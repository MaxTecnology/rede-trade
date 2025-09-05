import { useEffect, useState } from "react";
import InputMask from 'react-input-mask';
import { createUser } from "@/hooks/ListasHook";
import { ColorRing } from 'react-loader-spinner'
import defaultImage from "@/assets/images/default_img.png"
import Footer from "@/components/Footer";
import { activePage } from "@/utils/functions/setActivePage";
import { BiSolidImageAdd } from "react-icons/bi";
import RealInput from "@/components/Inputs/CampoMoeda";
import { toast } from "sonner";
import InvisibleInputs from "@/components/Inputs/InvisibleInputs";
import { getId } from "@/hooks/getId";
import { imageReferenceHandler, debugFormData } from "@/utils/functions/formHandler";
import PlanosFields from "@/components/Form/PlanosFields";
import { useSnapshot } from "valtio";
import state from "@/store";
import useRevalidate from "@/hooks/ReactQuery/useRevalidate";
import ButtonMotion from "@/components/FramerMotion/ButtonMotion";

const GerentesCadastrar = () => {
    const snap = useSnapshot(state);
    const [reference, setReference] = useState(true)
    const [imagemReference, setImageReference] = useState(null);
    const [imagem, setImagem] = useState(null);
    const [loading, setLoading] = useState(false)

    // DEBUG: Verificar dados do usuário logado
    useEffect(() => {
        activePage("gerentes");
        
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

    const revalidate = useRevalidate()

    // Função para converter formato brasileiro para numérico
    const convertBrazilianToNumber = (value) => {
        if (!value) return '';
        return value.toString()
            .replace(/\./g, '')  // Remove pontos (separadores de milhares)
            .replace(',', '.');  // Troca vírgula por ponto (decimal)
    };

    const formHandler = (event) => {
        event.preventDefault();
        setReference(false);
        setLoading(true);
        
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
            formDataLimpo.append('nome', formOriginal.get('nome') || '');
            formDataLimpo.append('cpf', formOriginal.get('cpf') || '');
            formDataLimpo.append('email', formOriginal.get('email') || '');
            formDataLimpo.append('senha', formOriginal.get('senha') || '');
            formDataLimpo.append('tipo', 'Gerente');
            formDataLimpo.append('statusConta', 'true');
            formDataLimpo.append('reputacao', '0');
            formDataLimpo.append('tipoDeMoeda', 'BRL');
            formDataLimpo.append('status', 'true');
            
            // CAMPOS CRÍTICOS - usuarioCriadorId e relacionados
            formDataLimpo.append('usuarioCriadorId', usuarioId.toString());
            
            // Campos opcionais do formulário
            const camposOpcionais = [
                'razaoSocial', 'nomeFantasia', 'cnpj', 'inscEstadual', 'inscMunicipal',
                'nomeContato', 'telefone', 'celular', 'emailContato', 'emailSecundario',
                'logradouro', 'numero', 'cep', 'complemento', 'bairro', 'cidade', 
                'estado', 'regiao', 'aceitaOrcamento', 'aceitaVoucher', 'tipoOperacao',
                'dataVencimentoFatura', 'limiteCredito', 'taxaGerente', 'planoId'
            ];
            
            camposOpcionais.forEach(campo => {
                const valor = formOriginal.get(campo);
                if (valor && valor.toString().trim() !== '') {
                    // Converter valores monetários para formato numérico (apenas limiteCredito)
                    if (campo === 'limiteCredito') {
                        const valorConvertido = convertBrazilianToNumber(valor);
                        formDataLimpo.append(campo, valorConvertido);
                        console.log(`💰 ${campo}: ${valor} → ${valorConvertido}`);
                    } else {
                        formDataLimpo.append(campo, valor);
                    }
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
                    console.log('✅ Resposta do servidor:', data);
                    
                    return data;
                } catch (error) {
                    console.error('❌ Erro completo:', error);
                    throw error;
                }
            };
    
            toast.promise(createUserWithImage(), {
                loading: 'Cadastrando Gerente...',
                success: () => {
                    setReference(true);
                    setImagem(null);
                    setImageReference(null);
                    setLoading(false);
                    revalidate("gerentes");
                    event.target.reset();
                    return "Gerente Cadastrado com sucesso!";
                },
                error: (error) => {
                    setReference(true);
                    setLoading(false);
                    console.error('❌ Erro no toast:', error);
                    return `Erro: ${error.message}`;
                },
            });
        } else {
            // Método para quando não há imagem - CORRIGIDO
            const formData = new FormData(event.target);
            
            // Converter valores monetários para formato numérico (apenas limiteCredito)
            const limiteCredito = formData.get('limiteCredito');
            
            if (limiteCredito) {
                const limiteCreditoConvertido = convertBrazilianToNumber(limiteCredito);
                formData.set('limiteCredito', limiteCreditoConvertido);
                console.log(`💰 limiteCredito: ${limiteCredito} → ${limiteCreditoConvertido}`);
            }
            
            // Adicionar campos obrigatórios que podem estar faltando
            formData.append('tipo', 'Gerente');
            formData.append('usuarioCriadorId', usuarioId.toString());
            formData.append('statusConta', 'true');
            formData.append('reputacao', '0');
            formData.append('tipoDeMoeda', 'BRL');
            formData.append('status', 'true');
            
            console.log('📝 Enviando sem imagem - usuarioCriadorId:', usuarioId);
            
            toast.promise(createUser(event, "usuarios/criar-usuario"), {
                loading: 'Cadastrando Gerente...',
                success: () => {
                    revalidate("gerentes");
                    setReference(true);
                    setImageReference(null);
                    setLoading(false);
                    return "Gerente Cadastrado com sucesso!";
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
            <div className="containerHeader">Novo Gerente</div>
            <form onSubmit={formHandler} className="containerForm">
                <div className="form-group f4">
                    <label>Razão Social</label>
                    <input type="text" className="form-control" name="razaoSocial" />
                </div>
                <div className="form-group f4">
                    <label>Nome Fantasia</label>
                    <input type="text" className="form-control" name="nomeFantasia" />
                </div>
                <div className="form-group f2">
                    <label>CNPJ</label>
                    <InputMask
                        mask="99.999.999/9999-99"
                        className="form-control"
                        type="text"
                        name="cnpj"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Insc. Estadual</label>
                    <input type="text" className="form-control" name="inscEstadual" />
                </div>
                <div className="form-group">
                    <label>Insc. Municipal</label>
                    <input type="text" className="form-control" name="inscMunicipal" />
                </div>
                
                <div className="formDivider">
                    <p>Contato</p>
                </div>
                
                <div className="form-group f2">
                    <label className="required">Nome</label>
                    <input type="text" className="form-control" name="nomeContato" required />
                </div>
                <div className="form-group f2">
                    <label>Telefone</label>
                    <InputMask
                        mask="(99)9999-9999"
                        className="form-control"
                        type="text"
                        name="telefone"
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label className="required">Celular</label>
                    <InputMask
                        mask="(99)99999-9999"
                        className="form-control"
                        type="text"
                        name="celular"
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label className="required">E-mail</label>
                    <input type="email" className="form-control" name="emailContato" required />
                </div>
                <div className="form-group f2">
                    <label>E-mail secundário</label>
                    <input type="email" className="form-control" name="emailSecundario" />
                </div>
                
                <div className="formDivider">
                    <p>Endereço</p>
                </div>
                
                <div className="form-group">
                    <label className="required">Logradouro</label>
                    <input type="text" className="form-control" name="logradouro" required />
                </div>
                <div className="form-group">
                    <label className="required">Número</label>
                    <input type="number" className="form-control" name="numero" required />
                </div>
                <div className="form-group">
                    <label className="required">CEP</label>
                    <InputMask
                        mask="99999-999"
                        className="form-control"
                        type="text"
                        name="cep"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Complemento</label>
                    <input type="text" className="form-control" name="complemento" />
                </div>
                <div className="form-group">
                    <label className="required">Bairro</label>
                    <input type="text" className="form-control" name="bairro" required />
                </div>
                <div className="form-group f2">
                    <label className="required">Cidade</label>
                    <input type="text" className="form-control" name="cidade" required />
                </div>
                <div className="form-group f1">
                    <label className="required">Estado</label>
                    <input type="text" className="form-control" name="estado" required />
                </div>
                <div className="form-group">
                    <label>Região</label>
                    <input type="text" className="form-control" name="regiao" />
                </div>
                
                <div className="formDivider">
                    <p>Unidade</p>
                </div>
                
                <PlanosFields type={"Gerente"} />
                <div className="form-group">
                    <label className="required">Nome da Agência</label>
                    <input 
                        type="text" 
                        className="readOnly" 
                        readOnly 
                        required 
                        value={snap.user.nomeFantasia} />
                </div>
                <div className="form-group">
                    <label className="required">Tipo de Operação</label>
                    <select defaultValue={""} className="form-control" name="tipoOperacao">
                        <option value="" disabled>Selecionar</option>
                        <option value={1}>Compra</option>
                        <option value={2}>Venda</option>
                        <option value={3}>Compra/Venda</option>
                    </select>
                </div>
                
                <div className="formDivider">
                    <p>Operações</p>
                </div>
                
                <div className="form-group f2">
                    <label className="required">Limite Crédito</label>
                    <RealInput name="limiteCredito" placeholder="Insira o limite" reference={reference} required />
                </div>
                <div className="form-group f2">
                    <label className="required">Taxa em % do Gerente</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="form-control"
                        name="taxaGerente"
                        placeholder="Ex: 21.65"
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label className="required">Data Vencimento Fatura</label>
                    <select required className="form-control" name="dataVencimentoFatura">
                        <option value="" disabled>Selecionar</option>
                        <option>10</option>
                        <option>20</option>
                        <option>30</option>
                    </select>
                </div>
                <div className="form-group f2">
                    <label className="required">Aceita Orçamento</label>
                    <select defaultValue={""} className="form-control" name="aceitaOrcamento">
                        <option value="" disabled>Selecionar</option>
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                    </select>
                </div>
                <div className="form-group f2">
                    <label className="required">Aceita Voucher</label>
                    <select defaultValue={""} className="form-control" name="aceitaVoucher">
                        <option value="" disabled>Selecionar</option>
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                    </select>
                </div>
                
                <div className="formDivider">
                    <p>Dados do usuário</p>
                </div>
                
                <div className="formImage">
                    <img 
                        src={imagemReference || defaultImage} 
                        className="rounded float-left img-fluid" 
                        alt="Foto do usuário" 
                        id="imagem-selecionada" 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="img_path" className="inputLabel">
                        <BiSolidImageAdd /> Selecione uma imagem
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="custom-file-input" 
                            id="img_path" 
                            onChange={(e) => imageReferenceHandler(e, setImageReference, setImagem)} 
                            name="imagem" 
                        />
                    </label>
                </div>
                
                {/* {imagem && (
                    <div className="form-group">
                        <small className="text-muted">
                            📎 Arquivo selecionado: {imagem.name} ({(imagem.size / 1024 / 1024).toFixed(2)}MB)
                        </small>
                    </div>
                )} */}
                
                <div className="form-group">
                    <label className="required">Nome</label>
                    <input type="text" className="form-control" name="nome" required />
                </div>
                <div className="form-group">
                    <label className="required">Cpf</label>
                    <InputMask
                        mask="999.999.999-99"
                        className="form-control"
                        type="text"
                        name="cpf"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="required">E-mail</label>
                    <input type="email" className="form-control" name="email" required />
                </div>
                <div className="form-group">
                    <label className="required">Senha</label>
                    <input type="password" className="form-control" name="senha" required />
                </div>
                
                <InvisibleInputs />
                <input type="hidden" name="tipo" value="Gerente" />
                <input type="hidden" name="gerente" value={getId()} />
                <input type="hidden" name="status" value="true" />
                <input type="hidden" name="usuarioCriadorId" value={getId()} />
                <input type="hidden" name="nomeFranquia" value={snap.user.nomeFantasia} />
                
                {/* DEBUG - vamos ver se os valores estão corretos */}
                <div style={{display: 'none'}}>
                    Debug: usuarioId = {getId()}, nomeFantasia = {snap.user.nomeFantasia}
                </div>
                
                <div className="buttonContainer">
                    {loading ? (
                        <ColorRing
                            visible={loading}
                            height="80"
                            width="80"
                            ariaLabel="blocks-loading"
                            colors={['#2d6cdf', '#2d6cdf', '#2d6cdf', '#2d6cdf', '#2d6cdf']}
                        />
                    ) : (
                        <ButtonMotion type="submit" className="purpleBtn" disabled={!reference}>
                            {reference ? 'Cadastrar' : 'Cadastrando...'}
                        </ButtonMotion>
                    )}
                </div>
            </form>
            <Footer />
        </div>
    );
};

export default GerentesCadastrar;