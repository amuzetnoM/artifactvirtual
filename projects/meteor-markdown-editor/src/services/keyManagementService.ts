import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the interface for API key data
export interface APIKeyData {
  provider: string;
  key: string;
  isEncrypted: boolean;
  dateAdded: string;
  lastUsed: string | null;
}

interface KeyState {
  apiKeys: Record<string, APIKeyData>;
  addKey: (provider: string, key: string) => void;
  removeKey: (provider: string) => void;
  getKey: (provider: string) => string | null;
  validateKey: (provider: string) => boolean;
  getAllKeys: () => Record<string, APIKeyData>;
}

// A simple encryption function - Note: In a production app, use a more robust encryption method
const encryptKey = (key: string): string => {
  // Simple XOR encryption with a static key (this is NOT secure for production)
  // In a real app, use the Web Crypto API or a proper encryption library
  const encryptionKey = 'MeteorMarkdownEditor';
  return Array.from(key)
    .map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ 
      encryptionKey.charCodeAt(i % encryptionKey.length))
    )
    .join('');
};

// Corresponding decryption function
const decryptKey = (encryptedKey: string): string => {
  // Since XOR encryption is symmetric, we can use the same function
  return encryptKey(encryptedKey);
};

// Create a Zustand store with localStorage persistence
export const useKeyStore = create<KeyState>()(
  persist(
    (set, get) => ({
      apiKeys: {},
      
      addKey: (provider, key) => set((state) => {
        const encryptedKey = encryptKey(key);
        return {
          apiKeys: {
            ...state.apiKeys,
            [provider]: {
              provider,
              key: encryptedKey,
              isEncrypted: true,
              dateAdded: new Date().toISOString(),
              lastUsed: null,
            },
          },
        };
      }),
      
      removeKey: (provider) => set((state) => {
        const newApiKeys = { ...state.apiKeys };
        delete newApiKeys[provider];
        return { apiKeys: newApiKeys };
      }),
      
      getKey: (provider) => {
        const state = get();
        const apiKeyData = state.apiKeys[provider];
        
        if (!apiKeyData) {
          return null;
        }
        
        // Update last used timestamp
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [provider]: {
              ...apiKeyData,
              lastUsed: new Date().toISOString(),
            },
          },
        }));
        
        // Return decrypted key
        return apiKeyData.isEncrypted ? decryptKey(apiKeyData.key) : apiKeyData.key;
      },
      
      validateKey: (provider) => {
        const state = get();
        return provider in state.apiKeys;
      },
      
      getAllKeys: () => {
        const state = get();
        return state.apiKeys;
      },
    }),
    {
      name: 'meteor-md-api-keys',
      // Only store encrypted keys
      partialize: (state) => ({ apiKeys: state.apiKeys }),
    }
  )
);

// Create a service wrapper for the key management store
export const keyManagementService = {
  addKey: (provider: string, key: string) => useKeyStore.getState().addKey(provider, key),
  removeKey: (provider: string) => useKeyStore.getState().removeKey(provider),
  getKey: (provider: string) => useKeyStore.getState().getKey(provider),
  validateKey: (provider: string) => useKeyStore.getState().validateKey(provider),
  getAllKeys: () => useKeyStore.getState().getAllKeys(),
};