const API_ROOT = 'https://api.github.com';

async function githubFetch(path) {
  const response = await fetch(`${API_ROOT}${path}`, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) throw new Error(`GitHub request failed: ${response.status}`);
  return response.json();
}

export async function fetchGithubData(username) {
  const [profile, repositories] = await Promise.all([
    githubFetch(`/users/${username}`),
    fetchAllRepositories(username)
  ]);
  return { profile, repositories };
}

async function fetchAllRepositories(username) {
  const all = [];
  let page = 1;
  while (true) {
    const batch = await githubFetch(`/users/${username}/repos?per_page=100&page=${page}&sort=updated`);
    all.push(...batch);
    if (batch.length < 100) return all;
    page += 1;
  }
}

export function summarizeRepositories(repositories) {
  return repositories.reduce((summary, repository) => {
    summary.stars += repository.stargazers_count;
    if (repository.language) summary.languages[repository.language] = (summary.languages[repository.language] || 0) + 1;
    return summary;
  }, { stars: 0, languages: {} });
}
