import axios from "axios";

const TOKEN_KEY = "electroshop_admin_token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attache automatiquement le token admin s'il existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si l'API répond 401 (token invalide/expiré) sur une page admin :
// on purge le token et on renvoie au login.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const path = window.location.pathname;

    if (
      status === 401 &&
      path.startsWith("/admin") &&
      path !== "/admin/login"
    ) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.replace("/admin/login");
    }

    return Promise.reject(error);
  }
);
