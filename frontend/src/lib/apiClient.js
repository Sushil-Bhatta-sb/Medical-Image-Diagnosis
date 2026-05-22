import axios from 'axios'
import { supabase } from './supabaseClient'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session error:', error)
        return config
      }
      
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
        console.log('✅ Token attached to request:', config.url)
      } else {
        console.warn('⚠️ No session - request without token:', config.url)
      }
    } catch (err) {
      console.error('❌ Failed to get session:', err)
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`)
    return response
  },
  async (error) => {
    const status = error.response?.status
    const url = error.config?.url
    
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${url} → ${status}`)
    
    if (status === 401) {
      console.warn('401 - signing out')
      await supabase.auth.signOut()
      window.location.href = '/auth'
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
