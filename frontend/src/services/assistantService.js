import { authService } from './authService'
import apiClient from './apiClient'

export const assistantService = {
  async chat(payload) {
    await authService.ensureCsrf()
    return apiClient.post('/ai/chat/', payload)
  },
}
