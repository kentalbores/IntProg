import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://sysarch.glitch.me', // Make sure this matches your API server
  withCredentials: true, // This is critical for sending cookies with cross-origin requests
  headers: {
    'Content-Type': 'application/json',
  }
});

instance.interceptors.response.use(
  response => response,
  error => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.warn('Authentication required. You may need to log in.');
      // You could redirect to login page here or handle it in the component
    }
    return Promise.reject(error);
  }
);

export default instance;