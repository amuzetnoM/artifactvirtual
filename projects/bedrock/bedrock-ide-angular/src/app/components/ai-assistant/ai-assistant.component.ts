import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AiService, CompletionRequest } from '../../services/ai.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-ai-assistant',
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.scss']
})
export class AiAssistantComponent implements OnInit {
  @Input() language: string = 'solidity';
  @Input() currentCode: string = '';
  @Input() activeFile: string = '';
  
  @Output() insertCode = new EventEmitter<string>();
  @Output() replaceCode = new EventEmitter<string>();

  queryForm: FormGroup;
  response$ = new BehaviorSubject<string>('');
  isLoading = false;
  aiModel = 'JetBrains/Mellum-4b-sft-python';
  aiServiceAvailable = false;

  constructor(
    private formBuilder: FormBuilder,
    private aiService: AiService
  ) {
    this.queryForm = this.formBuilder.group({
      query: ['', [Validators.required, Validators.minLength(3)]],
      temperature: [0.5, [Validators.required, Validators.min(0), Validators.max(1)]]
    });
  }

  ngOnInit(): void {
    this.checkAiService();
  }

  checkAiService(): void {
    this.aiService.checkHealth().subscribe(isHealthy => {
      this.aiServiceAvailable = isHealthy;
      if (!isHealthy) {
        this.response$.next('AI service is currently unavailable. Please try again later.');
      }
    });
  }

  onSubmit(): void {
    if (this.queryForm.invalid || this.isLoading) {
      return;
    }

    const query = this.queryForm.get('query')?.value;
    const temperature = this.queryForm.get('temperature')?.value;

    if (!query) {
      return;
    }

    this.isLoading = true;
    this.response$.next('Generating response...');

    // Create context from the current file
    const context = this.currentCode ? [this.currentCode] : [];
    
    // Create prompt with context about the current file and query
    let prompt = query;
    if (this.activeFile) {
      prompt = `File: ${this.activeFile}\n\n${prompt}`;
    }

    const request: CompletionRequest = {
      prompt,
      language: this.language,
      temperature,
      context
    };

    this.aiService.getCodeCompletion(request)
      .pipe(
        tap(response => {
          this.response$.next(response.completion);
          this.aiModel = response.model;
        }),
        catchError(error => {
          this.response$.next(`Error: ${error.message || 'Something went wrong'}`);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe();
  }

  insertResponseToEditor(): void {
    this.insertCode.emit(this.response$.getValue());
  }

  replaceEditorContent(): void {
    this.replaceCode.emit(this.response$.getValue());
  }

  clearResponse(): void {
    this.response$.next('');
    this.queryForm.get('query')?.reset('');
  }
}