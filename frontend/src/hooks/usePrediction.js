import { useState, useCallback, useRef } from 'react'
import apiClient from '../lib/apiClient'
import usePredictionStore from '../store/predictionStore'
import toast from 'react-hot-toast'

export const usePrediction = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { setPrediction, setIsAnalyzing: storeSetIsAnalyzing } = usePredictionStore()
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsAnalyzing(false)
    storeSetIsAnalyzing(false)
  }, [storeSetIsAnalyzing])

  const submitImage = useCallback(async (imageFile) => {
    // Stop any existing polling first
    stopPolling()

    try {
      setIsAnalyzing(true)
      storeSetIsAnalyzing(true)

      // 1. Upload image via Django backend (uses service key, bypasses storage RLS)
      const formData = new FormData()
      formData.append('file', imageFile)

      let publicUrl
      try {
        const uploadResponse = await apiClient.post('/predictions/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        publicUrl = uploadResponse.data.image_url
      } catch (uploadError) {
        const message =
          uploadError?.response?.data?.detail || uploadError.message || 'Upload failed'
        toast.error('Failed to upload image: ' + message)
        stopPolling()
        return
      }

      console.log('Image uploaded:', publicUrl)

      // 2. Create prediction in Django
      const response = await apiClient.post('/predictions/', {
        image_url: publicUrl
      })

      const predictionId = response.data.id
      setPrediction(response.data)
      toast.loading('Analyzing...', { id: 'analyzing' })

      console.log('Prediction created:', predictionId)

      // 4. Poll for results - using ref so we can clear it
      intervalRef.current = setInterval(async () => {
        try {
          const pollResponse = await apiClient.get(
            `/predictions/${predictionId}/`
          )
          const updated = pollResponse.data
          
          console.log('Poll result:', updated.status)
          setPrediction(updated)

          if (updated.status === 'COMPLETED') {
            stopPolling()
            toast.dismiss('analyzing')
            toast.success('Analysis complete!')
            return
          }

          if (updated.status === 'FAILED') {
            stopPolling()
            toast.dismiss('analyzing')
            toast.error('Analysis failed: ' + (updated.error_message || 'Unknown error'))
            return
          }

        } catch (err) {
          console.error('Polling error:', err)
          stopPolling()
          toast.dismiss('analyzing')
          toast.error('Polling failed')
        }
      }, 2000)

      // 5. Safety timeout after 30 seconds
      timeoutRef.current = setTimeout(() => {
        stopPolling()
        toast.dismiss('analyzing')
        toast.error('Analysis timed out')
      }, 30000)

    } catch (err) {
      console.error('Submit error:', err)
      toast.error(err.message || 'Failed to analyze image')
      stopPolling()
    }
  }, [setPrediction, storeSetIsAnalyzing, stopPolling])

  return { submitImage, isAnalyzing }
}