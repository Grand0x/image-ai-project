export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

export interface MeResponse {
  username: string
  roles: string[]
}

export interface User {
  username: string
  roles: string[]
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}
