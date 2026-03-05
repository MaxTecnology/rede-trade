import { useQuery } from '@tanstack/react-query';
import { getApiData } from '../ListasHook';

export const useQueryOfertasResumo = () => {
  return useQuery({
    queryKey: ['ofertasResumo'],
    queryFn: async () => {
      const data = await getApiData('ofertas/estatisticas');
      return data ?? { totalGeral: 0, totalUnidade: 0 };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
