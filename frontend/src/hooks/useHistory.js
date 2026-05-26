import { useState, useEffect } from 'react'
import apiClient from '../lib/apiClient'

export function useHistory() {
  const [predictions, setPredictions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchHistory = async () => {
      setIsLoading(true)
      try {
        const res = await apiClient.get('/predictions/history/')
        if (!cancelled) setPredictions(res.data)
      } catch (err) {
        if (!cancelled) {
          console.error('History fetch failed:', err.response?.status)
          setError(err)
          setPredictions([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchHistory()

    return () => { cancelled = true }
  }, []) // only runs once

  return { predictions, isLoading, error }
}