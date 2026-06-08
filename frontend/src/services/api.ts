import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({ baseURL: API_URL })

// Attach token
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('tems_auth')
  if (stored) {
    const { token } = JSON.parse(stored)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tems_auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
