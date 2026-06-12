// src/axiosConfig.js
import axios from 'axios';

// Create an axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // Use VITE_API_URL from environment variables
  timeout: 100000, // Set timeout for requests
  headers: {
    'Content-Type': 'application/json',
  },
});


// You can add interceptors here for request/response logging or error handling
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add any logic for the request before it's sent, e.g., adding tokens
    // If you have a token, you can set it like this:
    // config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    return config;
  },
  (error) => {
    // Handle request error here
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // You can add any logic for handling the response, e.g., logging
    return response;
  },
  (error) => {
    // Handle response errors globally
    console.error('Error in response:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
