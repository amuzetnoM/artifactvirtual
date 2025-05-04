import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CompletionRequest {
  prompt: string;
  language: string;
  max_tokens?: number;
  temperature?: number;
  context?: string[];
}

export interface CompletionResponse {
  completion: string;
  model: string;
}

export interface DocumentUpdateRequest {
  documents: string[];
  metadata?: Record<string, any>[];
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = environment.aiServiceUrl || 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  /**
   * Get a code completion from the Mellum AI model
   * @param request The completion request
   * @returns An observable with the completion response
   */
  getCodeCompletion(request: CompletionRequest): Observable<CompletionResponse> {
    return this.http.post<CompletionResponse>(`${this.apiUrl}/completions`, request)
      .pipe(
        catchError(error => {
          console.error('Error getting code completion:', error);
          return of({ 
            completion: `Error: Failed to get AI completion. ${error.message || ''}`,
            model: 'Error'
          });
        })
      );
  }

  /**
   * Update the AI's document store with new documents for context
   * @param request The document update request
   * @returns An observable with the update response
   */
  updateDocuments(request: DocumentUpdateRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-documents`, request)
      .pipe(
        catchError(error => {
          console.error('Error updating documents:', error);
          return of({ status: 'error', message: error.message || 'Unknown error' });
        })
      );
  }

  /**
   * Check if the AI service is healthy
   * @returns An observable that resolves to true if healthy, false otherwise
   */
  checkHealth(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/health`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }
}