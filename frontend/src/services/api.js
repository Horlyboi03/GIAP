import axios from 'axios'

// Use environment variable or default to local API
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Don't set Content-Type if it's FormData - let axios handle it with boundary
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

// Add response interceptor to handle API errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If API is not available, log but don't crash the app
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('API server not available:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api

