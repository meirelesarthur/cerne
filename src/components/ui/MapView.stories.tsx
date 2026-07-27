import type { Meta, StoryObj } from '@storybook/react-vite'
import { MapView } from './MapView'

// MapView usa Leaflet e importa `leaflet/dist/leaflet.css` diretamente no
// próprio componente — nenhum CSS extra é necessário aqui.

const meta: Meta<typeof MapView> = {
  title: 'GB CERNE/MapView',
  component: MapView,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 520 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof MapView>

// Perímetro simplificado (retângulo) de uma fazenda fictícia em Sorriso, MT.
const PERIMETRO_GEOJSON = JSON.stringify({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-55.72, -12.54],
          [-55.70, -12.54],
          [-55.70, -12.56],
          [-55.72, -12.56],
          [-55.72, -12.54],
        ]],
      },
    },
  ],
})

// ─── Com perímetro desenhado ─────────────────────────────────────────────────────

export const ComPerimetro: Story = {
  name: 'Com perímetro desenhado (GeoJSON)',
  args: {
    geoJSON: PERIMETRO_GEOJSON,
    height: 320,
  },
}

// ─── Fallback por coordenada ─────────────────────────────────────────────────────

export const FallbackPorCoordenada: Story = {
  name: 'Sem perímetro — fallback por coordenada',
  args: {
    lat: -12.55,
    lng: -55.71,
    height: 320,
  },
}

// ─── Sem localização ──────────────────────────────────────────────────────────────

export const SemLocalizacao: Story = {
  name: 'Sem localização definida',
  args: {
    height: 320,
  },
}

// ─── Altura customizada ───────────────────────────────────────────────────────────

export const AlturaCustomizada: Story = {
  name: 'Altura customizada (compacto)',
  args: {
    lat: -12.55,
    lng: -55.71,
    height: 200,
  },
}
