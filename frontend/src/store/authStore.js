import { create } from 'zustand'

const useAuthStore = create((set) => ({
  // Auth is now handled in App.jsx directly
  // This store is for predictions only
  currentPrediction: null,
  isAnalyzing: false,

  setPrediction: (prediction) => set({ currentPrediction: prediction }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  reset: () => set({ currentPrediction: null, isAnalyzing: false }),
}))

export default useAuthStore
