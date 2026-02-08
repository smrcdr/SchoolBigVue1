import { apiRequest } from './api'
import { clearTokens, getRefreshToken } from './auth'

export async function logout(): Promise<void> {
  const refresh = getRefreshToken()

  if (refresh) {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
        auth: false,
        body: { refresh },
      })
    } catch {
      // Cleanup should happen even if backend logout fails.
    }
  }

  clearTokens()
}
