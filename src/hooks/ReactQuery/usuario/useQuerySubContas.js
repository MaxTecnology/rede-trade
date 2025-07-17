import { useQuery } from '@tanstack/react-query';
import { getApiData } from '@/hooks/ListasHook';
import state from '@/store';

export const useQuerySubContas = () => {
    return useQuery({
        queryKey: ['sub-contas'],
        queryFn: async () => {
            // Usar ID da conta em vez do ID do usuário
            const contaId = state.user?.conta?.idConta;
            if (!contaId) {
                throw new Error('ID da conta não encontrado');
            }
            return getApiData(`contas/listar-subcontas/${contaId}?page=1&pageSize=100`);
        },
        enabled: !!state.user?.conta?.idConta, // Só executar se tiver ID da conta
    });
};
