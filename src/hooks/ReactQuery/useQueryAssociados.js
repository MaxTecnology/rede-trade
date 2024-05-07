import { useQuery } from '@tanstack/react-query';
import { getApiData } from '../ListasHook';
export const useQueryAssociados = (
    page = 1,
    tipoDaConta = 'Associado',
    nome = '',
    nomeFantasia = '',
    razaoSocial = '',
    nomeContato = '',
    estado = '',
    cidade = '',
    usuarioCriadorId = '',
    pageSize = 12
) => {
    let url = "usuarios/buscar-usuario-params"
    url += `?page=${page}` 
    url += `&pageSize=12`
    url += `nome=${nome}`
    url += `nomeFantasia=${nomeFantasia}`
    url += `razaoSocial=${razaoSocial}`
    url += `nomeContato=${nomeContato}`
    url += `estado=${estado}`
    url += `cidade=${cidade}`
    url += `usuarioCriadorId=${usuarioCriadorId}`
    url += `tipoDaConta=${tipoDaConta}`

    return useQuery({
        queryKey: ['associados'],
        queryFn: async () => getApiData(url),
    });
};
