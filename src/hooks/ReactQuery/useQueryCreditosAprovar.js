
import { useQuery } from '@tanstack/react-query';
import { getApiData } from '../ListasHook';
export const useQueryCreditosAprovar = () => {
    return useQuery({
        queryKey: ['creditos', 'aprovar'],
        queryFn: async () => getApiData(`creditos/matriz/analisar`),
        staleTime: 30000,
    });
};
