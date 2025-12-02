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

connectDB();


const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());


const allowedOrigins = [
  "http://localhost:3000",                      // for local dev (optional)
  "https://job-interview-platform-steel.vercel.app", //  frontend origin on Vercel
  
];

const corsOptions = {
  origin: (incomingOrigin, callback) => {
    if (!incomingOrigin || allowedOrigins.includes(incomingOrigin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
};

app.use(cors(corsOptions));



app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
