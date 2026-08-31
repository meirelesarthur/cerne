import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'
import type { ThemeColors } from '../../context/ThemeContext'
import { ensureLeafletControlTheme } from './leafletControlTheme'

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Linha "rótulo · valor" dentro de um bloco do painel de detalhe. */
export interface FarmAreaStat {
  label: string
  value: string
}

/** Bloco temático do painel de detalhe (ex.: "Cultura", "Manejo"). */
export interface FarmAreaGroup {
  title: string
  rows: FarmAreaStat[]
}

/** Ícones disponíveis para o marcador central da área. */
export type FarmAreaIcon = 'sprout' | 'wheat' | 'leaf' | 'trees' | 'water' | 'machine'

/** Área demarcada no mapa (talhão, pasto, gleba…). */
export interface FarmArea {
  id: string
  /** Nome exibido no rótulo permanente sobre a área. */
  name: string
  /** Segunda linha do rótulo — normalmente a área em hectares. */
  subtitle?: string
  /** Vértices do polígono, no sentido do perímetro. */
  coords: L.LatLngTuple[]
  /** Cor da borda e do preenchimento — usar `t.chart.series[n]` ou token de marca. */
  color: string
  /** Opacidade do preenchimento (0–1). Padrão: 0.28. */
  fillOpacity?: number
  /** Ícone do marcador central. Padrão: `sprout`. */
  icon?: FarmAreaIcon
  /** Resumo em destaque no topo do painel de detalhe. */
  headline?: string
  /** Blocos de indicadores exibidos no painel de detalhe. */
  groups?: FarmAreaGroup[]
}

interface FarmAreasMapProps {
  areas: FarmArea[]
  /** Centro inicial. Omitido → enquadra automaticamente todas as áreas. */
  center?: L.LatLngTuple
  zoom?: number
  /** Altura do mapa. Padrão: `100%` (ocupa o contêiner). */
  height?: number | string
  /** Exibe o rótulo permanente (nome + subtítulo) sobre cada área. Padrão: `true`. */
  showLabels?: boolean
  /** Posição do controle de zoom. Padrão: `bottomright`. */
  zoomPosition?: L.ControlPosition
  /** Descrição da região do mapa para leitores de tela. */
  ariaLabel?: string
}

// ─── Ícones (SVG inline — o conteúdo do marcador do Leaflet é HTML, não JSX) ──

const ICON_PATHS: Record<FarmAreaIcon, string> = {
  sprout:
    '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/>' +
    '<path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>' +
    '<path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  wheat:
    '<path d="M2 22 16 8"/>' +
    '<path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/>' +
    '<path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/>' +
    '<path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/>' +
    '<path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/>' +
    '<path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/>' +
    '<path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/>' +
    '<path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/>',
  leaf:
    '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>' +
    '<path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  trees:
    '<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/>' +
    '<path d="M13 19v3"/>' +
    '<path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/>',
  water:
    '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>' +
    '<path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',
  machine:
    '<path d="m10 11 11 .9a1 1 0 0 1 .8 1.1l-.665 4.158a1 1 0 0 1-.988.842H20"/><path d="M16 18h-5"/>' +
    '<path d="M18 5a1 1 0 0 0-1 1v5.573"/><path d="M3 4h8.129a1 1 0 0 1 .99.863L13 11.246"/>' +
    '<path d="M4 11V4"/><path d="M7 15h.01"/><path d="M8 10.1V4"/>' +
    '<circle cx="18" cy="18" r="2"/><circle cx="7" cy="15" r="5"/>',
}

function iconSvg(name: FarmAreaIcon, color: string, size: number): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" ` +
    `fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" ` +
    `aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`
  )
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

