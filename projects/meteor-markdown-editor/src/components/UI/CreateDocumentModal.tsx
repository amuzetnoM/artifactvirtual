import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDocument: (title: string) => void;
}

export default function CreateDocumentModal({
  isOpen,
  onClose,
  onCreateDocument,
}: CreateDocumentModalProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateDocument(title.trim());
      setTitle('');
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md transition-all duration-200 transform scale-100 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Document</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="documentTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document Title
            </label>
            <input
              ref={inputRef}
              id="documentTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter document title"
              required
              data-testid="create-doc-modal-input" // Added test ID
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
              data-testid="create-doc-modal-submit" // Added test ID
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}