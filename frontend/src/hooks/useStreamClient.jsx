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
      toast.loading('🔍 initCall started', { id: 'debug' });
      
      if (!session?.callId) {
        toast.error('❌ No callId: ' + JSON.stringify(session?.callId), { id: 'debug' });
        setIsInitializingCall(false);
        return;
      }
      
      if (!isHost && !isParticipant) {
        toast.error(`❌ Not host/participant: host=${isHost} part=${isParticipant}`, { id: 'debug' });
        setIsInitializingCall(false);
        return;
      }
      
      if (session.status === "completed") {
        toast.error('❌ Session completed', { id: 'debug' });
        setIsInitializingCall(false);
        return;
      }

      try {
        toast.loading('🎬 Getting token...', { id: 'debug' });
        const tokenData = await sessionApi.getStreamToken();
        
        toast.loading('✅ Got token for: ' + tokenData.userId, { id: 'debug' });
        
        toast.loading('🎬 Initializing client...', { id: 'debug' });
        const client = await initializeStreamClient(
          {
            id: tokenData.userId,
            name: tokenData.userName,
            image: tokenData.userImage,
          },
          tokenData.token
        );
        setStreamClient(client);
        
        toast.loading('🎬 Creating call...', { id: 'debug' });
        videoCall = client.call("default", session.callId);
        
        toast.loading('🎬 Joining call...', { id: 'debug' });
        await videoCall.join({ create: true });
        
        toast.success('🎉 Joined successfully!', { id: 'debug' });
        setCall(videoCall);

        // Chat setup
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
        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel("messaging", session.callId);
        await chatChannel.watch();
        setChannel(chatChannel);
        
      } catch (error) {
        toast.error('❌ Error: ' + error.message, { id: 'debug', duration: 5000 });
        console.error('Full error:', error);
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) {
      initCall();
    } else {
      toast('⏸️ Waiting... session=' + !!session + ' loading=' + loadingSession, { id: 'debug' });
      setIsInitializingCall(false);
    }

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