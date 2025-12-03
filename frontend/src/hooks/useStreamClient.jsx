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

  // Log whenever the hook is called
  console.log('🔄 useStreamClient hook rendered');
  console.log('📦 Received props:', {
    session,
    loadingSession,
    isHost,
    isParticipant
  });

  useEffect(() => {
    console.log('🔄 useEffect triggered');
    console.log('📦 Effect dependencies:', {
      hasSession: !!session,
      sessionCallId: session?.callId,
      sessionStatus: session?.status,
      loadingSession,
      isHost,
      isParticipant
    });

    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      console.log('🔍 initCall function started');
      
      if (!session?.callId) {
        console.log('❌ Blocked: No callId in session');
        console.log('Session object:', session);
        setIsInitializingCall(false);
        return;
      }
      
      if (!isHost && !isParticipant) {
        console.log('❌ Blocked: User is neither host nor participant');
        console.log('isHost:', isHost, 'isParticipant:', isParticipant);
        setIsInitializingCall(false);
        return;
      }
      
      if (session.status === "completed") {
        console.log('❌ Blocked: Session is completed');
        setIsInitializingCall(false);
        return;
      }

      console.log('✅ All checks passed! Starting initialization...');
      
      try {
        console.log('🎬 Step 1: Getting token from backend...');
        const tokenData = await sessionApi.getStreamToken();
        console.log('✅ Token received:', {
          userId: tokenData.userId,
          hasToken: !!tokenData.token
        });

        console.log('🎬 Step 2: Initializing Stream video client...');
        const client = await initializeStreamClient(
          {
            id: tokenData.userId,
            name: tokenData.userName,
            image: tokenData.userImage,
          },
          tokenData.token
        );
        console.log('✅ Stream video client initialized');
        setStreamClient(client);

        console.log('🎬 Step 3: Creating call object for callId:', session.callId);
        videoCall = client.call("default", session.callId);
        console.log('✅ Call object created');

        console.log('🎬 Step 4: Joining the call...');
        const joinResult = await videoCall.join({ create: true });
        console.log('✅ Successfully joined call!', joinResult);
        setCall(videoCall);

        console.log('🎬 Step 5: Setting up chat client...');
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          {
            id: tokenData.userId,
            name: tokenData.userName,
            image: tokenData.userImage,
          },
          tokenData.token
        );
        console.log('✅ Chat client connected');
        setChatClient(chatClientInstance);

        console.log('🎬 Step 6: Setting up chat channel...');
        const chatChannel = chatClientInstance.channel("messaging", session.callId);
        await chatChannel.watch();
        console.log('✅ Chat channel ready');
        setChannel(chatChannel);
        
        console.log('🎉 All initialization complete!');
      } catch (error) {
        console.error('❌ Error during initialization:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Full error object:', error);
        if (error.response) {
          console.error('Error response:', error.response);
        }
        toast.error("Failed to join video call: " + error.message);
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) {
      console.log('🚀 Conditions met, calling initCall()');
      initCall();
    } else {
      console.log('⏸️ NOT calling initCall. Reason:', {
        hasSession: !!session,
        loadingSession
      });
      setIsInitializingCall(false);
    }

    // cleanup
    return () => {
      (async () => {
        try {
          console.log('🧹 Cleanup started');
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
          console.log('✅ Cleanup complete');
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