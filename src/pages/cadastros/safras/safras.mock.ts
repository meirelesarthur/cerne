import type { Safra } from './safras.types'
import { generateWeeks } from './safras.types'

export const mockSafras: Safra[] = [
  {
    id: 1,
    desc: 'Safra 2024/2025',
    ini: '2024-07-01',
    fim: '2025-06-30',
    ativo: 'nao',
    reb: 'individual',
    evo: 'habilitado',
    s1: 'jan',
    s2: 'jul',
    weeks: generateWeeks('2024-07-01', '2025-06-30'),
  },
  {
    id: 2,
    desc: 'Safra 2025/2026',
    ini: '2025-07-01',
    fim: '2026-06-30',
    ativo: 'sim',
    reb: 'individual',
    evo: 'habilitado',
    s1: 'jan',
    s2: 'jul',
    weeks: generateWeeks('2025-07-01', '2026-06-30'),
  },
  {
    id: 3,
    desc: 'Safra 2026/2027',
    ini: '2026-07-01',
    fim: '2027-06-30',
    ativo: 'sim',
    reb: 'coletivo',
    evo: 'desabilitado',
    s1: 'jan',
    s2: 'jul',
    weeks: generateWeeks('2026-07-01', '2027-06-30'),
  },
]
