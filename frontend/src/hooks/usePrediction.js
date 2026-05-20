import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import apiClient from '../lib/apiClient';
import usePredictionStore from '../store/predictionStore';
import toast from 'react-hot-toast';

export const usePrediction = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { 
    setPrediction, 
    setIsAnalyzing: storeSetIsAnalyzing, 
    setPollingInterval,
    pollingInterval,
    addToHistory 
  } = usePredictionStore();

  const submitImage = useCallback(async (imageFile) => {
    try {
      setIsAnalyzing(true);
      storeSetIsAnalyzing(true);

      // 1. Upload file to Supabase Storage
      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExtension}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('xray-images')
        .upload(`predictions/${fileName}`, imageFile);

      if (uploadError) {
        toast.error('Failed to upload image');
        setIsAnalyzing(false);
        storeSetIsAnalyzing(false);
        return { error: uploadError };
      }

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('xray-images')
        .getPublicUrl(`predictions/${fileName}`);

      // 3. POST to API to create prediction
      const { data: predictionData, error: predictionError } = await apiClient.post(
        '/predictions/',
        { image_url: publicUrl }
      );

      if (predictionError) {
        toast.error('Failed to submit prediction');
        setIsAnalyzing(false);
        storeSetIsAnalyzing(false);
        return { error: predictionError };
      }

      setPrediction(predictionData);
      toast.loading('Analyzing image...');

      // 4. Start polling for results
      const pollPrediction = async () => {
        try {
          const { data: updatedPrediction } = await apiClient.get(
            `/predictions/${predictionData.id}/`
          );

          setPrediction(updatedPrediction);

          // 5. Stop polling when complete or failed
          if (updatedPrediction.status === 'COMPLETED' || updatedPrediction.status === 'FAILED') {
            if (updatedPrediction.status === 'COMPLETED') {
              addToHistory(updatedPrediction);
              toast.dismiss();
              toast.success('Analysis complete!');
            } else {
              toast.dismiss();
              toast.error('Analysis failed');
            }
            
            setIsAnalyzing(false);
            storeSetIsAnalyzing(false);
            
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
            return;
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      };

      // Poll every 2 seconds
      const interval = setInterval(pollPrediction, 2000);
      setPollingInterval(interval);

      return { data: predictionData };
    } catch (err) {
      const message = err.message || 'Failed to analyze image';
      toast.error(message);
      setIsAnalyzing(false);
      storeSetIsAnalyzing(false);
      return { error: err };
    }
  }, [setPrediction, storeSetIsAnalyzing, setPollingInterval, pollingInterval, addToHistory]);

  return {
    submitImage,
    isAnalyzing,
  };
};
