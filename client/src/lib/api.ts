import { queryClient } from './queryClient';
import { useAuthStore } from '@/hooks/useAuthStore';
import axios from 'axios';

// @ts-expect-error: import.meta.env è disponibile solo in ambiente Vite
const API_URL = typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_API_URL : undefined;
console.log("API_URL:", API_URL);

fetch(API_URL + "/health")
  .then(res => res.json())
  .then(data => console.log("API health:", data))
  .catch(err => console.error("API health error:", err));

export const api = axios.create({
  baseURL: API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
); 