import { useState } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import EditorContainer from './components/Editor/EditorContainer';
import CreateDocumentModal from './components/UI/CreateDocumentModal';
import { AppProvider, useAppContext } from './contexts/AppContext';

function MainApp() {
  const { state, updateDocument, createDocument } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const handleDocumentChange = (content: string) => {
    if (state.currentDocument) {
      updateDocument({
        ...state.currentDocument,
        content,
      });
    }
  };
  
  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Header onCreateNew={handleCreateNew} onSearch={handleSearch} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onCreateNew={handleCreateNew} onSearch={handleSearch} />
        
        <main className={`flex-1 transition-all duration-200 ${state.sidebarOpen ? 'md:ml-64' : ''}`}>
          {state.currentDocument ? (
            <div className="h-full">
              <EditorContainer
                document={state.currentDocument}
                onDocumentChange={handleDocumentChange}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                <h2 className="text-xl font-bold mb-2">No document selected</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select a document from the sidebar or create a new one to get started.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                >
                  Create New Document
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      
      <CreateDocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateDocument={createDocument}
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;