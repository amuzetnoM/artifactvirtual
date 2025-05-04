import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as monaco from 'monaco-editor';
import { FileSystemService } from '../../services/file-system.service';
import { CompilationService } from '../../services/compilation.service';
import { AiService } from '../../services/ai.service';

interface EditorFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorContainer') editorContainer!: ElementRef;
  
  editor: monaco.editor.IStandaloneCodeEditor | null = null;
  files: EditorFile[] = [];
  activeFile: EditorFile | null = null;
  compileOutput: string = '';
  isCompiling: boolean = false;
  supportedLanguages = ['solidity', 'javascript', 'typescript', 'json'];
  showAiAssistant: boolean = true;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fileSystemService: FileSystemService,
    private compilationService: CompilationService,
    private aiService: AiService
  ) {}

  ngOnInit(): void {
    // Load files from the file system service
    this.loadFiles();
    
    // Subscribe to file changes
    this.fileSystemService.fileChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadFiles();
      });
  }

  ngAfterViewInit(): void {
    this.initMonaco();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.editor) {
      this.editor.dispose();
    }
  }

  private initMonaco(): void {
    // Register Solidity language if not already registered
    if (!monaco.languages.getLanguages().some(lang => lang.id === 'solidity')) {
      monaco.languages.register({ id: 'solidity' });
      
      // Define tokenizer for Solidity syntax highlighting
      monaco.languages.setMonarchTokensProvider('solidity', {
        tokenizer: {
          root: [
            [/pragma\s+solidity\s+[\^0-9.]+/, 'keyword'],
            [/contract|interface|library|function|modifier|event|struct|enum|mapping/, 'keyword'],
            [/address|bool|string|uint|int|bytes/, 'type'],
            [/public|private|internal|external|view|pure|payable|memory|storage|calldata/, 'modifier'],
            [/\/\/.*$/, 'comment'],
            [/\/\*/, 'comment', '@comment'],
            [/"(?:\\.|[^"\\])*"/, 'string'],
            [/'(?:\\.|[^'\\])*'/, 'string'],
            [/\b\d+\b/, 'number'],
            [/[a-zA-Z_$][\w$]*/, 'identifier'],
          ],
          comment: [
            [/[^/*]+/, 'comment'],
            [/\/\*/, 'comment', '@push'],
            [/\*\//, 'comment', '@pop'],
            [/[/*]/, 'comment']
          ]
        }
      });
    }
    
    // Create editor
    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      automaticLayout: true,
      theme: 'vs-dark',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: "'Fira Code', 'Droid Sans Mono', 'monospace'",
      tabSize: 2,
      wordWrap: 'on'
    });
    
    // Open first file if available
    if (this.files.length > 0 && !this.activeFile) {
      this.openFile(this.files[0]);
    }
    
    // Add event listener for content changes
    this.editor.onDidChangeModelContent(() => {
      if (this.activeFile && this.editor) {
        this.activeFile.content = this.editor.getValue();
      }
    });
  }

  private loadFiles(): void {
    this.files = this.fileSystemService.getFiles().map(file => ({
      name: file.name,
      path: file.path,
      content: file.content,
      language: this.getLanguageFromFileName(file.name)
    }));
    
    // If active file exists, update it
    if (this.activeFile) {
      const updatedActiveFile = this.files.find(f => f.path === this.activeFile?.path);
      if (updatedActiveFile) {
        this.activeFile = updatedActiveFile;
        if (this.editor) {
          this.editor.setValue(this.activeFile.content);
        }
      }
    }
  }

  private getLanguageFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'sol':
        return 'solidity';
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'json':
        return 'json';
      default:
        return 'plaintext';
    }
  }

  openFile(file: EditorFile): void {
    this.activeFile = file;
    
    if (this.editor) {
      // Create or get model for the file
      let model = monaco.editor.getModel(monaco.Uri.parse(file.path));
      
      if (!model) {
        model = monaco.editor.createModel(
          file.content,
          file.language,
          monaco.Uri.parse(file.path)
        );
      }
      
      this.editor.setModel(model);
    }
  }

  saveActiveFile(): void {
    if (this.activeFile && this.editor) {
      this.activeFile.content = this.editor.getValue();
      this.fileSystemService.saveFile(this.activeFile.path, this.activeFile.content);
    }
  }

  createNewFile(): void {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      const language = this.getLanguageFromFileName(fileName);
      const path = `/workspace/${fileName}`;
      
      const newFile: EditorFile = {
        name: fileName,
        path,
        content: '',
        language
      };
      
      this.fileSystemService.saveFile(path, '');
      this.files.push(newFile);
      this.openFile(newFile);
    }
  }

  deleteFile(file: EditorFile): void {
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      this.fileSystemService.deleteFile(file.path);
      this.files = this.files.filter(f => f.path !== file.path);
      
      if (this.activeFile?.path === file.path) {
        this.activeFile = this.files.length > 0 ? this.files[0] : null;
        
        if (this.activeFile && this.editor) {
          this.openFile(this.activeFile);
        }
      }
    }
  }

  compileActiveFile(): void {
    if (!this.activeFile) return;
    
    this.isCompiling = true;
    this.compileOutput = 'Compiling...';
    
    this.compilationService.compile(this.activeFile.content, this.activeFile.language)
      .subscribe(
        result => {
          this.compileOutput = result.output;
          this.isCompiling = false;
        },
        error => {
          this.compileOutput = `Error: ${error.message || 'Compilation failed'}`;
          this.isCompiling = false;
        }
      );
  }

  toggleAiAssistant(): void {
    this.showAiAssistant = !this.showAiAssistant;
  }

  // Methods for AI integration
  insertCodeAtCursor(code: string): void {
    if (this.editor) {
      const position = this.editor.getPosition();
      if (position) {
        this.editor.executeEdits('ai-assistant', [{
          range: new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          text: code,
          forceMoveMarkers: true
        }]);
      }
    }
  }

  replaceEditorContent(code: string): void {
    if (this.editor) {
      this.editor.setValue(code);
      if (this.activeFile) {
        this.activeFile.content = code;
      }
    }
  }
}