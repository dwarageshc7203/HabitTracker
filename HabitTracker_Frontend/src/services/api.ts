import axios, { type InternalAxiosRequestConfig } from 'axios'

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (typeof window !== 'undefined' ? window.location.origin : '')

const api = axios.create({
  baseURL: apiBaseUrl,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('ht_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
