import { streamClient, chatClient } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    // Use streamClient for video tokens (works for both video AND chat)
    const token = streamClient.createToken(req.user.clerkId);

    res.status(200).json({
      token,
      userId: req.user.clerkId,
      userName: req.user.name,
      userImage: req.user.profileImage,
    });
  } catch (error) {
    console.error("Error in getstream controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}