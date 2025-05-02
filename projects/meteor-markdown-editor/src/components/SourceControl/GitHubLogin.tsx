import { Github } from 'lucide-react';
import useStore from '../../store/useStore';
import { authenticateWithGitHub } from '../../services/github';

export default function GitHubLogin() {
  const { setAuthenticated } = useStore();

  const handleLogin = async () => {
    try {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const redirectUri = `${window.location.origin}/github/callback`;
      const scope = 'repo';

      const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to initiate GitHub login:', error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
    >
      <Github size={20} />
      <span>Connect GitHub</span>
    </button>
  );
}