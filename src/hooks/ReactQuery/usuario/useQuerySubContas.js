import { useQuery } from '@tanstack/react-query';
import { getApiData } from '@/hooks/ListasHook';
import state from '@/store';
import { getType } from '@/hooks/getId';

export const useQuerySubContas = () => {
    return useQuery({
        queryKey: ['sub-contas'],
        queryFn: async () => {
            const userType = getType();
            
            // Para usuários Matriz, listar todas as subcontas do sistema
            if (userType === 'Matriz') {
                return getApiData('contas/listar-todas-subcontas?page=1&pageSize=100');
            }
            
            // Para outros usuários, usar ID da conta específica
            const contaId = state.user?.conta?.idConta;
            if (!contaId) {
                throw new Error('ID da conta não encontrado');
            }
            return getApiData(`contas/listar-subcontas/${contaId}?page=1&pageSize=100`);
        },
        enabled: !!(getType() === 'Matriz' || state.user?.conta?.idConta), // Executar para Matriz ou se tiver ID da conta
    });
};
