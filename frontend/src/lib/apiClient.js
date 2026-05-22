import axios from 'axios'
import { supabase } from './supabaseClient'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - attach JWT token to every request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
        console.log('Token attached:', session.access_token.substring(0, 20) + '...')
      } else {
        console.warn('No session found - request will be unauthorized')
      }
    } catch (error) {
      console.error('Error getting session:', error)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut()
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export default apiClient
