import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import apiRouter from './src/api/v1/routes/index.js';
import { apiLimiter } from './src/api/v1/middleware/rateLimitMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(morgan('combined'));

// Apply general rate limiting to all routes
app.use(apiLimiter);

// The webhook route needs a raw body, so we apply it before express.json().
// We have already configured the raw body parser in the webhooks.routes.js file itself,
// so we can mount the entire router here.
// Note: For this to work, the webhook router must be separate from the main api router if the main router is used after express.json()
// To keep it simple and clean, we will mount all routes here.

// All API routes are handled by the apiRouter
// The webhook route within it has its own body parser, which will be used for that specific route.
// For all other routes, we need the express.json() middleware.
// To solve this, we will apply the webhook route BEFORE the global json parser.

// We need to import the webhook router separately to achieve this.
import webhooksRouter from './src/api/v1/routes/webhooks.routes.js';
app.use('/api/v1/webhooks', webhooksRouter);

// Now, we can use the JSON parser for all other routes
app.use(express.json());

// And now we mount the rest of the API routes
app.use('/api/v1', apiRouter);


// Basic route for checking if the server is running
app.get('/', (req, res) => {
  res.json({ 
    message: 'SCSAA Backend is running',
    version: '1.0.0',
    status: 'running'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
