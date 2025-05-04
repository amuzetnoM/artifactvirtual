import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CompilationResult {
  success: boolean;
  output: string;
  errors?: any[];
  abi?: any[];
  bytecode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompilationService {
  private apiUrl = environment.compilationServiceUrl || 'http://localhost:3000/api/compile';
  private simulationMode = true; // Use this until the backend is fully implemented

  constructor(private http: HttpClient) { }

  compile(code: string, language: string): Observable<CompilationResult> {
    if (this.simulationMode) {
      return this.simulateCompilation(code, language);
    }

    return this.http.post<CompilationResult>(this.apiUrl, { code, language })
      .pipe(
        catchError(error => {
          console.error('Compilation error:', error);
          return of({
            success: false,
            output: `Error: Failed to connect to compilation service. ${error.message || ''}`,
            errors: [{ message: 'Connection error' }]
          });
        })
      );
  }

  private simulateCompilation(code: string, language: string): Observable<CompilationResult> {
    // This is a temporary simulation until the backend compiler is integrated
    console.log('Simulating compilation for', language);
    
    return of({}).pipe(
      map(() => {
        // Simulated delay for "compilation" - you'd replace this with actual compilation
        if (language === 'solidity') {
          return this.simulateSolidityCompilation(code);
        } else if (language === 'javascript' || language === 'typescript') {
          return this.simulateJSCompilation(code);
        } else {
          return {
            success: false,
            output: `Compilation not supported for ${language}`
          };
        }
      })
    );
  }

  private simulateSolidityCompilation(code: string): CompilationResult {
    // Basic syntax validation
    const errors = this.performBasicSolidityValidation(code);
    
    if (errors.length > 0) {
      return {
        success: false,
        output: `Compilation failed with ${errors.length} errors.\n\n${errors.map(err => err.message).join('\n')}`,
        errors
      };
    }
    
    // Simulate successful compilation with fake ABI and bytecode
    const contractName = this.extractContractName(code) || 'Contract';
    
    return {
      success: true,
      output: `Successfully compiled ${contractName}.\n\nNo errors found.`,
      abi: [
        { 
          "type": "constructor", 
          "inputs": [{ "name": "initialValue", "type": "uint256" }], 
          "stateMutability": "nonpayable" 
        },
        {
          "type": "function",
          "name": "getValue",
          "inputs": [],
          "outputs": [{ "name": "", "type": "uint256" }],
          "stateMutability": "view"
        }
      ],
      bytecode: '0x608060405234801561001057600080fd5b5060405161015d38038061015d83398101604081905261002f916100558565b600055610085565b60006020828403121561006757600080fd5b5051919050565b60cf806100936000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063209652552146035578063c0c53b8b146049575b60f357600080fd5b603f600054905081565b6040519081526020015b60405180910390f35b605560053660046057565b600055565b005b600060208284031215606857600080fd5b503591905056fea26469706673582212207ef978f0677a5c471825fed34a020b267a0dfdfc02b99de07c9fff8ba163536964736f6c63430008090033'
    };
  }

  private simulateJSCompilation(code: string): CompilationResult {
    // Basic syntax validation - in a real implementation, you'd use a proper JS parser
    try {
      // Try to detect simple syntax errors
      new Function(code);
      return {
        success: true,
        output: 'JavaScript compilation successful. No syntax errors detected.'
      };
    } catch (error: any) {
      return {
        success: false,
        output: `JavaScript compilation failed: ${error.message}`,
        errors: [{ message: error.message }]
      };
    }
  }

  private performBasicSolidityValidation(code: string): any[] {
    const errors = [];
    
    // Check for pragma solidity statement
    if (!code.includes('pragma solidity')) {
      errors.push({
        message: 'Missing pragma solidity statement',
        line: 1,
        column: 0
      });
    }
    
    // Check for matching braces
    const braceCount = (code.match(/{/g) || []).length - (code.match(/}/g) || []).length;
    if (braceCount !== 0) {
      errors.push({
        message: `Mismatched braces: ${braceCount > 0 ? 'missing' : 'extra'} closing braces`,
        line: 0,
        column: 0
      });
    }
    
    // Check for unclosed strings
    const lines = code.split('\n');
    let inString = false;
    let stringChar = '';
    let lineNum = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (!inString && (char === '"' || char === "'")) {
          inString = true;
          stringChar = char;
          lineNum = i;
        } else if (inString && char === stringChar && line[j-1] !== '\\') {
          inString = false;
        }
      }
    }
    
    if (inString) {
      errors.push({
        message: `Unclosed string starting at line ${lineNum + 1}`,
        line: lineNum,
        column: 0
      });
    }
    
    return errors;
  }
  
  private extractContractName(code: string): string | null {
    const contractMatch = code.match(/contract\s+(\w+)/);
    return contractMatch ? contractMatch[1] : null;
  }
}