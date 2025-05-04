import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CompilationOptions {
  optimization?: boolean;
  evmVersion?: string;
  runs?: number;
  sourceCode: string;
  version?: string;
}

export interface CompilationResult {
  success: boolean;
  output: string;
  contracts?: {
    [key: string]: {
      abi: any[];
      bytecode: string;
      deployedBytecode: string;
    }
  };
  errors?: any[];
  warnings?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class CompilationService {
  private apiUrl = environment.apiBaseUrl + '/compile';
  
  constructor(private http: HttpClient) { }
  
  compileContract(options: CompilationOptions): Observable<CompilationResult> {
    // For development/demo purposes, we can optionally include a mock implementation
    if (environment.useMockApi) {
      return this.mockCompileContract(options);
    }
    
    return this.http.post<CompilationResult>(this.apiUrl, options).pipe(
      catchError(error => {
        console.error('Compilation error:', error);
        return throwError(() => new Error('Failed to compile contract. Please check your network connection and try again.'));
      })
    );
  }
  
  private mockCompileContract(options: CompilationOptions): Observable<CompilationResult> {
    // Simple validation to provide realistic feedback
    if (!options.sourceCode || options.sourceCode.trim() === '') {
      return of({
        success: false,
        output: 'Error: No source code provided',
        errors: [{ message: 'No source code provided' }]
      });
    }
    
    // Check for common Solidity errors
    if (!options.sourceCode.includes('pragma solidity')) {
      return of({
        success: false,
        output: 'Error: Missing pragma solidity directive',
        errors: [{ 
          message: 'Source file does not specify required compiler version! Consider adding "pragma solidity ^0.8.0;"',
          severity: 'error',
          sourceLocation: { start: 0, end: 1, file: 'source.sol' }
        }]
      });
    }
    
    if (!options.sourceCode.includes('contract')) {
      return of({
        success: false,
        output: 'Error: No contract definition found',
        errors: [{ 
          message: 'No contract definition found',
          severity: 'error',
          sourceLocation: { start: 0, end: options.sourceCode.length, file: 'source.sol' }
        }]
      });
    }
    
    // Simulate delay for a realistic compilation time
    return of({
      success: true,
      output: 'Compilation successful!\n\nContract compiled successfully with solidity ^0.8.0\n\nABI and bytecode generated',
      contracts: {
        'MyContract': {
          abi: [
            {
              "inputs": [],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [],
              "name": "getValue",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "_value",
                  "type": "uint256"
                }
              ],
              "name": "setValue",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ],
          bytecode: '0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80633fa4f2451461003b5780635524107714610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220223a15a3351b046b64cbb6fe04b703915a810c1a4fd26e278b6d1feb57a098a164736f6c63430008090033',
          deployedBytecode: '0x608060405234801561001057600080fd5b50600436106100365760003560e01c80633fa4f2451461003b5780635524107714610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220223a15a3351b046b64cbb6fe04b703915a810c1a4fd26e278b6d1feb57a098a164736f6c63430008090033'
        }
      }
    }).pipe(delay(2000)); // 2 second delay to simulate compilation time
  }
}