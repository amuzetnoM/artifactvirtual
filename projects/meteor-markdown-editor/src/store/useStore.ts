import { create } from 'zustand';
import { AppState, Document, Repository, Theme, GitStatus } from '../types';
import { persist } from 'zustand/middleware';
import { Octokit } from '@octokit/rest';

interface StoreState extends AppState {
  setDocuments: (documents: Document[]) => void;
  setCurrentDocument: (document: Document | null) => void;
  updateDocument: (document: Document) => void;
  createDocument: (title: string, content?: string, path?: string) => void;
  deleteDocument: (id: string) => void;
  setRepositories: (repositories: Repository[]) => void;
  setCurrentRepository: (repository: Repository | null) => void;
  toggleSidebar: () => void;
  setPreviewMode: (mode: 'split' | 'editor' | 'preview' | 'focus') => void;
  setTheme: (theme: Theme) => void;
  setGitStatus: (status: GitStatus | null) => void;
  setAuthenticated: (isAuthenticated: boolean, accessToken?: string) => void;
  octokit: Octokit | null;
}

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      documents: [],
      currentDocument: null,
      repositories: [],
      currentRepository: null,
      sidebarOpen: true,
      previewMode: 'split',
      theme: 'system',
      gitStatus: null,
      isAuthenticated: false,
      accessToken: undefined,
      octokit: null,

      setDocuments: (documents) => set({ documents }),
      
      setCurrentDocument: (document) => set({ currentDocument: document }),
      
      updateDocument: (document) => {
        const updatedDoc = { ...document, lastModified: new Date() };
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === document.id ? updatedDoc : doc
          ),
          currentDocument: state.currentDocument?.id === document.id
            ? updatedDoc
            : state.currentDocument,
        }));
      },
      
      createDocument: (title, content = '', path) => {
        const newDoc: Document = {
          id: Math.random().toString(36).substring(2, 15),
          title,
          content: content || `# ${title}\n\n`,
          tags: [],
          lastModified: new Date(),
          createdAt: new Date(),
          path,
          status: 'new',
        };
        
        set((state) => ({
          documents: [newDoc, ...state.documents],
          currentDocument: newDoc,
        }));
      },
      
      deleteDocument: (id) => {
        set((state) => {
          const newDocuments = state.documents.filter((doc) => doc.id !== id);
          return {
            documents: newDocuments,
            currentDocument: state.currentDocument?.id === id
              ? newDocuments[0] || null
              : state.currentDocument,
          };
        });
      },
      
      setRepositories: (repositories) => set({ repositories }),
      
      setCurrentRepository: (repository) => set({ currentRepository: repository }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setPreviewMode: (mode) => set({ previewMode: mode }),
      
      setTheme: (theme) => set({ theme }),
      
      setGitStatus: (status) => set({ gitStatus: status }),
      
      setAuthenticated: (isAuthenticated, accessToken) => {
        const octokit = accessToken ? new Octokit({ auth: accessToken }) : null;
        set({ isAuthenticated, accessToken, octokit });
      },
    }),
    {
      name: 'markdown-editor-storage',
      partialize: (state) => ({
        documents: state.documents,
        theme: state.theme,
        accessToken: state.accessToken,
      }),
    }
  )
);

export default useStore;