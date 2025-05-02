export interface Document {
  id: string;
  title: string;
  content: string;
  tags: string[];
  lastModified: Date;
  createdAt: Date;
  path?: string;
  repository?: string;
  branch?: string;
  sha?: string;
  status?: 'modified' | 'unmodified' | 'new';
  metadata?: DocumentMetadata;
}

export interface DocumentMetadata {
  author?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  publishDate?: Date;
  lastPublished?: {
    platform: string;
    url: string;
    date: Date;
  }[];
}

export interface AIAnalysis {
  structureScore: number;
  readabilityScore: number;
  suggestions: AISuggestion[];
  summary?: string;
}

export interface AISuggestion {
  id: string;
  type: 'structure' | 'grammar' | 'spelling' | 'formatting' | 'readability' | 'seo' | 'linking' | 'style' | 'punctuation';
  description: string;
  position: {
    start: number;
    end: number;
  };
  severity: 'info' | 'warning' | 'error';
  suggestedFix?: string;
}

export interface ContentGenerationPrompt {
  type: 'paragraph' | 'section' | 'conclusion' | 'introduction' | 'custom';
  context: string;
  instructions: string;
  length?: 'short' | 'medium' | 'long';
}

export interface AIModelPreferences {
  preferredModel: string;
  enableAutocompleteSuggestions: boolean;
  enableGrammarCheck: boolean;
  suggestionDelay: number;
}

export type Theme = 'light' | 'dark' | 'system';

export interface Repository {
  id: string;
  name: string;
  owner: string;
  defaultBranch: string;
  branches: string[];
  connected: boolean;
}

export interface GitStatus {
  ahead: number;
  behind: number;
  modified: string[];
  staged: string[];
  untracked: string[];
}

export interface AppState {
  documents: Document[];
  currentDocument: Document | null;
  repositories: Repository[];
  currentRepository: Repository | null;
  sidebarOpen: boolean;
  previewMode: 'split' | 'editor' | 'preview' | 'focus';
  theme: Theme;
  gitStatus: GitStatus | null;
  isAuthenticated: boolean;
  accessToken?: string;
  aiPreferences: AIModelPreferences;
  isSettingsOpen: boolean;
}

export interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: Date;
  changes: {
    added: string[];
    modified: string[];
    removed: string[];
  };
}

export interface FileTree {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTree[];
}

export interface PublishTarget {
  id: string;
  name: string;
  icon: string;
  description: string;
  url: string;
  apiEndpoint?: string;
  requiresAuth: boolean;
  supportedFormats: ('markdown' | 'html')[];
}