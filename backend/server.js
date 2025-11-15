import { ENV } from './lib/env.js';
import express from 'express';
import { connectDB } from './lib/db.js';
import cors from "cors"
import { functions, inngest,  } from './lib/inngest.js';
import{ serve }from "inngest/express"


const app = express()


// middleware

app.use(express.json())
app.use(cors({origin:ENV.CLIENT_URL, credentials:true}));

app.use("/api/inngest", serve({client: inngest,functions}))

app.get("/", (req,res) => {
    res.send("server is working")
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