import axios from "axios";
import state from "@/store";
import { uploadFile } from "@/FirebaseConfig";
import { formHandler, formatForm } from "../formHandler";

const config = {
    headers: {
        Authorization: `Bearer ${localStorage.getItem('tokenRedeTrade')}`
    }
};

const mainUrl = `${state.url}`

export async function newPassword(event, id) {
    const response = await axios.post(`${mainUrl}usuarios/redefinir-senha-usuario/${id}`, event).catch((err) => {
        throw new Error(err.response.data.error)
    })
    return "Senha redefinida com sucesso!"
}
export async function forgotPassword(event) {
    const formData = new FormData(event.target)
    const object = formHandler(formData)
    const response = await axios.post(`${mainUrl}usuarios/solicitar-redefinicao-senha-usuario/`, object)
    return "Mensagem enviada para o seu e-mail!"
}

export const createUser = async (event, url) => {
    try {
        console.log("Dados originais:", event);
        
        const imagem = await uploadFile(event.imagem)
            .catch(error => {
                console.error("Erro no upload da imagem:", error);
                throw new Error(`Erro no upload da imagem: ${error.message}`);
            });
            
        event.imagem = imagem;
        const formatedEvent = formatForm(event);
        
        const {
            taxaRepasseMatriz, 
            limiteCredito, 
            limiteCreditoPermuta, 
            saldoDinheiro, 
            saldoPermuta, 
            limiteVendaMensal, 
            limiteVendaTotal, 
            limiteVendaEmpresa, 
            diaFechamentoFatura, 
            dataVencimentoFatura, 
            formaPagamento, 
            nomeFranquia, 
            planoId, 
            gerente: accountManager, 
            tipo: accountType, 
            plano: accountPlan, 
            ...params
        } = formatedEvent;
        
        // Garantir que o tipo para usuário seja "Associado"
        formatedEvent.tipo = "Associado";
        
        console.log("Tipo de conta (usuário):", formatedEvent.tipo);
        console.log("Dinheiro:", saldoDinheiro);
        console.log("Parâmetros:", params);
        
        delete formatedEvent.taxaRepasseMatriz;
        delete formatedEvent.limiteCredito;
        delete formatedEvent.limiteCreditoPermuta;
        delete formatedEvent.limiteVendaMensal;
        delete formatedEvent.limiteVendaTotal;
        delete formatedEvent.limiteVendaEmpresa;
        delete formatedEvent.diaFechamentoFatura;
        delete formatedEvent.dataVencimentoFatura;
        delete formatedEvent.nomeFranquia;
        delete formatedEvent.planoId;
        delete formatedEvent.gerente;
        delete formatedEvent.plano;
        delete formatedEvent.formaPagamento;

        console.log("Dados formatados que serão enviados:");
        console.table(formatedEvent);
        
        // Requisição para criar usuário com captura detalhada de erro
        const response = await axios.post(`${mainUrl}${url}`, formatedEvent, config)
            .catch((error) => {
                console.error("Erro detalhado da API:", error.response?.data || error);
                console.error("Status do erro:", error.response?.status);
                console.error("Headers da resposta:", error.response?.headers);
                console.error("Dados enviados que causaram o erro:", formatedEvent);
                throw new Error(`Erro ao criar usuário: ${error.response?.data?.error || error.message}`);
            });

        console.log('Usuário criado com sucesso:', response.data);
        
        // Delay para garantir que o usuário foi criado no banco de dados
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // IMPORTANTE: Usar um tipo de conta válido da tabela TipoConta
        // De acordo com as imagens do banco de dados, os tipos válidos são:
        // 1: Básica, 2: Premium, 3: Matriz
        const accountData = {
            "planoId": planoId || 1,
            // Usar o ID 1 que corresponde ao tipo "Básica"
            "tipoContaId": 1,
            // Não enviar tipoDaConta como string, já que não existe "Associado" na tabela TipoConta
            "saldoPermuta": saldoPermuta || 0,
            "saldoDinheiro": saldoDinheiro || 0,
            "limiteCredito": limiteCredito || 0,
            "limiteVendaMensal": limiteVendaMensal || 0,
            "limiteVendaTotal": limiteVendaTotal || 0,
            "limiteVendaEmpresa": 0,
            "valorVendaMensalAtual": 0,
            "valorVendaTotalAtual": 0,
            "taxaRepasseMatriz": taxaRepasseMatriz || 0,
            "diaFechamentoFatura": dataVencimentoFatura || 1,
            "dataVencimentoFatura": dataVencimentoFatura || 1,
            "nomeFranquia": nomeFranquia || "",
        };
        
        console.log("Dados da conta a ser criada:", accountData);
        
        const userAccount = await axios.post(
            `${mainUrl}contas/criar-conta-para-usuario/${response.data.idUsuario}`, 
            accountData, 
            config
        ).catch((error) => {
            console.error("Erro ao criar conta:", error.response?.data || error);
            throw new Error(`Erro ao criar conta do usuário: ${error.response?.data?.error || error.message}`);
        });
        
        if (!userAccount) {
            throw new Error("Erro ao criar conta do usuário, resposta vazia");
        }
        
        console.log("Conta criada com sucesso:", userAccount.data);
        
        // Pagamento do plano
        const planData = {
            "formaPagamento": formaPagamento || 0,
            "idPlano": planoId || 1,
        };
        
        console.log("Dados do pagamento do plano:", planData);
        
        const payPlan = await axios.post(
            `${mainUrl}contas/pagamento-do-plano/${response.data.idUsuario}`, 
            planData, 
            config
        ).catch((error) => {
            console.error("Erro ao pagar plano:", error.response?.data || error);
            throw new Error(`Erro ao cobrar plano do usuário: ${error.response?.data?.error || error.message}`);
        });
        
        if (!payPlan) {
            throw new Error("Erro ao cobrar plano do usuário, resposta vazia");
        }
        
        console.log("Plano pago com sucesso:", payPlan.data);
        
        // Adicionar gerente
        const contaId = userAccount.data.idConta || userAccount.data.id;
        console.log(`Adicionando gerente ${accountManager} à conta ${contaId}`);
        
        const addManager = await axios.post(
            `${mainUrl}contas/adicionar-gerente/${contaId}/${accountManager}`, 
            {}, 
            config
        ).catch((error) => {
            console.error("Erro ao adicionar gerente:", error.response?.data || error);
            throw new Error(`Erro ao adicionar gerente à conta: ${error.response?.data?.error || error.message}`);
        });
        
        if (!addManager) {
            throw new Error("Erro ao adicionar gerente à conta, resposta vazia");
        }
        
        console.log("Gerente adicionado com sucesso:", addManager.data);
        
        return response.data;
    } catch (error) {
        console.error("Erro completo no processo de criação:", error);
        throw error;
    }
}

