import { useState, useEffect } from 'react';
import { GitBranch, RefreshCw, FolderGit2 } from 'lucide-react';
import useStore from '../../store/useStore';
import { fetchRepositories } from '../../services/github';

export default function RepositoryList() {
  const { repositories, setRepositories, setCurrentRepository } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      const repos = await fetchRepositories();
      setRepositories(repos);
    } catch (err) {
      setError('Failed to load repositories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepositories();
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
        <button
          onClick={loadRepositories}
          className="mt-2 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <RefreshCw size={16} className="animate-spin" />
        <span>Loading repositories...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Repositories
      </h3>
      <div className="space-y-1">
        {repositories.map((repo) => (
          <button
            key={repo.id}
            onClick={() => setCurrentRepository(repo)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <FolderGit2 size={16} className="text-gray-500" />
            <span className="flex-1 truncate">{repo.owner}/{repo.name}</span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <GitBranch size={12} />
              <span>{repo.defaultBranch}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}