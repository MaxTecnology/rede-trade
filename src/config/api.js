// Configuração centralizada da API
const getApiUrl = () => {
  let baseUrl;
  
  // Em desenvolvimento, usar variável de ambiente ou fallback para localhost
  if (import.meta.env.MODE === 'development') {
    baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
  } else {
    // Em produção, usar variável de ambiente ou detectar automaticamente
    baseUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3024`;
  }
  
  // Garantir que sempre termine com uma barra
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
};

export const API_URL = getApiUrl();

console.log('🌐 API URL configurada:', API_URL);
console.log('🔧 Modo:', import.meta.env.MODE);
console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);

export default {
  API_URL
};