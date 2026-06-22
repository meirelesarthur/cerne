import React, { useRef, useEffect, useCallback } from 'react'
import { Upload, MapPin } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw'
import { StepHeader } from '../../../../components/ui/StepHeader'
import { Button } from '../../../../components/ui/Button'
import { t } from '../../../../design/tokens'
import { useTheme } from '../../../../context/ThemeContext'
import type { FazendaFormData } from '../fazendas.types'

interface Step3MapaProps {
  data: FazendaFormData
  errors: Record<string, string>
  onChange: (field: keyof FazendaFormData, value: string) => void
}

const PAISES_SUPORTADOS = ['Brasil', 'Argentina', 'Paraguai', 'Bolívia', 'Uruguai']

// Estilo do polígono da propriedade — tokenizado (Lei 3)
const POLY_STYLE = { color: t.color.brand[600], fillColor: t.color.brand[600], fillOpacity: 0.15 }

// Geocodificação reversa best-effort: traduz o centróide do perímetro em
// endereço. Falhas de rede são silenciosas — os campos seguem editáveis.
async function reverseGeocode(
  lat: number,
  lng: number,
  onChange: (field: keyof FazendaFormData, value: string) => void,
) {
  try {
    const url =
      'https://nominatim.openstreetmap.org/reverse?format=jsonv2' +
      `&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return
    const json = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a: Record<string, string> = json.address ?? {}

    const cidade = a.city || a.town || a.municipality || a.village || a.county || ''
    const bairro = a.suburb || a.neighbourhood || a.village || a.hamlet || ''
    const endereco = a.road || (json.display_name ? String(json.display_name).split(',')[0] : '')
    const cep = a.postcode || ''
    const pais = a.country || ''

    if (cidade) onChange('cidade', cidade)
    if (bairro) onChange('bairro', bairro)
    if (endereco) onChange('endereco', endereco)
    if (cep) onChange('cep', cep)
    if (PAISES_SUPORTADOS.includes(pais)) onChange('pais', pais)
  } catch {
    // Falha de rede/geocoding — campos seguem para preenchimento manual
  }
}

export function Step3Mapa({ data, onChange }: Step3MapaProps) {
  const { colors } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const drawnRef = useRef<L.FeatureGroup | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const syncGeoJSON = useCallback(
    (fg: L.FeatureGroup) => {
      const geojson = fg.toGeoJSON()
      const features = (geojson as GeoJSON.FeatureCollection).features
      onChange('perimetroGeoJSON', features.length > 0 ? JSON.stringify(geojson) : '')
    },
    [onChange],
  )

  // O perímetro é a fonte da verdade da localização: dele derivamos área total,
  // coordenadas e endereço, que as etapas seguintes apenas confirmam.
  const deriveFromDrawn = useCallback(
    (fg: L.FeatureGroup) => {
      const layers = fg.getLayers()
      if (layers.length === 0) {
        onChange('areaTotal', '')
        onChange('latitude', '')
        onChange('longitude', '')
        return
      }

      // Área total (ha) — soma geodésica de todos os polígonos
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const GeometryUtil = (L as any).GeometryUtil
      let totalM2 = 0
      layers.forEach((layer) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const latlngs = (layer as any).getLatLngs?.()
        if (!latlngs) return
        const ring = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs
        if (GeometryUtil?.geodesicArea) totalM2 += GeometryUtil.geodesicArea(ring)
      })
      if (totalM2 > 0) {
        onChange('areaTotal', String(Math.round((totalM2 / 10000) * 100) / 100))
      }

      // Centróide → latitude/longitude
      const center = fg.getBounds().getCenter()
      onChange('latitude', center.lat.toFixed(6))
      onChange('longitude', center.lng.toFixed(6))

      // Endereço via geocodificação reversa (best-effort, não bloqueia o fluxo)
      void reverseGeocode(center.lat, center.lng, onChange)
    },
    [onChange],
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Fix Leaflet default icon paths broken by Vite bundling
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(containerRef.current).setView([-15.7801, -47.9292], 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const drawn = new L.FeatureGroup()
    map.addLayer(drawn)
    drawnRef.current = drawn

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DrawControl = (L.Control as any).Draw
    const drawControl = new DrawControl({
      edit: { featureGroup: drawn },
      draw: {
        polygon: {
          shapeOptions: POLY_STYLE,
          showArea: true,
        },
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
        polyline: false,
      },
    })
    map.addControl(drawControl)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.on('draw:created', (e: any) => {
      drawn.addLayer(e.layer)
      syncGeoJSON(drawn)
      deriveFromDrawn(drawn)
    })
    map.on('draw:edited', () => {
      syncGeoJSON(drawn)
      deriveFromDrawn(drawn)
    })
    map.on('draw:deleted', () => {
      syncGeoJSON(drawn)
      deriveFromDrawn(drawn)
    })

    // Restore existing perimeter from form state
    if (data.perimetroGeoJSON) {
      try {
        const geojson = JSON.parse(data.perimetroGeoJSON)
        L.geoJSON(geojson, {
          style: POLY_STYLE,
        }).eachLayer((layer) => drawn.addLayer(layer))
        if (drawn.getLayers().length > 0) {
          map.fitBounds(drawn.getBounds(), { padding: [24, 24] })
        }
      } catch {
        // ignore malformed JSON
      }
    }

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      drawnRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleKmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange('kmlFileName', file.name)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target?.result as string
      const parser = new DOMParser()
      const kml = parser.parseFromString(content, 'text/xml')
      const coordNodes = kml.getElementsByTagName('coordinates')

      if (!coordNodes.length || !mapRef.current || !drawnRef.current) return

      const drawn = drawnRef.current

      drawn.clearLayers()

      for (let i = 0; i < coordNodes.length; i++) {
        const raw = (coordNodes[i].textContent ?? '').trim()
        const latlngs = raw
          .split(/\s+/)
          .map((pair) => {
            const [lng, lat] = pair.split(',').map(Number)
            return [lat, lng] as [number, number]
          })
          .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng) && lat !== 0)

        if (latlngs.length > 2) {
          const poly = L.polygon(latlngs, POLY_STYLE)
          drawn.addLayer(poly)
        }
      }

      if (drawn.getLayers().length > 0) {
        mapRef.current.fitBounds(drawn.getBounds(), { padding: [24, 24] })
        syncGeoJSON(drawn)
        deriveFromDrawn(drawn)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const hasPerimetro = (() => {
    if (!data.perimetroGeoJSON) return false
    try {
      const fc = JSON.parse(data.perimetroGeoJSON) as GeoJSON.FeatureCollection
      return fc.features?.length > 0
    } catch {
      return false
    }
  })()

  return (
    <div>
      <StepHeader
        title="Demarcação de Área"
        subtitle="Desenhe o perímetro da propriedade no mapa ou importe um arquivo KML."
      />

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.space[1] + 2,
            fontSize: t.font.size.sm,
            color: colors.fg.subtle,
            fontFamily: t.font.family.sans,
          }}
        >
          <MapPin size={13} color={colors.accent.default} />
          Use as ferramentas no mapa para desenhar o polígono da propriedade
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
          {data.kmlFileName && (
            <span
              style={{
                fontSize: t.font.size.xs,
                color: colors.accent.default,
                fontFamily: t.font.family.sans,
              }}
            >
              📎 {data.kmlFileName}
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload size={12} />}
            onClick={() => fileRef.current?.click()}
          >
            Importar KML
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".kml,.kmz"
            style={{ display: 'none' }}
            onChange={handleKmlUpload}
          />
        </div>
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        style={{
          height: 460,
          borderRadius: t.radius.xl,
          border: `1px solid ${colors.border.default}`,
          overflow: 'hidden',
        }}
      />

      {/* Status */}
      <div style={{ marginTop: t.space[2] + 2 }}>
        {hasPerimetro ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.space[1] + 2,
              fontSize: t.font.size.sm,
              color: colors.accent.default,
              fontFamily: t.font.family.sans,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: t.radius.full,
                background: colors.accent.default,
                display: 'inline-block',
              }}
            />
            Perímetro demarcado
            {data.areaTotal ? ` · ${data.areaTotal} ha` : ''} — área e endereço
            preenchidos automaticamente nas próximas etapas
          </div>
        ) : (
          <div
            style={{
              fontSize: t.font.size.sm,
              color: colors.fg.subtle,
              fontFamily: t.font.family.sans,
            }}
          >
            Nenhum perímetro demarcado — você pode avançar e definir depois
          </div>
        )}
      </div>
    </div>
  )
}
