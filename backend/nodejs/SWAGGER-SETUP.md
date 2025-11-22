# Swagger/OpenAPI Setup Guide

This guide explains how to set up Swagger UI to visualize and test the Bible App API.

## Option 1: Use swagger-ui-express (Recommended)

### Installation

```bash
npm install swagger-ui-express
```

### Integration with Express

Add this to your `server.js` file after initializing the app:

```javascript
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');

const app = express();

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true
  },
  customCss: '.swagger-ui .topbar { background-color: #2c3e50; }',
  customSiteTitle: 'Bible App API Documentation'
}));

// Rest of your server code...
```

### Access Swagger UI

After starting the server, visit:
```
http://localhost:3000/api-docs
```

You'll see an interactive API documentation interface where you can:
- Explore all endpoints
- View request/response schemas
- Test endpoints directly from the UI
- See rate limit headers

---

## Option 2: Swagger Editor (Online)

### Using Swagger Editor

1. Go to https://editor.swagger.io/
2. Go to **File → Import URL**
3. Enter: `http://localhost:3000/openapi.json`
4. The API documentation will load

### Local Swagger Editor

```bash
npm install -g swagger-editor

# Start editor
swagger-editor

# Then import your openapi.json
```

---

## Option 3: ReDoc (Alternative Documentation)

ReDoc provides a clean, three-panel view of your API documentation.

### Installation

```bash
npm install redoc redoc-cli
```

### Integration with Express

```javascript
const redoc = require('redoc');

app.use('/api-docs', redoc.serve, redoc.setup('./openapi.json', {
  title: 'Bible App API Documentation',
  tagGroups: [
    { tags: ['Health'], name: 'Health Check' },
    { tags: ['Authentication'], name: 'Authentication' },
    { tags: ['Lessons'], name: 'Lessons' },
    { tags: ['Progress'], name: 'Progress Tracking' },
    { tags: ['Favorites'], name: 'Favorites' },
    { tags: ['Preferences'], name: 'Preferences' }
  ]
}));
```

---

## Complete Server Setup Example

Here's a complete example of integrating Swagger UI:

```javascript
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true,
    withCredentials: true
  },
  customCss: '.swagger-ui .topbar { background-color: #2c3e50; }'
}));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/preferences', preferencesRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});
```

---

## Testing Authentication in Swagger UI

When testing authenticated endpoints in Swagger UI:

1. **Register or Login first** using `/api/auth/register` or `/api/auth/login`
2. **Copy the returned token** from the response
3. **Click the "Authorize" button** (top right)
4. **Paste the token** in the Bearer token field
5. **Test protected endpoints** - the token will be automatically included

### Bearer Token Format

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Custom Styling

Customize the Swagger UI appearance:

```javascript
const swaggerOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true,
    filter: true,
    showRequestHeaders: true,
    docExpansion: 'list' // 'list', 'full', 'none'
  },
  customCss: `
    .swagger-ui .topbar {
      background-color: #2c3e50;
    }
    .swagger-ui .btn {
      background-color: #3498db;
      color: white;
    }
    .swagger-ui .btn-box .btn {
      background-color: #27ae60;
    }
    .swagger-ui .model {
      background-color: #ecf0f1;
    }
  `,
  customSiteTitle: 'Bible App API',
  customfavIcon: 'https://example.com/favicon.ico'
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi, swaggerOptions));
```

---

## Generating Static HTML

Generate a static HTML file for documentation:

```bash
npm install -g swagger-editor-convert

swagger-editor-convert -i openapi.json -o api-docs.html
```

Then serve it as a static file:

```javascript
app.use(express.static('public'));
// Place api-docs.html in ./public directory
```

---

## CI/CD Integration

### Validate OpenAPI Spec

```bash
npm install -D openapi-types swagger-parser

# In your CI/CD pipeline:
swagger-cli validate openapi.json
```

### Generate Client SDKs (Optional)

Generate client code from the OpenAPI spec:

```bash
npm install -g openapi-generator-cli

# Generate JavaScript client
openapi-generator-cli generate -i openapi.json -g javascript -o ./clients/js

# Generate Swift client (for iOS)
openapi-generator-cli generate -i openapi.json -g swift5 -o ./clients/swift
```

---

## Docker

### Dockerfile Example

If you want to containerize with Swagger UI:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server.js"]
```

### docker-compose.yml Example

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
    volumes:
      - ./:/app

  # Optional: Swagger Editor
  swagger-editor:
    image: swaggerapi/swagger-editor:latest
    ports:
      - "8081:8080"
    environment:
      URL: http://localhost:3000/openapi.json
```

Then run:
```bash
docker-compose up
```

---

## Package.json Scripts

Add these useful scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "test": "jest",
    "validate:api": "swagger-cli validate openapi.json",
    "docs:generate": "swagger-editor-convert -i openapi.json -o api-docs.html"
  }
}
```

---

## Best Practices

### 1. Keep OpenAPI Updated
- Update `openapi.json` whenever you add/modify endpoints
- Document request/response schemas accurately
- Include examples for common operations

### 2. Use Consistent Naming
- Use consistent naming conventions for paths
- Document query parameters clearly
- Specify required vs optional fields

### 3. Include Examples
```json
{
  "schema": {
    "type": "object",
    "properties": {
      "email": {
        "type": "string",
        "example": "user@example.com"
      }
    }
  }
}
```

### 4. Document Error Responses
Always document what errors an endpoint can return:
```json
{
  "responses": {
    "400": { "description": "Validation error" },
    "401": { "description": "Unauthorized" },
    "429": { "description": "Rate limit exceeded" }
  }
}
```

### 5. Security Documentation
Clearly document authentication requirements:
```json
{
  "security": [
    { "bearerAuth": [] }
  ]
}
```

---

## Troubleshooting

### Swagger UI not loading

**Problem:** Blank page or 404 at `/api-docs`

**Solution:**
- Ensure `swagger-ui-express` is installed
- Check that `openapi.json` is in the correct path
- Verify the path in `require()` matches your file structure

### CORS errors

**Problem:** Can't test endpoints from Swagger UI

**Solution:** Ensure CORS is configured:
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
```

### Invalid OpenAPI spec

**Problem:** Swagger UI shows errors

**Solution:** Validate your OpenAPI JSON:
```bash
npm install -g swagger-cli
swagger-cli validate openapi.json
```

---

## API Documentation Checklist

- [ ] OpenAPI specification created (`openapi.json`)
- [ ] Swagger UI integrated into server
- [ ] All endpoints documented with descriptions
- [ ] Request/response schemas defined
- [ ] Examples provided for common operations
- [ ] Error responses documented
- [ ] Authentication requirements clearly marked
- [ ] Rate limiting information included
- [ ] Rate limit headers documented
- [ ] Tested in Swagger UI
- [ ] Documentation accessible at `/api-docs`

---

## See Also

- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [swagger-ui-express GitHub](https://github.com/scottie1984/swagger-ui-express)
- [ReDoc Documentation](https://redoc.ly/)
