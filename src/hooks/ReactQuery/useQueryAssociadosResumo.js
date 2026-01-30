import { useQuery } from '@tanstack/react-query';
import { getApiData } from '../ListasHook';

export const useQueryAssociadosResumo = () => {
  return useQuery({
    queryKey: ['associadosResumo'],
    queryFn: async () => {
      const data = await getApiData('usuarios/associados/estatisticas');
      return data ?? { totalGeral: 0, totalUnidade: 0 };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
