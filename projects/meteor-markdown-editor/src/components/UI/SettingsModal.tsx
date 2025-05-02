import { useState, useEffect } from 'react';
import { X, Key, Server } from 'lucide-react';
import { AVAILABLE_MODELS, ModelOption } from '../../services/aiService';
import { keyManagementService, APIKeyData } from '../../services/keyManagementService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'general' | 'appearance'>('ai');
  const [selectedModel, setSelectedModel] = useState<string>(localStorage.getItem('preferredModel') || 'local-distilgpt2');
  const [apiKeys, setApiKeys] = useState<Record<string, APIKeyData>>({});
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [newApiProvider, setNewApiProvider] = useState<string>('openai');
  const [isAdding, setIsAdding] = useState(false);

  // Load API keys on component mount
  useEffect(() => {
    if (isOpen) {
      const keys = keyManagementService.getAllKeys();
      setApiKeys(keys);
    }
  }, [isOpen]);

  // Save model preference when selected
  useEffect(() => {
    localStorage.setItem('preferredModel', selectedModel);
  }, [selectedModel]);

  // Handle adding a new API key
  const handleAddKey = () => {
    if (newApiKey && newApiProvider) {
      keyManagementService.addKey(newApiProvider, newApiKey);
      setNewApiKey('');
      setIsAdding(false);
      
      // Refresh the keys list
      setApiKeys(keyManagementService.getAllKeys());
    }
  };

  // Handle removing an API key
  const handleRemoveKey = (provider: string) => {
    keyManagementService.removeKey(provider);
    
    // Refresh the keys list
    setApiKeys(keyManagementService.getAllKeys());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 ${activeTab === 'ai' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveTab('ai')}
          >
            AI Features
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'appearance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'ai' && (
            <div>
              <section className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Model Selection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Select which AI model to use for text generation, suggestions, and analysis.
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                  {AVAILABLE_MODELS.map((model) => (
                    <div 
                      key={model.id} 
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedModel === model.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedModel(model.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Server size={18} className="text-gray-700 dark:text-gray-300" />
                          <div>
                            <h4 className="font-medium">{model.name}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{model.description}</p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full ${selectedModel === model.id ? 'bg-blue-500' : 'border border-gray-300 dark:border-gray-600'}`}></div>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-1">
                        {model.tasks.map((task) => (
                          <span 
                            key={`${model.id}-${task}`}
                            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                          >
                            {task.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                      
                      {model.requiresApiKey && (
                        <p className="mt-2 text-xs flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Key size={12} />
                          Requires API key
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
              
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">API Keys</h3>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    Add Key
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Manage your API keys for external LLM providers. Keys are stored securely in your browser.
                </p>
                
                {isAdding && (
                  <div className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Provider</label>
                      <select
                        value={newApiProvider}
                        onChange={(e) => setNewApiProvider(e.target.value)}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      >
                        <option value="openai">OpenAI</option>
                        <option value="azure">Azure AI</option>
                        <option value="anthropic">Anthropic</option>
                      </select>
                      
                      <label className="text-sm font-medium mt-2">API Key</label>
                      <input
                        type="password"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        placeholder="Enter your API key"
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                      
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={handleAddKey}
                          disabled={!newApiKey}
                          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsAdding(false);
                            setNewApiKey('');
                          }}
                          className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {Object.keys(apiKeys).length > 0 ? (
                    Object.entries(apiKeys).map(([provider, keyData]) => (
                      <div key={provider} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center">
                        <div>
                          <h4 className="font-medium capitalize">{provider}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Added: {new Date(keyData.dateAdded).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveKey(provider)}
                          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No API keys added yet.</p>
                  )}
                </div>
              </section>
            </div>
          )}
          
          {activeTab === 'general' && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">General settings will be implemented soon.</p>
            </div>
          )}
          
          {activeTab === 'appearance' && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">Appearance settings will be implemented soon.</p>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}