import { useQuery } from '@tanstack/react-query';
import { getApiData } from '../ListasHook';

export const useQueryOfertas = (
    page = 1, 
    limit = 12, 
    filtros = {}
) => {
    // Estabilizar o objeto filtros para o queryKey
    const filtrosString = JSON.stringify(filtros);

    return useQuery({
        queryKey: ['ofertas', page, limit, filtrosString],
        queryFn: async () => {
            let url = `ofertas/listar-ofertas?page=${page}&limit=${limit}`;
            
            // Adicionar filtros à URL
            Object.entries(filtros).forEach(([key, value]) => {
                if (value && value.toString().trim() && value.toString() !== "Selecionar") {
                    url += `&${key}=${encodeURIComponent(value.toString().trim())}`;
                }
            });
            
            return getApiData(url);
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchOnWindowFocus: false,
    });
};
