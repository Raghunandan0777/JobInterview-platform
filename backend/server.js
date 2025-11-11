import { ENV } from './lib/env.js';
import express from 'express';

const app = express()


app.get("/", (req,res) => {
    res.send("server is working")
})


app.listen(ENV.PORT, () => {
    console.log("server is running on", ENV.PORT);
    
})