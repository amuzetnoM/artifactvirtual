import { useState } from 'react';
import { Maximize2, Minimize2, FileText, Eye, Edit } from 'lucide-react';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';
import AIAnalysisPanel from './AIAnalysisPanel';
import { Document } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

interface EditorContainerProps {
  document: Document;
  onDocumentChange: (content: string) => void;
}

export default function EditorContainer({ document, onDocumentChange }: EditorContainerProps) {
  const { state, setPreviewMode } = useAppContext();
  const [resizingEditor, setResizingEditor] = useState(false);
  const [editorWidth, setEditorWidth] = useState(50); // Percentage of container width
  
  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setResizingEditor(true);
    
    const startX = e.clientX;
    const startWidth = editorWidth;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const containerWidth = document.getElementById('editor-container')?.clientWidth || 1000;
      const newWidth = startWidth + ((moveEvent.clientX - startX) / containerWidth) * 100;
      
      // Limit the width between 30% and 70%
      const clampedWidth = Math.min(Math.max(newWidth, 30), 70);
      setEditorWidth(clampedWidth);
    };
    
    const onMouseUp = () => {
      setResizingEditor(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-2 flex items-center justify-between transition-colors duration-200">
        <div className="flex items-center space-x-2">
          <FileText size={16} className="text-gray-500 dark:text-gray-400" />
          <h2 className="text-base font-medium text-gray-800 dark:text-gray-200">{document.title}</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreviewMode('editor')}
            className={`p-1.5 rounded text-xs flex items-center space-x-1 ${
              state.previewMode === 'editor'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            } transition-colors duration-150`}
            title="Editor Only"
          >
            <Edit size={14} />
            <span className="hidden sm:inline">Editor</span>
          </button>
          
          <button
            onClick={() => setPreviewMode('split')}
            className={`p-1.5 rounded text-xs flex items-center space-x-1 ${
              state.previewMode === 'split'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            } transition-colors duration-150`}
            title="Split View"
          >
            {state.previewMode === 'split' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span className="hidden sm:inline">Split</span>
          </button>
          
          <button
            onClick={() => setPreviewMode('preview')}
            className={`p-1.5 rounded text-xs flex items-center space-x-1 ${
              state.previewMode === 'preview'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            } transition-colors duration-150`}
            title="Preview Only"
          >
            <Eye size={14} />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>
      </div>
      
      <div 
        id="editor-container" 
        className="flex flex-1 overflow-hidden"
        style={{ cursor: resizingEditor ? 'col-resize' : 'auto' }}
      >
        {(state.previewMode === 'editor' || state.previewMode === 'split') && (
          <div 
            className="h-full overflow-auto transition-all ease-in-out duration-200"
            style={{ 
              width: state.previewMode === 'split' 
                ? `${editorWidth}%` 
                : '100%'
            }}
          >
            <MarkdownEditor document={document} onChange={onDocumentChange} />
          </div>
        )}
        
        {state.previewMode === 'split' && (
          <div
            className="w-2 h-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 cursor-col-resize flex items-center justify-center transition-colors duration-150"
            onMouseDown={handleResize}
          >
            <div className="w-1 h-8 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
          </div>
        )}
        
        {(state.previewMode === 'preview' || state.previewMode === 'split') && (
          <div 
            className="h-full overflow-auto transition-all ease-in-out duration-200"
            style={{ 
              width: state.previewMode === 'split' 
                ? `${100 - editorWidth - 0.5}%`
                : '100%'
            }}
          >
            <MarkdownPreview document={document} />
          </div>
        )}
      </div>
      
      <AIAnalysisPanel document={document} />
    </div>
  );
}