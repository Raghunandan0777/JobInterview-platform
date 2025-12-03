import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      if (!session?.callId) return;
      if (!isHost && !isParticipant) return;
      if (session.status === "completed") return;

      try {
        console.log('🎬 Step 1: Getting token...');
        const { token, userId, userName, userImage } = await sessionApi.getStreamToken();
        console.log('✅ Token received for user:', userId);

        console.log('🎬 Step 2: Initializing video client...');
        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        console.log('✅ Video client initialized');
        setStreamClient(client);

        console.log('🎬 Step 3: Creating call object...');
        videoCall = client.call("default", session.callId);
        console.log('✅ Call object created for:', session.callId);

        console.log('🎬 Step 4: Joining call...');
        await videoCall.join({ create: true });
        console.log('🎉 Successfully joined call!');
        setCall(videoCall);

        console.log('🎬 Step 5: Initializing chat client...');
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        console.log('✅ Chat client connected');
        setChatClient(chatClientInstance);

        console.log('🎬 Step 6: Creating chat channel...');
        const chatChannel = chatClientInstance.channel("messaging", session.callId);
        await chatChannel.watch();
        console.log('✅ Chat channel ready');
        setChannel(chatChannel);
        
        console.log('🎉 All initialization complete!');
      } catch (error) {
        console.error('❌ Failed at step:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Full error:', error);
        toast.error("Failed to join video call");
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) initCall();

    // cleanup
    return () => {
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [session, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;