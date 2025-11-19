
import {chatClient, streamClient} from "../lib/stream.js"

 

export async function createSession(req, res) {
    try {
        const {problem, defaculty} =  req.body;
        const userId = req.user._id;
        const clerkId = req.user.clerkId

        if(!defaculty || !problem){
            return res.status(400).json({message:"problem and defaculty are required"})
        }

        const callId = `session_${Date.now()}_${math.random().toString(36).substring(7)}`;

        // create session in db

        const session = await Session.create({problem, dificulty, host: userId, clerkId});
        
        // create stream video call

        await streamClient.video.call("default", callId).getOrCreate({
            data:{
                created_by_id:clerkId,
                custom:{problem,dificulty,sessionId: session._id.toString()}
            }
        });

        // chat messaging
        const channel = chatClient.channel( "messaging", callId,{
            name:`${problem} Session`,
            created_by_id: clerkId,
            members:[clerkId]
        })

        await channel.create();
        res.status(201).json({session})
    } catch (error) {
        console.log("Error in createSession:", error)
        res.status(500).json("Internal server error")
        
    }
}

export async function getActiveSessions(req, res) {

    try {
        const session = await Session.find({status: "active"})
        .populate("host", "name profileImage email  clerkId")
        .sort({createdAt: -1}).limit(20)

        res.status(200).json({session});
    } catch (error) {
        console.log("Error in ActiveSession controller");
        res.status(500).json({message: "intrenal server error"})
        
        
    }
}

export async function getMyRecentSessions(req, res) {

    try {
        const userId = req.user._id

        // get sessions where user is eithe host or participant
        
        const sessions = await Session.find({
            status: "completed",
            $or: [{host:userId}, {participant: userId}]
        }) 
        .sort({createdAt: -1})
        .limit(20);

        res.status(200).json({sessions})


    } catch (error) {
        console.log("Error in getRecentSession controller:",error.message);
        res.status(500).json({message:"internal server error"})
        
        
    }
    
}

export async function getSessionById(req, res) {

    try {
        const {id} = req.params;

        const session = await Session.create(id)
        .populate("host", "name email profileImage clerkId")
        .populate("participant", "name email profileImage clerkId")

        if(!session){
            res.status(404).json({message: "Session not found"})
        }

        res.status(200).json({session})
    } catch (error) {
     console.log("Error in getSessionById controller:",error.message);
     res.status(500).json({message:"internal server error"})
           
    }
}

export async function joinSession(req, res) {

    try {
        const {id} = req.params
        const userId = req.user._id
        const clerkId = req.user.clerkId

        const session = await Session.create(id)

        if(!session) return res.status(404).json({message: "Session not found"});

        if(session.status !== "active"){
            return res.status(400).json({message: "Cannot join  the sesion is commpleted"})
        }

        if(session.host.toString() === userId.toString()){
            return res.status(400).json({message:"Host can not join their own session as participant"})
        }


        // check if session is already full -has participant

        if(session.participant) return res.status(409).json({message:"Session is full"});

        session.participant = userId;
        await session.save()

        const channel = chatClient.create("messaging", session.callId)
        await channel.addMembers([clerkId])

        res.status(200).json({session})


        
    } catch (error) {
    console.log("Error in joinSession controller:",error.message);
    res.status(500).json({message:"internal server error"})
        
    }
}

export async function endSession(req, res) {

    try {
        
     const {id} = req.params
     const userId = req.user._id

     const session = await Session.findById(id)

     if(!session) return res.status(404).json({message:"session not found"})

        // check  if the user is the  host 
        
        if(session.host.toString() !== userId.toString()){
            return res.status(403).json({message: "Only thr host can End the session"})
        }

        // chek if the session is already completed 

        if(session == "completed") return res.status(400).json({message:"Session is already completed"});

        session.status == "completed"
        await session.save();

        // delete stream video call

        const call = streamClient.video.call("default", session.callId);
        await call.delete({hard:true})

        // delete stream chat 

        const channel = chatClient.channel("default", session.callId);
        await channel.delete();

        res.status(200).json({message: "Session is ended successfully!"})

    } catch (error) {
    console.log("Error in EndSession controller:",error.message);
    res.status(500).json({message:"internal server error"})
        
    }
}