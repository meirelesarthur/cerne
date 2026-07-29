import { createContext, useContext, useState, type ReactNode } from 'react'

export interface UserProfileRole {
  id:    string
  label: string
}

/**
 * Dados de identidade do usuário autenticado (`User` + `Person`, SPEC-17).
 * `nif` e `email` nunca são alterados por `updateProfile` — o autoatendimento
 * de perfil não os edita (exibidos como somente leitura na tela).
 */
export interface UserProfile {
  name:     string
  email:    string
  nif:      string
  phone:    string
  cityId:   string
  address:  string
  photoUrl: string | null
  /** Somente leitura — nunca atribuído pela tela de perfil. */
  roles:    UserProfileRole[]
}

interface UserProfileContextType {
  profile:       UserProfile
  updateProfile: (patch: Partial<UserProfile>) => void
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

const MOCK_PROFILE: UserProfile = {
  name:     'Silvio Ventura Abreu',
  email:    'ventura.silvio@greenbelt-ti.com',
  nif:      '12345678909',
  phone:    '65999887766',
  cityId:   'cba',
  address:  'Av. Fernando Correa da Costa, 1200 — Bairro Coxipó',
  photoUrl: null,
  roles:    [{ id: 'gestor', label: 'Gestor' }],
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE)

  const updateProfile = (patch: Partial<UserProfile>) =>
    setProfile((prev) => ({ ...prev, ...patch }))

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserProfileContext.Provider>
  )
}

/** Fonte única do usuário autenticado — consumida por Topbar (avatar/nome) e Meu Perfil. */
export function useUserProfile() {
  const context = useContext(UserProfileContext)
  if (!context) {
    throw new Error('useUserProfile deve ser usado dentro de UserProfileProvider')
  }
  return context
}
