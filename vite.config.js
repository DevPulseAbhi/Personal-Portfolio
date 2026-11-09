import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import contributionHandler from './api/github-contributions.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GITHUB_TOKEN) process.env.GITHUB_TOKEN = env.GITHUB_TOKEN;
  if (env.RESEND_API_KEY) process.env.RESEND_API_KEY = env.RESEND_API_KEY;
  if (env.RESEND_FROM_EMAIL) process.env.RESEND_FROM_EMAIL = env.RESEND_FROM_EMAIL;

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
          server.middlewares.use('/api/contact', async (request, response, next) => {
            try {
              const chunks = [];
              for await (const chunk of request) chunks.push(chunk);
              request.body =
                request.method === 'POST'
                  ? JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
                  : {};
              const contactHandler = (await import('./api/contact.js')).default;
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
              await contactHandler(request, apiResponse);
            } catch (error) {
              next(error);
            }
          });
        }
      }
    ]
  };
});
