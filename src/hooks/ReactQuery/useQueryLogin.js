import { useQuery } from '@tanstack/react-query';
import { getUserInfo } from '@/auth/authFunction';

export const useQueryLogin = () => {
    return useQuery({
        queryKey: ['login'],
        queryFn: async () => getUserInfo(),
        enabled: !!localStorage.getItem('tokenRedeTrade'), // <-- Só executa se houver token
        retry: false, // <-- Não tenta novamente se der erro
        refetchOnWindowFocus: false, // <-- Evita refetch desnecessário
        staleTime: 5 * 60 * 1000, // <-- Cache por 5 minutos
    });
};