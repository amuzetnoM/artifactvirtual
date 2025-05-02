import { useState } from 'react';
import { Search, Tag, Plus, Trash2, FileText, GitBranch, History } from 'lucide-react';
import { Document } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import FileTree from '../SourceControl/FileTree';
import CommitHistory from '../SourceControl/CommitHistory';
import RepositoryList from '../SourceControl/RepositoryList';

interface SidebarProps {
  onCreateNew: () => void;
  onSearch: (query: string) => void;
}

export default function Sidebar({ onCreateNew, onSearch }: SidebarProps) {
  const { state, setCurrentDocument, deleteDocument } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'documents' | 'repository' | 'history'>('documents');
  
  // Extract all unique tags from documents
  const allTags = Array.from(
    new Set(state.documents.flatMap((doc) => doc.tags))
  ).sort();
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };
  
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };
  
  // Filter documents based on search query and selected tags
  const filteredDocuments = state.documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 ||
                        selectedTags.some((tag) => doc.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const handleDeleteDocument = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocument(id);
    }
  };

  return (
    <aside 
      className={`w-64 h-[calc(100vh-3.5rem)] flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200 fixed md:relative z-10 ${
        state.sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0'
      }`}
    >
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'documents'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={16} className="inline-block mr-1" />
          Documents
        </button>
        <button
          onClick={() => setActiveTab('repository')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'repository'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <GitBranch size={16} className="inline-block mr-1" />
          Repository
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <History size={16} className="inline-block mr-1" />
          History
        </button>
      </div>

      {activeTab === 'documents' && (
        <>
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full px-3 py-2 pl-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            
            <div className="flex justify-between items-center mt-6 mb-2">
              <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">TAGS</h3>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Tag size={12} />
                  {tag}
                </button>
              ))}
              {allTags.length === 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">No tags yet</span>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center px-4 mt-2">
            <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">DOCUMENTS</h3>
            <button
              onClick={onCreateNew}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-150"
              aria-label="New document"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-2">
            <ul className="space-y-1 px-2">
              {filteredDocuments.map((doc) => (
                <li key={doc.id}>
                  <div
                    className={`flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-colors duration-150 ${
                      state.currentDocument?.id === doc.id
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setCurrentDocument(doc)}
                  >
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <FileText size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="truncate">{doc.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteDocument(e, doc.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity duration-150"
                      aria-label="Delete document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
              {filteredDocuments.length === 0 && (
                <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No documents found
                </li>
              )}
            </ul>
          </div>
        </>
      )}

      {activeTab === 'repository' && (
        <div className="flex-1 overflow-y-auto">
          <RepositoryList />
          {state.currentRepository && <FileTree tree={[]} />}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="flex-1 overflow-y-auto">
          <CommitHistory />
        </div>
      )}
    </aside>
  );
}