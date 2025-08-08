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
    pageSize = 12,
    categoriaId = '',
    agencia = '',
    account = ''
) => {
    // MUDAR PARA A ROTA QUE TEM OS FILTROS FUNCIONANDO
    var url = "usuarios/listar-usuarios"  // ← MUDANÇA PRINCIPAL
    url += `?page=${page}`
    url += `&pageSize=100`
      
    // Usar 'nome' para busca por nome/nomeFantasia (mudança no backend)
    if( !!nome || !!nomeFantasia ) {
        const searchTerm = nome || nomeFantasia;
        url += `&nome=${encodeURIComponent(searchTerm)}`
    }
    if( !!estado ) {
        url += `&estado=${encodeURIComponent(estado)}`
    }
    if( !!cidade ) {
        url += `&cidade=${encodeURIComponent(cidade)}`
    }
    if( !!categoriaId ) {
        url += `&categoriaId=${categoriaId}`
    }
    if( !!agencia ) {
        url += `&agencia=${encodeURIComponent(agencia)}`
    }
    if( !!account ) {
        url += `&account=${encodeURIComponent(account)}`
    }

    async function getData() {
        // console.log('🌐 URL da requisição:', url); // Comentado para produção
        
        // Usar a rota corrigida que já tem os filtros
        const response = await getApiData(url);
        
        // console.log('📊 Dados recebidos da API:', response); // Comentado para produção
        
        // A nova rota já retorna no formato correto { data: [...], meta: {...} }
        return response;
    }

    // QueryKey com TODOS os parâmetros
    return useQuery({
        queryKey: [
            'associados', 
            page, 
            tipoDaConta, 
            nome, 
            nomeFantasia, 
            estado, 
            cidade, 
            categoriaId,
            agencia,
            account,
            pageSize
        ],
        queryFn: async () => getData(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};