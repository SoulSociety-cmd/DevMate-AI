# DevMate AI

> An AI-powered developer workspace for understanding, reviewing, fixing, and improving code.

**Demo:** `https://devmate-ai-frontend.onrender.com`

DevMate AI is a full-stack web application that brings common development workflows into one focused workspace. Developers can submit code, select a programming language and use AI-assisted tools to produce practical results, including explanations, bug fixes, optimizations, conversions, documentation, tests, and code reviews.

## Features

- Code review with structured feedback
- Code explanation for unfamiliar files and functions
- Bug fixing with an updated code result
- Code optimization suggestions
- Source-code conversion between languages
- Documentation and test generation
- AI developer chat
- File upload, diff view, theme support, and local history
- Backend health check and configurable AI model selection

## Architecture

```text
DevMate AI
├── frontend/   React + Vite client application
└── backend/    Node.js + Express REST API
```

The frontend communicates with the backend through REST endpoints. The backend integrates with Google's Generative AI API and keeps API credentials on the server.

## Tech Stack

**Frontend:** React 19, Vite, React Router, Monaco Editor, Axios, Lucide React, React Markdown

**Backend:** Node.js, Express 5, Google Generative AI SDK, Helmet, CORS, Morgan

**Testing:** Node.js built-in test runner

## Requirements

- Node.js 18 or later
- npm
- A Google Gemini API key

## Local Setup

Clone the repository and install dependencies for both applications:

```bash
git clone <your-repository-url>
cd DevMate-AI

cd backend
npm install

cd ../frontend
npm install
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the backend and frontend in separate terminals:

```bash
# Terminal 1
cd backend
npm run dev
```

```bash
# Terminal 2
cd frontend
npm run dev
```

The Vite development server is usually available at `http://localhost:5173`.

## Available Scripts

### Backend

| Command | Description |
| --- | --- |
| `npm start` | Start the API server |
| `npm run dev` | Start the API server with Node watch mode |
| `npm test` | Run backend tests |

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

## API

The backend exposes feature-specific endpoints under `/api`:

- `POST /api/review`
- `POST /api/explain`
- `POST /api/fix-bugs`
- `POST /api/optimize`
- `POST /api/convert`
- `POST /api/docs`
- `POST /api/generate-tests`
- `POST /api/chat`
- `GET /api/health`

Example review request:

```bash
curl -X POST http://localhost:5000/api/review \
  -H "Content-Type: application/json" \
  -d '{"code":"function greet(name) { return \"Hello \" + name; }","language":"javascript"}'
```

## Deployment on Render

Deploy the frontend and backend as separate Render services. Never commit real API keys or production URLs to `.env` files.

### Backend Web Service

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Required environment variable: `GEMINI_API_KEY`
- Optional variables: `GEMINI_MODEL`, `PORT`, `FRONTEND_URL`

After deployment, verify:

```text
https://<backend-domain>/api/health
```

### Frontend Static Site

- Root Directory: `frontend`
- Build Command: `npm run build`
- Publish Directory: `dist`
- Environment variable: `VITE_API_URL=https://<backend-domain>`

After the frontend is deployed, set the exact frontend URL as the backend's `FRONTEND_URL` value and redeploy the backend. `VITE_API_URL` is embedded during the Vite build, so update it and rebuild whenever the API URL changes.

## Security Notes

- Keep `GEMINI_API_KEY` on the backend only.
- Use environment variables for local and production configuration.
- Confirm `.env` files are ignored before pushing to GitHub.
- Restrict CORS with `FRONTEND_URL` in production.

## License

No license has been specified for this project yet.
