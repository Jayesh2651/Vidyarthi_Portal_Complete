import axios from 'axios'

const configuredBaseURL = (import.meta.env.VITE_API_BASE_URL || '/api').trim()

const apiClient = axios.create({
  baseURL: configuredBaseURL || '/api',
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
})

let csrfToken = null

export function setCsrfToken(token) {
  csrfToken = token || null
}

apiClient.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase()

  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(method)) {
    config.headers = config.headers ?? {}
    config.headers['X-CSRFToken'] = csrfToken
  }

  return config
})

export default apiClient
