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
