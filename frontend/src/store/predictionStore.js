import { create } from 'zustand';

const usePredictionStore = create((set) => ({
  currentPrediction: null,
  isAnalyzing: false,
  pollingInterval: null,
  predictionHistory: [],

  setPrediction: (prediction) => set({ currentPrediction: prediction }),
  
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  
  setPollingInterval: (interval) => set({ pollingInterval: interval }),
  
  addToHistory: (prediction) => set((state) => ({
    predictionHistory: [prediction, ...state.predictionHistory],
  })),
  
  reset: () => set({
    currentPrediction: null,
    isAnalyzing: false,
    pollingInterval: null,
  }),

  clearHistory: () => set({ predictionHistory: [] }),
}));

export default usePredictionStore;
