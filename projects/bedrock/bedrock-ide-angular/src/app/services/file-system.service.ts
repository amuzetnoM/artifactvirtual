import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  language?: string;
  children?: FileNode[];
  parentId?: string;
  path?: string; // Full path from root
  isExpanded?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {
  private readonly STORAGE_KEY = 'bedrock_ide_file_system';
  
  // Initial file system with some template code
  private initialFileSystem: FileNode[] = [
    {
      id: 'root-contracts',
      name: 'contracts',
      type: 'directory',
      path: '/contracts',
      isExpanded: true,
      children: [
        {
          id: 'token-contract',
          name: 'MyToken.sol',
          type: 'file',
          language: 'solidity',
          path: '/contracts/MyToken.sol',
          content: this.getSolidityTemplate()
        }
      ]
    },
    {
      id: 'root-tests',
      name: 'tests',
      type: 'directory',
      path: '/tests',
      isExpanded: true,
      children: [
        {
          id: 'token-test',
          name: 'MyToken.test.js',
          type: 'file',
          language: 'javascript',
          path: '/tests/MyToken.test.js',
          content: this.getJavaScriptTestTemplate()
        }
      ]
    }
  ];

  private fileSystemSubject = new BehaviorSubject<FileNode[]>(this.loadFileSystem());
  
  // Current active file
  private activeFileSubject = new BehaviorSubject<FileNode | null>(null);
  
  fileSystem$ = this.fileSystemSubject.asObservable();
  activeFile$ = this.activeFileSubject.asObservable();

  constructor() {
    // Set initial active file
    const fileSystem = this.fileSystemSubject.value;
    if (fileSystem.length > 0 && fileSystem[0].children && fileSystem[0].children.length > 0) {
      this.setActiveFile(fileSystem[0].children[0]);
    }
  }

  private loadFileSystem(): FileNode[] {
    const savedFs = localStorage.getItem(this.STORAGE_KEY);
    if (savedFs) {
      try {
        return JSON.parse(savedFs);
      } catch (e) {
        console.error('Failed to parse saved file system:', e);
      }
    }
    return this.initialFileSystem;
  }

  private saveFileSystem(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.fileSystemSubject.value));
  }

  getFileSystem(): FileNode[] {
    return this.fileSystemSubject.value;
  }

  getActiveFile(): FileNode | null {
    return this.activeFileSubject.value;
  }

  setActiveFile(file: FileNode): void {
    this.activeFileSubject.next(file);
  }

  getFileById(id: string): FileNode | null {
    const findById = (nodes: FileNode[]): FileNode | null => {
      for (const node of nodes) {
        if (node.id === id) {
          return node;
        }
        if (node.children) {
          const found = findById(node.children);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    return findById(this.fileSystemSubject.value);
  }

  getFileByPath(path: string): FileNode | null {
    const findByPath = (nodes: FileNode[]): FileNode | null => {
      for (const node of nodes) {
        if (node.path === path) {
          return node;
        }
        if (node.children) {
          const found = findByPath(node.children);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    return findByPath(this.fileSystemSubject.value);
  }

  updateFileContent(fileId: string, content: string): void {
    const updateContent = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === fileId) {
          return { ...node, content };
        }
        if (node.children) {
          return { ...node, children: updateContent(node.children) };
        }
        return node;
      });
    };

    const updatedFs = updateContent(this.fileSystemSubject.value);
    this.fileSystemSubject.next(updatedFs);
    this.saveFileSystem();
    
    // Also update activeFile if this is the active file
    const currentActiveFile = this.activeFileSubject.value;
    if (currentActiveFile && currentActiveFile.id === fileId) {
      this.activeFileSubject.next({ ...currentActiveFile, content });
    }
  }

  createFile(parentDirId: string, name: string, language: string = 'solidity'): FileNode | null {
    let parentDir: FileNode | null = null;
    let parentPath = '';
    
    if (parentDirId) {
      parentDir = this.getFileById(parentDirId);
      if (!parentDir || parentDir.type !== 'directory') {
        return null;
      }
      parentPath = parentDir.path || '';
    }
    
    const newFilePath = `${parentPath}/${name}`;
    const newFile: FileNode = {
      id: `file-${Date.now()}`,
      name,
      type: 'file',
      language,
      content: '',
      path: newFilePath,
      parentId: parentDirId
    };

    const updateFs = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === parentDirId) {
          const children = node.children || [];
          return {
            ...node,
            children: [...children, newFile],
            isExpanded: true
          };
        }
        if (node.children) {
          return { ...node, children: updateFs(node.children) };
        }
        return node;
      });
    };

    const updatedFs = updateFs(this.fileSystemSubject.value);
    this.fileSystemSubject.next(updatedFs);
    this.saveFileSystem();
    return newFile;
  }

  createDirectory(parentDirId: string | null, name: string): FileNode | null {
    let parentPath = '';
    let parentDir: FileNode | null = null;
    
    if (parentDirId) {
      parentDir = this.getFileById(parentDirId);
      if (!parentDir || parentDir.type !== 'directory') {
        return null;
      }
      parentPath = parentDir.path || '';
    }

    const dirPath = parentPath ? `${parentPath}/${name}` : `/${name}`;
    const newDir: FileNode = {
      id: `dir-${Date.now()}`,
      name,
      type: 'directory',
      children: [],
      path: dirPath,
      parentId: parentDirId,
      isExpanded: true
    };

    if (!parentDirId) {
      // Add to root level
      const updatedFs = [...this.fileSystemSubject.value, newDir];
      this.fileSystemSubject.next(updatedFs);
      this.saveFileSystem();
      return newDir;
    }

    // Add to a parent directory
    const updateFs = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === parentDirId) {
          const children = node.children || [];
          return {
            ...node,
            children: [...children, newDir],
            isExpanded: true
          };
        }
        if (node.children) {
          return { ...node, children: updateFs(node.children) };
        }
        return node;
      });
    };

    const updatedFs = updateFs(this.fileSystemSubject.value);
    this.fileSystemSubject.next(updatedFs);
    this.saveFileSystem();
    return newDir;
  }

  deleteFileOrDirectory(id: string): boolean {
    const findAndRemove = (nodes: FileNode[], fileId: string): { nodes: FileNode[], removed: boolean } => {
      // Check if item is directly in this level
      const itemIndex = nodes.findIndex(node => node.id === fileId);
      if (itemIndex !== -1) {
        const newNodes = [...nodes.slice(0, itemIndex), ...nodes.slice(itemIndex + 1)];
        return { nodes: newNodes, removed: true };
      }

      // If not found, search in children
      const newNodes = nodes.map(node => {
        if (node.children) {
          const result = findAndRemove(node.children, fileId);
          if (result.removed) {
            return { ...node, children: result.nodes };
          }
        }
        return node;
      });

      return { nodes: newNodes, removed: itemIndex !== -1 };
    };

    const result = findAndRemove(this.fileSystemSubject.value, id);
    if (result.removed) {
      this.fileSystemSubject.next(result.nodes);
      this.saveFileSystem();
      
      // Handle if the active file is deleted
      const currentActiveFile = this.activeFileSubject.value;
      if (currentActiveFile && currentActiveFile.id === id) {
        this.activeFileSubject.next(null);
      }
    }
    return result.removed;
  }

  renameFileOrDirectory(id: string, newName: string): boolean {
    let renamed = false;
    
    const updateName = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === id) {
          renamed = true;
          // Compute the new path
          let newPath: string;
          
          if (node.path) {
            const pathParts = node.path.split('/');
            pathParts[pathParts.length - 1] = newName;
            newPath = pathParts.join('/');
          } else {
            newPath = `/${newName}`;
          }
          
          return { 
            ...node, 
            name: newName,
            path: newPath 
          };
        }
        if (node.children) {
          return { ...node, children: updateName(node.children) };
        }
        return node;
      });
    };

    const updatedFs = updateName(this.fileSystemSubject.value);
    
    if (renamed) {
      this.fileSystemSubject.next(updatedFs);
      this.saveFileSystem();
      
      // Update active file if needed
      const currentActiveFile = this.activeFileSubject.value;
      if (currentActiveFile && currentActiveFile.id === id) {
        const updatedFile = this.getFileById(id);
        if (updatedFile) {
          this.activeFileSubject.next(updatedFile);
        }
      }
    }
    
    return renamed;
  }

  toggleDirectoryExpansion(dirId: string): void {
    const toggle = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === dirId && node.type === 'directory') {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: toggle(node.children) };
        }
        return node;
      });
    };

    const updatedFs = toggle(this.fileSystemSubject.value);
    this.fileSystemSubject.next(updatedFs);
    this.saveFileSystem();
  }

  // Export file system to a JSON file
  exportFileSystem(): string {
    return JSON.stringify(this.fileSystemSubject.value, null, 2);
  }

  // Import file system from a JSON string
  importFileSystem(jsonString: string): boolean {
    try {
      const parsedFs = JSON.parse(jsonString) as FileNode[];
      this.fileSystemSubject.next(parsedFs);
      this.saveFileSystem();
      return true;
    } catch (e) {
      console.error('Failed to import file system:', e);
      return false;
    }
  }

  // Reset to initial file system
  resetFileSystem(): void {
    this.fileSystemSubject.next(this.initialFileSystem);
    this.saveFileSystem();
    
    // Set initial active file
    if (this.initialFileSystem.length > 0 && 
        this.initialFileSystem[0].children && 
        this.initialFileSystem[0].children.length > 0) {
      this.setActiveFile(this.initialFileSystem[0].children[0]);
    } else {
      this.activeFileSubject.next(null);
    }
  }

  // Get file language from extension
  getLanguageFromFilename(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'sol':
        return 'solidity';
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'rs':
        return 'rust';
      default:
        return 'plaintext';
    }
  }

  // Template code for new Solidity files
  private getSolidityTemplate(): string {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name;
    string public symbol;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    
    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply;
        balanceOf[msg.sender] = _totalSupply;
    }
    
    function transfer(address _to, uint256 _value) external returns (bool) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        return true;
    }
}`;
  }

  // Template code for JavaScript test files
  private getJavaScriptTestTemplate(): string {
    return `const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let MyToken;
  let myToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy contract
    MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy("Test Token", "TEST", 1000000);
    await myToken.deployed();
  });

  it("Should have correct initial supply", async function () {
    expect(await myToken.totalSupply()).to.equal(1000000);
    expect(await myToken.balanceOf(owner.address)).to.equal(1000000);
  });

  it("Should transfer tokens between accounts", async function () {
    // Transfer 100 tokens from owner to addr1
    await myToken.transfer(addr1.address, 100);
    expect(await myToken.balanceOf(addr1.address)).to.equal(100);
    expect(await myToken.balanceOf(owner.address)).to.equal(999900);

    // Transfer 50 tokens from addr1 to addr2
    await myToken.connect(addr1).transfer(addr2.address, 50);
    expect(await myToken.balanceOf(addr1.address)).to.equal(50);
    expect(await myToken.balanceOf(addr2.address)).to.equal(50);
  });

  it("Should fail if transfer amount exceeds balance", async function () {
    await expect(
      myToken.connect(addr1).transfer(addr2.address, 100)
    ).to.be.revertedWith("Insufficient balance");
  });
});`;
  }
}