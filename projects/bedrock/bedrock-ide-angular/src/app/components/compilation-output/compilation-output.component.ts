import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-compilation-output',
  templateUrl: './compilation-output.component.html',
  styleUrls: ['./compilation-output.component.scss']
})
export class CompilationOutputComponent implements OnChanges {
  @Input() output: string = '';
  @Input() isLoading: boolean = false;
  @Output() clearOutput = new EventEmitter<void>();
  
  hasError: boolean = false;
  hasWarning: boolean = false;
  
  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['output'] && changes['output'].currentValue) {
      this.parseOutput(changes['output'].currentValue);
    }
  }
  
  private parseOutput(output: string): void {
    // Simple heuristic to detect errors and warnings
    this.hasError = output.toLowerCase().includes('error');
    this.hasWarning = output.toLowerCase().includes('warning');
  }
  
  copyToClipboard(): void {
    if (this.output) {
      this.clipboard.copy(this.output);
      this.snackBar.open('Output copied to clipboard', 'Close', {
        duration: 2000,
      });
    }
  }
}