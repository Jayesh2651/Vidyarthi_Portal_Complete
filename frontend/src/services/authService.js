import axios from 'axios'

import apiClient, { buildBackendUrl, setCsrfToken } from './apiClient'

export const authService = {
  async ensureCsrf() {
    const response = await axios.get(buildBackendUrl('/auth/csrf/'), {
      withCredentials: true,
    })
    setCsrfToken(response.data?.csrfToken)
    return response
  },
  getSession() {
    return apiClient.get('/auth/session/')
  },
  async login(payload) {
    await authService.ensureCsrf()
    return apiClient.post('/auth/login/', payload)
  },
  async logout() {
    await authService.ensureCsrf()
    return apiClient.post('/auth/logout/')
  },
}
