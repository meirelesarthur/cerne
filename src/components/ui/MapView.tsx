import { useRef, useEffect, useState } from 'react'
import { MapPinOff } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { t } from '../../design/tokens'
import { useTheme } from '../../context/ThemeContext'

interface MapViewProps {
  /** Perímetro em GeoJSON (FeatureCollection) serializado — fonte primária. */
  geoJSON?: string
  /** Coordenada de fallback quando não há perímetro desenhado. */
  lat?: number | string
  lng?: number | string
  /** Altura do mapa em px. */
  height?: number
}

const BRAND = t.color.brand[600]

function toNum(v: number | string | undefined): number | null {
  if (v == null) return null
  const n = typeof v === 'string' ? parseFloat(v) : v
  return Number.isFinite(n) ? n : null
}

/**
 * Mapa de leitura (sem edição) para visualizar a demarcação de uma área.
 * Renderiza o polígono do perímetro quando há `geoJSON`; caso contrário,
 * posiciona um marcador na coordenada informada.
 */
export function MapView({ geoJSON, lat, lng, height = 320 }: MapViewProps) {
  const { colors } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [hasLocation, setHasLocation] = useState(true)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Corrige os ícones default do Leaflet quebrados pelo bundling do Vite
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([-15.78, -47.93], 4)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // 1. Perímetro (preferencial)
    let hasPolygon = false
    if (geoJSON) {
      try {
        const layer = L.geoJSON(JSON.parse(geoJSON), {
          style: { color: BRAND, fillColor: BRAND, fillOpacity: 0.15, weight: 2 },
        })
        if (layer.getLayers().length > 0) {
          layer.addTo(map)
          map.fitBounds(layer.getBounds(), { padding: [24, 24] })
          hasPolygon = true
        }
      } catch {
        // GeoJSON inválido — cai no fallback de coordenada
      }
    }

    // 2. Fallback: marcador na coordenada
    let hasMarker = false
    if (!hasPolygon) {
      const la = toNum(lat)
      const ln = toNum(lng)
      if (la !== null && ln !== null) {
        L.marker([la, ln]).addTo(map)
        map.setView([la, ln], 13)
        hasMarker = true
      }
    }

    setHasLocation(hasPolygon || hasMarker)

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={containerRef}
        style={{
          height,
          borderRadius: t.radius.lg,
          border: `1px solid ${colors.border.default}`,
          overflow: 'hidden',
        }}
      />
      {!hasLocation && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: t.space[2],
            background: colors.bg.surface,
            borderRadius: t.radius.lg,
            pointerEvents: 'none',
          }}
        >
          <MapPinOff size={24} color={colors.fg.subtle as string} aria-hidden="true" />
          <span style={{ fontSize: t.font.size.sm, color: colors.fg.subtle, fontFamily: t.font.family.sans }}>
            Localização não definida para este registro.
          </span>
        </div>
      )}
    </div>
  )
}
