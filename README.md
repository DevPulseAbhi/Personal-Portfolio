# Abhinav Deshwal Portfolio

A Vite + React portfolio for Abhinav Deshwal, focused on Cloud Computing, DevOps, and full-stack development.

## Run locally

```bash
npm install
npm run dev
```

Build for production with `npm run build`.

## GitHub integration

Public profile and repository data are fetched from the GitHub REST API for `DevPulseAbhi`. The frontend does not contain a personal access token. A contribution graph can be enabled by providing a Vercel function at `/api/github-contributions` backed by `GITHUB_TOKEN`.

For local development, copy `.env.example` to `.env` and set `GITHUB_TOKEN`. For deployment, add `GITHUB_TOKEN` under Vercel Project Settings > Environment Variables. Do not use a `VITE_` prefix: Vite exposes prefixed variables to browser code.

## Resume

Add `public/resume/Abhinav_Deshwal_Resume.pdf`, then set `resumeAvailable` to `true` in `src/config/portfolio.js` to enable the download link.

## Deploy to Vercel

Import the repository into Vercel and use the default Vite settings. Add `GITHUB_TOKEN` only if the contribution serverless function is enabled. Never expose that value to client-side code.
