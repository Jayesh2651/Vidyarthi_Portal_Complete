import axios from 'axios'

export function normalizeApiBaseURL(rawValue) {
  const candidate = (rawValue || '').trim()

  if (!candidate || candidate === '/') {
    return '/api'
  }

  if (/^https?:\/\//i.test(candidate)) {
    try {
      const url = new URL(candidate)
      const normalizedPathname = url.pathname.replace(/\/+$/, '')

      url.pathname = !normalizedPathname || normalizedPathname === '/' ? '/api' : normalizedPathname
      url.search = ''
      url.hash = ''

      return url.toString().replace(/\/+$/, '')
    } catch {
      // Fall through to relative-path normalization below.
    }
  }

  const normalizedPath = `/${candidate.replace(/^\/+|\/+$/g, '')}`
  return normalizedPath === '/' ? '/api' : normalizedPath
}

// Allow deployment envs to provide either the API root or just the backend origin.
const configuredBaseURL = normalizeApiBaseURL(import.meta.env?.VITE_API_BASE_URL)

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
