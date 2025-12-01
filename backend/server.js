import { ENV } from './lib/env.js';
import express from 'express';
import { connectDB } from './lib/db.js';
import cors from "cors"
import { functions, inngest,  } from './lib/inngest.js';
import{ serve }from "inngest/express"
import { clerkMiddleware } from '@clerk/express'
import { protectRoute } from './middleware/protectRoute.js';
import chatRoutes from "./routes/chatRoutes.js"
import sessionRoute from "./routes/sessionRoute.js"

import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const app = express()





// middleware

app.use(express.json())

const allowedOrigins = [ENV.CLIENT_URL];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(clerkMiddleware())


app.use("/api/inngest", serve({client: inngest,functions}))
app.use("/api/chat", chatRoutes)
app.use("/api/sessions", sessionRoute)

const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));

// Serve index.html for all non-API GET routes (SPA fallback)
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});



app.get("/", (req,res) => {
    res.send("server is working")
})

app.get("/video-calls", protectRoute, (req,res) => {
    res.status(200).json({msg: "this is protect route"})
})




const startserver = async() => {
    try {
   await connectDB();
    app.listen(ENV.PORT, () => {
    console.log("server is running on", ENV.PORT);   
    
})       
    } catch (error) {
        console.log("error in connecting db", error);
        
        
    }
}

startserver()