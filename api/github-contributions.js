export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  response.setHeader('Content-Type', 'application/json');
  const year = Number(request.query.year) || new Date().getFullYear();
  if (year < 2008 || year > new Date().getFullYear()) {
    return response.status(400).json({ error: 'Invalid contribution year.' });
  }

  if (!process.env.GITHUB_TOKEN) {
    return response.status(503).json({ error: 'Contribution data is not configured.' });
  }

  const query = `query($login: String!, $from: DateTime!, $to: DateTime!) { user(login: $login) { contributionsCollection(from: $from, to: $to) { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount color } } } } } }`;
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;
  const githubResponse = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login: 'DevPulseAbhi', from, to } })
  });

  if (!githubResponse.ok) return response.status(githubResponse.status).json({ error: 'GitHub contribution request failed.' });
  const payload = await githubResponse.json();
  if (payload.errors) return response.status(502).json({ error: 'GitHub contribution data was unavailable.' });
  response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
  return response.status(200).json(payload.data.user.contributionsCollection.contributionCalendar);
}
