// API Configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.meteormarkdown.com'  // Production URL (replace with actual URL)
  : 'http://localhost:3001';          // Development URL

// Feature flags
export const FEATURES = {
  AI_ENABLED: true,
  SOURCE_CONTROL_ENABLED: true,
};

// App settings
export const APP_SETTINGS = {
  MAX_DOCUMENTS: 100,
  AUTO_SAVE_INTERVAL: 5000, // milliseconds
};

// Default AI model if none selected
export const DEFAULT_AI_MODEL = 'local-distilgpt2';