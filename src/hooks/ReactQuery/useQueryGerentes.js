// hooks/ReactQuery/useQueryGerentes.js - Versão Limpa

import { useQuery } from '@tanstack/react-query';

export const useQueryGerentes = (filters = {}) => {
  const fetchGerentes = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
    
    // Obter token
    let token = localStorage.getItem('tokenRedeTrade') || 
               localStorage.getItem('token') || 
               localStorage.getItem('authToken');
    
    if (!token) {
      const allKeys = Object.keys(localStorage);
      const tokenKey = allKeys.find(key => key.toLowerCase().includes('token'));
      if (tokenKey) token = localStorage.getItem(tokenKey);
    }

    // Construir query params
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.estado) queryParams.append('estado', filters.estado);
    if (filters.cidade) queryParams.append('cidade', filters.cidade);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.pageSize) queryParams.append('pageSize', filters.pageSize.toString());
    
    const url = `${baseUrl}/usuarios/listar-gerentes?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      } else {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    }

    const data = await response.json();
    return data;
  };

  return useQuery({
    queryKey: ['gerentes', filters],
    queryFn: fetchGerentes,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });
};