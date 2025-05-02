import { useState, useEffect } from 'react';
import { X, ExternalLink, Check, AlertCircle, FileEdit, Loader2 } from 'lucide-react';
import { Document, PublishTarget } from '../../types';

interface PublishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  onPublish: (target: PublishTarget, document: Document) => Promise<{ success: boolean; url?: string; error?: string }>;
}

// Available publishing targets
const PUBLISH_TARGETS: PublishTarget[] = [
  {
    id: 'github-pages',
    name: 'GitHub Pages',
    icon: 'github',
    description: 'Publish to your GitHub Pages site',
    url: 'https://pages.github.com',
    requiresAuth: true,
    supportedFormats: ['markdown', 'html'],
  },
  {
    id: 'dev-to',
    name: 'DEV.to',
    icon: 'dev',
    description: 'Developer community platform',
    url: 'https://dev.to',
    apiEndpoint: 'https://dev.to/api/articles',
    requiresAuth: true,
    supportedFormats: ['markdown'],
  },
  {
    id: 'hashnode',
    name: 'Hashnode',
    icon: 'hashnode',
    description: 'Developer blogging platform',
    url: 'https://hashnode.com',
    apiEndpoint: 'https://api.hashnode.com',
    requiresAuth: true,
    supportedFormats: ['markdown'],
  },
  {
    id: 'medium',
    name: 'Medium',
    icon: 'medium',
    description: 'Popular publishing platform',
    url: 'https://medium.com',
    apiEndpoint: 'https://api.medium.com/v1',
    requiresAuth: true,
    supportedFormats: ['markdown', 'html'],
  },
];

export default function PublishDialog({ isOpen, onClose, document, onPublish }: PublishDialogProps) {
  const [selectedTarget, setSelectedTarget] = useState<PublishTarget | null>(null);
  const [publishFormat, setPublishFormat] = useState<'markdown' | 'html'>('markdown');
  const [isMetadataValid, setIsMetadataValid] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);
  
  // Validate if document has required metadata for publishing
  useEffect(() => {
    const metadata = document.metadata;
    const hasRequiredMetadata = Boolean(
      metadata && 
      metadata.author && 
      metadata.description && 
      (metadata.keywords?.length ?? 0) > 0
    );
    setIsMetadataValid(hasRequiredMetadata);
  }, [document]);
  
  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTarget(null);
      setPublishFormat('markdown');
      setIsPublishing(false);
      setPublishResult(null);
    }
  }, [isOpen]);
  
  const handleSelectTarget = (target: PublishTarget) => {
    setSelectedTarget(target);
    // Default to markdown if supported, otherwise first supported format
    if (target.supportedFormats.includes('markdown')) {
      setPublishFormat('markdown');
    } else {
      setPublishFormat(target.supportedFormats[0]);
    }
  };
  
  const handlePublish = async () => {
    if (!selectedTarget) return;
    
    setIsPublishing(true);
    setPublishResult(null);
    
    try {
      const result = await onPublish(selectedTarget, document);
      setPublishResult(result);
    } catch (error) {
      setPublishResult({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsPublishing(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Publish Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {!isMetadataValid && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md flex items-start gap-3 dark:bg-yellow-900/20 dark:border-yellow-800/50 dark:text-yellow-400">
              <AlertCircle size={20} className="mt-0.5" />
              <div>
                <h3 className="font-medium">Missing required metadata</h3>
                <p className="text-sm mt-1">
                  Your document is missing required metadata for publishing. Please add author, description, and keywords.
                </p>
                <button
                  className="flex items-center gap-1 mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={() => {
                    onClose();
                    // This would typically trigger the metadata panel to open
                    // You would need to implement this behavior in the parent component
                  }}
                >
                  <FileEdit size={14} />
                  Edit Metadata
                </button>
              </div>
            </div>
          )}
          
          {publishResult && (
            <div className={`mb-4 p-3 border rounded-md flex items-start gap-3 ${
              publishResult.success 
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400' 
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'
            }`}>
              {publishResult.success ? <Check size={20} className="mt-0.5" /> : <AlertCircle size={20} className="mt-0.5" />}
              <div>
                <h3 className="font-medium">
                  {publishResult.success ? 'Published successfully!' : 'Publishing failed'}
                </h3>
                <p className="text-sm mt-1">
                  {publishResult.success 
                    ? 'Your document has been published.' 
                    : publishResult.error || 'An error occurred while publishing.'}
                </p>
                {publishResult.success && publishResult.url && (
                  <a
                    href={publishResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink size={14} />
                    View Published Document
                  </a>
                )}
              </div>
            </div>
          )}
          
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Select Destination</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {PUBLISH_TARGETS.map((target) => (
              <div
                key={target.id}
                onClick={() => handleSelectTarget(target)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTarget?.id === target.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* This would be replaced with actual icons if available */}
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold">
                    {target.icon.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">{target.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{target.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedTarget && (
            <>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Publish Settings</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
                <div className="flex gap-3">
                  {selectedTarget.supportedFormats.map((format) => (
                    <label key={format} className="flex items-center">
                      <input
                        type="radio"
                        checked={publishFormat === format}
                        onChange={() => setPublishFormat(format as 'markdown' | 'html')}
                        className="mr-2"
                      />
                      <span className="capitalize">{format}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-700/30 dark:border-gray-600">
                <h4 className="font-medium mb-1">Document Information</h4>
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div className="flex">
                    <span className="font-medium w-24">Title:</span>
                    <span>{document.title}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">Author:</span>
                    <span>{document.metadata?.author || 'Not set'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">Keywords:</span>
                    <span>{document.metadata?.keywords?.join(', ') || 'Not set'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">Pub. Date:</span>
                    <span>
                      {document.metadata?.publishDate 
                        ? new Date(document.metadata.publishDate).toLocaleDateString() 
                        : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div>
            {selectedTarget?.requiresAuth && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Note: This platform requires authentication.
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={!selectedTarget || !isMetadataValid || isPublishing}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPublishing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}