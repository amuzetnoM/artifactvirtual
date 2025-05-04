import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as monaco from 'monaco-editor';
import { CompilationService, CompilationOptions, CompilationResult } from '../../services/compilation.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  
  editor: monaco.editor.IStandaloneCodeEditor | null = null;
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
    fontSize: 14
  };
  
  compilerVersion: string = '0.8.19';
  optimizationEnabled: boolean = true;
  evmVersion: string = 'paris';
  compilationOutput: string = '';
  isCompiling: boolean = false;
  compilationResult: CompilationResult | null = null;
  
  aiAssistantVisible: boolean = false;

  constructor(
    private compilationService: CompilationService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.initMonacoEditor();
    
    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      this.updateEditorTheme(isDarkMode);
    });
    
    // Register Solidity language if not registered already
    this.registerSolidityLanguage();
  }
  
  private initMonacoEditor() {
    // Create the editor with default Solidity boilerplate code
    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      ...this.editorOptions,
      value: this.getDefaultSolidityCode()
    });
  }
  
  private updateEditorTheme(isDarkMode: boolean) {
    if (this.editor) {
      monaco.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs');
    }
  }
  
  private registerSolidityLanguage() {
    // This is a simplified syntax highlighting for Solidity
    // In a production app, you'd want to use a more complete language definition
    monaco.languages.register({ id: 'solidity' });
    
    monaco.languages.setMonarchTokensProvider('solidity', {
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
      ],
      
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
          ...this.editorOptions.keywords?.map(keyword => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword
          })) || [],
          ...this.editorOptions.typeKeywords?.map(type => ({
            label: type,
            kind: monaco.languages.CompletionItemKind.TypeParameter,
            insertText: type
          })) || []
        ];
        
        return { suggestions };
      }
    });
  }
  
  private getDefaultSolidityCode(): string {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private value;
    
    event ValueChanged(uint256 newValue);
    
    constructor() {
        value = 0;
    }
    
    function setValue(uint256 _value) public {
        value = _value;
        emit ValueChanged(_value);
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
}`;
  }
  
  compileContract() {
    if (!this.editor) {
      return;
    }
    
    const sourceCode = this.editor.getValue();
    this.isCompiling = true;
    this.compilationOutput = 'Compiling...';
    
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
      },
      error: (error) => {
        this.isCompiling = false;
        this.compilationOutput = `Error: ${error.message}`;
        console.error('Compilation error:', error);
      }
    });
  }
  
  clearCompilationOutput() {
    this.compilationOutput = '';
    this.compilationResult = null;
  }
  
  toggleAIAssistant() {
    this.aiAssistantVisible = !this.aiAssistantVisible;
  }
}