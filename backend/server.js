import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoute from "./routes/sessionRoute.js";
import { inngest, functions } from "./lib/inngest.js";
import { serve } from "inngest/express";
import { ENV } from "./lib/env.js";


const app = express(); 

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://job-interview-platform-nu.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(clerkMiddleware());

// API routes
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoute);

// Serve frontend build
const distPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(distPath));


const start = async () => {
  await connectDB();
  app.listen(ENV.PORT, () =>
    console.log("Server running on port", ENV.PORT)
  );
};

start();
