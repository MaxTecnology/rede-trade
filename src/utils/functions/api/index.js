import axios from "axios";
import state from "@/store";
// Firebase removido - agora usamos upload direto para o backend
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

// Função para criar associados (simplificada - sem Firebase, conta automática no backend)
export const createAssociado = async (data) => {
    try {
        console.log("🚀 Iniciando criação de associado:", data);
        
        // Capturar campos numéricos para logs sem removê-los do payload principal
        const limiteCredito = data.limiteCredito;
        const limiteVendaMensal = data.limiteVendaMensal;
        const limiteVendaTotal = data.limiteVendaTotal;
        const limiteVendaEmpresa = data.limiteVendaEmpresa;
        const saldoDinheiro = data.saldoDinheiro;
        const saldoPermuta = data.saldoPermuta;
        const formaPagamento = data.formaPagamento;

        // Extrair campos específicos que exigem tratamento separado
        const {
            gerente,
            tipoOperacao,
            aceitaOrcamento,
            aceitaVoucher,
            taxaGerenteConta,
            planoId,
            ...userFields
        } = data;
        
        console.log("📋 Campos extraídos:", {
            gerente,
            limiteCredito,
            limiteVendaMensal,
            limiteVendaTotal,
            limiteVendaEmpresa,
            saldoDinheiro,
            saldoPermuta,
            formaPagamento,
            tipoOperacao,
            aceitaOrcamento,
            aceitaVoucher,
            restricao: userFields.restricao,
            userFieldsKeys: Object.keys(userFields)
        });
        
        // Preparar FormData para envio com imagem (apenas dados do usuário)
        const formData = new FormData();
        
        // Adicionar campos do usuário
        Object.keys(userFields).forEach(key => {
            if (userFields[key] !== null && userFields[key] !== undefined && key !== 'imagem') {
                formData.append(key, userFields[key]);
            }
        });
        
        // IMPORTANTE: Adicionar campos de operações que foram extraídos
        if (tipoOperacao !== null && tipoOperacao !== undefined) {
            formData.append('tipoOperacao', tipoOperacao);
        }
        if (aceitaOrcamento !== null && aceitaOrcamento !== undefined) {
            formData.append('aceitaOrcamento', aceitaOrcamento);
        }
        if (aceitaVoucher !== null && aceitaVoucher !== undefined) {
            formData.append('aceitaVoucher', aceitaVoucher);
        }
        if (gerente && gerente !== '') {
            formData.append('gerente', gerente);
        }

        if (planoId !== undefined && planoId !== null && planoId !== '' && planoId !== 'null') {
            formData.append('planoId', planoId);
        }
        if (taxaGerenteConta !== undefined && taxaGerenteConta !== null && taxaGerenteConta !== '') {
            formData.append('taxaGerenteConta', taxaGerenteConta);
        }
        
        // Adicionar imagem se existir
        if (userFields.imagem && userFields.imagem instanceof File) {
            formData.append('imagem', userFields.imagem);
            console.log("📸 Imagem adicionada ao FormData:", userFields.imagem.name);
        }
        
        // Garantir que é tipo Associado
        formData.set('tipo', 'Associado');
        
        console.log("📋 Dados do usuário preparados para envio");
        
        // Configuração com content-type adequado para FormData
        const uploadConfig = {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('tokenRedeTrade')}`,
                'Content-Type': 'multipart/form-data'
            }
        };
        
        // Criar associado (o backend já cria a conta automaticamente)
        const response = await axios.post(
            `${mainUrl}usuarios/criar-usuario`, 
            formData, 
            uploadConfig
        ).catch((error) => {
            console.error("❌ Erro ao criar associado:", error.response?.data || error);
            console.error("❌ Status:", error.response?.status);
            console.error("❌ Headers:", error.response?.headers);
            console.error("❌ Dados enviados:", Object.keys(userFields));
            console.error("❌ Campos FormData:", Array.from(formData.keys()));
            
            // Análise detalhada do erro
            const status = error.response?.status;
            const serverError = error.response?.data?.error || error.response?.data?.message;
            const field = error.response?.data?.field;
            
            let errorMsg = "Erro desconhecido ao criar associado";
            
            if (status === 400 && serverError) {
                // Erro de validação - incluir campo específico se disponível
                errorMsg = field ? `${serverError} (campo: ${field})` : serverError;
            } else if (status === 401) {
                errorMsg = "Não autorizado. Faça login novamente.";
            } else if (status === 403) {
                errorMsg = "Permissão negada para criar associado.";
            } else if (status === 409) {
                errorMsg = "Email ou CPF já cadastrado.";
            } else if (status >= 500) {
                errorMsg = "Erro interno do servidor. Tente novamente em alguns minutos.";
            } else if (serverError) {
                errorMsg = serverError;
            } else if (error.message) {
                errorMsg = error.message;
            }
            
            // NÃO recarregar a página - apenas lançar erro para ser tratado pelo componente
            throw new Error(errorMsg);
        });
        
        console.log("✅ Associado criado com sucesso:", response.data);
        console.log("✅ ID do usuário:", response.data.idUsuario);
        
        return response.data;
        
    } catch (error) {
        console.error("❌ Erro completo na criação do associado:", error);
        throw error;
    }
};

// Função legada para outros tipos (gerentes, agências) - FIREBASE REMOVIDO
export const createUser = async (event, url) => {
    try {
        console.log("Dados originais:", event);
        
        // REMOVIDO: Firebase upload - agora o backend processa FormData diretamente
        // A imagem deve ser enviada via FormData diretamente para o backend
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
            "formaPagamentoPlano": formaPagamento || "0",
            "valorPlanoPermuta": saldoPermuta || 0,
            "valorPlanoDinheiro": saldoDinheiro || 0,
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

const ensureFormData = (payload) => {
    if (typeof FormData !== "undefined" && payload instanceof FormData) {
        return payload;
    }

    const formData = new FormData();
    if (!payload) {
        return formData;
    }

    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        if (key === "imagem") {
            if (value instanceof FileList && value.length > 0) {
                formData.append("imagem", value[0]);
            } else if (value instanceof Blob) {
                formData.append("imagem", value);
            }
        } else {
            formData.append(key, value);
        }
    });

    return formData;
};

// Versão atualizada que funciona com upload direto (sem Firebase)
export async function createSubAccount(formData, options = {}) {
    try {
        console.log("🚀 Iniciando criação de subconta");
        
        // Configuração para upload com FormData
        const uploadConfig = {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('tokenRedeTrade')}`,
                'Content-Type': 'multipart/form-data'
            }
        };

        const payload = ensureFormData(formData);

        // Criar subconta no backend
        const response = await axios.post(
            `${mainUrl}contas/criar-subconta/${state.user.conta.idConta}`, 
            payload, 
            uploadConfig
        ).catch((error) => {
            console.error("❌ Erro ao criar subconta:", error.response?.data || error);
            const errorMsg = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message || 
                           "Erro ao criar subconta";
            throw new Error(errorMsg);
        });

        console.log('✅ Subconta criada:', response.data);

        if (options.permissionGroupId) {
            try {
                await axios.post(
                    `${mainUrl}permissions/usuarios/${response.data.idSubContas}/permission-group?target=subconta`,
                    {
                        groupId: Number(options.permissionGroupId),
                        escopo: "DEFAULT"
                    },
                    config
                );
            } catch (groupError) {
                console.error("❌ Erro ao vincular grupo de permissões:", groupError.response?.data || groupError);
                const message = groupError.response?.data?.error || "Subconta criada, mas não foi possível vincular o grupo selecionado.";
                throw new Error(message);
            }
        }

        return response.data;

    } catch (error) {
        console.error("❌ Erro completo na criação da subconta:", error);
        throw error;
    }
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
