import apiClient, { setCsrfToken } from './apiClient'

export const authService = {
  async ensureCsrf() {
    const response = await apiClient.get('/auth/csrf/')
    setCsrfToken(response.data?.csrfToken)
    return response
  },
  getSession() {
    return apiClient.get('/auth/session/')
  },
  login(payload) {
    return apiClient.post('/auth/login/', payload)
  },
  logout() {
    return apiClient.post('/auth/logout/')
  },
}
