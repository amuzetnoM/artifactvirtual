"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Folder, FileCode, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

// Define the file system item type
type FileSystemItem = {
  id: string
  name: string
  type: "file" | "directory"
  content?: string
  language?: string
  children?: FileSystemItem[]
}

interface FileExplorerProps {
  files: FileSystemItem[]
  onFileSelect: (file: FileSystemItem) => void
  activeFile: FileSystemItem | null
}

export function FileExplorer({ files, onFileSelect, activeFile }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Get the appropriate icon based on file type and extension
  const getFileIcon = (file: FileSystemItem) => {
    if (file.type === "directory") {
      return <Folder className="h-4 w-4 text-muted-foreground" />
    }

    const extension = file.name.split(".").pop()?.toLowerCase()

    if (extension === "sol") {
      return <FileCode className="h-4 w-4 text-yellow-500" />
    } else if (extension === "rs") {
      return <FileCode className="h-4 w-4 text-orange-500" />
    } else if (extension === "vy") {
      return <FileCode className="h-4 w-4 text-blue-500" />
    } else if (extension === "js" || extension === "ts") {
      return <FileCode className="h-4 w-4 text-green-500" />
    } else {
      return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Recursive function to render the file tree
  const renderTree = (items: FileSystemItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} style={{ paddingLeft: `${level * 12}px` }}>
        {item.type === "directory" ? (
          <div>
            <div
              className="flex items-center gap-1 py-1 px-2 hover:bg-muted/50 rounded-sm cursor-pointer"
              onClick={() => toggleFolder(item.id)}
            >
              {expandedFolders[item.id] ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              {getFileIcon(item)}
              <span className="text-sm">{item.name}</span>
            </div>
            {expandedFolders[item.id] && item.children && (
              <div className="ml-2">{renderTree(item.children, level + 1)}</div>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center gap-1 py-1 px-2 hover:bg-muted/50 rounded-sm cursor-pointer ml-4",
              activeFile?.id === item.id && "bg-muted",
            )}
            onClick={() => onFileSelect(item)}
          >
            {getFileIcon(item)}
            <span className="text-sm">{item.name}</span>
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className="p-2 overflow-auto h-[calc(100vh-120px)]">
      {files.length === 0 ? (
        <div className="text-center text-muted-foreground text-sm p-4">No files found</div>
      ) : (
        renderTree(files)
      )}
    </div>
  )
}
