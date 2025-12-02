import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

const app = express();
const __dirname = path.resolve();

// middleware
app.use(express.json());
app.use(
  cors({
    origin: [ENV.CLIENT_URL, "https://job-interview-platform-nu.vercel.app"],
    credentials: true,
  })
);
app.use(clerkMiddleware());

// API routes
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "API is up and running" });
});

// Serve frontend in production
if (ENV.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));

  // Catch-all route for SPA
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start server (Render requires a listening port)
const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT || 3000, () => {
      console.log("Server running on port", ENV.PORT || 3000);
    });
  } catch (err) {
    console.error("Failed to connect to DB", err);
  }
};

startServer();
