import { useQuery } from '@tanstack/react-query';
import { getId } from '../getId';
import { getApiData } from '../ListasHook';

export const useQueryMeusAssociados = () => {
    const userId = getId();

    return useQuery({
        queryKey: ['meusAssociados', userId],
        queryFn: async () => {
            if (!userId) return [];
            try {
                // A rota correta é 'listar-usuarios', filtrando pelo ID do criador.
                const data = await getApiData(`usuarios/listar-usuarios?usuarioCriadorId=${userId}`);
                return data || [];
            } catch (error) {
                // Se a API retornar 404 ou qualquer outro erro, tratamos como "sem associados".
                // Isso evita quebrar a UI e poluir o console com erros esperados.
                return [];
            }
        },
        enabled: !!userId, // A query só será executada se o userId existir.
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // Cache de 5 minutos
    });
};