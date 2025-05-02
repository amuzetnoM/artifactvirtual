import { AzureKeyCredential } from '@azure/core-auth';
import ModelClient from '@azure-rest/ai-inference';
import { isUnexpected } from '@azure-rest/ai-inference/ai-models';
import OpenAI from 'openai';
import { IUser } from '../models/user.model';
import axios from 'axios';

// AI Provider configuration types
interface AzureAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
}

interface OpenAIConfig {
  apiKey: string;
  organization?: string;
}

// Base model type
export type AIModel = {
  id: string;
  name: string;
  provider: 'azure-openai' | 'openai' | 'github' | 'local' | 'mistral';
  maxTokens: number;
  capabilities: Array<'chat' | 'completion' | 'embedding'>;
};

// Available models
export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'local-gemma3',
    name: 'Gemma 3 (Ollama)',
    provider: 'local',
    maxTokens: 4096,
    capabilities: ['chat', 'completion']
  },
  {
    id: 'local-llama3',
    name: 'Llama 3 (Ollama)',
    provider: 'local',
    maxTokens: 4096,
    capabilities: ['chat', 'completion']
  },
  {
    id: 'local-distilgpt2',
    name: 'DistilGPT-2 (Local)',
    provider: 'local',
    maxTokens: 1024,
    capabilities: ['completion']
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o (OpenAI)',
    provider: 'openai',
    maxTokens: 8192,
    capabilities: ['chat', 'completion']
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini (OpenAI)',
    provider: 'openai',
    maxTokens: 4096,
    capabilities: ['chat', 'completion']
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo (OpenAI)',
    provider: 'openai',
    maxTokens: 4096,
    capabilities: ['chat', 'completion']
  },
  {
    id: 'azure-openai/gpt-4',
    name: 'GPT-4 (Azure)',
    provider: 'azure-openai',
    maxTokens: 8192,
    capabilities: ['chat', 'completion']
  },
  {
    id: 'azure-openai/gpt-35-turbo',
    name: 'GPT-3.5 Turbo (Azure)',
    provider: 'azure-openai',
    maxTokens: 4096,
    capabilities: ['chat', 'completion']
  },
  {
    id: 'github/openai/gpt-4o',
    name: 'GPT-4o (GitHub)',
    provider: 'github',
    maxTokens: 8192,
    capabilities: ['chat', 'completion']
  },
  {
    id: 'github/openai/gpt-4o-mini',
    name: 'GPT-4o Mini (GitHub)',
    provider: 'github',
    maxTokens: 4096,
    capabilities: ['chat', 'completion']
  },
  {
    id: 'github/mistral-ai/Mistral-large',
    name: 'Mistral Large (GitHub)',
    provider: 'github',
    maxTokens: 4096,
    capabilities: ['chat', 'completion']
  },
  {
    id: 'github/mistral-ai/Mistral-small',
    name: 'Mistral Small (GitHub)',
    provider: 'github',
    maxTokens: 2048,
    capabilities: ['chat', 'completion']
  }
];

// Generate AI function interface
interface GenerateAIParams {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model: string;
  user?: IUser;
}

// Content analysis function interface
interface AnalyzeContentParams {
  content: string;
  model: string;
  user?: IUser;
}

class AIService {
  private azureOpenAIConfig: AzureAIConfig | null = null;
  private openAIConfig: OpenAIConfig | null = null;
  private githubAIConfig: { token: string, endpoint: string } | null = null;
  private ollamaConfig = {
    endpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
    available: false
  };

  constructor() {
    // Initialize with environment variables if available
    if (process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY) {
      this.azureOpenAIConfig = {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: process.env.AZURE_OPENAI_KEY,
        deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-35-turbo'
      };
    }

    if (process.env.OPENAI_API_KEY) {
      this.openAIConfig = {
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORGANIZATION
      };
    }

    if (process.env.GITHUB_TOKEN) {
      this.githubAIConfig = {
        token: process.env.GITHUB_TOKEN,
        endpoint: process.env.GITHUB_AI_ENDPOINT || 'https://models.github.ai/inference/'
      };
    }

    // Check if Ollama is available
    this.checkOllamaAvailability();
  }

  /**
   * Check if Ollama is available
   */
  private async checkOllamaAvailability(): Promise<void> {
    try {
      const response = await axios.get(`${this.ollamaConfig.endpoint}/api/tags`, { 
        timeout: 2000 
      });
      
      if (response.status === 200 && response.data && response.data.models) {
        this.ollamaConfig.available = true;
        console.log('Ollama is available with models:', 
          response.data.models.map((m: any) => m.name).join(', '));
      }
    } catch (error) {
      console.warn('Ollama not available:', error instanceof Error ? error.message : String(error));
      this.ollamaConfig.available = false;
    }
  }

