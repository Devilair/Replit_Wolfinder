import { queryClient } from './queryClient';
import { useAuthStore } from '@/hooks/useAuthStore'; // Assumendo che lo store sia esportato

<<<<<<< HEAD
const api = {
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || '/api',
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
=======
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
>>>>>>> c674766a33746b3a9795c1c81da0821d46cadf00

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