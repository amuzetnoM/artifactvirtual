import { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen } from 'lucide-react';
import { FileTree as FileTreeType } from '../../types';
import useStore from '../../store/useStore';
import { fetchFile } from '../../services/github';

interface FileTreeProps {
  tree: FileTreeType[];
  level?: number;
}

interface FileTreeNodeProps {
  node: FileTreeType;
  level: number;
}

function FileTreeNode({ node, level }: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentRepository, setCurrentDocument } = useStore();
  
  const handleFileClick = async () => {
    if (!currentRepository || node.type !== 'file') return;
    
    try {
      const [owner, repo] = currentRepository.name.split('/');
      const document = await fetchFile(owner, repo, node.path);
      setCurrentDocument(document);
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  };
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-md transition-colors duration-150"
        style={{ paddingLeft: `${level * 12}px` }}
        onClick={node.type === 'file' ? handleFileClick : toggleExpand}
      >
        {node.type === 'directory' && (
          <button
            onClick={toggleExpand}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
        
        {node.type === 'directory' ? (
          isExpanded ? (
            <FolderOpen size={16} className="text-blue-500" />
          ) : (
            <Folder size={16} className="text-blue-500" />
          )
        ) : (
          <FileText size={16} className="text-gray-500" />
        )}
        
        <span className="text-sm truncate">{node.name}</span>
      </div>
      
      {node.type === 'directory' && isExpanded && node.children && (
        <FileTree tree={node.children} level={level + 1} />
      )}
    </div>
  );
}

export default function FileTree({ tree, level = 0 }: FileTreeProps) {
  return (
    <div className="select-none">
      {tree.map((node) => (
        <FileTreeNode key={node.path} node={node} level={level} />
      ))}
    </div>
  );
}