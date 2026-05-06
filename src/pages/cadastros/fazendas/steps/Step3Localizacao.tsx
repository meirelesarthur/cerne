import React from 'react'
import { MapPin, Upload } from 'lucide-react'
import { FormSection } from '../../../../components/ui/FormSection'
import { FormField } from '../../../../components/ui/FormField'
import { FormSelect } from '../../../../components/ui/FormSelect'
import type { FazendaFormData } from '../fazendas.types'

interface Step3Props {
  data: FazendaFormData
  errors: Record<string, string>
  onChange: (field: keyof FazendaFormData, value: string) => void
}

const paisOptions = [
  { value: 'Brasil', label: 'Brasil' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Paraguai', label: 'Paraguai' },
  { value: 'Bolívia', label: 'Bolívia' },
  { value: 'Uruguai', label: 'Uruguai' },
]

export function Step3Localizacao({ data, errors, onChange }: Step3Props) {
  return (
    <div>
      {/* Info Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          background: '#f0fdf4',
          border: '1px solid #d1fae5',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 20,
        }}
      >
        <MapPin size={15} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
        <span
          style={{
            fontSize: 12,
            color: '#059669',
            fontFamily: "'Outfit', sans-serif",
            lineHeight: 1.5,
          }}
        >
          Para cadastrar a fazenda, desenhe o perímetro no mapa e, em seguida, informe os campos do cadastro.
        </span>
      </div>

      {/* Mock Map Area */}
      <div
        style={{
          position: 'relative',
          height: 220,
          borderRadius: 12,
          border: '1px solid #d1fae5',
          background: '#e8f5e9',
          backgroundImage:
            'linear-gradient(rgba(5,150,105,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(5,150,105,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          overflow: 'hidden',
          marginBottom: 20,
        }}
      >
        {/* Polygon SVG */}
        <svg
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 200,
            height: 140,
          }}
          viewBox="0 0 200 140"
        >
          <polygon
            points="100,10 180,50 160,120 60,130 20,70"
            stroke="#059669"
            strokeWidth={2}
            fill="rgba(5,150,105,0.1)"
            strokeLinejoin="round"
          />
          {/* Vertices */}
          {[
            [100, 10],
            [180, 50],
            [160, 120],
            [60, 130],
            [20, 70],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={4} fill="#059669" />
          ))}
        </svg>

        {/* Import KML button */}
        <button
          type="button"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'white',
            border: '1.5px solid #e5e5e5',
            borderRadius: 8,
            padding: '5px 10px',
            fontSize: 11,
            fontWeight: 500,
            fontFamily: "'Outfit', sans-serif",
            color: '#1a1a1a',
            cursor: 'pointer',
          }}
        >
          <Upload size={11} />
          Importar KML
        </button>

        {/* Lat/Long fields at bottom of map */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            right: 10,
            display: 'flex',
            gap: 8,
          }}
        >
          <input
            placeholder="Latitude"
            value={data.latitude}
            onChange={(e) => onChange('latitude', e.target.value)}
            style={{
              flex: 1,
              height: 30,
              border: '1.5px solid #d1fae5',
              borderRadius: 6,
              padding: '0 8px',
              fontSize: 11,
              fontFamily: "'Outfit', sans-serif",
              background: 'rgba(255,255,255,0.9)',
              color: '#1a1a1a',
              outline: 'none',
            }}
          />
          <input
            placeholder="Longitude"
            value={data.longitude}
            onChange={(e) => onChange('longitude', e.target.value)}
            style={{
              flex: 1,
              height: 30,
              border: '1.5px solid #d1fae5',
              borderRadius: 6,
              padding: '0 8px',
              fontSize: 11,
              fontFamily: "'Outfit', sans-serif",
              background: 'rgba(255,255,255,0.9)',
              color: '#1a1a1a',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Address Section */}
      <FormSection title="Endereço">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          <FormSelect
            label="País"
            required
            error={errors.pais}
            options={paisOptions}
            value={data.pais}
            onChange={(e) => onChange('pais', e.target.value)}
          />

          <FormField
            label="CEP"
            required
            error={errors.cep}
            value={data.cep}
            onChange={(e) => onChange('cep', e.target.value)}
            placeholder="00000-000"
          />

          <FormField
            label="Cidade"
            required
            error={errors.cidade}
            value={data.cidade}
            onChange={(e) => onChange('cidade', e.target.value)}
            placeholder="Nome da cidade"
          />

          <FormField
            label="Local / Endereço"
            required
            error={errors.endereco}
            value={data.endereco}
            onChange={(e) => onChange('endereco', e.target.value)}
            placeholder="Rodovia, Km, estrada..."
          />

          <FormField
            label="Número"
            error={errors.numero}
            value={data.numero}
            onChange={(e) => onChange('numero', e.target.value)}
            placeholder="S/N"
          />

          <FormField
            label="Bairro"
            required
            error={errors.bairro}
            value={data.bairro}
            onChange={(e) => onChange('bairro', e.target.value)}
            placeholder="Bairro / Localidade"
          />
        </div>
      </FormSection>
    </div>
  )
}