  /**
   * Set configuration for a specific provider
   */
  public setProviderConfig(provider: 'azure-openai' | 'openai' | 'github', config: any): void {
    switch (provider) {
      case 'azure-openai':
        this.azureOpenAIConfig = config;
        break;
      case 'openai':
        this.openAIConfig = config;
        break;
      case 'github':
        this.githubAIConfig = config;
        break;
    }
  }

  /**
   * Get available models based on configured providers
   */
  public getAvailableModels(): AIModel[] {
    const models: AIModel[] = [];

    // Always include local models
    models.push(...AVAILABLE_MODELS.filter(model => model.provider === 'local'));

    // Add OpenAI models if configured
    if (this.openAIConfig) {
      models.push(...AVAILABLE_MODELS.filter(model => model.provider === 'openai'));
    }

    // Add Azure OpenAI models if configured
    if (this.azureOpenAIConfig) {
      models.push(...AVAILABLE_MODELS.filter(model => model.provider === 'azure-openai'));
    }

    // Add GitHub models if configured
    if (this.githubAIConfig) {
      models.push(...AVAILABLE_MODELS.filter(model => model.provider === 'github'));
    }

    return models;
  }

  /**
   * Generate completion from user prompt
   */
  public async getCompletion(params: GenerateAIParams): Promise<string> {
    const { prompt, model, maxTokens = 500, temperature = 0.7 } = params;

    // Determine which provider to use based on the model ID
    const modelInfo = AVAILABLE_MODELS.find(m => m.id === model);
    if (!modelInfo) {
      throw new Error(`Model ${model} not found or not supported`);
    }

    // Check capability
    if (!modelInfo.capabilities.includes('completion')) {
      throw new Error(`Model ${model} does not support completion`);
    }

    try {
      switch (modelInfo.provider) {
        case 'local':
          return await this.getLocalCompletion(prompt, maxTokens, temperature);
        
        case 'openai':
          if (!this.openAIConfig) {
            throw new Error('OpenAI configuration not set');
          }
          return await this.getOpenAICompletion(prompt, modelInfo.id.split('/')[1], maxTokens, temperature);
        
        case 'azure-openai':
          if (!this.azureOpenAIConfig) {
            throw new Error('Azure OpenAI configuration not set');
          }
          return await this.getAzureOpenAICompletion(prompt, maxTokens, temperature);
        
        case 'github':
          if (!this.githubAIConfig) {
            throw new Error('GitHub AI configuration not set');
          }
          return await this.getGitHubAICompletion(prompt, modelInfo.id.split('/').slice(1).join('/'), maxTokens, temperature);
        
        default:
          throw new Error(`Provider ${modelInfo.provider} not implemented`);
      }
    } catch (error) {
      console.error('AI completion error:', error);
      throw new Error(`Failed to generate completion: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Analyze content for structure, readability, etc.
   */
  public async analyzeContent(params: AnalyzeContentParams): Promise<any> {
    const { content, model } = params;
    const systemPrompt = `
      Analyze the following text for its structure, readability, and clarity.
      Provide scores from 1-100 for each category.
      Identify at least 2-3 specific suggestions for improvement.
      Return the analysis in a JSON format with fields:
      - scores: { structure: number, readability: number, clarity: number }
      - suggestions: [{ type: string, text: string }]
      - stats: { wordCount: number, sentenceCount: number, averageWordsPerSentence: number }
    `;
    
    // First get stats with regex (more reliable than AI for basic stats)
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const sentenceCount = content.split(/[.!?]+/).filter(Boolean).length;
    const averageWordsPerSentence = wordCount / (sentenceCount || 1);
    
    try {
      // Use completion to get analysis
      const analysisPrompt = `${systemPrompt}\n\nText to analyze:\n${content}`;
      const result = await this.getCompletion({
        prompt: analysisPrompt,
        model,
        maxTokens: 1000,
        temperature: 0.2
      });
      
      // Extract JSON result from the response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const analysis = JSON.parse(jsonMatch[0]);
          // Add our calculated stats to the result
          analysis.stats = {
            ...analysis.stats,
            wordCount,
            sentenceCount,
            averageWordsPerSentence
          };
          return analysis;
        } catch (parseErr) {
          // Fallback if parsing fails
          console.error('Failed to parse AI analysis response', parseErr);
        }
      }
    } catch (error) {
      console.error('Content analysis error:', error);
    }
    
    // Fallback to basic analysis if AI fails
    return {
      scores: {
        structure: Math.min(100, Math.max(1, 60 + Math.random() * 20)),
        readability: Math.min(100, Math.max(1, 60 + Math.random() * 20)),
        clarity: Math.min(100, Math.max(1, 60 + Math.random() * 20)),
      },
      stats: {
        wordCount,
        sentenceCount,
        averageWordsPerSentence
      },
      suggestions: [
        {
          type: 'structure',
          text: 'Consider breaking down longer sections into smaller paragraphs'
        },
        {
          type: 'clarity',
          text: 'Add more examples to illustrate your key points'
        }
      ]
    };
  }

  /**
   * Summarize content
   */
  public async summarizeContent(content: string, model: string, maxLength: number = 150): Promise<string> {
    const prompt = `Summarize the following text in ${maxLength} characters or less:\n\n${content}`;
    try {
      const summary = await this.getCompletion({
        prompt,
        model,
        maxTokens: Math.ceil(maxLength / 4), // Rough estimate of tokens to characters
        temperature: 0.3
      });
      
      return summary.slice(0, maxLength);
    } catch (error) {
      console.error('Content summarization error:', error);
      
      // Fallback to basic summarization if AI fails
      let summary = content.split(/\s+/).filter(Boolean).slice(0, 20).join(' ');
      if (summary.length > maxLength) {
        summary = summary.substring(0, maxLength - 3) + '...';
      } else if (summary.length < content.length) {
        summary += '...';
      }
      
      return summary;
    }
  }

  /**
   * Private methods for different provider implementations
   */
  private async getLocalCompletion(prompt: string, maxTokens: number, temperature: number): Promise<string> {
    // Try to use Ollama if available
    if (this.ollamaConfig.available) {
      try {
        // Extract model name from the request or use default
        const modelName = prompt.includes('local-gemma3') ? 'gemma3' : 
                          prompt.includes('local-llama3') ? 'llama3' : 
                          'llama3'; // default
        
        const response = await axios.post(
          `${this.ollamaConfig.endpoint}/api/generate`, 
          {
            model: modelName,
            prompt: prompt,
            max_tokens: maxTokens,
            temperature: temperature
          },
          { timeout: 30000 } // 30 second timeout
        );
        
        if (response.status === 200 && response.data && response.data.response) {
          return response.data.response;
        }
        
        throw new Error(`Ollama returned status ${response.status}`);
      } catch (error) {
        console.error('Ollama completion error:', error);
        // Fall through to transformers.js or fallback
      }
    }
    
    // Attempt to use Transformers.js if available
    try {
      // Here you would integrate with Transformers.js
      // This would require additional dependencies and setup
      
      // For now, we'll use a more informative fallback
      console.warn('Transformers.js integration not implemented yet. Using fallback response.');
    } catch (error) {
      console.error('Transformers.js error:', error);
    }
    
    // Fallback response that's more informative than just a stub
    return `I'm METEOR's AI assistant. I notice you're asking about: "${prompt.substring(0, 50)}..."\n\n` +
           `To enable full AI capabilities, please configure one of these options:\n` +
           `1. Start the Ollama server locally (recommended for privacy)\n` +
           `2. Add OpenAI, Azure, or GitHub API keys in the settings\n\n` +
           `Your Markdown document looks great so far! If you need help with formatting or structure, ` +
           `I'd be happy to assist once AI services are configured.`;
  }

  private async getOpenAICompletion(prompt: string, modelName: string, maxTokens: number, temperature: number): Promise<string> {
    if (!this.openAIConfig) {
      throw new Error('OpenAI configuration not set');
    }

    const openai = new OpenAI({
      apiKey: this.openAIConfig.apiKey,
      organization: this.openAIConfig.organization
    });

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: temperature,
    });

    return response.choices[0].message.content || '';
  }

