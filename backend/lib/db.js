import mongoose from "mongoose"
import {ENV} from "./env.js"


export const connectDB = async() =>{
    try {
        const conn = await mongoose.connect(ENV.DB_URL)
        console.log("Connected to MOngoDB", conn.connection.host);  
    } catch (error) {
        console.log("error in connecting to mongodb",error);
        process.exit(1);
        
        
    }
}