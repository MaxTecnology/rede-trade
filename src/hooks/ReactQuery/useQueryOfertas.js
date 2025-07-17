import { useQuery } from '@tanstack/react-query';
import { getApiData } from '../ListasHook';

export const useQueryOfertas = (
    page = 1, 
    limit = 12, 
    filtros = {}
) => {
    return useQuery({
        queryKey: ['ofertas', page, limit, filtros],
        queryFn: async () => {
            let url = `ofertas/listar-ofertas?page=${page}&limit=${limit}`;
            
            // Adicionar filtros à URL
            Object.entries(filtros).forEach(([key, value]) => {
                if (value && value.trim() && value !== "Selecionar") {
                    url += `&${key}=${encodeURIComponent(value.trim())}`;
                }
            });
            
            console.log('🌐 Buscando ofertas com filtros:', url);
            return getApiData(url);
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchOnWindowFocus: false,
    });
};
