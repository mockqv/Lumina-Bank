import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // The base URL of our backend API
  withCredentials: true, // This is crucial for sending cookies
});

export default api;
