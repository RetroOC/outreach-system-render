# Outreach System Prototype Deployment Guide

This guide gets the prototype running fast.

## What you have

- **Backend**: Fastify API in the repo root (`outreach-core`)
- **Frontend**: Vite/React app in `frontend/`
- **Prototype flows**:
  - backend health check
  - account creation
  - lead creation
  - campaign creation
  - campaign listing by account
  - Gmail test send (SMTP via Gmail app password)
  - queued campaign-step sending via worker

## Option A — Run locally in 5–10 minutes

### 1) Backend
From repo root:

```bash
npm install
cp .env.example .env
npm run dev
```

Backend default URL:

```text
http://localhost:3000
```

If you want auth enabled, set in `.env`:

```env
API_KEY=change-me
```

### 2) Frontend
From `frontend/`:

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

If backend auth is enabled, put the same value in:

```env
VITE_API_KEY=change-me
```

If backend runs elsewhere:

```env
VITE_API_BASE_URL=https://your-backend-url
```

## Option B — Deploy frontend to Vercel

From `frontend/`:

```bash
vercel
vercel --prod
```

Set environment variables in Vercel:

- `VITE_API_BASE_URL`
- `VITE_API_KEY` (only if backend auth is enabled)

## Option C — Deploy backend to Railway / Render / VPS

### Minimal backend env vars

```env
PORT=3000
API_KEY=change-me
DEFAULT_EMAIL_PROVIDER=gmail
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

Optional if using Postgres:

```env
DATABASE_URL=postgres://...
WEBHOOK_SECRET=change-me
```

### Start command

```bash
npm run build && npm start
```

### For worker later

```bash
npm run build && npm run start:worker
```

## Recommended fastest production-ish setup

- backend on **Railway** or **Render**
- frontend on **Vercel**
- point `VITE_API_BASE_URL` to backend URL

## Quick smoke test

1. Open frontend
2. set backend URL
3. click **Check backend**
4. create account
5. create an inbox with provider `gmail`
6. connect that inbox
7. use `POST /inboxes/:inboxId/send-test` to send a real Gmail test email
8. create lead(s)
9. create campaign
10. enroll leads into campaign with the Gmail inbox
11. hit `POST /ops/worker/tick` (or run the worker) to send due campaign steps

If those work, the Gmail MVP is functional.

## Notes

- CORS is enabled for the prototype
- API key auth is supported via Bearer token
- frontend is intentionally simple and optimized for speed of setup, not final polish
