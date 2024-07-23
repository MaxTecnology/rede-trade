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
    url += `&pageSize=12`
    url += `nome=${nome}`
    url += `nomeFantasia=${nomeFantasia}`
    url += `razaoSocial=${razaoSocial}`
    url += `nomeContato=${nomeContato}`
    url += `estado=${estado}`
    url += `cidade=${cidade}`
    url += `usuarioCriadorId=${usuarioCriadorId}`
    url += `tipoDaConta=${tipoDaConta}`

    async function mergeContaUsers() {
        const { contas } = await getApiData("contas/listar-contas");
        const { data } = await getApiData(url);
        console.clear()
        console.log("testes")
        console.log(data)
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
