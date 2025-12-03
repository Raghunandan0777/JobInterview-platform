import axiosInstance from "../lib/axios";

export const sessionApi = {
  createSession: async (data) => {
    const response = await axiosInstance.post("/sessions", data);
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await axiosInstance.get("/sessions/active");
    return response.data;
  },
  
  getMyRecentSessions: async () => {
    const response = await axiosInstance.get("/sessions/my-recent");
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await axiosInstance.get(`/sessions/${id}`);
    return response.data;
  },

  joinSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/join`);
    return response.data;
  },
  
  endSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/end`);
    return response.data;
  },
  
  getStreamToken: async () => {
    console.log('🔑 getStreamToken called');
    console.log('📍 Base URL:', import.meta.env.VITE_API_URL);
    console.log('📍 Full URL:', import.meta.env.VITE_API_URL + '/chat/token');
    
    try {
      const response = await axiosInstance.get('/chat/token');
      console.log('✅ Token response received:', {
        hasToken: !!response.data.token,
        userId: response.data.userId,
        userName: response.data.userName
      });
      return response.data;
    } catch (error) {
      console.error('❌ getStreamToken ERROR');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response data:', error.response?.data);
      console.error('Request URL:', error.config?.url);
      console.error('Full error:', error);
      throw error;
    }
  },
};