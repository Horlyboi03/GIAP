import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
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

export default api
