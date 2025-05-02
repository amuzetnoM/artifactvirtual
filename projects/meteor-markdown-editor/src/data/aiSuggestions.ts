import { AIAnalysis, AISuggestion } from '../types';
import { aiService, GrammarCheckResult } from '../services/aiService';

// Enhanced AI analysis function that uses the AI service
export const generateAIAnalysis = async (content: string): Promise<AIAnalysis> => {
  const suggestions: AISuggestion[] = [];
  let structureScore = 70;
  let readabilityScore = 70;

  try {
    // Get grammar and style suggestions using the AI service
    const grammarResult: GrammarCheckResult = await aiService.checkGrammar({
      text: content,
      model: 'openai-gpt-3.5', // Can be configurable based on user preference
    });

    // Convert grammar corrections to AISuggestions
    grammarResult.corrections.forEach((correction, index) => {
      suggestions.push({
        id: `grammar-${index}`,
        type: correction.type as 'grammar' | 'spelling' | 'style' | 'punctuation',
        description: `${correction.explanation} Suggested correction: "${correction.suggestion}"`,
        position: { start: correction.startPosition, end: correction.endPosition },
        severity: correction.severity as 'info' | 'warning' | 'error',
      });
    });

    // Analyze document structure
    // Check for headers (structure analysis)
    if (!content.includes('# ')) {
      suggestions.push({
        id: 'structure-1',
        type: 'structure',
        description: 'Consider adding a main heading (H1) to your document for better structure.',
        position: { start: 0, end: 0 },
        severity: 'warning',
      });
    }

    // Check for heading hierarchy (h1 -> h2 -> h3)
    const h1Count = (content.match(/^# /gm) || []).length;
    const h2Count = (content.match(/^## /gm) || []).length;
    const h3Count = (content.match(/^### /gm) || []).length;

    if (h2Count > 0 && h1Count === 0) {
      suggestions.push({
        id: 'structure-2',
        type: 'structure',
        description: 'Your document has H2 headings but no H1 heading. Consider adding a main (H1) heading.',
        position: { start: 0, end: 0 },
        severity: 'warning',
      });
    }

    // Check for long paragraphs (readability)
    const paragraphs = content.split('\n\n');
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.length > 300 && !paragraph.startsWith('#') && !paragraph.startsWith('```')) {
        suggestions.push({
          id: `readability-${index}`,
          type: 'readability',
          description: 'Consider breaking this long paragraph into smaller ones for better readability.',
          position: { 
            start: content.indexOf(paragraph), 
            end: content.indexOf(paragraph) + paragraph.length 
          },
          severity: 'info',
        });
      }
    });

    // Check for code blocks without language specification
    const codeBlockMatches = content.match(/```(?!\w+)\n[\s\S]*?```/g);
    if (codeBlockMatches) {
      codeBlockMatches.forEach((match, index) => {
        suggestions.push({
          id: `formatting-${index}`,
          type: 'formatting',
          description: 'Specify a language for this code block to enable syntax highlighting.',
          position: {
            start: content.indexOf(match),
            end: content.indexOf(match) + match.length,
          },
          severity: 'info',
        });
      });
    }

    // Calculate more nuanced scores based on document structure and readability
    structureScore = Math.min(100, Math.max(50, 
      70 + // Base score
      (h1Count > 0 ? 10 : 0) + // Has H1
      (h2Count > 0 ? 5 : 0) + // Has H2
      (h3Count > 0 ? 5 : 0) + // Has H3
      (h1Count > 0 && h2Count > 0 ? 10 : 0) - // Has good hierarchy
      (suggestions.filter(s => s.type === 'structure').length * 5) // Deduct for structure issues
    ));
    
    readabilityScore = Math.min(100, Math.max(50, 
      80 - // Base score
      (paragraphs.filter(p => p.length > 300).length * 3) - // Deduct for long paragraphs
      (suggestions.filter(s => s.type === 'readability' || s.type === 'grammar').length * 2) // Deduct for readability/grammar issues
    ));
    
    // Summarize content if it's long enough
    if (content.length > 500) {
      try {
        const summary = await aiService.getSummary({
          text: content,
          maxLength: 100,
        });
        
        // Add the summary to the analysis
        return {
          structureScore,
          readabilityScore,
          suggestions,
          summary,
        };
      } catch (error) {
        console.error('Failed to generate summary:', error);
        // Continue without summary
      }
    }
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    // If AI service fails, fall back to basic analysis
    return fallbackAnalysis(content);
  }

  return {
    structureScore,
    readabilityScore,
    suggestions,
  };
};

// Fallback analysis when AI service fails
const fallbackAnalysis = (content: string): AIAnalysis => {
  const suggestions: AISuggestion[] = [];
  
  // Basic structure checks
  if (!content.includes('# ')) {
    suggestions.push({
      id: '1',
      type: 'structure',
      description: 'Consider adding a main heading (H1) to your document for better structure.',
      position: { start: 0, end: 0 },
      severity: 'warning',
    });
  }

  // Basic readability checks
  const paragraphs = content.split('\n\n');
  paragraphs.forEach((paragraph, index) => {
    if (paragraph.length > 300 && !paragraph.startsWith('#') && !paragraph.startsWith('```')) {
      suggestions.push({
        id: `para-${index}`,
        type: 'readability',
        description: 'Consider breaking this long paragraph into smaller ones for better readability.',
        position: { 
          start: content.indexOf(paragraph), 
          end: content.indexOf(paragraph) + paragraph.length 
        },
        severity: 'info',
      });
    }
  });

  // Calculate basic scores
  const structureScore = Math.min(100, Math.max(50, 70 + (content.includes('# ') ? 10 : 0) + (content.includes('## ') ? 10 : 0) + (content.includes('### ') ? 10 : 0)));
  const readabilityScore = Math.min(100, Math.max(50, 80 - (paragraphs.filter(p => p.length > 300).length * 5)));

  return {
    structureScore,
    readabilityScore,
    suggestions,
  };
};