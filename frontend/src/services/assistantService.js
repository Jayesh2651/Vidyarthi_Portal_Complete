import apiClient from './apiClient'

export const assistantService = {
  chat(payload) {
    return apiClient.post('/ai/chat/', payload)
  },
}
