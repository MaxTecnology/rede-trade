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
    var url = "usuarios/buscar-usuario-params"
    url += `?page=${page}`
    url += `&pageSize=100`


    if( !!nome ) {
        url += `&nome=${nome}`
    }
    if( !!nomeFantasia ) {
        url += `&nomeFantasia=${nomeFantasia}`
    }
    if( !!razaoSocial ) {
        url += `&razaoSocial=${razaoSocial}`
    }
    if( !!nomeContato ) {
        url += `&nomeContato=${nomeContato}`
    }
    if( !!estado ) {
        url += `&estado=${estado}`
    }
    if( !!cidade ) {
        url += `&cidade=${cidade}`
    }
    if( !!usuarioCriadorId ) {
        url += `&usuarioCriadorId=${usuarioCriadorId}`
    }
    if( !!tipoDaConta ) {
        url += `&tipoDaConta=${tipoDaConta}`
    }

    async function mergeContaUsers() {
        const { contas } = await getApiData("contas/listar-contas");
        const { data } = await getApiData(url);
        const response = data.map((user) => {
            contas.forEach(conta => {
                if (conta.usuarioId === user.idUsuario) {
                    user.conta = conta
                }
            });
            return user
        })
        return { data: response };
    }

    //alert(teste)
    return useQuery({
        queryKey: ['associados'],
        queryFn: async () => mergeContaUsers(),
    });
};
