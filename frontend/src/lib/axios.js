
import axios from "axios"

const axiosInstance = axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    withCredentials: true // by adding this filed the browser
    //  will send cookies to server automaticaly, on every single req 
});

export default axiosInstance
