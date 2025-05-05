import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FileSystemService, FileNode } from '../../services/file-system.service';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss']
})
export class FileExplorerComponent implements OnInit {
  @Output() fileSelected = new EventEmitter<FileNode>();
  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  
  fileSystem: FileNode[] = [];
  activeFile: FileNode | null = null;
  newItemName: string = '';
  newItemType: 'file' | 'directory' = 'file';
  selectedNode: FileNode | null = null;
  renameMode: boolean = false;
  renameValue: string = '';

  constructor(
    private fileSystemService: FileSystemService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.fileSystemService.fileSystem$.subscribe(fs => {
      this.fileSystem = fs;
    });
    
    this.fileSystemService.activeFile$.subscribe(file => {
      this.activeFile = file;
    });
  }

  onFileClick(file: FileNode) {
    if (file.type === 'file') {
      this.fileSystemService.setActiveFile(file);
      this.fileSelected.emit(file);
    } else {
      this.fileSystemService.toggleDirectoryExpansion(file.id);
    }
  }

  onContextMenu(event: MouseEvent, item: FileNode) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.selectedNode = item;
    this.contextMenu.openMenu();
  }

  isActiveFile(file: FileNode): boolean {
    return this.activeFile !== null && this.activeFile.id === file.id;
  }

  createNewFile(parentDir: FileNode | null) {
    const parentId = parentDir ? parentDir.id : null;
    const name = window.prompt('Enter file name:', 'NewFile.sol');
    
    if (name) {
      const language = this.fileSystemService.getLanguageFromFilename(name);
      const newFile = parentId 
        ? this.fileSystemService.createFile(parentId, name, language)
        : null;
      
      if (newFile) {
        this.fileSystemService.setActiveFile(newFile);
      }
    }
  }

  createNewFolder(parentDir: FileNode | null) {
    const parentId = parentDir ? parentDir.id : null;
    const name = window.prompt('Enter folder name:', 'New Folder');
    
    if (name) {
      this.fileSystemService.createDirectory(parentId, name);
    }
  }

  deleteItem(item: FileNode) {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      this.fileSystemService.deleteFileOrDirectory(item.id);
    }
  }

  startRenaming(item: FileNode) {
    this.selectedNode = item;
    this.renameMode = true;
    this.renameValue = item.name;
  }

  completeRenaming() {
    if (this.selectedNode && this.renameMode && this.renameValue) {
      this.fileSystemService.renameFileOrDirectory(this.selectedNode.id, this.renameValue);
      this.cancelRenaming();
    }
  }

  cancelRenaming() {
    this.renameMode = false;
    this.renameValue = '';
    this.selectedNode = null;
  }

  exportFiles() {
    const jsonData = this.fileSystemService.exportFileSystem();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bedrock-files.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  importFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.fileSystemService.importFileSystem(result);
      };
      reader.readAsText(file);
    }
  }

  resetFiles() {
    if (confirm('Are you sure you want to reset the file system to default? All changes will be lost.')) {
      this.fileSystemService.resetFileSystem();
    }
  }
}