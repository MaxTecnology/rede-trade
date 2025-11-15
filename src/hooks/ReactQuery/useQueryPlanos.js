import { useQuery } from '@tanstack/react-query';
import { getApiData } from '../ListasHook';

export const allowedPlanTypes = {
    associado: ['Associado', 'Associados'],
    agencia: ['Agencia', 'Agencias'],
    gerente: ['Gerente', 'Gerentes'],
    matriz: ['Matriz', 'Matrizes'],
};

export const useQueryPlanos = ({ tipo } = {}) => {
    return useQuery({
        queryKey: ['planos', tipo || 'all'],
        queryFn: async () => getApiData('planos/listar-planos'),
        select: (response) => {
            if (!tipo) return response;
            const tiposPermitidos = allowedPlanTypes[tipo.toLowerCase()] || [tipo];
            const dataFiltrada = Array.isArray(response?.data)
                ? response.data.filter((plano) => {
                    const tipoPlano = (plano.tipoDoPlano || plano.tipo)?.toString();
                    if (!tipoPlano) return false;
                    return tiposPermitidos.some((permitido) =>
                        tipoPlano.toLowerCase() === permitido.toLowerCase()
                    );
                })
                : [];

            return {
                ...response,
                data: dataFiltrada,
            };
        },
    });
};
