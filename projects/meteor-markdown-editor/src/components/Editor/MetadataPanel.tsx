import { useState, useEffect } from 'react';
import { Document, DocumentMetadata } from '../../types';
import { X, Plus, Tag, Link, Calendar, User, FileText } from 'lucide-react';

interface MetadataPanelProps {
  document: Document;
  onUpdateMetadata: (metadata: DocumentMetadata) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function MetadataPanel({ document, onUpdateMetadata, isOpen, onClose }: MetadataPanelProps) {
  const [metadata, setMetadata] = useState<DocumentMetadata>(document.metadata || {});
  const [newKeyword, setNewKeyword] = useState<string>('');
  
  // Initialize metadata from document when component mounts or document changes
  useEffect(() => {
    setMetadata(document.metadata || {});
  }, [document]);
  
  const handleAuthorChange = (value: string) => {
    setMetadata(prev => ({ ...prev, author: value }));
  };
  
  const handleDescriptionChange = (value: string) => {
    setMetadata(prev => ({ ...prev, description: value }));
  };
  
  const handleCanonicalUrlChange = (value: string) => {
    setMetadata(prev => ({ ...prev, canonicalUrl: value }));
  };
  
  const handlePublishDateChange = (value: string) => {
    setMetadata(prev => ({ ...prev, publishDate: value ? new Date(value) : undefined }));
  };
  
  const handleAddKeyword = () => {
    if (newKeyword.trim() && !metadata.keywords?.includes(newKeyword.trim())) {
      setMetadata(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };
  
  const handleRemoveKeyword = (keyword: string) => {
    setMetadata(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword)
    }));
  };
  
  const handleSaveMetadata = () => {
    onUpdateMetadata(metadata);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Document Metadata</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <User size={16} />
                Author
              </label>
              <input
                type="text"
                value={metadata.author || ''}
                onChange={(e) => handleAuthorChange(e.target.value)}
                placeholder="Author name"
                className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <FileText size={16} />
                Description
              </label>
              <textarea
                value={metadata.description || ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Brief description of the document"
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Calendar size={16} />
                Publish Date
              </label>
              <input
                type="date"
                value={metadata.publishDate ? new Date(metadata.publishDate).toISOString().split('T')[0] : ''}
                onChange={(e) => handlePublishDateChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Link size={16} />
                Canonical URL
              </label>
              <input
                type="url"
                value={metadata.canonicalUrl || ''}
                onChange={(e) => handleCanonicalUrlChange(e.target.value)}
                placeholder="https://example.com/your-article"
                className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Tag size={16} />
                Keywords
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                  placeholder="Enter keyword"
                  className="flex-1 p-2 border border-gray-300 rounded-l-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleAddKeyword}
                  className="bg-blue-500 text-white py-2 px-4 rounded-r-md hover:bg-blue-600 transition-colors flex items-center"
                >
                  <Plus size={18} />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {metadata.keywords?.map((keyword) => (
                  <span
                    key={keyword}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center gap-1 dark:bg-gray-700 dark:text-gray-200"
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            
            {metadata.lastPublished && metadata.lastPublished.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Publication History</h3>
                <div className="space-y-2">
                  {metadata.lastPublished.map((pub, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded-md dark:bg-gray-700">
                      <div className="flex justify-between">
                        <span className="font-medium">{pub.platform}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(pub.date).toLocaleDateString()}
                        </span>
                      </div>
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 text-sm hover:underline"
                      >
                        {pub.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveMetadata}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Save Metadata
          </button>
        </div>
      </div>
    </div>
  );
}