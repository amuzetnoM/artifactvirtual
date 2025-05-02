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

  // Helper function to get the correct icon based on the current theme
  const getThemeIcon = () => {
    // Simple cycle for now, could be more specific if needed
    if (state.theme === 'light') return <Moon size={20} />;
    // Add icons for other dark themes if desired, otherwise Sun for all darks
    return <Sun size={20} />; 
  };
  
  const getThemeAriaLabel = () => {
    if (state.theme === 'light') return "Switch to dark mode";
    // Could customize label based on next theme in cycle
    return "Switch theme"; 
  }

  return (
    <header className="h-14 border-b px-4 sticky top-0 z-10 flex items-center transition-colors duration-200 bg-card border-border text-card-foreground">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-muted transition-colors duration-150"
            aria-label={state.sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {state.sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="font-bold text-lg hidden md:block">
              <span className="ml-2 text-lg font-semibold">
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
                className="w-full px-3 py-1.5 bg-muted border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-150 border-border text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setIsSearchOpen(false)}
              >
                <X size={16} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-md hover:bg-muted transition-colors duration-150"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          )}
          
          <button
            onClick={onCreateNew}
            className="p-2 rounded-md hover:bg-muted transition-colors duration-150 hidden sm:flex"
            aria-label="New document"
          >
            <Plus size={20} />
          </button>
          
          <button
            className="p-2 rounded-md hover:bg-muted transition-colors duration-150 hidden md:flex"
            aria-label="Save"
          >
            <Save size={20} />
          </button>
          
          <div className="border-l h-6 mx-1 hidden md:block border-border"></div>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-muted transition-colors duration-150"
            aria-label={getThemeAriaLabel()}
          >
            {getThemeIcon()}
          </button>
          
          <button
            className="p-2 rounded-md hover:bg-muted transition-colors duration-150 hidden lg:flex"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}