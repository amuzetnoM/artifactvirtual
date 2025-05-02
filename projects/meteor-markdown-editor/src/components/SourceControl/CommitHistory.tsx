import { useEffect, useState } from 'react';
import { GitCommit, Clock, User } from 'lucide-react';
import { CommitInfo } from '../../types';
import { fetchCommitHistory } from '../../services/github';
import useStore from '../../store/useStore';

export default function CommitHistory() {
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentDocument, currentRepository } = useStore();
  
  useEffect(() => {
    const loadCommits = async () => {
      if (!currentDocument?.path || !currentRepository) return;
      
      try {
        setLoading(true);
        const [owner, repo] = currentRepository.name.split('/');
        const history = await fetchCommitHistory(owner, repo, currentDocument.path);
        setCommits(history);
      } catch (error) {
        console.error('Failed to load commit history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCommits();
  }, [currentDocument?.path, currentRepository]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 text-gray-500">
        <GitCommit size={16} className="animate-spin mr-2" />
        <span>Loading commits...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-2 p-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
        Commit History
      </h3>
      
      <div className="space-y-3">
        {commits.map((commit) => (
          <div
            key={commit.sha}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <div className="flex items-start gap-3">
              <GitCommit size={16} className="text-gray-500 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                  {commit.message}
                </p>
                <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <User size={12} />
                    <span>{commit.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{new Date(commit.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {commits.length === 0 && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
            No commits found for this file
          </div>
        )}
      </div>
    </div>
  );
}