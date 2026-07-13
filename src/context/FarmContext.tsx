import { createContext, useContext, useState, ReactNode } from 'react'

export interface Farm {
  id: string
  name: string
  code?: string
}

interface FarmContextType {
  currentFarm: Farm | null
  farms: Farm[]
  setCurrentFarm: (farm: Farm) => void
}

const FarmContext = createContext<FarmContextType | undefined>(undefined)

export function FarmProvider({ children }: { children: ReactNode }) {
  const mockFarms: Farm[] = [
    { id: '1', name: 'Fazenda Bom Gosto', code: 'FBG001' },
    { id: '2', name: 'Fazenda Esperança', code: 'FES002' },
    { id: '3', name: 'Fazenda Rio Verde', code: 'FRV003' },
    { id: '4', name: 'Fazenda São João', code: 'FSJ004' },
    { id: '5', name: 'Fazenda Paraíso', code: 'FPD005' },
    { id: '6', name: 'Fazenda Nova Esperança', code: 'FNE006' },
    { id: '7', name: 'Fazenda Santa Rosa', code: 'FSR007' },
    { id: '8', name: 'Fazenda do Vale', code: 'FVL008' },
    { id: '9', name: 'Fazenda Boa Vista', code: 'FBV009' },
    { id: '10', name: 'Fazenda Horizonte', code: 'FHZ010' },
  ]

  const [currentFarm, setCurrentFarm] = useState<Farm>(mockFarms[0])

  return (
    <FarmContext.Provider value={{ currentFarm, farms: mockFarms, setCurrentFarm }}>
      {children}
    </FarmContext.Provider>
  )
}

export function useFarm() {
  const context = useContext(FarmContext)
  if (!context) {
    throw new Error('useFarm deve ser usado dentro de FarmProvider')
  }
  return context
}
