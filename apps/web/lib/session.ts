interface AuthState {
  token: string | null
  tenantId: string | null
  setToken: (token: string) => void
  setTenantId: (tenantId: string) => void
  clear: () => void
}