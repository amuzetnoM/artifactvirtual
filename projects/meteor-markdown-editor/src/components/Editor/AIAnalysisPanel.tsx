import { useState, useEffect } from 'react';
import { 
  BarChart, 
  MessageSquareText, 
  ChevronUp, 
  ChevronDown,
  CheckCircle,
  XCircle,
  Info,
  Loader2
} from 'lucide-react';
import { Document, AIAnalysis, AISuggestion } from '../../types';
import { aiService } from '../../services/ai.service';
import { useSettings } from '../../hooks/useSettings';

interface AIAnalysisPanelProps {
  document: Document;
}

export default function AIAnalysisPanel({ document }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();
  
  useEffect(() => {
    // Only analyze if there's content and AI features are enabled
    if (!document.content || !settings.features.aiAssistant.enabled) {
      return;
    }
    
    // Debounce the analysis requests to avoid too many API calls
    const timer = setTimeout(() => {
      // Don't show loading indicator for very quick refreshes
      const loadingTimer = setTimeout(() => setIsLoading(true), 200);
      
      const analyzeContent = async () => {
        try {
          // Use the preferred model from settings, or fall back to default
          const modelId = settings.features.aiAssistant.preferredModel || undefined;
          const newAnalysis = await aiService.analyzeContent(document.content, modelId);
          setAnalysis(newAnalysis);
          setError(null);
        } catch (err) {
          console.error('AI analysis error:', err);
          setError('Failed to analyze document');
          // Keep the previous analysis if available
        } finally {
          setIsLoading(false);
          clearTimeout(loadingTimer);
        }
      };
      
      analyzeContent();
      
      return () => {
        clearTimeout(loadingTimer);
      };
    }, 1500); // Wait 1.5 seconds after typing stops
    
    return () => clearTimeout(timer);
  }, [document.content, settings.features.aiAssistant.enabled, settings.features.aiAssistant.preferredModel]);
  
  // If AI features are disabled, don't render the panel
  if (!settings.features.aiAssistant.enabled) {
    return null;
  }
  
  if (isLoading && !analysis) {
    return (
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex items-center justify-center">
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-500" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Analyzing document...</p>
      </div>
    );
  }
  
  // If there's no content to analyze, show placeholder
  if (!document.content.trim()) {
    return (
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Start writing to get AI suggestions</p>
      </div>
    );
  }
  
  // If we encountered an error but have previous analysis, still show it
  // Otherwise, show an error message
  if (error && !analysis) {
    return (
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex items-center justify-center">
        <XCircle className="w-4 h-4 mr-2 text-red-500" />
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }
  
  // Still loading or no analysis available yet
  if (!analysis) {
    return (
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Preparing document analysis...</p>
      </div>
    );
  }
  
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
        aria-expanded={isExpanded}
        aria-label="Toggle AI suggestions panel"
      >
        <div className="flex items-center space-x-2">
          <MessageSquareText size={16} className="text-blue-500" />
          <span className="font-medium text-sm">AI Suggestions</span>
          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs rounded-full px-2 py-0.5">
            {analysis.suggestions.length}
          </span>
          {isLoading && <Loader2 size={14} className="animate-spin text-gray-400 ml-2" />}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-sm">
            <BarChart size={14} className="text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">Score: </span>
            <span className={`font-medium ${getScoreColor(Math.floor((analysis.structureScore + analysis.readabilityScore) / 2))}`}>
              {Math.floor((analysis.structureScore + analysis.readabilityScore) / 2)}%
            </span>
          </div>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <ScoreCard
              title="Structure"
              score={analysis.structureScore}
              description="Document organization and heading hierarchy"
            />
            <ScoreCard
              title="Readability"
              score={analysis.readabilityScore}
              description="Text flow and paragraph length"
            />
          </div>
          
          <h4 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
            Suggestions
            {isLoading && <Loader2 size={14} className="inline animate-spin text-gray-400 ml-2" />}
          </h4>
          
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {analysis.suggestions.length > 0 ? (
              analysis.suggestions.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                No suggestions found. Your document looks great!
              </p>
            )}
          </div>
          
          {settings.features.aiAssistant.showDetails && (
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              <p>Document stats: {document.content.split(/\s+/).filter(Boolean).length} words, {document.content.split(/[.!?]+/).filter(Boolean).length} sentences</p>
              {settings.features.aiAssistant.preferredModel && (
                <p>Using model: {settings.features.aiAssistant.preferredModel}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
}

function ScoreCard({ title, score, description }: ScoreCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md p-3 shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">{title}</span>
        <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
        <div
          className={`h-1.5 rounded-full ${getScoreBarColor(score)}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: AISuggestion;
}

function SuggestionCard({ suggestion }: SuggestionCardProps) {
  return (
    <div className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm border-l-2 border-blue-500 dark:border-blue-400">
      <div className="flex space-x-2">
        <div className="mt-0.5">
          {suggestion.severity === 'info' && <Info size={14} className="text-blue-500" />}
          {suggestion.severity === 'warning' && <Info size={14} className="text-yellow-500" />}
          {suggestion.severity === 'error' && <XCircle size={14} className="text-red-500" />}
        </div>
        <div>
          <p className="text-sm text-gray-800 dark:text-gray-200">{suggestion.description}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Type: {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper functions to get colors based on scores
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}