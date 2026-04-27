import apiClient from './apiClient'

export const authService = {
  ensureCsrf() {
    return apiClient.get('/auth/csrf/')
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
