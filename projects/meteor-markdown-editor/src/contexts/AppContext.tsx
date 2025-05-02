import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Document, Theme } from '../types';
import { sampleDocuments } from '../data/sampleDocuments';

interface AppContextType {
  state: AppState;
  setCurrentDocument: (document: Document | null) => void;
  updateDocument: (document: Document) => void;
  createDocument: (title: string) => void;
  deleteDocument: (id: string) => void;
  toggleSidebar: () => void;
  setPreviewMode: (mode: 'split' | 'editor' | 'preview') => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state with localStorage data if available
  const [state, setState] = useState<AppState>(() => {
    const savedState = localStorage.getItem('markdownEditorState');
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    // Determine the initial theme based on user preference or system setting
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme: Theme = savedTheme || (prefersDarkMode ? 'dark' : 'light');
    
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      return {
        ...parsedState,
        // Convert string dates back to Date objects
        documents: parsedState.documents.map((doc: any) => ({
          ...doc,
          lastModified: new Date(doc.lastModified),
          createdAt: new Date(doc.createdAt),
        })),
        theme: initialTheme,
      };
    }
    
    return {
      documents: sampleDocuments,
      currentDocument: sampleDocuments[0],
      sidebarOpen: true,
      previewMode: 'split',
      theme: initialTheme,
    };
  });

  // Apply theme class to document
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('markdownEditorState', JSON.stringify(state));
    localStorage.setItem('theme', state.theme);
  }, [state]);

  // Set current document
  const setCurrentDocument = (document: Document | null) => {
    setState((prevState) => ({
      ...prevState,
      currentDocument: document,
    }));
  };

  // Update existing document
  const updateDocument = (updatedDoc: Document) => {
    setState((prevState) => ({
      ...prevState,
      documents: prevState.documents.map((doc) => 
        doc.id === updatedDoc.id ? { ...updatedDoc, lastModified: new Date() } : doc
      ),
      currentDocument: updatedDoc.id === prevState.currentDocument?.id 
        ? { ...updatedDoc, lastModified: new Date() } 
        : prevState.currentDocument,
    }));
  };

  // Create new document
  const createDocument = (title: string) => {
    const newDoc: Document = {
      id: Math.random().toString(36).substring(2, 15),
      title,
      content: `# ${title}\n\n`,
      tags: [],
      lastModified: new Date(),
      createdAt: new Date(),
    };
    
    setState((prevState) => ({
      ...prevState,
      documents: [newDoc, ...prevState.documents],
      currentDocument: newDoc,
    }));
  };

  // Delete document
  const deleteDocument = (id: string) => {
    setState((prevState) => {
      const newDocuments = prevState.documents.filter((doc) => doc.id !== id);
      return {
        ...prevState,
        documents: newDocuments,
        currentDocument: prevState.currentDocument?.id === id 
          ? newDocuments.length > 0 ? newDocuments[0] : null 
          : prevState.currentDocument,
      };
    });
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setState((prevState) => ({
      ...prevState,
      sidebarOpen: !prevState.sidebarOpen,
    }));
  };

  // Set preview mode
  const setPreviewMode = (mode: 'split' | 'editor' | 'preview') => {
    setState((prevState) => ({
      ...prevState,
      previewMode: mode,
    }));
  };

  // Toggle theme
  const toggleTheme = () => {
    setState((prevState) => ({
      ...prevState,
      theme: prevState.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const value = {
    state,
    setCurrentDocument,
    updateDocument,
    createDocument,
    deleteDocument,
    toggleSidebar,
    setPreviewMode,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};