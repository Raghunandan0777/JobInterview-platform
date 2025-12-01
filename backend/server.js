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



const app = express()


// middleware

app.use(express.json())
const allowedOrigins = [
  ENV.CLIENT_URL,
  "https://jobinterview-platform.onrender.com",
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(clerkMiddleware())


app.use("/api/inngest", serve({client: inngest,functions}))
app.use("/api/chat", chatRoutes)
app.use("/api/sessions", sessionRoute)

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