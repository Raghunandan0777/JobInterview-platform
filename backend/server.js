import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';
import { serve as inngestServe } from 'inngest/express';
import { functions, inngest } from './lib/inngest.js';
import { clerkMiddleware } from '@clerk/express';
import chatRoutes from './routes/chatRoutes.js';
import sessionRoute from './routes/sessionRoute.js';
import { protectRoute } from './middleware/protectRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());

const allowedOrigins = [ENV.CLIENT_URL];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
}));
app.options('*', cors());

app.use(clerkMiddleware());

// API routes
app.use('/api/inngest', inngestServe({ client: inngest, functions }));
app.use('/api/chat', chatRoutes);
app.use('/api/sessions', sessionRoute);

// Now serve the static frontend (after API routes)
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));

// Fallback: serve index.html for any route not starting with /api
app.get('*', (req, res) => {
  // If request is for API — do nothing / 404
  if (req.path.startsWith('/api')) {
    return res.status(404).send('API route not found');
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Other server-only endpoints (if any)
app.get('/', (req, res) => {
  res.send('server is working');
});

// Protected sample route
app.get('/video-calls', protectRoute, (req, res) => {
  res.status(200).json({ msg: "this is protected route" });
});

// Start server
const startserver = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log("server is running on", ENV.PORT);
    });
  } catch (error) {
    console.error("error in connecting db", error);
  }
};

startserver();
