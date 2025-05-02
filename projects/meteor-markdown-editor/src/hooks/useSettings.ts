import { useState, useEffect } from 'react';

// Define types for settings
interface AIAssistantSettings {
  enabled: boolean;
  preferredModel: string | null;
  showDetails: boolean;
}

interface Features {
  aiAssistant: AIAssistantSettings;
}

export interface Settings {
  features: Features;
}

// Default settings
const defaultSettings: Settings = {
  features: {
    aiAssistant: {
      enabled: true,
      preferredModel: localStorage.getItem('preferredModel') || null,
      showDetails: false
    }
  }
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    // Try to load settings from localStorage
    const savedSettings = localStorage.getItem('markdownEditorSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Failed to parse settings from localStorage:', e);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('markdownEditorSettings', JSON.stringify(settings));
  }, [settings]);

  // Function to update settings
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  // Function to update specific feature settings
  const updateFeature = (featureName: keyof Features, featureSettings: Partial<any>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      features: {
        ...prevSettings.features,
        [featureName]: {
          ...prevSettings.features[featureName],
          ...featureSettings
        }
      }
    }));
  };

  // Toggle AI assistant
  const toggleAIAssistant = () => {
    updateFeature('aiAssistant', {
      enabled: !settings.features.aiAssistant.enabled
    });
  };

  // Set preferred model
  const setPreferredModel = (modelId: string) => {
    updateFeature('aiAssistant', {
      preferredModel: modelId
    });
    // Also save to localStorage directly for compatibility with SettingsModal
    localStorage.setItem('preferredModel', modelId);
  };

  // Toggle showing detailed stats
  const toggleShowDetails = () => {
    updateFeature('aiAssistant', {
      showDetails: !settings.features.aiAssistant.showDetails
    });
  };

  return {
    settings,
    updateSettings,
    updateFeature,
    toggleAIAssistant,
    setPreferredModel,
    toggleShowDetails
  };
}