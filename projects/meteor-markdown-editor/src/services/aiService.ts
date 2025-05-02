import { pipeline, Pipeline, TextGenerationPipeline } from '@xenova/transformers';
import { keyManagementService } from './keyManagementService';

// Define available model options
export type ModelProvider = 'local' | 'openai' | 'azure' | 'anthropic';
export type ModelSize = 'small' | 'medium' | 'large';
export type ModelTask = 'completion' | 'summarization' | 'grammar' | 'suggestions' | 'content-generation';

export interface ModelOption {
  id: string;
  name: string;
  provider: ModelProvider;
  size: ModelSize;
  description: string;
  tasks: ModelTask[];
  requiresApiKey: boolean;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'local-distilgpt2',
    name: 'DistilGPT-2',
    provider: 'local',
    size: 'small',
    description: 'Lightweight model running directly in browser',
    tasks: ['completion', 'content-generation'],
    requiresApiKey: false,
  },
  {
    id: 'openai-gpt-3.5',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    size: 'medium',
    description: 'Balanced performance and cost',
    tasks: ['completion', 'summarization', 'grammar', 'suggestions', 'content-generation'],
    requiresApiKey: true,
  },
  {
    id: 'openai-gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    size: 'large',
    description: 'Advanced capabilities with highest quality',
    tasks: ['completion', 'summarization', 'grammar', 'suggestions', 'content-generation'],
    requiresApiKey: true,
  },
  {
    id: 'anthropic-claude',
    name: 'Claude',
    provider: 'anthropic',
    size: 'large',
    description: 'High-quality model with long context',
    tasks: ['completion', 'summarization', 'grammar', 'suggestions', 'content-generation'],
    requiresApiKey: true,
  },
];

// Define interfaces for AI service requests and responses
export interface CompletionRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string; // Model ID
}

export interface SummarizationRequest {
  text: string;
  maxLength?: number;
  model?: string; // Model ID
}

export interface GrammarCheckRequest {
  text: string;
  model?: string; // Model ID
}

export interface GrammarCheckResult {
  correctedText: string;
  corrections: {
    original: string;
    suggestion: string;
    explanation: string;
    startPosition: number;
    endPosition: number;
    type: 'grammar' | 'spelling' | 'style' | 'punctuation';
    severity: 'info' | 'warning' | 'error';
  }[];
}

export interface SuggestionRequest {
  text: string;
  context?: string;
  model?: string; // Model ID
}

export interface TextSuggestion {
  text: string;
  position: number;
  confidence: number;
}

// Local model service using Transformers.js
class LocalModelService {
  // Use the specific pipeline type
  private generator: TextGenerationPipeline | null = null;
  private modelName = 'Xenova/distilgpt2'; // Start with a small model
  // Ensure the promise resolves to the specific pipeline type
  private loadingPromise: Promise<TextGenerationPipeline> | null = null;

  // Ensure the pipeline is loaded, returning the loading promise if it's already in progress
  private async loadGenerator(): Promise<TextGenerationPipeline> {
    if (this.generator) {
      return this.generator;
    }
    if (!this.loadingPromise) {
      console.log('Loading text generation model:', this.modelName);
      // Start loading and store the promise. Cast the result to the specific type.
      this.loadingPromise = pipeline('text-generation', this.modelName, {
        // Optional: Add progress callback if needed
        // progress_callback: (progress: any) => {
        //   console.log('Model loading progress:', progress);
        // },
      }) as Promise<TextGenerationPipeline>; // Cast here

      this.loadingPromise.then(generator => {
        console.log('Text generation model loaded successfully.');
        this.generator = generator;
        this.loadingPromise = null; // Clear the promise once loaded
        return generator;
      }).catch(err => {
        console.error('Failed to load text generation model:', err);
        this.loadingPromise = null; // Clear promise on error
        throw err; // Re-throw the error
      });
    }
    // Return the promise. If it's null here, it means loading hasn't started, which shouldn't happen
    // due to the logic above, but we add a fallback throw for type safety.
    if (!this.loadingPromise) {
        throw new Error("Model loading promise was unexpectedly null.");
    }
    return this.loadingPromise;
  }

  // Generate text using the local model
  async generateText(prompt: string, maxTokens = 50): Promise<string> {
    try {
      const generator = await this.loadGenerator();
      
      console.log('Generating completion for:', prompt);
      
      const outputs = await generator(prompt, {
        max_new_tokens: maxTokens,
        temperature: 0.7,
      });

      if (Array.isArray(outputs) && outputs.length > 0 && typeof outputs[0]?.generated_text === 'string') {
        console.log('Completion generated:', outputs[0].generated_text);
        const generatedText = outputs[0].generated_text;
        
        if (generatedText.startsWith(prompt)) {
          return generatedText.substring(prompt.length);
        }
        return generatedText;
      }
      
      console.warn('Unexpected output format from generator:', outputs);
      return '';
    } catch (error) {
      console.error('Error during text generation:', error);
      return `Error: ${error instanceof Error ? error.message : 'Failed to generate text'}`;
    }
  }
}

