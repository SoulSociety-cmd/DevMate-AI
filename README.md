# DevMate AI

DevMate AI is a monorepo starter for building an AI-assisted developer workspace with a React frontend and an Express backend.

## Structure

- frontend/ - Vite + React application
  - src/components
  - src/pages
  - src/services
  - src/hooks
  - src/styles
- backend/ - Node.js + Express API
  - controllers/
  - routes/
  - services/
  - middlewares/
  - config/
  - utils/

## Backend Review API

### Endpoint

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

### Thunder Client example

- Method: POST
- URL: http://localhost:5000/api/review
- Body: JSON
- Payload:

```json
{
  "code": "function greet(name) { return 'Hello ' + name; }",
  "language": "javascript"
}
```
