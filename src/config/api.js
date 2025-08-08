// Configuração centralizada da API
const getApiUrl = () => {
  // Em desenvolvimento, usar variável de ambiente ou fallback para localhost
  if (import.meta.env.MODE === 'development') {
    return import.meta.env.VITE_API_URL || 'http://localhost:3024/';
  }
  
  // Em produção, usar variável de ambiente ou detectar automaticamente
  return import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3024/`;
};

export const API_URL = getApiUrl();

console.log('🌐 API URL configurada:', API_URL);
console.log('🔧 Modo:', import.meta.env.MODE);
console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);

export default {
  API_URL
};