// Configuração centralizada da API
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin.replace(/\/+$/, '')}/api`;
  }

  return 'http://localhost:3024';
};

export const API_URL = getApiUrl();

export default {
  API_URL
};
