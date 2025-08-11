// Configuração centralizada da API
const getApiUrl = () => {
  // Sempre usar VITE_API_URL se definido, senão usar localhost:3024
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
  
  // Garantir que sempre termine com uma barra
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
};

export const API_URL = getApiUrl();

export default {
  API_URL
};