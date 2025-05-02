import { useState, useEffect } from 'react';
import { X, Sparkles, Clock, RefreshCw } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { ContentGenerationPrompt } from '../../types';

interface ContentGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertContent: (content: string) => void;
  contextText?: string;
  cursorPosition?: number;
}

const PROMPT_TEMPLATES = [
  {
    type: 'paragraph',
    label: 'Write a paragraph',
    instructions: 'Write a detailed paragraph about the following topic:',
    placeholder: 'Topic or specific instructions...',
  },
  {
    type: 'introduction',
    label: 'Create an introduction',
    instructions: 'Write an engaging introduction for an article with the following focus:',
    placeholder: 'Article focus or main points...',
  },
  {
    type: 'conclusion',
    label: 'Create a conclusion',
    instructions: 'Write a conclusion that summarizes the following points:',
    placeholder: 'Main points to summarize...',
  },
  {
    type: 'section',
    label: 'Create a section',
    instructions: 'Write a section for my document covering the following:',
    placeholder: 'Section topic and key points...',
  },
  {
    type: 'custom',
    label: 'Custom instructions',
    instructions: '',
    placeholder: 'Enter detailed instructions for what you need...',
  }
];

export default function ContentGenerationDialog({ 
  isOpen, 
  onClose, 
  onInsertContent,
  contextText = '',
  cursorPosition
}: ContentGenerationDialogProps) {
  const [selectedPromptType, setSelectedPromptType] = useState<ContentGenerationPrompt['type']>('paragraph');
  const [instructionsText, setInstructionsText] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [length, setLength] = useState<ContentGenerationPrompt['length']>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsGenerating(false);
      setGeneratedContent('');
      setError(null);
      setSelectedPromptType('paragraph');
      setInstructionsText('');
      setCustomInstructions('');
    }
  }, [isOpen]);
  
  // Update instructions text when prompt type changes
  useEffect(() => {
    const template = PROMPT_TEMPLATES.find(t => t.type === selectedPromptType);
    if (template) {
      setInstructionsText(template.instructions);
    }
  }, [selectedPromptType]);
  
  const handleGenerateContent = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const prompt: ContentGenerationPrompt = {
        type: selectedPromptType,
        context: contextText,
        instructions: selectedPromptType === 'custom' ? customInstructions : `${instructionsText} ${customInstructions}`,
        length,
      };
      
      // Construct a complete prompt for the AI service
      const promptText = `
${prompt.context ? `CONTEXT:\n${prompt.context}\n\n` : ''}
INSTRUCTIONS: ${prompt.instructions}
${prompt.length ? `LENGTH: ${prompt.length === 'short' ? 'Write a concise response (1-2 paragraphs)' : 
  prompt.length === 'medium' ? 'Write a moderate-length response (2-4 paragraphs)' : 
  'Write a detailed, comprehensive response (4+ paragraphs)'}\n` : ''}
FORMAT: Markdown

GENERATED CONTENT:
`;

      // Call the AI service to generate content
      const content = await aiService.getCompletion({
        prompt: promptText,
        maxTokens: prompt.length === 'short' ? 150 : prompt.length === 'medium' ? 300 : 600,
        model: localStorage.getItem('preferredModel') || 'local-distilgpt2',
      });
      
      setGeneratedContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
      console.error('Content generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleInsertContent = () => {
    if (generatedContent) {
      onInsertContent(generatedContent);
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Sparkles size={18} className="text-blue-500" />
            Generate Content
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              What would you like to generate?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {PROMPT_TEMPLATES.map((template) => (
                <button
                  key={template.type}
                  onClick={() => setSelectedPromptType(template.type as ContentGenerationPrompt['type'])}
                  className={`p-2 text-sm rounded-md border ${
                    selectedPromptType === template.type
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  {template.label}
                </button>
              ))}
            </div>
            
            {selectedPromptType !== 'custom' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {instructionsText}
                </label>
                <input
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder={PROMPT_TEMPLATES.find(t => t.type === selectedPromptType)?.placeholder}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
            
            {selectedPromptType === 'custom' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custom instructions:
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Be as specific as possible about what you want..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Length:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLength('short')}
                  className={`flex-1 p-2 text-sm rounded-md border ${
                    length === 'short'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  Short
                </button>
                <button
                  onClick={() => setLength('medium')}
                  className={`flex-1 p-2 text-sm rounded-md border ${
                    length === 'medium'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setLength('long')}
                  className={`flex-1 p-2 text-sm rounded-md border ${
                    length === 'long'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  Long
                </button>
              </div>
            </div>
            
            <button
              onClick={handleGenerateContent}
              disabled={isGenerating || (!customInstructions && selectedPromptType !== 'custom')}
              className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Content
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}
          
          {generatedContent && (
            <div className="mt-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Generated Content:</h3>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md overflow-y-auto max-h-60 prose prose-sm dark:prose-invert dark:bg-gray-900 dark:border-gray-700">
                <div dangerouslySetInnerHTML={{ __html: generatedContent.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Clock size={14} />
            Results may vary based on the selected model
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleInsertContent}
              disabled={!generatedContent}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}