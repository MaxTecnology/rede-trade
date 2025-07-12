import { useQuery } from '@tanstack/react-query';
import { getApiData } from '../ListasHook';

export const useQueryOfertas = (page = 1, limit = 12) => {
    return useQuery({
        queryKey: ['ofertas', page, limit],
        queryFn: async () => {
            const url = `ofertas/listar-ofertas?page=${page}&limit=${limit}`;
            console.log('🌐 Buscando ofertas:', url);
            return getApiData(url);
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchOnWindowFocus: false,
    });
};