function transformarDados(dados) {
    const resultado = {};

    Object.keys(dados).forEach((chave) => {
        const permissao = dados[chave];

        if (Object.prototype.hasOwnProperty.call(dados, chave)) {
            if (typeof permissao === 'object' && permissao !== null && !Array.isArray(permissao)) {
                resultado[chave] = Object.keys(permissao).filter(subChave => permissao[subChave] === true && subChave !== 'field');
            } else if (permissao === true && chave !== 'field') {
                resultado[chave] = [chave];
            } else if (Array.isArray(permissao) && permissao.length > 0) {
                resultado[chave] = permissao.filter(item => item !== 'field');
            }
        }
    });

    return resultado;
}

export async function createSubAccount(event) {

    const { email, senha, imagem, cpf, nome } = event
    const imagemUrl = await uploadFile(imagem)
    const userData = {
        "nome": nome,
        "email": email,
        "cpf": cpf,
        "senha": senha,
        "imagem": imagemUrl
    }
    console.log(userData)
    const response = await axios.post(`${mainUrl}contas/criar-subconta/${state.user.conta.idConta}`, userData, config)
        .catch(() => {
            throw new Error("Erro ao criar usuário, por favor cheque os campos e tente novamente")
        });
    console.log('Usuário criado:', response.data)


    const { atendimento, compras, extratos, faturas, meusUsuarios, minhaConta, ofertas, permissoesConta, vendas, vouchers } = event
    const permissoes = {
        atendimento, compras, extratos, faturas, meusUsuarios, minhaConta, ofertas, permissoesConta, vendas, vouchers
    }
    let permissoesArray = [JSON.stringify(permissoes)]
    const resultado = transformarDados(permissoes)
    console.table(resultado)



    const subconta = await axios.post(`${mainUrl}contas/subcontas/adicionar-permissao/${response.data.idSubContas}`, permissoesArray, config)
        .catch((err) => {
            throw new Error("Erro ao criar usuário, por favor cheque os campos e tente novamente")
        });
    console.log("Sub-conta criada", subconta)
}

export async function updateCharge(id, revalidate) {
    const object = {
        status: "Quitado"
    }
    axios.put(`${mainUrl}cobrancas/atualizar-cobranca/${id}`, object, config).then(res => {
        revalidate()
        return res
    })
}