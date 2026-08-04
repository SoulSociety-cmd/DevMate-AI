# DevMate AI

DevMate AI is an AI-assisted developer workspace with a React frontend and an Express backend.

## Project structure

- frontend/ - Vite + React application
- backend/ - Node.js + Express API

## Local development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Render deployment guide

### 1. Push code to GitHub

- Commit and push the repository to GitHub.
- Make sure the project contains the Render-ready config in both frontend and backend.

### 2. Create the backend Web Service on Render

1. In Render, choose New + Web Service.
2. Connect your GitHub repository.
3. Set the following values:
   - Runtime: Node
   - Root Directory: backend
   - Build Command: npm install
   - Start Command: npm start
4. Add environment variables:
   - GEMINI_API_KEY=your_gemini_key
   - OPENAI_API_KEY=your_openai_key (optional)
   - PORT=10000
   - GEMINI_MODEL=gemini-2.0-flash
   - OPENAI_MODEL=gpt-4o-mini
   - FRONTEND_URL=https://your-frontend-url.onrender.com
5. Deploy the service.
6. Copy the backend URL, for example: https://devmate-ai-backend.onrender.com

### 3. Create the frontend Static Site on Render

1. In Render, choose New + Static Site.
2. Connect the same GitHub repository.
3. Set the following values:
   - Root Directory: frontend
   - Build Command: npm run build
   - Publish Directory: dist
4. Add environment variables:
   - VITE_API_URL=https://your-backend-url.onrender.com
5. Deploy the site.
6. Render will provide a frontend URL such as https://devmate-ai-frontend.onrender.com

### 4. Test the full flow on the real domain

1. Open the frontend URL in the browser.
2. Verify the app loads correctly.
3. Try the following flows:
   - Review code
   - Fix bugs
   - Convert code
   - Upload a supported file
   - Check diff view and history
4. Confirm the frontend can reach the backend via the VITE_API_URL value.
5. If needed, update FRONTEND_URL in the backend environment after the frontend URL is known.

## Backend API example

### Review endpoint

- POST /api/review

### Request body

```json
{
  "code": "function greet(name) { return 'Hello ' + name; }",
  "language": "javascript"
}
```

### cURL example

```bash
curl -X POST http://localhost:5000/api/review \
  -H "Content-Type: application/json" \
  -d '{"code":"function greet(name) { return \"Hello \" + name; }","language":"javascript"}'
```
