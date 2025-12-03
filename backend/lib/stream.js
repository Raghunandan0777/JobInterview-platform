import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("STREAM_API_KEY or STREAM_API_SECRET missing");
}

//  Correct Stream Video client
export const streamClient = new StreamClient({
  apiKey,
  secret: apiSecret,
});

//  Correct Stream Chat client
export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

// Utility functions
export const upsertStreamUser = async (userData) => {
  try {
    await chatClient.upsertUser(userData);
    console.log("Successfully upserted Stream user:", userData.id);
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId, { hard: true });
    console.log("Deleted Stream user:", userId);
  } catch (error) {
    console.error("Error deleting Stream user:", error);
  }
};