// Remote API service (OpenAI, Azure, Anthropic)
class RemoteAPIService {
  private async fetchFromAPI(url: string, apiKey: string, data: any): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // OpenAI API integration
  async openAICompletion(prompt: string, maxTokens: number = 100): Promise<string> {
    const apiKey = keyManagementService.getKey('openai');
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please add your API key in settings.');
    }
    
    try {
      const response = await this.fetchFromAPI(
        'https://api.openai.com/v1/chat/completions',
        apiKey,
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.7,
        }
      );
      
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  // Add similar methods for Azure, Anthropic, etc.
  // ...
}

// Unified AI Service that combines local and remote capabilities
class AIService {
  private localService = new LocalModelService();
  private remoteService = new RemoteAPIService();
  
  // Get the appropriate model option based on ID
  getModelById(modelId: string): ModelOption | undefined {
    return AVAILABLE_MODELS.find(model => model.id === modelId);
  }

  // Text completion (autocomplete, continue writing) feature
  async getCompletion(request: CompletionRequest): Promise<string> {
    const { prompt, maxTokens = 100, temperature = 0.7, model = 'local-distilgpt2' } = request;
    
    const modelOption = this.getModelById(model);
    
    if (!modelOption) {
      throw new Error(`Unknown model: ${model}`);
    }
    
    // Check if the model requires an API key
    if (modelOption.requiresApiKey) {
      const hasKey = keyManagementService.validateKey(modelOption.provider);
      if (!hasKey) {
        throw new Error(`API key required for ${modelOption.name}`);
      }
    }
    
    // Route to appropriate service based on provider
    switch (modelOption.provider) {
      case 'local':
        return this.localService.generateText(prompt, maxTokens);
      case 'openai':
        return this.remoteService.openAICompletion(prompt, maxTokens);
      // Add cases for other providers
      default:
        throw new Error(`Unsupported model provider: ${modelOption.provider}`);
    }
  }
  
  // Document summarization feature
  async getSummary(request: SummarizationRequest): Promise<string> {
    const { text, maxLength = 150, model = 'openai-gpt-3.5' } = request;
    
    // Construct prompt for summarization
    const prompt = `Please summarize the following text concisely in ${maxLength} words or less:\n\n${text}`;
    
    // Use the completion method with the summarization prompt
    return this.getCompletion({
      prompt,
      maxTokens: maxLength * 2, // Estimate tokens from words
      model,
    });
  }
  
  // Grammar and style checking feature
  async checkGrammar(request: GrammarCheckRequest): Promise<GrammarCheckResult> {
    const { text, model = 'openai-gpt-3.5' } = request;
    
    // For now, implement a simplified version using the API
    const prompt = `Please check the following text for grammar, spelling, and style issues. 
Format your response as JSON with two fields:
1. "correctedText": the corrected version
2. "corrections": an array of objects with "original", "suggestion", "explanation", "startPosition", "endPosition", "type" (grammar/spelling/style/punctuation), and "severity" (info/warning/error)

Text to check:
${text}`;

    const response = await this.getCompletion({
      prompt,
      maxTokens: text.length * 3, // Allow space for corrections and explanations
      model,
    });
    
    try {
      // Parse JSON response from the LLM
      const parsedResponse = JSON.parse(response);
      return {
        correctedText: parsedResponse.correctedText || text,
        corrections: Array.isArray(parsedResponse.corrections) ? parsedResponse.corrections : [],
      };
    } catch (error) {
      console.error('Failed to parse grammar check response:', error);
      // Return a minimal valid result if parsing fails
      return {
        correctedText: text,
        corrections: [],
      };
    }
  }
  
  // Text suggestions feature (inline completions)
  async getSuggestions(request: SuggestionRequest): Promise<TextSuggestion[]> {
    const { text, context = '', model = 'local-distilgpt2' } = request;
    
    // For now, implement a simple version that generates completions for the text
    const prompt = `${context ? context + '\n\n' : ''}${text}`;
    
    const completion = await this.getCompletion({
      prompt,
      maxTokens: 30,
      temperature: 0.3, // Lower temperature for more predictable completions
      model,
    });
    
    // Return the completion as a suggestion
    return [{
      text: completion,
      position: text.length,
      confidence: 0.8,
    }];
  }
}

// Export a singleton instance of the service
export const aiService = new AIService();
