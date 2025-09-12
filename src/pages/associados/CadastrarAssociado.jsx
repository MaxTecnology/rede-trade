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
    const [reference, setReference] = useState(true);

    
    useEffect(() => {
        activePage("associados");
        buscarPlanos();
    }, []);

    const revalidate = useRevalidate();

    // Função para converter formato brasileiro para numérico
    const convertBrazilianToNumber = (value) => {
        if (!value) return '';
        return value.toString()
            .replace(/\./g, '')  // Remove pontos (separadores de milhares)
            .replace(',', '.');  // Troca vírgula por ponto (decimal)
    };

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
            nomeContato: "",
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
            categoriaId: "null", // string "null" para não pré-selecionar categoria
            tipoOperacao: "",
            aceitaOrcamento: "", // Começar vazio para forçar seleção
            aceitaVoucher: "", // Começar vazio para forçar seleção
            mostrarNoSite: "", // Começar vazio para forçar seleção
            
            // Conta/Plano
            planoId: "",
            gerente: "",
            
            // Campos invisíveis/automáticos
            reputacao: "",
            saldoDinheiro: "",
            saldoPermuta: "",
            nomeFranquia: snap.user?.nomeFantasia || "",
            usuarioCriadorId: snap.user?.idUsuario?.toString() || "",
            matrizId: (snap.user?.matrizId || snap.user?.idUsuario)?.toString() || "",
            tipoDeMoeda: "BRL",
            statusConta: true,
            taxaRepasseMatriz: "",
            bloqueado: false,
            
            // Campos adicionais - deixar vazio para o usuário preencher
            restricao: "",
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
            if (planos.length > 0) return;
            
            const response = await getApiData("planos/listar-planos");
            setPlanos(response.data || response.planos || []);
        } catch (error) {
            toast.error('Erro ao carregar planos');
        }
    };

    const formHandler = async (event) => {
        try {
            setReference(false); // Para controlar RealInput durante processamento
            
            if (imagem) {
                event.imagem = imagem;
            }
            
            event.tipo = "Associado";
            
            if (event.categoriaId === "" || event.categoriaId === "null") {
                delete event.categoriaId;
            }
            if (event.subcategoriaId === "" || event.subcategoriaId === "null") {
                delete event.subcategoriaId;
            }
            if (event.planoId === "" || event.planoId === "null") {
                delete event.planoId;
            }
            
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

            // Converter boolean fields corretamente
            if (event.aceitaOrcamento !== undefined) {
                event.aceitaOrcamento = event.aceitaOrcamento === true || event.aceitaOrcamento === "true";
            }
            if (event.aceitaVoucher !== undefined) {
                event.aceitaVoucher = event.aceitaVoucher === true || event.aceitaVoucher === "true";
            }
            if (event.mostrarNoSite !== undefined) {
                event.mostrarNoSite = event.mostrarNoSite === true || event.mostrarNoSite === "true";
            }
            if (event.status !== undefined) {
                event.status = event.status === true || event.status === "true";
            }
            
            event.statusConta = true;
            
            // Obter valores dos campos RealInput diretamente do DOM (já que não estão integrados com react-hook-form)
            const camposMonetarios = ['limiteCredito', 'limiteVendaMensal', 'limiteVendaTotal', 'saldoDinheiro', 'saldoPermuta'];
            camposMonetarios.forEach(campo => {
                // Tentar obter o valor do input pelo name
                const inputElement = document.querySelector(`input[name="${campo}"]`);
                if (inputElement && inputElement.value) {
                    const valorOriginal = inputElement.value;
                    const valorConvertido = convertBrazilianToNumber(valorOriginal);
                    const valorNumerico = parseFloat(valorConvertido) || 0;
                    event[campo] = valorNumerico;
                    console.log(`💰 ${campo}: "${valorOriginal}" → ${valorNumerico}`);
                } else {
                    // Se não encontrar o campo ou estiver vazio, definir como 0
                    event[campo] = 0;
                    console.log(`💰 ${campo}: não encontrado ou vazio → 0`);
                }
            });
            
            // Debug completo dos dados antes de enviar
            console.log("📋 Dados finais para envio:", {
                tipoOperacao: event.tipoOperacao,
                aceitaOrcamento: event.aceitaOrcamento,
                aceitaVoucher: event.aceitaVoucher,
                limiteCredito: event.limiteCredito,
                limiteVendaMensal: event.limiteVendaMensal,
                limiteVendaTotal: event.limiteVendaTotal,
                saldoDinheiro: event.saldoDinheiro,
                saldoPermuta: event.saldoPermuta,
                gerente: event.gerente,
                restricao: event.restricao
            });
            
            // Limpar apenas campos realmente vazios, mas preservar 0 e false
            Object.keys(event).forEach(key => {
                if (event[key] === "" || event[key] === "undefined" || event[key] === null) {
                    delete event[key];
                }
            });
            
            setLoading(true);
            
            try {
                const response = await createAssociado(event);
                
                // Sucesso - mostrar toast e limpar formulário
                toast.success(`Associado ${response.nome} cadastrado com sucesso!`);
                form.reset();
                setReference(true); // Resetar reference
                revalidate("associados");
                
                setTimeout(() => {
                    navigate('/associadosLista');
                }, 2000);
                
            } catch (error) {
                // Erro - NÃO limpar formulário para preservar dados
                console.error("Erro ao cadastrar associado:", error);
                
                // Determinar tipo de erro
                const errorMessage = error.message || 'Erro desconhecido';
                const isValidationError = error.message?.includes('obrigatório') || 
                                        error.message?.includes('inválido') ||
                                        error.message?.includes('formato');
                
                if (isValidationError) {
                    // Erro de validação - manter dados no formulário
                    toast.error(`Erro de validação: ${errorMessage}`, {
                        duration: 5000,
                        description: "Verifique os campos destacados e tente novamente."
                    });
                } else {
                    // Outros erros - também manter dados por segurança
                    toast.error(`Erro ao cadastrar: ${errorMessage}`, {
                        duration: 5000,
                        description: "Seus dados foram preservados. Tente novamente."
                    });
                }
                
                // NÃO fazer reset do formulário para preservar dados
                // form.reset(); <- REMOVIDO
            }
        } catch (error) {
            // Catch adicional para erros inesperados
            console.error("Erro inesperado:", error);
            toast.error("Erro inesperado. Dados preservados, tente novamente.");
            setReference(true); // Resetar reference em caso de erro
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
                    <Form_Operacoes form={form} type={"Associado"} reference={reference} />
                    
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
