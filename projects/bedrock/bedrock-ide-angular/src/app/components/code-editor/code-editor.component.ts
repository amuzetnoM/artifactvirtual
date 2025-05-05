import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit, NgZone } from '@angular/core';
import * as monaco from 'monaco-editor';
import { CompilationService, CompilationOptions, CompilationResult } from '../../services/compilation.service';
import { ThemeService } from '../../services/theme.service';
import { FileSystemService, FileNode } from '../../services/file-system.service';
import { Subscription } from 'rxjs';
import { CdkDragMove } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  
  // Editor state
  editor: monaco.editor.IStandaloneCodeEditor | null = null;
  activeFile: FileNode | null = null;
  private fileSubscription: Subscription | null = null;
  
  // UI state
  sidebarCollapsed: boolean = false;
  showAiAssistant: boolean = false;
  aiAssistantVisible: boolean = false;
  
  // Panel sizing
  editorWidth: number = 100;
  aiAssistantWidth: number = 0;
  outputPanelHeight: number = 200;
  defaultOutputHeight: number = 200;
  
  // Editor options
  editorOptions = {
    language: 'solidity',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: {
      enabled: true
    },
    lineNumbers: 'on',
    roundedSelection: true,
    scrollBeyondLastLine: false,
    readOnly: false,
    fontSize: 14,
    keywords: [
      'abstract', 'address', 'as', 'assembly', 'assert', 'block', 'break', 'case', 'catch',
      'constant', 'constructor', 'continue', 'contract', 'default', 'delete', 'do', 'else',
      'emit', 'enum', 'event', 'external', 'false', 'final', 'for', 'from', 'function',
      'if', 'implements', 'import', 'in', 'indexed', 'interface', 'internal', 'is', 'let',
      'library', 'mapping', 'memory', 'modifier', 'msg', 'new', 'now', 'null', 'of',
      'payable', 'pragma', 'private', 'public', 'pure', 'require', 'return', 'returns',
      'revert', 'selfdestruct', 'solidity', 'storage', 'struct', 'super', 'switch', 'this',
      'throw', 'true', 'try', 'tx', 'type', 'typeof', 'using', 'value', 'view', 'virtual',
      'while', 'with'
    ],
    typeKeywords: [
      'bool', 'byte', 'bytes', 'bytes1', 'bytes2', 'bytes3', 'bytes4', 'bytes5', 'bytes6',
      'bytes7', 'bytes8', 'bytes9', 'bytes10', 'bytes11', 'bytes12', 'bytes13', 'bytes14',
      'bytes15', 'bytes16', 'bytes17', 'bytes18', 'bytes19', 'bytes20', 'bytes21', 'bytes22',
      'bytes23', 'bytes24', 'bytes25', 'bytes26', 'bytes27', 'bytes28', 'bytes29', 'bytes30',
      'bytes31', 'bytes32', 'int', 'int8', 'int16', 'int24', 'int32', 'int40', 'int48', 'int56',
      'int64', 'int72', 'int80', 'int88', 'int96', 'int104', 'int112', 'int120', 'int128',
      'int136', 'int144', 'int152', 'int160', 'int168', 'int176', 'int184', 'int192', 'int200',
      'int208', 'int216', 'int224', 'int232', 'int240', 'int248', 'int256', 'string', 'uint',
      'uint8', 'uint16', 'uint24', 'uint32', 'uint40', 'uint48', 'uint56', 'uint64', 'uint72',
      'uint80', 'uint88', 'uint96', 'uint104', 'uint112', 'uint120', 'uint128', 'uint136',
      'uint144', 'uint152', 'uint160', 'uint168', 'uint176', 'uint184', 'uint192', 'uint200',
      'uint208', 'uint216', 'uint224', 'uint232', 'uint240', 'uint248', 'uint256'
    ]
  };
  
  // Compilation state
  compilerVersion: string = '0.8.19';
  optimizationEnabled: boolean = true;
  evmVersion: string = 'paris';
  compilationOutput: string = '';
  compileOutput: string = '';
  isCompiling: boolean = false;
  compilationResult: CompilationResult | null = null;

  constructor(
    private compilationService: CompilationService,
    private themeService: ThemeService,
    private fileSystemService: FileSystemService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.initMonacoEditor();
    
    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      this.updateEditorTheme(isDarkMode);
    });
    
    // Register Solidity language if not registered already
    this.registerSolidityLanguage();
    
    // Subscribe to active file changes
    this.fileSubscription = this.fileSystemService.activeFile$.subscribe(file => {
      if (file) {
        this.activeFile = file;
        this.updateEditorContent(file);
      }
    });
  }
  
  ngAfterViewInit() {
    // Handle initial layout after view is initialized
    this.adjustEditorLayout();
  }
  
  ngOnDestroy() {
    // Clean up subscriptions
    if (this.fileSubscription) {
      this.fileSubscription.unsubscribe();
    }
    
    // Dispose of the Monaco editor
    if (this.editor) {
      this.editor.dispose();
    }
  }
  
  // Resize handling
  
  onVerticalResizerDrag(event: CdkDragMove) {
    this.ngZone.runOutsideAngular(() => {
      // Get panel container and calculate new widths based on drag position
      const panelsContainer = event.source.element.nativeElement.parentElement;
      if (!panelsContainer) return;
      
      const containerWidth = panelsContainer.clientWidth;
      const dragPosition = event.pointerPosition.x;
      const containerRect = panelsContainer.getBoundingClientRect();
      const leftPanelWidth = Math.max(200, dragPosition - containerRect.left);
      
      // Set minimum and maximum widths
      this.editorWidth = Math.min(Math.max(30, (leftPanelWidth / containerWidth) * 100), 85);
      this.aiAssistantWidth = 100 - this.editorWidth;
      
      // Trigger Monaco editor layout adjustment
      if (this.editor) {
        this.editor.layout();
      }
    });
  }
  
  onHorizontalResizerDrag(event: CdkDragMove) {
    this.ngZone.runOutsideAngular(() => {
      // Get the panel container
      const panelsContainer = event.source.element.nativeElement.parentElement;
      if (!panelsContainer) return;
      
      const containerHeight = panelsContainer.clientHeight;
      const dragPosition = event.pointerPosition.y;
      const containerRect = panelsContainer.getBoundingClientRect();
      
      // Calculate output panel height based on drag position
      const bottomPanelTop = dragPosition - containerRect.top;
      const bottomPanelHeight = Math.max(100, containerHeight - bottomPanelTop);
      
      // Limit output panel height to be between 100px and 60% of container height
      this.outputPanelHeight = Math.min(bottomPanelHeight, containerHeight * 0.6);
      
      // Trigger Monaco editor layout adjustment
      if (this.editor) {
        this.editor.layout();
      }
    });
  }
  
  adjustEditorLayout() {
    // Adjust editor layout whenever the panels are shown/hidden or resized
    setTimeout(() => {
      if (this.editor) {
        this.editor.layout();
      }
    }, 0);
  }
  
  // File Explorer Integration
  
  onFileSelected(file: FileNode) {
    this.activeFile = file;
    this.updateEditorContent(file);
  }
  
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.adjustEditorLayout();
  }
  
  saveActiveFile() {
    if (this.activeFile && this.editor) {
      const content = this.editor.getValue();
      this.fileSystemService.updateFileContent(this.activeFile.id, content);
    }
  }
  
  // File content handling
  
  private updateEditorContent(file: FileNode) {
    if (this.editor && file.content !== undefined) {
      const model = this.editor.getModel();
      if (model) {
        // Update language based on file type
        monaco.editor.setModelLanguage(model, this.getMonacoLanguage(file.language || 'plaintext'));
      }
      
      // Set the editor content
      this.editor.setValue(file.content);
    }
  }
  
  private getMonacoLanguage(language: string): string {
    // Map our language identifiers to Monaco's language identifiers
    const languageMap: Record<string, string> = {
      'solidity': 'solidity',
      'javascript': 'javascript',
      'typescript': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'markdown': 'markdown',
      'rust': 'rust',
      'plaintext': 'plaintext'
    };
    
    return languageMap[language] || 'plaintext';
  }
  
  // Editor and Monaco setup
  
  private initMonacoEditor() {
    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      ...this.editorOptions,
      value: '' // Start with empty editor, content will be updated on file selection
    });
    
    // Set up change event listener to track unsaved changes
    this.editor.onDidChangeModelContent(() => {
      // Could implement dirty file tracking here
    });
  }
  
  private updateEditorTheme(isDarkMode: boolean) {
    if (this.editor) {
      monaco.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs');
    }
  }
  
  // Code Editing Features
  
  insertCodeAtCursor(code: string) {
    if (this.editor) {
      const position = this.editor.getPosition();
      if (position) {
        const range = new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        );
        this.editor.executeEdits('ai-assistant', [{
          range,
          text: code,
          forceMoveMarkers: true
        }]);
      }
    }
  }
  
  replaceEditorContent(code: string) {
    if (this.editor) {
      this.editor.setValue(code);
      if (this.activeFile) {
        this.saveActiveFile();
      }
    }
  }
  
  // AI Assistant Integration
  
  toggleAiAssistant() {
    this.showAiAssistant = !this.showAiAssistant;
    
    if (this.showAiAssistant) {
      // Set default width distribution when showing AI assistant
      this.editorWidth = 65;
      this.aiAssistantWidth = 35;
    } else {
      // Reset to full width editor when hiding AI assistant
      this.editorWidth = 100;
      this.aiAssistantWidth = 0;
    }
    
    this.adjustEditorLayout();
  }
  
  toggleAIAssistant() {
    this.aiAssistantVisible = !this.aiAssistantVisible;
  }
  
  // Compilation Features
  
  compileActiveFile() {
    if (this.activeFile && this.editor) {
      this.compileContract();
    }
  }
  
  private registerSolidityLanguage() {
    // This is a simplified syntax highlighting for Solidity
    monaco.languages.register({ id: 'solidity' });
    
    monaco.languages.setMonarchTokensProvider('solidity', {
      keywords: this.editorOptions.keywords,
      typeKeywords: this.editorOptions.typeKeywords,
      
      operators: [
        '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
        '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
        '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
        '%=', '<<=', '>>=', '>>>='
      ],
      
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      
      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*/, { 
            cases: { 
              '@keywords': 'keyword',
              '@typeKeywords': 'type',
              '@default': 'identifier' 
            } 
          }],
          { include: '@whitespace' },
          [/[{}()\[\]]/, '@brackets'],
          [/[<>](?!@symbols)/, '@brackets'],
          [/@symbols/, { 
            cases: { 
              '@operators': 'operator',
              '@default': '' 
            } 
          }],
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/0[xX][0-9a-fA-F]+/, 'number.hex'],
          [/\d+/, 'number'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }]
        ],
        
        comment: [
          [/[^\/*]+/, 'comment' ],
          [/\/\*/, 'comment', '@push'],
          ["\\*/", 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ],
        
        string: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],
        
        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/\/\*/, 'comment', '@comment'],
          [/\/\/.*$/, 'comment'],
        ],
      }
    });
    
    // Add code completion provider - simplified example
    monaco.languages.registerCompletionItemProvider('solidity', {
      provideCompletionItems: () => {
        const suggestions = [
          ...(this.editorOptions.keywords || []).map(keyword => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword
          })),
          ...(this.editorOptions.typeKeywords || []).map(type => ({
            label: type,
            kind: monaco.languages.CompletionItemKind.TypeParameter,
            insertText: type
          }))
        ];
        
        return { suggestions };
      }
    });
  }
  
  compileContract() {
    if (!this.editor) {
      return;
    }
    
    const sourceCode = this.editor.getValue();
    this.isCompiling = true;
    this.compileOutput = 'Compiling...';
    
    const options: CompilationOptions = {
      sourceCode,
      version: this.compilerVersion,
      optimization: this.optimizationEnabled,
      evmVersion: this.evmVersion
    };
    
    this.compilationService.compileContract(options).subscribe({
      next: (result) => {
        this.isCompiling = false;
        this.compilationResult = result;
        this.compilationOutput = result.output;
        
        if (result.success) {
          console.log('Compilation successful:', result);
        } else {
          console.error('Compilation failed:', result.errors);
        }
        
        // Show the output panel with default height when compilation completes
        this.outputPanelHeight = this.defaultOutputHeight;
        this.adjustEditorLayout();
      },
      error: (error) => {
        this.isCompiling = false;
        this.compileOutput = `Error: ${error.message}`;
        console.error('Compilation error:', error);
        
        // Show the output panel with default height when compilation errors
        this.outputPanelHeight = this.defaultOutputHeight;
        this.adjustEditorLayout();
      }
    });
  }
  
  clearCompilationOutput() {
    this.compilationOutput = '';
    this.compilationResult = null;
    this.compileOutput = '';
    this.adjustEditorLayout();
  }
}