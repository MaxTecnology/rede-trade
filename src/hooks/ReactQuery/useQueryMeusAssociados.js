import { useQuery } from '@tanstack/react-query';
import { getId, getType } from '../getId';
import { getApiData } from '../ListasHook';
import state from '../../store';

export const useQueryMeusAssociados = () => {
    const userId = getId();
    const userType = getType();

    return useQuery({
        queryKey: ['meusAssociados', userId, userType],
        queryFn: async () => {
            if (!userId) return [];
            try {
                let url;
                
                // Lógica baseada no tipo de usuário
                if (userType === 'Associado') {
                    // Para associados: buscar colegas da mesma unidade (mesmo criador)
                    const usuarioCriadorId = state.user?.usuarioCriadorId;
                    if (usuarioCriadorId) {
                        url = `usuarios/listar-usuarios?usuarioCriadorId=${usuarioCriadorId}&tipo=Associado`;
                    } else {
                        // Se não tem criador, retorna apenas ele mesmo
                        url = `usuarios/listar-usuarios?idUsuario=${userId}&tipo=Associado`;
                    }
                } else {
                    // Para Gerentes/Franquias/Matriz: buscar associados que eles criaram
                    url = `usuarios/listar-usuarios?usuarioCriadorId=${userId}&tipo=Associado`;
                }
                
                console.log('🔍 DEBUG: URL para meusAssociados:', url);
                const data = await getApiData(url);
                
                // Se retornou objeto com propriedade data, usar ela
                if (data && data.data && Array.isArray(data.data)) {
                    console.log('📊 DEBUG: Associados encontrados:', data.data.length);
                    return data.data;
                }
                
                // Se retornou array diretamente
                if (Array.isArray(data)) {
                    console.log('📊 DEBUG: Associados encontrados (array direto):', data.length);
                    return data;
                }
                
                return [];
            } catch (error) {
                console.log('❌ Erro ao buscar associados:', error.message);
                return [];
            }
        },
        enabled: !!userId, // A query só será executada se o userId existir.
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // Cache de 5 minutos
    });
};