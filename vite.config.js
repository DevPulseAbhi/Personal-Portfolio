import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import contributionHandler from './api/github-contributions.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GITHUB_TOKEN) process.env.GITHUB_TOKEN = env.GITHUB_TOKEN;

  return {
    plugins: [
      react(),
      {
        name: 'local-github-contributions-api',
        configureServer(server) {
          server.middlewares.use('/api/github-contributions', async (request, response, next) => {
            try {
              const url = new URL(request.url || '/', 'http://localhost');
              request.query = Object.fromEntries(url.searchParams.entries());
              const apiResponse = {
                status(code) {
                  response.statusCode = code;
                  return apiResponse;
                },
                setHeader(name, value) {
                  response.setHeader(name, value);
                },
                json(payload) {
                  response.end(JSON.stringify(payload));
                }
              };
              await contributionHandler(request, apiResponse);
            } catch (error) {
              next(error);
            }
          });
        }
      }
    ]
  };
});
