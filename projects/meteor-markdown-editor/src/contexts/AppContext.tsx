import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Define available themes
type Theme = 'light' | 'dark-current' | 'dark-slate' | 'dark-midnight';
const themes: Theme[] = ['light', 'dark-current', 'dark-slate', 'dark-midnight'];

interface AppState {
  documents: Document[];
  currentDocument: Document | null;
  previewMode: 'split' | 'editor' | 'preview';
  theme: Theme;
  sidebarOpen: boolean;
}

type AppAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR', payload: boolean }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME', payload: Theme }
  | { type: 'SET_CURRENT_DOCUMENT', payload: Document | null }
  | { type: 'UPDATE_DOCUMENT', payload: Document }
  | { type: 'CREATE_DOCUMENT', payload: string }
  | { type: 'DELETE_DOCUMENT', payload: string }
  | { type: 'SET_PREVIEW_MODE', payload: 'split' | 'editor' | 'preview' };

const initialState: AppState = {
  documents: sampleDocuments,
  currentDocument: sampleDocuments[0],
  previewMode: 'split',
  theme: localStorage.getItem('theme') as Theme || 'light',
  sidebarOpen: true,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setCurrentDocument: (document: Document | null) => void;
  updateDocument: (document: Document) => void;
  createDocument: (title: string) => void;
  deleteDocument: (id: string) => void;
  setPreviewMode: (mode: 'split' | 'editor' | 'preview') => void;
}>({
  state: initialState,
  dispatch: () => null,
  toggleSidebar: () => {},
  toggleTheme: () => {},
  setCurrentDocument: () => {},
  updateDocument: () => {},
  createDocument: () => {},
  deleteDocument: () => {},
  setPreviewMode: () => {},
});

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
    case 'TOGGLE_THEME': {
      const currentIndex = themes.indexOf(state.theme);
      const nextIndex = (currentIndex + 1) % themes.length;
      const nextTheme = themes[nextIndex];
      return { ...state, theme: nextTheme };
    }
    case 'SET_THEME':
      if (themes.includes(action.payload)) {
        return { ...state, theme: action.payload };
      }
      return state;
    case 'SET_CURRENT_DOCUMENT':
      return { ...state, currentDocument: action.payload };
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === action.payload.id ? { ...action.payload, lastModified: new Date() } : doc
        ),
        currentDocument: action.payload.id === state.currentDocument?.id
          ? { ...action.payload, lastModified: new Date() }
          : state.currentDocument,
      };
    case 'CREATE_DOCUMENT':
      const newDoc: Document = {
        id: Math.random().toString(36).substring(2, 15),
        title: action.payload,
        content: `# ${action.payload}\n\n`,
        tags: [],
        lastModified: new Date(),
        createdAt: new Date(),
      };
      return {
        ...state,
        documents: [newDoc, ...state.documents],
        currentDocument: newDoc,
      };
    case 'DELETE_DOCUMENT':
      const newDocuments = state.documents.filter((doc) => doc.id !== action.payload);
      return {
        ...state,
        documents: newDocuments,
        currentDocument: state.currentDocument?.id === action.payload
          ? newDocuments.length > 0 ? newDocuments[0] : null
          : state.currentDocument,
      };
    case 'SET_PREVIEW_MODE':
      return { ...state, previewMode: action.payload };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const htmlElement = document.documentElement;
    themes.forEach(t => {
      if (t !== 'light') {
        htmlElement.classList.remove(t.replace('dark-', 'dark-theme-'));
      }
    });
    htmlElement.classList.remove('dark');
    if (state.theme !== 'light') {
      htmlElement.classList.add(state.theme.replace('dark-', 'dark-theme-'));
    }
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);

  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' });
  const setCurrentDocument = (document: Document | null) => dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: document });
  const updateDocument = (document: Document) => dispatch({ type: 'UPDATE_DOCUMENT', payload: document });
  const createDocument = (title: string) => dispatch({ type: 'CREATE_DOCUMENT', payload: title });
  const deleteDocument = (id: string) => dispatch({ type: 'DELETE_DOCUMENT', payload: id });
  const setPreviewMode = (mode: 'split' | 'editor' | 'preview') => dispatch({ type: 'SET_PREVIEW_MODE', payload: mode });

  return (
    <AppContext.Provider value={{ state, dispatch, toggleSidebar, toggleTheme, setCurrentDocument, updateDocument, createDocument, deleteDocument, setPreviewMode }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};