  private async getAzureOpenAICompletion(prompt: string, maxTokens: number, temperature: number): Promise<string> {
    if (!this.azureOpenAIConfig) {
      throw new Error('Azure OpenAI configuration not set');
    }

    const client = new ModelClient(
      this.azureOpenAIConfig.endpoint, 
      new AzureKeyCredential(this.azureOpenAIConfig.apiKey)
    );

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "user", content: prompt }
        ],
        model: this.azureOpenAIConfig.deploymentName,
        max_tokens: maxTokens,
        temperature: temperature
      }
    });

    if (isUnexpected(response)) {
      throw new Error(response.body.error?.message || 'Unknown error from Azure OpenAI');
    }

    return response.body.choices[0].message.content || '';
  }

  private async getGitHubAICompletion(prompt: string, modelName: string, maxTokens: number, temperature: number): Promise<string> {
    if (!this.githubAIConfig) {
      throw new Error('GitHub AI configuration not set');
    }

    const client = new ModelClient(
      this.githubAIConfig.endpoint, 
      new AzureKeyCredential(this.githubAIConfig.token)
    );

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "user", content: prompt }
        ],
        model: modelName,
        max_tokens: maxTokens,
        temperature: temperature
      }
    });

    if (isUnexpected(response)) {
      throw new Error(response.body.error?.message || 'Unknown error from GitHub AI');
    }

    return response.body.choices[0].message.content || '';
  }

  /**
   * Log AI usage for analytics and debugging
   */
  private logAIUsage(model: string, prompt: string, tokens: number, success: boolean, error?: string): void {
    console.log(`[AI Usage] Model: ${model}, Tokens: ${tokens}, Success: ${success}${error ? ', Error: ' + error : ''}`);
    // In production, this would log to a database or monitoring system
  }
}

// Export a singleton instance
export const aiService = new AIService();