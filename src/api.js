import axios from 'axios';
import API_BASE_URL from "./config";
import {useNavigate} from 'react-router-dom';
const api = axios.create({
  baseURL: `${API_BASE_URL}`,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // ya jahan store karte ho
    if (token) {
      config.headers['Authorization'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
        // Token expired or invalid
        const navigate = useNavigate();
        localStorage.clear();
        navigate('/login'); 
    }
    return Promise.reject(error);
  }
);

export default api;
