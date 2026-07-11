# Backend Review API

## Endpoint

- POST /api/review

## Request body

```json
{
  "code": "function greet(name) { return 'Hello ' + name; }",
  "language": "javascript"
}
```

## cURL example

```bash
curl -X POST http://localhost:5000/api/review \
  -H "Content-Type: application/json" \
  -d '{"code":"function greet(name) { return \"Hello \" + name; }","language":"javascript"}'
```

## Thunder Client example

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
