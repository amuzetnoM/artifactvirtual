import { API_BASE_URL } from '../config';
import { AIModel, AIAnalysis } from '../types';

class AIService {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Get token from local storage if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Make request
    const response = await fetch(`${API_BASE_URL}/api/ai${path}`, {
      ...options,
      headers
    });

    // Handle non-success responses
    if (!response.ok) {
      // Try to extract error message
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      } catch (e) {
        throw new Error(`HTTP error ${response.status}`);
      }
    }

    // Return parsed response
    return response.json();
  }

  /**
   * Get available AI models
   */
  async getAvailableModels(): Promise<AIModel[]> {
    try {
      const response = await this.request<{ models: AIModel[] }>('/models');
      return response.models;
    } catch (error) {
      console.error('Failed to fetch AI models:', error);
      return [];
    }
  }

  /**
   * Analyze content structure and readability
   */
  async analyzeContent(content: string, modelId?: string): Promise<AIAnalysis> {
    try {
      const response = await this.request<AIAnalysis>('/analyze', {
        method: 'POST',
        body: JSON.stringify({ content, modelId })
      });
      return response;
    } catch (error) {
      console.error('Failed to analyze content:', error);
      
      // Return fallback analysis
      return {
        structureScore: 70,
        readabilityScore: 65,
        suggestions: [
          {
            id: 'fallback-1',
            type: 'structure',
            description: 'Consider breaking up longer paragraphs for better readability.',
            severity: 'info'
          },
          {
            id: 'fallback-2',
            type: 'readability',
            description: 'Some sentences are quite long. Consider shortening them.',
            severity: 'warning'
          }
        ]
      };
    }
  }

  /**
   * Generate summary of content
   */
  async summarizeContent(content: string, maxLength?: number, modelId?: string): Promise<string> {
    try {
      const response = await this.request<{ summary: string }>('/summarize', {
        method: 'POST',
        body: JSON.stringify({ content, maxLength, modelId })
      });
      return response.summary;
    } catch (error) {
      console.error('Failed to summarize content:', error);
      
      // Generate basic summary as fallback
      const words = content.split(/\s+/).filter(Boolean);
      let summary = words.slice(0, 20).join(' ');
      if (summary.length < content.length) {
        summary += '...';
      }
      return summary;
    }
  }

  /**
   * Check grammar and offer corrections
   */
  async checkGrammar(content: string, modelId?: string): Promise<{ suggestions: any[], score: number }> {
    try {
      const response = await this.request<{ suggestions: any[], score: number }>('/grammar', {
        method: 'POST',
        body: JSON.stringify({ content, modelId })
      });
      return response;
    } catch (error) {
      console.error('Failed to check grammar:', error);
      return {
        suggestions: [],
        score: 8
      };
    }
  }

  /**
   * Generate content from prompt
   */
  async generateContent(prompt: string, length?: number, temperature?: number, modelId?: string): Promise<string> {
    try {
      const response = await this.request<{ content: string }>('/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt, length, temperature, modelId })
      });
      return response.content;
    } catch (error) {
      console.error('Failed to generate content:', error);
      return `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Get text completion suggestions
   */
  async getCompletion(content: string, maxTokens?: number, modelId?: string): Promise<string> {
    try {
      const response = await this.request<{ completion: string }>('/complete', {
        method: 'POST',
        body: JSON.stringify({ content, maxTokens, modelId })
      });
      return response.completion;
    } catch (error) {
      console.error('Failed to get completion:', error);
      return '';
    }
  }
}

// Export singleton instance
export const aiService = new AIService();