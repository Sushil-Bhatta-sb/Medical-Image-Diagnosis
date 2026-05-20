export const DISEASE_LABELS = [
  'Normal',
  'Pneumonia',
  'Tuberculosis',
  'COVID-19',
  'Lung Cancer',
  'Pneumothorax',
  'Pleural Effusion',
  'Atelectasis',
  'Cardiomegaly',
];

export const MODEL_TYPES = {
  CNN: 'Convolutional Neural Network',
  VIT: 'Vision Transformer',
  CLASSICAL: 'Classical ML',
};

export const STATUS_COLORS = {
  PENDING: '#f59e0b',
  ANALYZING: '#3b82f6',
  COMPLETED: '#10b981',
  FAILED: '#ef4444',
};

export const API_ENDPOINTS = {
  PREDICTIONS: '/predictions/',
  PREDICTIONS_HISTORY: '/predictions/history/',
  PREDICTIONS_DETAIL: (id) => `/predictions/${id}/`,
  ANALYTICS_LEADERBOARD: '/analytics/leaderboard/',
  ANALYTICS_MODELS: '/analytics/models/',
};
