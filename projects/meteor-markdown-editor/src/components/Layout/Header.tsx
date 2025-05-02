import { useState } from 'react';
import { Search, Moon, Sun, Menu, X, Save, Download, Upload, Settings, Plus } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

interface HeaderProps {
  onCreateNew: () => void;
  onSearch: (query: string) => void;
}

export default function Header({ onCreateNew, onSearch }: HeaderProps) {
  const { state, toggleSidebar, toggleTheme } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center px-4 sticky top-0 z-10 transition-colors duration-200">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
            aria-label={state.sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {state.sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="font-bold text-lg text-gray-900 dark:text-white hidden md:block">
              <span className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">
                METEOR
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="relative md:w-64">
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setIsSearchOpen(false)}
              >
                <X size={16} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          )}
          
          <button
            onClick={onCreateNew}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 hidden sm:flex"
            aria-label="New document"
          >
            <Plus size={20} />
          </button>
          
          <button
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 hidden md:flex"
            aria-label="Save"
          >
            <Save size={20} />
          </button>
          
          <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-1 hidden md:block"></div>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
            aria-label={state.theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
          >
            {state.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 hidden lg:flex"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}