import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attache automatiquement le token admin s'il existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("electroshop_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
