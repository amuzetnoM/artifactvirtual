import { Octokit } from '@octokit/rest';
import { Document, Repository, FileTree, CommitInfo } from '../types';
import useStore from '../store/useStore';

export async function authenticateWithGitHub(code: string): Promise<string> {
  const response = await fetch('/api/github/oauth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  
  if (!response.ok) {
    throw new Error('Authentication failed');
  }
  
  const { access_token } = await response.json();
  return access_token;
}

export async function fetchRepositories(): Promise<Repository[]> {
  const { octokit } = useStore.getState();
  if (!octokit) throw new Error('Not authenticated');

  const { data: repos } = await octokit.repos.listForAuthenticatedUser();
  
  return Promise.all(
    repos.map(async (repo) => {
      const { data: branches } = await octokit.repos.listBranches({
        owner: repo.owner.login,
        repo: repo.name,
      });

      return {
        id: repo.id.toString(),
        name: repo.name,
        owner: repo.owner.login,
        defaultBranch: repo.default_branch,
        branches: branches.map((b) => b.name),
        connected: false,
      };
    })
  );
}

export async function fetchFileTree(
  owner: string,
  repo: string,
  path: string = ''
): Promise<FileTree[]> {
  const { octokit } = useStore.getState();
  if (!octokit) throw new Error('Not authenticated');

  const { data: contents } = await octokit.repos.getContent({
    owner,
    repo,
    path,
  });

  if (!Array.isArray(contents)) {
    throw new Error('Invalid response format');
  }

  return Promise.all(
    contents
      .filter((item) => item.type === 'file' || item.type === 'dir')
      .map(async (item) => {
        const node: FileTree = {
          name: item.name,
          path: item.path,
          type: item.type === 'file' ? 'file' : 'directory',
        };

        if (item.type === 'dir') {
          node.children = await fetchFileTree(owner, repo, item.path);
        }

        return node;
      })
  );
}

export async function fetchFile(
  owner: string,
  repo: string,
  path: string
): Promise<Document> {
  const { octokit } = useStore.getState();
  if (!octokit) throw new Error('Not authenticated');

  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
  });

  if (Array.isArray(data) || !('content' in data)) {
    throw new Error('Invalid response format');
  }

  const content = Buffer.from(data.content, 'base64').toString('utf8');
  
  return {
    id: Math.random().toString(36).substring(2, 15),
    title: data.name,
    content,
    tags: [],
    lastModified: new Date(),
    createdAt: new Date(),
    path: data.path,
    repository: `${owner}/${repo}`,
    sha: data.sha,
    status: 'unmodified',
  };
}

export async function commitFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  const { octokit } = useStore.getState();
  if (!octokit) throw new Error('Not authenticated');

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    sha,
  });
}

export async function fetchCommitHistory(
  owner: string,
  repo: string,
  path: string
): Promise<CommitInfo[]> {
  const { octokit } = useStore.getState();
  if (!octokit) throw new Error('Not authenticated');

  const { data: commits } = await octokit.repos.listCommits({
    owner,
    repo,
    path,
  });

  return commits.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: commit.commit.author?.name || 'Unknown',
    date: new Date(commit.commit.author?.date || ''),
    changes: {
      added: [],
      modified: [],
      removed: [],
    },
  }));
}