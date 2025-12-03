import { StreamChat } from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("STREAM_API_KEY or STREAM_API_SECRET missing");
  throw new Error("Stream credentials not configured");
}

// Stream Video client - takes (apiKey, secret) as parameters
export const streamClient = new StreamClient(apiKey, apiSecret);

// Stream Chat client
export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

// Utility functions
export const upsertStreamUser = async (userData) => {
  try {
    await chatClient.upsertUser(userData);
    console.log("Successfully upserted Stream user:", userData.id);
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error;
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId, { hard: true });
    console.log("Deleted Stream user:", userId);
  } catch (error) {
    console.error("Error deleting Stream user:", error);
    throw error;
  }
};