import { createContext, useContext } from 'react'

interface NavigationContextValue {
  navigateTo: (moduleId: string, itemId?: string) => void
}

export const NavigationContext = createContext<NavigationContextValue>({
  navigateTo: () => {},
})

export const useNavigation = () => useContext(NavigationContext)
