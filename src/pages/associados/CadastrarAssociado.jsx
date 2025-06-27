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
import { createUser } from "@/utils/functions/api";
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
            senha: "", // Mudei de 'password' para 'senha' (padrão do back-end)
            nome: "",
            cpf: "",
            imagem: "",
            
            // Dados da empresa
            nomeFantasia: "",
            razaoSocial: "",
            cnpj: "",
            inscEstadual: "",
            inscMunicipal: "",
            
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
            tipo: "",
            status: true,
            subcategoriaId: "",
            categoriaId: "",
            tipoOperacao: "",
            aceitaOrcamento: true,
            aceitaVoucher: true,
            mostrarNoSite: true,
            
            // Conta/Plano
            planoId: "",
            gerente: "",
            
            // Campos invisíveis/automáticos
            reputacao: "",
            saldoDinheiro: "",
            saldoPermuta: "",
            nomeFranquia: snap.user?.nomeFantasia || "",
            usuarioCriadorId: snap.user?.idUsuario || "",
            matrizId: snap.user?.matrizId || snap.user?.idUsuario || "", // Importante para hierarquia
            tipoDeMoeda: "BRL",
            statusConta: true,
            taxaRepasseMatriz: "",
            bloqueado: false,
            // Campos adicionais

            descricao: "",
            restricoes: "",
            limiteCredito: "",
            limiteVendaMensal: "", 
            limiteVendaTotal: "",
            limiteVendaEmpresa: "",
            formaPagamento: "",
            percentualGerente: "",
            valorPlano: "",
            percentualComissao: "",
            taxaAnual: "",
        },
    });

    const buscarPlanos = async () => {
        try {
            const response = await getApiData("planos/listar-planos");
            console.log('📋 Planos disponíveis:', response);
            setPlanos(response.data || response.planos || []);
        } catch (error) {
            console.error('❌ Erro ao buscar planos:', error);
            toast.error('Erro ao carregar planos');
        }
    };

    const formHandler = async (event) => {
        try {

            console.log('🔍 Dados ANTES da conversão:', JSON.parse(JSON.stringify(event)));

            // Adicionar imagem aos dados
            event.imagem = imagem;
            
            // Converter strings vazias para null nos IDs
            if (event.categoriaId === "" || event.categoriaId === "null") {
                event.categoriaId = null;
            }
            if (event.subcategoriaId === "" || event.subcategoriaId === "null") {
                event.subcategoriaId = null;
            }
            if (event.planoId === "" || event.planoId === "null") {
                event.planoId = null;
            }
            
            // IMPORTANTE: Converter tipos para o que a API espera
            // Status - converter boolean para string
            if (typeof event.status === 'boolean') {
                event.status = event.status ? "Ativo" : "Inativo";
            }
            
            // Mostrar no site - converter boolean para string
            if (typeof event.mostrarNoSite === 'boolean') {
                event.mostrarNoSite = event.mostrarNoSite ? "true" : "false";
            }
            
            // Tipo de Operação - converter number para string
            if (typeof event.tipoOperacao === 'number') {
                event.tipoOperacao = event.tipoOperacao.toString();
            }
            
            // Aceita Orçamento - converter boolean para string
            if (typeof event.aceitaOrcamento === 'boolean') {
                event.aceitaOrcamento = event.aceitaOrcamento ? "true" : "false";
            }
            
            // Aceita Voucher - converter boolean para string
            if (typeof event.aceitaVoucher === 'boolean') {
                event.aceitaVoucher = event.aceitaVoucher ? "true" : "false";
            }
            
            // Garantir que limite de venda total não seja vazio
            if (!event.limiteVendaTotal || event.limiteVendaTotal === "") {
                event.limiteVendaTotal = "0";
            }
            
            // Converter strings para números onde necessário
            if (event.numero) event.numero = parseInt(event.numero);
            if (event.categoriaId) event.categoriaId = parseInt(event.categoriaId);
            if (event.subcategoriaId) event.subcategoriaId = parseInt(event.subcategoriaId);
            if (event.planoId) event.planoId = parseInt(event.planoId);
            
            console.log('📊 Dados do formulário após conversão:', event);
            
            setLoading(true);
            
            const response = await toast.promise(
                createUser(event, "usuarios/criar-usuario"),
                {
                    loading: 'Cadastrando Associado...',
                    success: (data) => {
                        console.log('✅ Associado criado:', data);
                        return "Associado cadastrado com sucesso!";
                    },
                    error: (error) => {
                        console.error('❌ Erro ao criar associado:', error);
                        console.error('Detalhes do erro:', error.response?.data || error);
                        return `Erro: ${error.message || 'Erro desconhecido'}`;
                    },
                }
            );
            
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
                            <ButtonMotion className="purpleBtn" type="submit">
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