const ESC: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Escapa texto vindo de dados antes de entrar no HTML do rótulo do Leaflet. */
function esc(value: string): string {
  return value.replace(/[&<>"']/g, c => ESC[c])
}

const STYLE_ID = 'gb-farm-areas-map'

/**
 * Remove o cromo padrão do tooltip do Leaflet (fundo, borda, seta) para que o
 * rótulo da área seja desenhado só com os tokens do sistema.
 */
function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = [
    '.gb-farm-map .leaflet-tooltip.gb-farm-map__label {',
    '  background: none; border: 0; box-shadow: none; padding: 0;',
    '  border-radius: 0; max-width: none;',
    '}',
    '.gb-farm-map .leaflet-tooltip.gb-farm-map__label::before { display: none; }',
    '.gb-farm-map .gb-farm-map__pin-wrap { background: none; border: 0; }',
    '@media (prefers-reduced-motion: reduce) {',
    '  .gb-farm-map .leaflet-zoom-anim .leaflet-zoom-animated,',
    '  .gb-farm-map .leaflet-fade-anim .leaflet-tile { transition: none !important; }',
    '}',
  ].join('\n')
  document.head.appendChild(el)
}

function labelHtml(area: FarmArea): string {
  const sub = area.subtitle
    ? `<div style="font-size:${t.font.size['2xs']}px;font-weight:${t.font.weight.semibold};opacity:0.92">${esc(area.subtitle)}</div>`
    : ''
  return (
    `<div style="font-family:${t.font.family.sans};color:${t.color.neutral[0]};` +
    `text-align:center;line-height:1.25;text-shadow:${t.shadow.mapLabel};pointer-events:none">` +
    `<div style="font-size:${t.font.size.xs}px;font-weight:${t.font.weight.bold}">${esc(area.name)}</div>${sub}</div>`
  )
}

function pinHtml(area: FarmArea): string {
  const size = t.size.mapPin
  return (
    `<div style="width:${size}px;height:${size}px;border-radius:${t.radius.full}px;` +
    `background:${t.color.neutral[0]};border:2px solid ${area.color};` +
    `box-shadow:${t.shadow.md};display:flex;align-items:center;justify-content:center">` +
    `${iconSvg(area.icon ?? 'sprout', area.color, Math.round(size * 0.5))}</div>`
  )
}

// ─── Painel de detalhe ────────────────────────────────────────────────────────

/**
 * Cartão com os indicadores da área sob o cursor. Fica ancorado a um dos lados
 * do mapa (o oposto ao da área destacada), então nunca é cortado pela moldura
 * nem cobre o polígono que está sendo lido.
 */
function AreaPanel({ area, side, colors, isGbMode }: {
  area: FarmArea
  side: 'left' | 'right'
  colors: ThemeColors
  isGbMode: boolean
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        // Centralizado na vertical, com uma folga para baixo: sai da faixa de
        // chips e controles que costuma ocupar o topo do mapa.
        top: '50%',
        transform: 'translateY(-50%)',
        marginTop: t.space[3],
        left: side === 'left' ? t.space[3] : undefined,
        right: side === 'right' ? t.space[3] : undefined,
        zIndex: t.zIndex.mapPanel,
        width: t.size.mapPanel,
        maxWidth: `calc(100% - ${t.space[6]}px)`,
        padding: `${t.space[3]}px ${t.space[4]}px`,
        background: isGbMode ? colors.bg.surface : t.color.neutral[0],
        border: `1px solid ${colors.border.default}`,
        borderRadius: t.radius.xl,
        boxShadow: isGbMode ? t.shadow.cardDarkHover : t.shadow.lg,
        fontFamily: t.font.family.sans,
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
        <span style={{ width: 9, height: 9, borderRadius: t.radius.full, background: area.color, flexShrink: 0 }} />
        <span style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.bold, color: colors.fg.default }}>
          {area.name}
        </span>
        {area.subtitle && (
          <span style={{ fontSize: t.font.size['2xs'], color: colors.fg.subtle, marginLeft: 'auto' }}>
            {area.subtitle}
          </span>
        )}
      </div>

      {area.headline && (
        <div style={{
          fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold,
          color: area.color, marginTop: t.space[1],
        }}>
          {area.headline}
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: `${t.space[2]}px ${t.space[5]}px`, marginTop: t.space[2],
      }}>
        {(area.groups ?? []).map(group => (
          <div key={group.title}>
            <div style={{
              fontSize: t.font.size['3xs'], fontWeight: t.font.weight.bold,
              color: colors.fg.subtle, letterSpacing: '0.06em',
              textTransform: 'uppercase', marginBottom: t.space[1],
            }}>
              {group.title}
            </div>
            {group.rows.map(row => (
              <div
                key={row.label}
                style={{
                  display: 'flex', alignItems: 'baseline',
                  justifyContent: 'space-between', gap: t.space[2], lineHeight: 1.5,
                }}
              >
                <span style={{ fontSize: t.font.size['2xs'], color: colors.fg.subtle }}>{row.label}</span>
                <span style={{
                  fontSize: t.font.size['2xs'], fontWeight: t.font.weight.semibold,
                  color: colors.fg.default, textAlign: 'right',
                }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Mapa de leitura com múltiplas áreas demarcadas sobre imagem de satélite.
 *
 * Cada área recebe polígono colorido, marcador com ícone e rótulo permanente;
 * ao passar o cursor, abre o painel com os indicadores daquela área. Sem
 * edição — para desenhar o perímetro de um cadastro, usar o mapa do passo de
 * localização; para uma única área já demarcada, usar `MapView`.
 */
export function FarmAreasMap({
  areas,
  center,
  zoom = 13,
  height = '100%',
  showLabels = true,
  zoomPosition = 'bottomright',
  ariaLabel = 'Mapa das áreas da fazenda',
}: FarmAreasMapProps) {
  const { colors, isGbMode } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layersRef = useRef<L.LayerGroup | null>(null)
  const boundsRef = useRef<L.LatLngBounds | null>(null)
  const fittedRef = useRef(false)
  const [hovered, setHovered] = useState<{ area: FarmArea; side: 'left' | 'right' } | null>(null)

  /**
   * Enquadra todas as áreas. Enquanto o contêiner ainda não tem tamanho (mapa
   * montado dentro de um painel oculto, por exemplo), o Leaflet cairia no zoom
   * máximo — então o enquadramento espera a primeira medida válida.
   */
  const fitRef = useRef<() => void>(() => {})
  fitRef.current = () => {
    const map = mapRef.current
    const bounds = boundsRef.current
    if (!map || center || !bounds || !bounds.isValid()) return
    const size = map.getSize()
    if (size.x === 0 || size.y === 0) return
    map.fitBounds(bounds, { padding: [32, 32] })
    fittedRef.current = true
  }

  // Mapa base — criado uma única vez; preserva zoom/pan entre re-renders.
  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return
    ensureStyles()
    ensureLeafletControlTheme()
    const map = L.map(container, { zoomControl: false, attributionControl: false })
      .setView(center ?? [-15.78, -47.93], center ? zoom : 4)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 },
    ).addTo(map)
    L.control.zoom({ position: zoomPosition }).addTo(map)
    layersRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    // Card responsivo: revalida o tamanho do mapa e, enquanto o enquadramento
    // inicial não aconteceu, tenta de novo a cada medida do contêiner.
    const observer = new ResizeObserver(() => {
      if (!mapRef.current) return
      mapRef.current.invalidateSize({ animate: false })
      if (!fittedRef.current) fitRef.current()
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      map.remove()
      mapRef.current = null
      layersRef.current = null
      fittedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Camadas de áreas — redesenhadas quando os dados mudam.
  useEffect(() => {
    const map = mapRef.current
    const group = layersRef.current
    if (!map || !group) return
    group.clearLayers()
    setHovered(null)

    const bounds = L.latLngBounds([])
    areas.forEach(area => {
      const fillOpacity = area.fillOpacity ?? 0.28
      const poly = L.polygon(area.coords, {
        color: area.color,
        fillColor: area.color,
        fillOpacity,
        weight: 2.5,
      })
      poly.on('mouseover', () => {
        poly.setStyle({ weight: 3.5, fillOpacity: Math.min(fillOpacity + 0.18, 0.65) })
        // O painel abre no lado oposto ao da área, para não cobri-la.
        const x = map.latLngToContainerPoint(poly.getBounds().getCenter()).x
        setHovered({ area, side: x < map.getSize().x / 2 ? 'right' : 'left' })
      })
      poly.on('mouseout', () => {
        poly.setStyle({ weight: 2.5, fillOpacity })
        setHovered(current => (current?.area.id === area.id ? null : current))
      })
      poly.addTo(group)
      bounds.extend(poly.getBounds())

      // Pino e rótulo são decorativos: `interactive: false` deixa o hover do
      // polígono passar por baixo deles, sem "buracos" na área sensível.
      const pin = L.marker(poly.getBounds().getCenter(), {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({
          html: pinHtml(area),
          className: 'gb-farm-map__pin-wrap',
          iconSize: [t.size.mapPin, t.size.mapPin],
          iconAnchor: [t.size.mapPin / 2, t.size.mapPin / 2],
        }),
      })
      if (showLabels) {
        pin.bindTooltip(labelHtml(area), {
          permanent: true,
          direction: 'bottom',
          offset: [0, t.size.mapPin / 2 + 2],
          opacity: 1,
          className: 'gb-farm-map__label',
        })
      }
      pin.addTo(group)
    })

    boundsRef.current = bounds
    fittedRef.current = false
    fitRef.current()
  }, [areas, showLabels, center])

  return (
    <div
      style={{ position: 'relative', height, width: '100%' }}
      // Rede de segurança: se o cursor sair do mapa sem passar pela borda do
      // polígono (scroll, troca de janela), o painel fecha junto.
      onMouseLeave={() => setHovered(null)}
    >
      <div
        ref={containerRef}
        className="gb-farm-map"
        role="region"
        aria-label={ariaLabel}
        style={{ height: '100%', width: '100%' }}
      />
      {hovered && (
        <AreaPanel area={hovered.area} side={hovered.side} colors={colors} isGbMode={isGbMode} />
      )}
    </div>
  )
}
