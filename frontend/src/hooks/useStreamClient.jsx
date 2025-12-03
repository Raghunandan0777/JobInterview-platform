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
      console.log('🔍 initCall triggered');
      console.log('📋 Session:', session);
      console.log('📋 callId:', session?.callId);
      console.log('📋 isHost:', isHost);
      console.log('📋 isParticipant:', isParticipant);
      console.log('📋 status:', session?.status);
      console.log('📋 loadingSession:', loadingSession);
      
      if (!session?.callId) {
        console.log('❌ Blocked: No callId');
        return;
      }
      if (!isHost && !isParticipant) {
        console.log('❌ Blocked: Not host or participant');
        return;
      }
      if (session.status === "completed") {
        console.log('❌ Blocked: Session completed');
        return;
      }

      console.log('✅ All checks passed, starting initialization...');
      
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
        console.error('❌ Failed during initialization');
        console.error('❌ Error message:', error.message);
        console.error('❌ Full error:', error);
        console.error('❌ Error stack:', error.stack);
        toast.error("Failed to join video call");
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) {
      console.log('🚀 Calling initCall...');
      initCall();
    } else {
      console.log('⏸️ Not calling initCall - session:', !!session, 'loadingSession:', loadingSession);
      setIsInitializingCall(false);
    }

    // cleanup
    return () => {
      (async () => {
        try {
          console.log('🧹 Cleanup started...');
          if (videoCall) {
            await videoCall.leave();
            console.log('✅ Left video call');
          }
          if (chatClientInstance) {
            await chatClientInstance.disconnectUser();
            console.log('✅ Disconnected chat client');
          }
          await disconnectStreamClient();
          console.log('✅ Disconnected stream client');
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