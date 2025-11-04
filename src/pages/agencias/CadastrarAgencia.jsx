import { useEffect, useState } from "react";
import InputMask from 'react-input-mask';
import { createUser } from "@/hooks/ListasHook";
import { ColorRing } from 'react-loader-spinner';
import defaultImage from "@/assets/images/default_img.png";
import Footer from '@/components/Footer';
import RealInput from "@/components/Inputs/CampoMoeda";
import { activePage } from "@/utils/functions/setActivePage";
import { BiSolidImageAdd } from "react-icons/bi";
import { toast } from "sonner";
import InvisibleInputs from "@/components/Inputs/InvisibleInputs";
import { getId } from "@/hooks/getId";
import Form_Agencia from "@/components/Form/Form_Agencia";
import useRevalidate from "@/hooks/ReactQuery/useRevalidate";
import { useSnapshot } from "valtio";
import state from "@/store";
import { imageReferenceHandler } from "@/utils/functions/formHandler";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const CadastrarAgencia = () => {
    const snap = useSnapshot(state);
    const [imagemReference, setImageReference] = useState(null);
    const [imagem, setImagem] = useState(null);
    const [reference, setReference] = useState(true);
    const [tipoSelecionado, setTipoSelecionado] = useState("");
    const [loading, setLoading] = useState(false);
    const planosForm = useForm({
        defaultValues: {
            planoId: "",
            planoValor: "",
            comissao: "",
            planoTaxa: "",
            formaPagamento: "",
            dataVencimentoFatura: "",
            nomeFranquia: snap.user?.nomeFantasia || "",
            saldoDinheiro: "",
            saldoPermuta: "",
        },
    });


    useEffect(() => {
        activePage("agencias");
        
        // Debug do usuário logado
        const userId = getId();
        console.log('🔍 DEBUG - Usuário logado:', {
            userId: userId,
            userType: typeof userId,
            snapUser: snap.user,
            nomeFantasia: snap.user?.nomeFantasia
        });
        
        // Verificar localStorage
        console.log('🔍 DEBUG - LocalStorage tokens:', {
            tokenRedeTrade: !!localStorage.getItem('tokenRedeTrade'),
            token: !!localStorage.getItem('token'),
            authToken: !!localStorage.getItem('authToken'),
            allKeys: Object.keys(localStorage).filter(key => key.toLowerCase().includes('token'))
        });
    }, [snap.user]);

    useEffect(() => {
        planosForm.setValue("nomeFranquia", snap.user?.nomeFantasia || "");
    }, [snap.user?.nomeFantasia, planosForm]);

    const revalidate = useRevalidate("agencias")

    const deveExibirOperacoes = (() => {
        if (!tipoSelecionado) return false;
        const tipoNormalizado = tipoSelecionado.toLowerCase();
        return tipoNormalizado.includes("associado") || tipoNormalizado.includes("cliente");
    })();

    // Função para converter formato brasileiro para numérico
    const convertBrazilianToNumber = (value) => {
        if (!value) return '';
        return value.toString()
            .replace(/\./g, '')  // Remove pontos (separadores de milhares)
            .replace(',', '.');  // Troca vírgula por ponto (decimal)
    };

    const formHandler = async (event) => {
        event.preventDefault();
        const formElement = event.target;
        setReference(false);
        setLoading(true);

        const planosValidos = await planosForm.trigger();
        if (!planosValidos) {
            toast.error('Revise as informações do plano antes de continuar.');
            setReference(true);
            setLoading(false);
            return;
        }

        const valoresPlano = planosForm.getValues();
        
        // Obter ID do usuário logado
        const usuarioId = getId();
        console.log('🔑 ID do usuário logado:', usuarioId);
        
        if (!usuarioId) {
            toast.error('Erro: ID do usuário não encontrado. Faça login novamente.');
            setReference(true);
            setLoading(false);
            return;
        }
        
        if (imagem) {
            // Criar FormData limpo para evitar duplicação
            const formDataLimpo = new FormData();
            const formOriginal = new FormData(event.target);
            
            // Log para debug dos dados do formulário
            console.log('📝 Dados do formulário original:');
            for (let [key, value] of formOriginal.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            // Campos obrigatórios
            formDataLimpo.append('razaoSocial', formOriginal.get('razaoSocial') || '');
            formDataLimpo.append('nomeFantasia', formOriginal.get('nomeFantasia') || '');
            formDataLimpo.append('cnpj', formOriginal.get('cnpj') || '');
            formDataLimpo.append('nome', formOriginal.get('nome') || '');
            formDataLimpo.append('cpf', formOriginal.get('cpf') || '');
            formDataLimpo.append('email', formOriginal.get('email') || '');
            formDataLimpo.append('senha', formOriginal.get('senha') || '');
            formDataLimpo.append('tipo', formOriginal.get('tipo') || 'Franquia Comum');
            formDataLimpo.append('statusConta', 'true');
            formDataLimpo.append('reputacao', '0');
            formDataLimpo.append('tipoDeMoeda', 'BRL');
            formDataLimpo.append('status', 'true');
            
            // CAMPOS CRÍTICOS - usuarioCriadorId e relacionados
            formDataLimpo.append('usuarioCriadorId', usuarioId.toString());
            formDataLimpo.append('gerente', usuarioId.toString());
            formDataLimpo.append('nomeFranquia', snap.user.nomeFantasia);

            const formaPagamentoSelecionado = formOriginal.get('formaPagamento');
            formDataLimpo.append('formaPagamento', formaPagamentoSelecionado ?? '0');
            
            // Campos opcionais do formulário
            const camposOpcionais = [
                'inscEstadual', 'inscMunicipal', 'mostrarNoSite',
                'nomeContato', 'telefone', 'celular', 'emailContato', 'emailSecundario',
                'logradouro', 'numero', 'cep', 'complemento', 'bairro', 'cidade', 
                'estado', 'regiao', 'aceitaOrcamento', 'aceitaVoucher', 'tipoOperacao',
                'dataVencimentoFatura', 'limiteCredito', 'limiteVendaMensal', 'limiteVendaTotal',
                'saldoDinheiro', 'saldoPermuta',
                'taxaRepasseMatriz', 'planoId', 'planoValor', 'comissao', 'planoTaxa'
            ];
            
            camposOpcionais.forEach(campo => {
                const valor = formOriginal.get(campo);
                if (valor && valor.toString().trim() !== '') {
                    // Converter valores monetários para formato numérico
                    if (['limiteCredito', 'limiteVendaMensal', 'limiteVendaTotal', 'saldoDinheiro', 'saldoPermuta'].includes(campo)) {
                        const valorConvertido = convertBrazilianToNumber(valor);
                        formDataLimpo.append(campo, valorConvertido);
                        console.log(`💰 ${campo}: ${valor} → ${valorConvertido}`);
                    } else {
                        formDataLimpo.append(campo, valor);
                    }
                }
            });

            ['planoId', 'planoValor', 'comissao', 'planoTaxa'].forEach((campo) => {
                const valor = valoresPlano[campo];
                if (valor !== undefined && valor !== null && valor !== '') {
                    formDataLimpo.set(campo, valor);
                }
            });
            
            // Adicionar imagem
            formDataLimpo.append('imagem', imagem);
            
            // Log final dos dados que serão enviados
            console.log('🧪 FormData limpo que será enviado:');
            for (let [key, value] of formDataLimpo.entries()) {
                if (key === 'imagem') {
                    console.log(`${key}: [File] ${value.name} (${(value.size / 1024 / 1024).toFixed(2)}MB)`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }
            
            const createUserWithImage = async () => {
                try {
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
                    const url = `${baseUrl}/usuarios/criar-usuario`;
                    
                    // Obter token
                    let token = localStorage.getItem('tokenRedeTrade') || 
                               localStorage.getItem('token') || 
                               localStorage.getItem('authToken');
                    
                    if (!token) {
                        const allKeys = Object.keys(localStorage);
                        const tokenKey = allKeys.find(key => key.toLowerCase().includes('token'));
                        if (tokenKey) {
                            token = localStorage.getItem(tokenKey);
                        }
                    }
                    
                    if (!token) {
                        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
                    }
                    
                    console.log('🔗 Fazendo requisição para:', url);
                    console.log('🔑 Token presente:', !!token);
                    
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                            // NÃO incluir Content-Type quando usando FormData
                        },
                        body: formDataLimpo
                    });
    
                    console.log('📡 Status da resposta:', response.status);
    
                    if (!response.ok) {
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            const errorData = await response.json();
                            console.error('❌ Erro do servidor:', errorData);
                            throw new Error(errorData.error || `Erro HTTP ${response.status}`);
                        } else {
                            const errorText = await response.text();
                            console.error('❌ Resposta do servidor (texto):', errorText);
                            throw new Error(`Erro ${response.status}: ${errorText}`);
                        }
                    }
    
                    const data = await response.json();
                    console.log('✅ Usuário criado:', data);
                    
                    return data;
                } catch (error) {
                    console.error('❌ Erro completo:', error);
                    throw error;
                }
            };
    
            toast.promise(createUserWithImage(), {
                loading: 'Cadastrando Agência...',
                success: () => {
                    setReference(true);
                    setImagem(null);
                    setImageReference(null);
                    setLoading(false);
                    revalidate("agencias");
                    setTipoSelecionado("");
                    formElement.reset();
                    planosForm.reset({
                        planoId: "",
                        planoValor: "",
                        comissao: "",
                        planoTaxa: "",
                        formaPagamento: "",
                        dataVencimentoFatura: "",
                        nomeFranquia: snap.user?.nomeFantasia || "",
                        saldoDinheiro: "",
                        saldoPermuta: "",
                    });
                    return "Agência Cadastrada com sucesso!";
                },
                error: (error) => {
                    setReference(true);
                    setTipoSelecionado("");
                    setLoading(false);
                    console.error('❌ Erro no toast:', error);
                    return `Erro: ${error.message}`;
                },
            });
        } else {
            // Método para quando não há imagem - CORRIGIDO
            const formData = new FormData(event.target);
            
            // Converter valores monetários para formato numérico
            const camposMonetarios = ['limiteCredito', 'limiteVendaMensal', 'limiteVendaTotal', 'saldoDinheiro', 'saldoPermuta'];
            camposMonetarios.forEach(campo => {
                const valor = formData.get(campo);
                if (valor) {
                    const valorConvertido = convertBrazilianToNumber(valor);
                    formData.set(campo, valorConvertido);
                    console.log(`💰 ${campo}: ${valor} → ${valorConvertido}`);
                }
            });

            ['planoId', 'planoValor', 'comissao', 'planoTaxa'].forEach((campo) => {
                const valor = valoresPlano[campo];
                if (valor !== undefined && valor !== null && valor !== '') {
                    formData.set(campo, valor);
                }
            });
            
            // Adicionar campos obrigatórios que podem estar faltando
            // Manter o tipo do formulário (já enviado automaticamente pelo createUser)
            formData.append('usuarioCriadorId', usuarioId.toString());
            formData.append('gerente', usuarioId.toString());
            formData.append('statusConta', 'true');
            formData.append('reputacao', '0');
            formData.append('tipoDeMoeda', 'BRL');
            formData.append('status', 'true');
            formData.append('nomeFranquia', snap.user.nomeFantasia);
            
            // Garantir que formaPagamento existe para o createUser funcionar
            if (!formData.get('formaPagamento')) {
                formData.append('formaPagamento', '0');
            }
            
            console.log('📝 Enviando sem imagem - usuarioCriadorId:', usuarioId);
            
            toast.promise(createUser(event, "usuarios/criar-usuario"), {
                loading: 'Cadastrando Agência...',
                success: () => {
                    revalidate("agencias");
                    setReference(true);
                    setImageReference(null);
                    setLoading(false);
                    formElement.reset();
                    planosForm.reset({
                        planoId: "",
                        planoValor: "",
                        comissao: "",
                        planoTaxa: "",
                        formaPagamento: "",
                        dataVencimentoFatura: "",
                        nomeFranquia: snap.user?.nomeFantasia || "",
                        saldoDinheiro: "",
                        saldoPermuta: "",
                    });
                    return "Agência Cadastrada com sucesso!";
                },
                error: (error) => {
                    setLoading(false);
                    console.error('❌ Erro no createUser:', error);
                    return `Erro: ${error.message}`;
                },
            });
        }
    }

    return (
        <div className="container">
            <div className="containerHeader">Cadastrar Agência</div>
            <Form {...planosForm}>
                <form onSubmit={(event) => formHandler(event)} className="containerForm">
                <div className="form-group f2">
                    <label className="required">Razão Social</label>
                    <input type="text" className="form-control" id="razaoSocial" name="razaoSocial" required />
                </div>
                <div className="form-group f2">
                    <label className="required">Nome Fantasia</label>
                    <input type="text" className="form-control" id="nomeFantasia" name="nomeFantasia" required />
                </div>
                <div className="form-group f2">
                    <label className="required">CNPJ</label>
                    <InputMask
                        mask="99.999.999/9999-99"
                        className="form-control"
                        type="text"
                        id="cnpj"
                        name="cnpj"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Insc. Estadual</label>
                    <input type="text" className="form-control" id="inscEstadual" name="inscEstadual" />
                </div>
                <div className="form-group">
                    <label>Insc. Municipal</label>
                    <input type="text" className="form-control" id="inscMunicipal" name="inscMunicipal" />
                </div>
                <div className="form-group">
                    <label className="required">Mostrar no site</label>
                    <select className="form-control" id="mostrarNoSite" name="mostrarNoSite" required>
                        <option value="" disabled>Selecionar</option>
                        <option value={true}>Sim</option>
                        <option value={false}>Não</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="required">Tipo</label>
                    <select
                        required
                        className="form-control"
                        name="tipo"
                        value={tipoSelecionado}
                        onChange={(event) => setTipoSelecionado(event.target.value)}
                    >
                        <option value="" disabled>Selecionar</option>
                        <option value="Agencia Comum">Comum</option>
                        <option value="Agencia Master">Master</option>
                    </select>
                </div>
                <div className="formDivider">
                    <p>Contato</p>
                </div>

                {/* ======================================================================================= */}
                {/* CONTATO */}
                {/* ======================================================================================= */}
                <div className="form-group f2">
                    <label className="required">Nome</label>
                    <input type="text" className="form-control" id="nomeContato" name="nomeContato" required />
                </div>
                <div className="form-group f2">
                    <label>Telefone</label>
                    <InputMask
                        mask="(99)9999-9999"
                        className="form-control"
                        type="text"
                        id="telefone"
                        name="telefone"
                    />
                </div>
                <div className="form-group f2">
                    <label className="required">Celular</label>
                    <InputMask
                        mask="(99)99999-9999"
                        className="form-control"
                        type="text"
                        id="celular"
                        name="celular"
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label className="required">E-mail</label>
                    <input type="email" className="form-control" id="emailContato" name="emailContato" required />
                </div>
                <div className="form-group f2">
                    <label>E-mail secundário</label>
                    <input type="email" className="form-control" id="emailSecundario" name="emailSecundario" />
                </div>

                {/* ======================================================================================= */}
                {/* ENDEREÇO */}
                {/* ======================================================================================= */}
                <div className="formDivider">
                    <p>Endereço</p>
                </div>
                <div className="form-group">
                    <label className="required">Logradouro</label>
                    <input type="text" className="form-control" id="logradouro" name="logradouro" required />
                </div>
                <div className="form-group">
                    <label className="required">Número</label>
                    <input type="number" className="form-control" id="numero" name="numero" required />
                </div>
                <div className="form-group">
                    <label className="required">CEP</label>
                    <InputMask
                        mask="99999-999"
                        className="form-control"
                        type="text"
                        id="cep"
                        name="cep"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Complemento</label>
                    <input type="text" className="form-control" id="complemento" name="complemento" />
                </div>
                <div className="form-group">
                    <label className="required">Bairro</label>
                    <input type="text" className="form-control" id="bairro" name="bairro" required />
                </div>
                <div className="form-group f2">
                    <label className="required">Cidade</label>
                    <input type="text" className="form-control" id="cidade" name="cidade" required />
                </div>
                <div className="form-group f1">
                    <label className="required">Estado</label>
                    <input type="text" className="form-control" id="estado" name="estado" required />
                </div>
                <div className="form-group">
                    <label>Região</label>
                    <input type="text" className="form-control" id="regiao" name="regiao" />
                </div>
                {/* ======================================================================================= */}
                {/* Unidade */}
                {/* ======================================================================================= */}
                <div className="formDivider">
                    <p>Unidade</p>
                </div>
                <Form_Agencia form={planosForm} type={"Agencias"} />
                {deveExibirOperacoes && (
                    <>
                        <div className="formDivider">
                            <p>Operações</p>
                        </div>
                        {/* ======================================================================================= */}
                        {/* Operações */}
                        {/* ======================================================================================= */}
                        <div className="form-group">
                            <label className="required">Limite Crédito</label>
                            <RealInput name="limiteCredito" placeholder="Insira o limite" reference={reference} required />
                        </div>
                        <div className="form-group">
                            <label className="required">Limite de Venda Mensal</label>
                            <RealInput name="limiteVendaMensal" placeholder="Insira o limite" reference={reference} required />
                        </div>
                        <div className="form-group">
                            <label className="required">Limite de Venda Total</label>
                            <RealInput name="limiteVendaTotal" placeholder="Insira o limite" reference={reference} required />
                        </div>
                        <div className="form-group">
                            <label className="required">Taxa repasse Matriz em %</label>
                            <input type="number" className="form-control" name="taxaRepasseMatriz" required />
                        </div>
                        <div className="form-group">
                            <label className="required">Tipo de Operação</label>
                            <select defaultValue={""} className="form-control" id="tipoOperacao" name="tipoOperacao" required>
                                <option value="" disabled>Selecionar</option>
                                <option value={1}>Compra</option>
                                <option value={2}>Venda</option>
                                <option value={3}>Compra/Venda</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="required">Aceita Orçamento</label>
                            <select defaultValue={""} className="form-control" id="aceitaOrcamento" name="aceitaOrcamento" required>
                                <option value="" disabled>Selecionar</option>
                                <option value={true}>Sim</option>
                                <option value={false}>Não</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="required">Aceita Voucher</label>
                            <select defaultValue={""} className="form-control" id="aceitaVoucher" name="aceitaVoucher" required>
                                <option value="" disabled>Selecionar</option>
                                <option value={true}>Sim</option>
                                <option value={false}>Não</option>
                            </select>
                        </div>
                    </>
                )}
                {/* ======================================================================================= */}
                {/* DADOS USUÁRIO */}
                {/* ======================================================================================= */}
                <div className="formDivider">
                    <p>Dados do usuário</p>
                </div>
                <div className="formImage">
                    <img src={imagemReference ? imagemReference : defaultImage} className="rounded float-left img-fluid" alt="..." id="imagem-selecionada" name="imagem-selecionada" />
                </div>
                <div className="form-group">
                    <label htmlFor="img_path" className="inputLabel">
                        <BiSolidImageAdd /> Selecione uma imagem
                        <input type="file" id="img_path" name="imagem" required accept="image/*" className="custom-file-input" onChange={(e) => imageReferenceHandler(e, setImageReference, setImagem)} />
                    </label>
                </div>
                <div className="form-group">
                    <label className="required">Nome</label>
                    <input type="text" className="form-control" id="nome" name="nome" required />
                </div>
                <div className="form-group">
                    <label className="required">Cpf</label>
                    <InputMask
                        mask="999.999.999-99"
                        className="form-control"
                        type="text"
                        id="cpf"
                        name="cpf"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="required ">E-mail</label>
                    <input type="email" className="form-control" id="email" name="email" required />
                </div>
                <div className="form-group">
                    <label className="required ">Senha</label>
                    <input type="password" className="form-control" id="password" name="senha" required />
                </div>
                {/* ======================================================================================= */}
                {/* DADOS USUÁRIO */}
                {/* ======================================================================================= */}
                <InvisibleInputs />
                <input type="hidden" name="gerente" value={getId()} />
                <input type="hidden" name="status" value="true" />
                <input type="hidden" name="usuarioCriadorId" value={getId()} />
                <input type="hidden" name="statusConta" value="true" />
                <input type="hidden" name="reputacao" value="0" />
                <input type="hidden" name="tipoDeMoeda" value="BRL" />
                <div className="buttonContainer">
                    {loading
                        ? <ColorRing
                            visible={loading}
                            height="33"
                            width="33"
                            ariaLabel="blocks-loading"
                            wrapperStyle={{}}
                            wrapperClass="blocks-wrapper"
                            colors={['#2d6cdf', '#2d6cdf', '#2d6cdf', '#2d6cdf', '#2d6cdf']}
                        />
                        : <button className="purpleBtn" type="submit">Cadastrar</button>}
                </div>
            </form>
        </Form>
        <Footer />
    </div>
    );
};

export default CadastrarAgencia;
