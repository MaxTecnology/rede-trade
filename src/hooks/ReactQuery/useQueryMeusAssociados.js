// import { useQuery } from '@tanstack/react-query';
// import { getId } from '../getId';
// import { getApiData } from '../ListasHook';
// export const useQueryMeusAssociados = () => {
//     return useQuery({
//         queryKey: ['meusAssociados'],
//         queryFn: async () => getApiData(`usuarios/usuarios-criados/${getId()}`),
//     });
// };

import { useQuery } from '@tanstack/react-query';
import { getId } from '../getId';
import { getApiData } from '../ListasHook';

export const useQueryMeusAssociados = () => {
    const userId = getId();

    return useQuery({
        queryKey: ['meusAssociados', userId],
        queryFn: async () => {
            try {
                console.log('🔍 Executando nova versão da query');
                const response = await getApiData(`usuarios/usuarios-criados/${userId}`);
                return response || [];
            } catch (error) {
                // 404 é normal - usuário não criou ninguém ainda
                if (error.response?.status === 404) {
                    console.log(`ℹ️ Usuário ${userId} ainda não criou associados (404 - normal)`);
                    return [];
                }

                // Log outros erros para debugging
                console.error('❌ Erro inesperado ao buscar associados:', {
                    status: error.response?.status,
                    message: error.response?.data?.message || error.message,
                    userId
                });

                // Re-throw outros erros
                throw error;
            }
        },
        enabled: !!userId && userId !== null && userId !== undefined,
        retry: false, // Não tenta novamente
        refetchOnWindowFocus: false, // Evita refetch ao focar janela
        staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    });
};