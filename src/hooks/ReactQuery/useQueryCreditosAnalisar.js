
import { useQuery } from '@tanstack/react-query';
import { getApiData } from '../ListasHook';
import { getId } from '../getId';
export const useQueryCreditosAnalisar = () => {
    const userId = getId();
    return useQuery({
        queryKey: ['creditos', 'analisar', userId],
        queryFn: async () => getApiData(`creditos/listar-filhos/${userId}`),
        enabled: !!userId,
        staleTime: 30000,
    });
};
