const express = require('express');
const promClient = require('prom-client');

const app = express();
const port = 3000;

// Create a default Registry and collect default metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Define a custom metric
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code'],
  registers: [register]
});

// Middleware to increment the custom metric
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route ? req.route.path : '/',
      code: res.statusCode
    });
  });
  next();
});

// Route to serve metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
