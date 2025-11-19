
import {chatClient} from "../lib/stream.js"

export async function getStreamToken(req,res){

    try {
        // use clerkid for stream it should match with the id wich we have in the stream
        const token = chatClient.createToken(req.user.clerkId)

        res.status(200).json({
            token,
            userId: req.user.clerkId,
            userName: req.user.name,
            userImage: req.user.image

        })
        
    } catch (error) {
        console.error("Error in getstream controller",error.message)
        res.status(501).json({ message: "Internal server error"})
        
    }

}