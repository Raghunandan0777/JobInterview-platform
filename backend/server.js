import { ENV } from './lib/env.js';
import express from 'express';
import { connectDB } from './lib/db.js';
import cors from "cors";
import { functions, inngest } from './lib/inngest.js';
import { serve } from "inngest/express";
import { clerkMiddleware } from '@clerk/express';
import { protectRoute } from './middleware/protectRoute.js';
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoute from "./routes/sessionRoute.js";

import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// MIDDLEWARE
app.use(express.json());

app.use(cors({
  origin: ENV.CLIENT_URL,
  credentials: true
}));


// SPA FALLBACK 
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distPath, "index.html"));
});


app.use(clerkMiddleware());

// API ROUTES
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoute);

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.get("/video-calls", protectRoute, (req, res) => {
  res.status(200).json({ msg: "Protected route is working" });
});

// STATIC FRONTEND (Vite Build)
const distPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(distPath));


// START SERVER
const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log("Server running on port", ENV.PORT);
    });
  } catch (error) {
    console.log("Error connecting to DB:", error);
  }
};

startServer();
