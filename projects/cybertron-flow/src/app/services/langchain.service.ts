import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelConfig {
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  provider?: string;
}

export interface ChatCompletionOptions {
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LangchainService {
  private readonly apiUrl = '/api/langchain'; // This will be configured in proxy or environment
  private readonly localModels = ['llama2', 'mistral', 'codellama', 'phi-2'];
  private readonly availableModels = [
    'gpt-3.5-turbo',
    'gpt-4',
    'mistral-7b',
    'llama2-13b',
    'claude-instant',
    'claude-2',
    'gemini-pro'
  ];
  
  constructor(private http: HttpClient) { }
  
  /**
   * Generate text using a specified AI model
   */
  generateText(
    messages: ChatMessage[], 
    modelConfig: ModelConfig
  ): Observable<string> {
    // Determine if this is a local model or external API
    const endpoint = this.getEndpointForModel(modelConfig.model);
    
    return this.http.post<any>(endpoint, {
      messages,
      model: modelConfig.model,
      temperature: modelConfig.temperature || 0.7,
      max_tokens: modelConfig.maxTokens || 500,
      system_prompt: modelConfig.systemPrompt
    }).pipe(
      map(response => response.choices[0].message.content),
      catchError(error => {
        console.error('AI model generation error:', error);
        return throwError(() => new Error('Failed to generate text with the AI model'));
      })
    );
  }
  
  /**
   * Chain multiple AI model calls together to form a workflow
   */
  executeChain(
    inputs: Record<string, any>,
    chainConfig: any[]
  ): Observable<Record<string, any>> {
    // Simple implementation for MVP
    return this.http.post<any>(`${this.apiUrl}/chain`, {
      inputs,
      chainConfig
    }).pipe(
      catchError(error => {
        console.error('Chain execution error:', error);
        return throwError(() => new Error('Failed to execute model chain'));
      })
    );
  }
  
  /**
   * List available models
   */
  listAvailableModels(): Observable<string[]> {
    // In a real implementation, this would query backend for available models
    return of(this.availableModels);
  }
  
  /**
   * Get the appropriate endpoint for a model
   */
  private getEndpointForModel(model: string): string {
    if (this.isLocalModel(model)) {
      return `${this.apiUrl}/local`;
    } else if (model.includes('gpt')) {
      return `${this.apiUrl}/openai`;
    } else if (model.includes('claude')) {
      return `${this.apiUrl}/anthropic`;
    } else {
      return `${this.apiUrl}/generic`;
    }
  }
  
  /**
   * Check if a model is locally hosted
   */
  private isLocalModel(model: string): boolean {
    return this.localModels.some(localModel => model.toLowerCase().includes(localModel));
  }

  /**
   * Simulate a response from a language model
   */
  private simulateModelResponse(messages: ChatMessage[], options: ChatCompletionOptions): string {
    // Extract the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    if (!lastUserMessage) {
      return 'I don\'t see a message to respond to.';
    }
    
    const content = lastUserMessage.content.toLowerCase();
    
    // Simple simulation of responses based on content keywords
    if (content.includes('hello') || content.includes('hi')) {
      return 'Hello! How can I assist you with your workflow today?';
    } else if (content.includes('help')) {
      return 'I\'m here to help. You can use me in your workflow to process text, answer questions, generate content, and more.';
    } else if (content.includes('weather')) {
      return 'I don\'t have real-time weather data, but you could integrate a weather API node in your workflow for that information.';
    } else if (content.includes('workflow')) {
      return 'Cybertron Flow allows you to create powerful AI workflows by connecting different nodes together. Each node performs a specific task, and together they can automate complex processes.';
    } else if (content.includes('summarize')) {
      return `Here's a summary based on your request: ${content.substring(0, 50)}... The main points include workflow automation, AI integration, and process efficiency.`;
    } else if (content.includes('data') || content.includes('analysis')) {
      return 'For data analysis, you might want to include a Task node in your workflow that can process data using custom scripts. You can then pass the results to other nodes for further processing or reporting.';
    } else {
      // Generic response for other inputs
      return `I've processed your request: "${content}". In a production environment, this would be handled by a real language model. You can configure different models and parameters in the node settings.`;
    }
  }
}