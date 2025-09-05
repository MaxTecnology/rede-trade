import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Mascaras from '@/hooks/Mascaras';
import { editUser } from '@/hooks/ListasHook';
import { closeModal } from '@/hooks/Functions';
import { GrFormClose } from "react-icons/gr";
import { BiSolidImageAdd } from 'react-icons/bi';
import RealInput from '@/components/Inputs/CampoMoeda';
import PlanosFields from '@/components/Form/PlanosFields';
import { toast } from 'sonner';
import useRevalidate from '@/hooks/ReactQuery/useRevalidate';
import { imageReferenceHandler, formHandlerComImagem, debugFormData } from '@/utils/functions/formHandler';
import InputMask from 'react-input-mask';
import defaultImage from "@/assets/images/default_img.png"

const EditarGerenteModal = ({ isOpen, modalToggle, associadoInfo }) => {
    const [imagemReference, setImageReference] = useState(null);
    const [imagem, setImagem] = useState(null);
    const [reference, setReference] = useState(true);
    const [error, setError] = useState(false);
    const [sucess, setSucess] = useState(false);
    const info = associadoInfo || {};

    useEffect(() => {
        if (isOpen && info) {
            Mascaras();
            
            // Construir URL completa da imagem
            let imageUrl = defaultImage;
            
            if (info.imagem) {
                if (info.imagem.startsWith('http')) {
                    imageUrl = info.imagem;
                } else if (info.imagem.startsWith('/uploads')) {
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
                    imageUrl = `${baseUrl}${info.imagem}`;
                } else {
                    imageUrl = defaultImage;
                }
            }
            
            setImageReference(imageUrl);
            setImagem(null);
        }
    }, [info.imagem, isOpen]);

    const revalidate = useRevalidate();

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
        
        // LÓGICA UNIFICADA: Sempre usar a mesma rota
        const updateUser = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
                const url = `${baseUrl}/usuarios/atualizar-usuario-completo/${info.idUsuario}`;
                
                // Obter token
                let token = localStorage.getItem('tokenRedeTrade') || 
                           localStorage.getItem('token') || 
                           localStorage.getItem('authToken');
                
                if (!token) {
                    const allKeys = Object.keys(localStorage);
                    const tokenKey = allKeys.find(key => key.toLowerCase().includes('token'));
                    if (tokenKey) token = localStorage.getItem(tokenKey);
                }
                
                if (!token) {
                    throw new Error('Token de autenticação não encontrado. Faça login novamente.');
                }
    
                // SEMPRE usar FormData
                const formData = new FormData(event.target);
                
                // Converter valores monetários para formato numérico (apenas limiteCredito)
                const limiteCredito = formData.get('limiteCredito');
                
                if (limiteCredito) {
                    const limiteCreditoConvertido = convertBrazilianToNumber(limiteCredito);
                    formData.set('limiteCredito', limiteCreditoConvertido);
                    console.log(`💰 limiteCredito: ${limiteCredito} → ${limiteCreditoConvertido}`);
                }
                
                // CORREÇÃO: Remover duplicações de tipo e campos hidden problemáticos
                formData.delete('tipo'); // Remover todos os tipos
                formData.append('tipo', 'Gerente'); // Adicionar apenas um
                
                // Adicionar apenas campos essenciais
                if (info.idUsuario) {
                    formData.append('idUsuario', info.idUsuario.toString());
                }
                
                // CORREÇÃO: Só adicionar imagem se uma nova foi selecionada
                if (imagem) {
                    formData.append('imagem', imagem);
                    console.log('📸 Nova imagem será enviada:', imagem.name);
                } else {
                    console.log('📷 Nenhuma nova imagem - mantendo a atual');
                }
    
                // Log para debug
                console.log('🔍 Dados que serão enviados:');
                for (let [key, value] of formData.entries()) {
                    if (key === 'imagem') {
                        console.log(`${key}: [File] ${value.name || 'N/A'}`);
                    } else {
                        console.log(`${key}: ${value}`);
                    }
                }
                
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                        // NÃO incluir Content-Type quando usando FormData
                    },
                    body: formData
                });
    
                if (!response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
                    } else {
                        const errorText = await response.text();
                        throw new Error(`Erro ${response.status}: ${errorText}`);
                    }
                }
    
                const data = await response.json();
                console.log('✅ Gerente atualizado com sucesso:', data);
                return data;
            } catch (error) {
                console.error('❌ Erro ao atualizar gerente:', error);
                throw error;
            }
        };
    
        toast.promise(updateUser(), {
            loading: 'Editando Gerente...',
            success: () => {
                setReference(true);
                setImagem(null);
                modalToggle();
                revalidate("gerentes");
                return "Gerente editado com sucesso!";
            },
            error: (error) => {
                setReference(true);
                return `Erro: ${error.message}`;
            },
        });
    };

    if (!info || !isOpen) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => closeModal(modalToggle, setSucess, setError)}
            contentLabel="Editar Gerente"
            className="modalContainer modalAnimationUser"
            overlayClassName="modalOverlay modalAnimationUserOverlay"
        >
            <div className='modalEditHeader'>
                <p>Editar Gerente</p>
                <GrFormClose onClick={() => closeModal(modalToggle, setSucess, setError)} />
            </div>
            <form onSubmit={formHandler} className="containerForm">
                {/* Dados da Empresa */}
                <div className="form-group f4">
                    <label className="required-field-label">Razão Social</label>
                    <input
                        defaultValue={info.razaoSocial || ''}
                        type="text"
                        className="form-control"
                        name="razaoSocial"
                        required
                    />
                </div>
                <div className="form-group f4">
                    <label className="required-field-label">Nome Fantasia</label>
                    <input
                        defaultValue={info.nomeFantasia || ''}
                        type="text"
                        className="form-control"
                        name="nomeFantasia"
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label className="required-field-label">CNPJ</label>
                    <InputMask
                        mask="99.999.999/9999-99"
                        defaultValue={info.cnpj || ''}
                        className="form-control"
                        type="text"
                        name="cnpj"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Insc. Estadual</label>
                    <input
                        defaultValue={info.inscEstadual || ''}
                        type="text"
                        className="form-control"
                        name="inscEstadual"
                    />
                </div>
                <div className="form-group">
                    <label>Insc. Municipal</label>
                    <input
                        defaultValue={info.inscMunicipal || ''}
                        type="text"
                        className="form-control"
                        name="inscMunicipal"
                    />
                </div>

                {/* Contato */}
                <div className="formDivider">
                    <p>Contato</p>
                </div>
                <div className="form-group f2">
                    <label className="required-field-label">Nome</label>
                    <input
                        defaultValue={info.nomeContato || ''}
                        type="text"
                        className="form-control"
                        name="nomeContato"
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label>Telefone</label>
                    <InputMask
                        mask="(99)9999-9999"
                        defaultValue={info.telefone || ''}
                        className="form-control"
                        type="text"
                        name="telefone"
                    />
                </div>
                <div className="form-group f2">
                    <label className="required-field-label">Celular</label>
                    <InputMask
                        mask="(99)99999-9999"
                        defaultValue={info.celular || ''}
                        className="form-control"
                        type="text"
                        name="celular"
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label className="required-field-label">E-mail</label>
                    <input
                        defaultValue={info.emailContato || ''}
                        type="email"
                        className="form-control"
                        name="emailContato"
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label>E-mail secundário</label>
                    <input
                        defaultValue={info.emailSecundario || ''}
                        type="email"
                        className="form-control"
                        name="emailSecundario"
                    />
                </div>

                {/* Endereço */}
                <div className="formDivider">
                    <p>Endereço</p>
                </div>
                <div className="form-group">
                    <label className="required-field-label">Logradouro</label>
                    <input
                        defaultValue={info.logradouro || ''}
                        type="text"
                        className="form-control"
                        name="logradouro"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="required-field-label">Número</label>
                    <input
                        defaultValue={info.numero || ''}
                        type="number"
                        className="form-control"
                        name="numero"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="required-field-label">CEP</label>
                    <InputMask
                        mask="99999-999"
                        defaultValue={info.cep || ''}
                        className="form-control"
                        type="text"
                        name="cep"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Complemento</label>
                    <input
                        defaultValue={info.complemento || ''}
                        type="text"
                        className="form-control"
                        name="complemento"
                    />
                </div>
                <div className="form-group">
                    <label className="required-field-label">Bairro</label>
                    <input
                        defaultValue={info.bairro || ''}
                        type="text"
                        className="form-control"
                        name="bairro"
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label className="required-field-label">Cidade</label>
                    <input
                        defaultValue={info.cidade || ''}
                        type="text"
                        className="form-control"
                        name="cidade"
                        required
                    />
                </div>
                <div className="form-group f1">
                    <label className="required-field-label">Estado</label>
                    <input
                        defaultValue={info.estado || ''}
                        type="text"
                        className="form-control"
                        name="estado"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Região</label>
                    <input
                        defaultValue={info.regiao || ''}
                        type="text"
                        className="form-control"
                        name="regiao"
                    />
                </div>

                {/* Unidade */}
                <div className="formDivider">
                    <p>Unidade</p>
                </div>
                <PlanosFields type={"Gerente"} defaultValue={info} />
                <div className="form-group">
                    <label className="required">Nome da Agência</label>
                    <input 
                        type="text" 
                        className="readOnly" 
                        readOnly 
                        required 
                        value={info.matriz?.nomeFantasia || info.conta?.nomeFranquia || ''} 
                    />
                </div>

                {/* Operações */}
                <div className="formDivider">
                    <p>Operações</p>
                </div>
                <div className="form-group f2">
                    <label className="required-field-label">Limite Crédito</label>
                    <RealInput
                        defaultValue={info.conta?.limiteCredito}
                        name="limiteCredito"
                        placeholder="Insira o limite"
                        reference={reference}
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label className="required-field-label">Taxa em % do Gerente</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        defaultValue={info?.taxaComissaoGerente || info.taxaGerente || ''}
                        className="form-control"
                        name="taxaGerente"
                        placeholder="Ex: 21.65"
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label className="required-field-label">Data Vencimento Fatura</label>
                    <select 
                        defaultValue={info.conta.dataVencimentoFatura || ''} 
                        className="form-control" 
                        name="dataVencimentoFatura"
                        required
                    >
                        <option value="" disabled>Selecionar</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                    </select>
                </div>
                <div className="form-group f2">
                    <label className="required">Tipo de Operação</label>
                    <select 
                        defaultValue={info.tipoOperacao || ''} 
                        className="form-control" 
                        name="tipoOperacao"
                        required
                    >
                        <option value="" disabled>Selecionar</option>
                        <option value="1">Compra</option>
                        <option value="2">Venda</option>
                        <option value="3">Compra/Venda</option>
                    </select>
                </div>
                <div className="form-group f2">
                    <label className="required">Aceita Orçamento</label>
                    <select 
                        defaultValue={info.aceitaOrcamento !== undefined ? info.aceitaOrcamento.toString() : ''} 
                        className="form-control" 
                        name="aceitaOrcamento"
                        required
                    >
                        <option value="" disabled>Selecionar</option>
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                    </select>
                </div>
                <div className="form-group f2">
                    <label className="required">Aceita Voucher</label>
                    <select 
                        defaultValue={info.aceitaVoucher !== undefined ? info.aceitaVoucher.toString() : ''} 
                        className="form-control" 
                        name="aceitaVoucher"
                        required
                    >
                        <option value="" disabled>Selecionar</option>
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                    </select>
                </div>

                {/* Dados do usuário */}
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
                        <BiSolidImageAdd /> Alterar imagem (opcional)
                        <input
                            type="file"
                            accept="image/*"
                            className="custom-file-input"
                            id="img_path"
                            name="imagemFile" // MUDANÇA: nome diferente para evitar conflito
                            onChange={(e) => imageReferenceHandler(e, setImageReference, setImagem)}
                        />
                    </label>
                </div>
                {imagem && (
                    <div className="form-group">
                        <small className="text-success">
                            ✅ Nova imagem selecionada: {imagem.name} ({(imagem.size / 1024 / 1024).toFixed(2)}MB)
                        </small>
                    </div>
                )}
                {imagem && (
                    <div className="form-group">
                        <small style={{ 
                            color: '#000', 
                            display: 'block',
                            textAlign: 'left',
                            marginTop: '5px',
                            fontSize: '12px'
                        }}>
                            ✅ Nova imagem selecionada: {imagem.name} ({(imagem.size / 1024 / 1024).toFixed(2)}MB)
                        </small>
                    </div>
                )}
                <div className="form-group">
                    <label className="required-field-label">Nome</label>
                    <input
                        defaultValue={info.nome || ''}
                        type="text"
                        className="form-control"
                        name="nome"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="required-field-label">CPF</label>
                    <InputMask
                        mask="999.999.999-99"
                        defaultValue={info.cpf || ''}
                        className="form-control"
                        type="text"
                        name="cpf"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="required-field-label">E-mail</label>
                    <input
                        defaultValue={info.email || ''}
                        type="email"
                        className="form-control"
                        name="email"
                        required
                    />
                </div>

                {/* Campos hidden */}
                <input type="hidden" name="tipo" value="Gerente" />
                <input type="hidden" name="gerente" value={info.conta?.gerenteContaId || ''} />
                <input type="hidden" name="contaId" value={info.conta?.idConta || ''} />
                <input type="hidden" name="idUsuario" value={info.idUsuario || ''} />

                <div className="buttonContainer">
                    <button 
                        className='modalButtonClose' 
                        type='button' 
                        onClick={() => closeModal(modalToggle, setSucess, setError)}
                    >
                        Fechar
                    </button>
                    <button 
                        className='modalButtonSave' 
                        type="submit" 
                        disabled={!reference}
                    >
                        {reference ? 'Salvar alterações' : 'Salvando...'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditarGerenteModal;