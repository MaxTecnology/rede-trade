import { useEffect, useState } from "react";
import { ColorRing } from 'react-loader-spinner'
import Footer from "@/components/Footer";
import { activePage } from "@/utils/functions/setActivePage";
import { toast } from "sonner";
import useRevalidate from "@/hooks/ReactQuery/useRevalidate";
import { useSnapshot } from "valtio";
import state from "@/store";
import ButtonMotion from "@/components/FramerMotion/ButtonMotion";
import Form_InformacoesUsuario from "@/components/Form/Form_InformacoesUsuario";
import Form_Contato from "@/components/Form/Form_Contato";
import Form_Endereço from "@/components/Form/Form_Endereço";
import Form_Agencia from "@/components/Form/Form_Agencia";
import Form_Operacoes from "@/components/Form/Form_Operacoes";
import Form_Dados from "@/components/Form/Form_Dados";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { associadoSchema } from "@/models/schemas/associadoSchema";
import { createAssociado } from "@/utils/functions/api";
import { useNavigate } from 'react-router-dom';
import { getApiData } from "@/hooks/ListasHook";


const CadastrarAssociado = () => {
    const snap = useSnapshot(state);
    const navigate = useNavigate();
    const [imagem, setImagem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [planos, setPlanos] = useState([]);

    
    useEffect(() => {
        activePage("associados");
        buscarPlanos();
    }, []);

    const revalidate = useRevalidate();

    const form = useForm({
        resolver: zodResolver(associadoSchema),
        defaultValues: {
            // Dados básicos
            email: "",
            senha: "",
            nome: "",
            cpf: "",
            imagem: "",
            
            // Dados da empresa
            nomeFantasia: "",
            razaoSocial: "",
            cnpj: "",
            inscEstadual: "",
            inscMunicipal: "",
            descricao: "",
            
            // Contato
            telefone: "",
            celular: "",
            emailContato: "",
            emailSecundario: "",
            site: "",
            
            // Endereço
            logradouro: "",
            numero: "",
            cep: "",
            complemento: "",
            bairro: "",
            cidade: "",
            estado: "",
            regiao: "",
            
            // Configurações
            tipo: "Associado",
            status: "", // Começar vazio para forçar seleção
            subcategoriaId: "",
            categoriaId: "",
            tipoOperacao: "",
            aceitaOrcamento: "", // Começar vazio para forçar seleção
            aceitaVoucher: "", // Começar vazio para forçar seleção
            mostrarNoSite: "", // Começar vazio para forçar seleção
            
            // Conta/Plano
            planoId: "",
            gerente: "",
            
            // Campos invisíveis/automáticos
            reputacao: "0",
            saldoDinheiro: "0",
            saldoPermuta: "0",
            nomeFranquia: snap.user?.nomeFantasia || "",
            usuarioCriadorId: snap.user?.idUsuario?.toString() || "",
            matrizId: (snap.user?.matrizId || snap.user?.idUsuario)?.toString() || "",
            tipoDeMoeda: "BRL",
            statusConta: true,
            taxaRepasseMatriz: "0",
            bloqueado: false,
            
            // Campos adicionais
            restricoes: "",
            limiteCredito: "0",
            limiteVendaMensal: "0", 
            limiteVendaTotal: "0",
            limiteVendaEmpresa: "0",
            formaPagamento: "",
            percentualGerente: "0",
            valorPlano: "0",
            percentualComissao: "0",
            taxaAnual: "0",
        },
    });

    const buscarPlanos = async () => {
        try {
            // Evitar chamadas duplas se já temos planos
            if (planos.length > 0) return;
            
            const response = await getApiData("planos/listar-planos");
            console.log('📋 Planos carregados:', response.data?.length || response.planos?.length || 0, 'planos');
            setPlanos(response.data || response.planos || []);
        } catch (error) {
            console.error('❌ Erro ao buscar planos:', error);
            toast.error('Erro ao carregar planos');
        }
    };

    const formHandler = async (event) => {
        try {
            console.log('🔍 Dados ANTES do processamento:', JSON.parse(JSON.stringify(event)));
            
            // Debug específico para campos boolean
            console.log('🔍 Valores boolean antes da validação:', {
                status: event.status,
                mostrarNoSite: event.mostrarNoSite,
                aceitaOrcamento: event.aceitaOrcamento,
                aceitaVoucher: event.aceitaVoucher
            });

            // Adicionar imagem aos dados (agora é File object, não string)
            if (imagem) {
                event.imagem = imagem;
            }
            
            // Garantir que os campos obrigatórios estão presentes
            event.tipo = "Associado";
            
            // Limpar campos vazios - converter para null ou remover
            if (event.categoriaId === "" || event.categoriaId === "null") {
                delete event.categoriaId;
            }
            if (event.subcategoriaId === "" || event.subcategoriaId === "null") {
                delete event.subcategoriaId;
            }
            if (event.planoId === "" || event.planoId === "null") {
                delete event.planoId;
            }
            
            // Garantir que campos numéricos sejam tratados corretamente
            if (event.numero) {
                event.numero = parseInt(event.numero, 10);
            }
            if (event.categoriaId) {
                event.categoriaId = parseInt(event.categoriaId, 10);
            }
            if (event.subcategoriaId) {
                event.subcategoriaId = parseInt(event.subcategoriaId, 10);
            }
            if (event.planoId) {
                event.planoId = parseInt(event.planoId, 10);
            }
            if (event.tipoOperacao) {
                event.tipoOperacao = parseInt(event.tipoOperacao, 10);
            }
            
            // Os campos boolean serão processados pelo schema transform automaticamente
            // Mas vamos garantir que valores padrão estejam corretos
            if (event.status === undefined || event.status === null) event.status = true;
            if (event.mostrarNoSite === undefined || event.mostrarNoSite === null) event.mostrarNoSite = true;
            if (event.aceitaOrcamento === undefined || event.aceitaOrcamento === null) event.aceitaOrcamento = true;
            if (event.aceitaVoucher === undefined || event.aceitaVoucher === null) event.aceitaVoucher = true;
            event.statusConta = true; // Sempre ativo para novos associados
            
            // Limpar campos que podem estar vazios
            Object.keys(event).forEach(key => {
                if (event[key] === "" || event[key] === "undefined" || event[key] === undefined) {
                    delete event[key];
                }
            });
            
            console.log('📊 Dados processados para envio:', event);
            
            setLoading(true);
            
            const response = await toast.promise(
                createAssociado(event),
                {
                    loading: 'Cadastrando Associado...',
                    success: (data) => {
                        console.log('✅ Associado criado:', data);
                        return `Associado ${data.nome} cadastrado com sucesso!`;
                    },
                    error: (error) => {
                        console.error('❌ Erro ao criar associado:', error);
                        return `Erro: ${error.message || 'Erro desconhecido'}`;
                    },
                }
            );
            
            console.log('✅ Resposta final:', response);
            
            form.reset();
            revalidate("associados");
            
            setTimeout(() => {
                navigate('/associados');
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erro no formHandler:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="containerHeader">Novo Associado</div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(formHandler)} className="containerForm">
                    <Form_InformacoesUsuario form={form} type={"Associado"} />
                    
                    <div className="formDivider">
                        <p>Contato</p>
                    </div>
                    <Form_Contato form={form} type={"Associado"} />
                    
                    <div className="formDivider">
                        <p>Endereço</p>
                    </div>
                    <Form_Endereço form={form} type={"Associado"} />
                    
                    <div className="formDivider">
                        <p>Agência</p>
                    </div>
                    <Form_Agencia form={form} type={"Associado"} planos={planos}/>
                    
                    <div className="formDivider">
                        <p>Operações</p>
                    </div>
                    <Form_Operacoes form={form} type={"Associado"} />
                    
                    <div className="formDivider">
                        <p>Dados do usuário</p>
                    </div>
                    <Form_Dados form={form} setImagem={setImagem} />
                    
                    <div className="buttonContainer">
                        {loading ? (
                            <ColorRing
                                visible={loading}
                                height="33"
                                width="80"
                                ariaLabel="blocks-loading"
                                wrapperStyle={{}}
                                wrapperClass="blocks-wrapper"
                                colors={['#2d6cdf', '#2d6cdf', '#2d6cdf', '#2d6cdf', '#2d6cdf']}
                            />
                        ) : (
                            <ButtonMotion 
                                className="purpleBtn" 
                                type="submit"
                                onClick={() => {
                                    console.log('🔍 Botão clicado');
                                    console.log('🔍 Erros detalhados do formulário:', JSON.stringify(form.formState.errors, null, 2));
                                    console.log('🔍 Estado válido:', form.formState.isValid);
                                    console.log('🔍 Valores do formulário:', form.getValues());
                                    
                                    // Verificar especificamente os campos com erro
                                    if (form.formState.errors.usuarioCriadorId) {
                                        console.log('❌ Erro usuarioCriadorId:', form.formState.errors.usuarioCriadorId);
                                    }
                                    if (form.formState.errors.matrizId) {
                                        console.log('❌ Erro matrizId:', form.formState.errors.matrizId);
                                    }
                                }}
                            >
                                Cadastrar
                            </ButtonMotion>
                        )}
                    </div>
                </form>
            </Form>
            <Footer />
        </div>
    );
};

export default CadastrarAssociado;