import axios from "axios";
import state from "../store";
import { popup } from "./Popup";
import { toast } from "sonner";
// Firebase removido - agora usamos upload direto para o backend
import { formHandler } from "../utils/functions/formHandler";

// ✅ Configuração dinâmica de headers
const getConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('tokenRedeTrade')}`
    }
});

const mainUrl = `${state.url}`;

function formatarData(dataString) {
    // Criar um objeto Date com a data fornecida
    const dataOriginal = new Date(dataString);

    // Adicionar informações que estão faltando
    dataOriginal.setUTCHours(23, 59, 59, 999);

    // Formatar a data para o formato ISO 8601
    const dataFormatada = dataOriginal.toISOString();
    return dataFormatada;
}

export const loginUser = (event, setLoading, revalidate) => {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.target)
    const object = {};
    formData.forEach((value, key) => object[key] = value);
    const call = axios.post(`${mainUrl}usuarios/login`, object)
    toast.promise(call, {
        loading: 'Realizando login...',
        success: (data) => {
            const token = data.data.token
            const user = data.data.user
            localStorage.setItem('tokenRedeTrade', token);
            revalidate("login")
            state.logged = true
            state.user = user
            setLoading(false)
            window.location.reload();
            return `${data.data.user.nomeFantasia} seja bem vindo!`;
        },
        error: (err) => {
            setLoading(false)
            return "Erro ao realizar login"
        },
    });
}

export const getApiData = async (url, setState) => {
    const fullUrl = `${mainUrl}${url}`;
    return axios.get(fullUrl, getConfig())
        .then((response) => {
            if (setState) {
                setState(response.data)
            }
            return response.data
        })
        .catch((error) => {
            // Só faz log de erros importantes
            if (error.response?.status >= 500) {
                console.error(`❌ Erro ${error.response?.status} na requisição para ${fullUrl}:`, error.response?.data?.error || error.message);
            }
            throw error;
        })
}

export const postItem = async (url, body, setData) => {
    return axios.post(`${mainUrl}${url}`, body, getConfig())
        .then((response) => {
            if (setData) {
                setData(response.data)
            }
            return response.data
        })
}

export const getDate = (setData) => {
    // Obter a data atual no formato 'YYYY-MM-DD'
    const hoje = new Date();
    const ano = hoje.getFullYear();
    let mes = hoje.getMonth() + 1;
    mes = mes < 10 ? `0${mes}` : mes;
    let dia = hoje.getDate();
    dia = dia < 10 ? `0${dia}` : dia;

    const dataFormatada = `${dia}/${mes}/${ano}`;
    if (setData) {
        setData(dataFormatada);
        return
    }
    return (dataFormatada);
}

export const requestCredit = async (event, url) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = formHandler(formData)
    console.table(data)
    await axios.post(`${mainUrl}${url}`, data, getConfig())
        .then(response => {
        })
        .catch(() => {
            throw "Algo de errado aconteceu"
        })
}

// CRÉDITOS HANDLER
export const aproveCreditos = async (id, modalHandler, setState) => {
    const body = {
        "status": "Aprovado"
    }
    toast.promise(axios.put(`${mainUrl}creditos/finalizar-analise/${id}`, body, getConfig()), {
        loading: 'Aprovando crédito...',
        success: (data) => {
            modalHandler()
            setState(true)
            return "Credito aprovado com sucesso!"
        },
        error: (err) => {
            return "Erro ao aprovar Crédito"
        },
    })
}

export const negateCreditos = async (id, modalHandler, setState) => {
    const body = {
        "status": "Negado"
    }
    toast.promise(axios.put(`${mainUrl}creditos/finalizar-analise/${id}`, body, getConfig()), {
        loading: 'Negando crédito...',
        success: (data) => {
            modalHandler()
            setState(true)
            return "Credito negado com sucesso!"
        },
        error: (err) => {
            return "Erro ao negar Crédito"
        },
    })
}

export const forwardCreditos = async (id, modalHandler, setState) => {
    const body = {
        "status": "Encaminhado para a matriz",
        "matrizId": 1
    }
    toast.promise(axios.put(`${mainUrl}creditos/encaminhar/${id}`, body, getConfig()), {
        loading: 'Encaminhando crédito...',
        success: (data) => {
            modalHandler()
            setState(true)
            return "Credito encaminhado com sucesso!"
        },
        error: (err) => {
            return "Erro ao encaminhar Crédito"
        },
    })
}

export const deleteCreditos = async (id, modalHandler, setState) => {
    toast.promise(axios.delete(`${mainUrl}creditos/apagar/${id}`, getConfig()), {
        loading: 'Deletando solicitação...',
        success: (data) => {
            modalHandler()
            setState(true)
            return "Solicitação deletada com sucesso!"
        },
        error: (err) => {
            return "Erro ao deletar solicitação"
        },
    })
}

export const atualizarCreditos = async (event, id, modalHandler, setState) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = formHandler(formData)
    toast.promise(axios.put(`${mainUrl}creditos/editar/${id}`, data, getConfig()), {
        loading: 'Editando solicitação...',
        success: (data) => {
            modalHandler()
            setState(true)
            return "Solicitação editada com sucesso!"
        },
        error: (err) => {
            return "Erro ao deletar Crédito"
        },
    })
}

export const createItem = async (event, url) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const object = formHandler(formData)

    await axios.post(`${mainUrl}${url}`, object, getConfig())
        .then(response => {
        })
        .catch(() => {
            throw "Algo de errado aconteceu"
        })
}

// REMOVIDO: createItemWithImage - Firebase não é mais usado
// Use createOferta que já faz upload direto para o backend

export const createOferta = async (event, url) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    
    // REMOVIDO: uploadFile - O backend agora processa imagem diretamente
    // A imagem já está no FormData e será processada pelo backend
    
    // Formatar vencimento
    formData.set("vencimento", formatarData(formData.get("vencimento")))
    
    // Enviar FormData diretamente para o backend
    const config = {
        ...getConfig(),
        headers: {
            ...getConfig().headers,
            'Content-Type': 'multipart/form-data'
        }
    }
    
    await axios.post(`${mainUrl}${url}`, formData, config)
        .then(response => {
            event.target.reset()
        })
        .catch((error) => {
            console.error('Erro ao criar oferta:', error);
            throw error.response?.data?.message || "Erro ao criar oferta"
        })
}

// REMOVIDO: createSubAccount - Firebase não é mais usado
// Use a função createSubAccount do api/index.js que faz upload direto

// ATUALIZADO: createUser - Firebase removido, agora processa FormData diretamente
export const createUser = async (event, url) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    // REMOVIDO: Firebase upload via uploadFile() - agora o backend processa imagem diretamente

    const object = formHandler(formData)
    const {
        taxaRepasseMatriz, limiteCredito, limiteCreditoPermuta, limiteVendaMensal, limiteVendaTotal, limiteVendaEmpresa, diaFechamentoFatura, dataVencimentoFatura, formaPagamento, nomeFranquia, planoId, gerente: accountManager, tipo: accountType, plano: accountPlan
    } = object
    delete object.taxaRepasseMatriz
    delete object.limiteCredito
    delete object.limiteCreditoPermuta
    delete object.limiteVendaMensal
    delete object.limiteVendaTotal
    delete object.limiteVendaEmpresa
    delete object.diaFechamentoFatura
    delete object.dataVencimentoFatura
    delete object.nomeFranquia
    delete object.planoId
    delete object.gerente
    delete object.tipo
    delete object.plano
    delete object.formaPagamento
    // NÃO DELETAR object.taxaGerente - precisa ser enviado para o backend

    const response = await axios.post(`${mainUrl}${url}`, object, getConfig());
    if (!response) {
        throw new Error("Erro ao criar usuário, por favor cheque os campos e tente novamente")
    }
    event.target.reset();
    await new Promise(resolve => setTimeout(resolve, 1000));
    const userAccount = await axios.post(`${mainUrl}contas/criar-conta-para-usuario/${response.data.idUsuario}`, {
        "planoId": planoId,
        'tipoDaConta': accountType,
        "saldoPermuta": 0,
        "limiteCredito": limiteCredito,
        "limiteVendaMensal": limiteVendaMensal,
        "limiteVendaTotal": limiteVendaTotal,
        "limiteVendaEmpresa": 0,
        "valorVendaMensalAtual": 0,
        "valorVendaTotalAtual": 0,
        "taxaRepasseMatriz": taxaRepasseMatriz,
        "diaFechamentoFatura": dataVencimentoFatura,
        "dataVencimentoFatura": dataVencimentoFatura,
        "nomeFranquia": nomeFranquia,
    }, getConfig()).catch((error) => { /* Erro já tratado pelo catch principal */ })
    if (!userAccount) {
        throw new Error("Erro ao criar conta do usuário, por favor entrar em contato com suporte")
    }
    const payPlan = await axios.post(`${mainUrl}contas/pagamento-do-plano/${response.data.idUsuario}`, {
        "formaPagamento": formaPagamento || 0,
        "idPlano": planoId,
    }, getConfig())
    if (!payPlan) {
        throw new Error("Erro ao cobrar plano do usuário, por favor entrar em contato com suporte")
    }
    const addManager = await axios.post(`${mainUrl}contas/adicionar-gerente/${userAccount.data.idConta}/${accountManager}`, {}, getConfig()).catch((error) => { /* Erro já tratado */ })
    if (!addManager) {
        throw new Error("Erro ao adicionar gerente a conta, por favor entre em contato com suporte")
    }
}

export const createT = async (event) => {
    const object = formHandler(event)
    console.table(object)
    const { voucher } = object
    delete object.voucher
    const response = await axios.post(`${mainUrl}transacoes/inserir-transacao`, object, getConfig())
    if (!response) {
        throw new Error("Erro ao criar transação, por favor cheque os campos e tente novamente")
    }
    if (voucher) {
        const voucherResponse = await axios.post(`${mainUrl}transacoes/criar-voucher/${response.data.novaTransacao.idTransacao}`, getConfig())
        if (!voucherResponse) {
            throw new Error("Erro ao criar voucher, por favor entre em contato com suporte")
        }
    }
};

export const editUser = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    // REMOVIDO: uploadFile - O backend agora processa imagem diretamente
    if (formData.get("imagem")) {
        if (formData.get("imagem").name === "") {
            formData.delete("imagem")
        }
        // A imagem permanece no FormData e será processada pelo backend
    }
    const object = formHandler(formData)

    const { limiteCredito, limiteVendaMensal, limiteVendaTotal, nomeFranquia, gerente, tipo, planoId, contaId, dataVencimentoFatura, taxaRepasseMatriz, idUsuario } = object
    delete object.limiteCredito
    delete object.limiteVendaMensal
    delete object.limiteVendaTotal
    delete object.nomeFranquia
    // NÃO DELETAR object.gerente - precisa ser enviado para o backend
    delete object.tipo
    delete object.planoId
    delete object.contaId
    delete object.idUsuario
    delete object.contaId
    delete object.dataVencimentoFatura
    delete object.taxaRepasseMatriz

    const response = await axios.put(`${mainUrl}usuarios/atualizar-usuario-completo/${idUsuario}`, object, getConfig())
    if (!response) {
        throw new Error("Erro ao editar usuário, por favor cheque os campos e tente novamente")
    }
    const account = axios.put(`${mainUrl}contas/atualizar-conta/${contaId}`, {
        "planoId": planoId,
        'tipoDaConta': tipo,
        "saldoPermuta": 0,
        "limiteCredito": limiteCredito,
        "limiteVendaMensal": limiteVendaMensal,
        "limiteVendaTotal": limiteVendaTotal,
        "diaFechamentoFatura": dataVencimentoFatura,
        "dataVencimentoFatura": dataVencimentoFatura,
        "nomeFranquia": nomeFranquia,
        "taxaRepasseMatriz": taxaRepasseMatriz,
    }, getConfig()).catch(error => { /* Erro já tratado */ })
    if (!account) {
        throw new Error("Erro ao editar usuário")
    }

    axios.get(`${mainUrl}contas/listar-contas`)
        .then(response => {
        })
        .catch(error => {
            console.log(error)
        })
}

export const updateUser = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    // REMOVIDO: Firebase upload - agora o backend processa FormData diretamente
    // Se não há imagem, remover campo vazio
    if (formData.get("imagem") && formData.get("imagem").name === "") {
        formData.delete("imagem")
    }
    
    const object = formHandler(formData)
    
    // Para a página de "Meus Dados", vamos usar a rota de atualizar-usuario-completo
    const { idUsuario, ...dadosParaAtualizar } = object
    
    // Buscar ID do usuário do estado
    const userId = state.user?.idUsuario
    
    if (!userId) {
        throw new Error("ID do usuário não encontrado")
    }
    
    const response = await axios.put(`${mainUrl}usuarios/atualizar-usuario-completo/${userId}`, dadosParaAtualizar, getConfig())
    
    if (!response) {
        throw new Error("Erro ao atualizar dados, por favor tente novamente")
    }
    
    // Atualizar estado local com novos dados
    if (response.data) {
        state.user = { ...state.user, ...response.data }
    }
    
    return response.data
}

export const editItem = async (event, url, setState, oferta) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    // REMOVIDO: uploadFile - O backend agora processa imagem diretamente
    if (formData.get("imagem")) {
        if (formData.get("imagem").name === "") {
            formData.delete("imagem")
        }
        // A imagem permanece no FormData e será processada pelo backend
    }

    if (formData.get("vencimento")) {
        formData.set("vencimento", formatarData(formData.get("vencimento")))
    }
    const object = formHandler(formData)
    if (oferta) {
        object.imagem = [object.imagem]
    }
    const response = await axios.put(`${mainUrl}${url}`, object, getConfig())
    if (!response) {
        throw new Error("Erro ao editar item, por favor cheque os campos e tente novamente")
    }
    if (setState) {
        setState(true)
    }
}

export const deleteItem = (url, revalidate, message, titulo) => {
    axios.delete(`${mainUrl}${url}`, getConfig())
        .then(response => {
            popup(message, titulo)
            revalidate()
        })
}

export const deleteCredito = (url, item) => {
    axios.put(`${mainUrl}${url}`, item, getConfig())
        .then((result) => { /* Sucesso */ })
}

export const aprove = (url, item) => {
    axios.put(`${mainUrl}${url}`, item, getConfig())
        .then((result) => { /* Sucesso */ })
}

export const negate = (url, item) => {
    axios.put(`${mainUrl}${url}`, item, getConfig())
        .then((result) => { /* Sucesso */ })
}

export const bloqUser = (userId) => {
    const url = `usuarios/bloquear-usuario/${userId}`
    return axios.post(`${mainUrl}${url}`, {}, getConfig())
        .then((result) => {
            toast.success('Usuário bloqueado com sucesso!');
            return result;
        })
        .catch(error => {
            console.error('Erro ao bloquear usuário:', error);
            toast.error('Erro ao bloquear usuário');
            throw error;
        });
}

export const unBloqUser = (userId) => {
    const url = `usuarios/desbloquear-usuario/${userId}`
    return axios.post(`${mainUrl}${url}`, {}, getConfig())
        .then((result) => {
            toast.success('Usuário desbloqueado com sucesso!');
            return result;
        })
        .catch(error => {
            console.error('Erro ao desbloquear usuário:', error);
            toast.error('Erro ao desbloquear usuário');
            throw error;
        });
}

// EXTORNO
export const refound = async (id, revalidate) => {
    axios.post(`${mainUrl}transacoes/encaminhar-estorno/${id}`, getConfig())
        .then(result => {
            revalidate()
            toast.success("Extorno solicitado com sucesso")
        })
        .catch(error => console.error('Erro ao solicitar extorno:', error))
}

export const sendRefound = async (id, revalidate) => {
    axios.post(`${mainUrl}transacoes/encaminhar-estorno-matriz/${id}`, getConfig())
        .then(result => {
            revalidate()
            toast.success("Extorno encaminhado com sucesso")
        })
        .catch(error => {
            console.error('Erro ao encaminhar extorno:', error)
            toast.error("Erro ao encaminhar")
        })
}

export const aproveRefound = async (id, revalidate) => {
    axios.post(`${mainUrl}transacoes/estornar-transacao/${id}`, getConfig())
        .then(result => {
            revalidate()
            toast.success("Extorno aprovado com sucesso")
        })
        .catch(error => {
            console.error('Erro ao aprovar extorno:', error)
            toast.error("Erro ao aprovar")
        })
}

export const formatDate = (dataString, full) => {
    const data = new Date(dataString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');  // Os meses são base 0, então é necessário adicionar 1.
    const ano = data.getFullYear();

    if (full) {
        const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
        const monthName = monthNames[data.getMonth()];
        return `Termina em ${dia} de ${monthName} de ${ano}`;
    } else {
        return `${dia}/${mes}/${ano}`;
    }
}