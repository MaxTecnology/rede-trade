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

const EditarAgenciaModal = ({ isOpen, modalToggle, associadoInfo }) => {
    const [imagemReference, setImageReference] = useState(null);
    const [imagem, setImagem] = useState(null); // NOVO: Para armazenar o arquivo
    const [reference, setReference] = useState(true)
    const [error, setError] = useState(false)
    const [sucess, setSucess] = useState(false)
    const info = associadoInfo || {}; // Proteção contra undefined

    useEffect(() => {
        if (isOpen && info) {
            Mascaras();
            
            // Construir URL completa da imagem
            let imageUrl = defaultImage; // Fallback padrão
            
            if (info.imagem) {
                if (info.imagem.startsWith('http')) {
                    // URL completa (ex: http://exemplo.com/imagem.jpg)
                    imageUrl = info.imagem;
                } else if (info.imagem.startsWith('/uploads')) {
                    // Caminho relativo do servidor (ex: /uploads/images/123.jpg)
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
                    imageUrl = `${baseUrl}${info.imagem}`;
                } else {
                    // Outros casos - manter URL padrão
                    imageUrl = defaultImage;
                }
                
                console.log('🖼️ URL da imagem construída:', imageUrl);
            }
            
            setImageReference(imageUrl);
            setImagem(null); // Reset do arquivo quando abrir modal
        }
    }, [info.imagem, isOpen]);

    const revalidate = useRevalidate()

    const formHandler = (event) => {
        event.preventDefault();
        setReference(false);
        
        // Se há imagem, usar FormData. Senão, usar método original
        if (imagem) {
            // NOVO: Usar formHandlerComImagem para processar FormData
            const formData = formHandlerComImagem(new FormData(event.target), imagem);
            
            // IMPORTANTE: Adicionar campos que podem estar faltando
            formData.append('tipo', 'Agencia'); // Força o tipo
            
            // Debug opcional - descomente se precisar debugar
            // debugFormData(formData);
            
            // NOVO: Função para update com imagem
            const updateUserWithImage = async () => {
                try {
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
                    
                    // Usar a rota de atualizar-usuario-completo que funciona
                    const url = `${baseUrl}/usuarios/atualizar-usuario-completo/${info.idUsuario}`;
                    
                    // Obter token do localStorage
                    let token = localStorage.getItem('tokenRedeTrade') || 
                               localStorage.getItem('token') || 
                               localStorage.getItem('authToken') || 
                               localStorage.getItem('accessToken') ||
                               sessionStorage.getItem('token') ||
                               sessionStorage.getItem('authToken');
                    
                    if (!token) {
                        // Tentar pegar de qualquer chave que contenha "token"
                        const allKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
                        const tokenKey = allKeys.find(key => key.toLowerCase().includes('token'));
                        if (tokenKey) {
                            token = localStorage.getItem(tokenKey) || sessionStorage.getItem(tokenKey);
                        }
                    }
                    
                    if (!token) {
                        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
                    }
                    
                    // Opcional: logs para debug
                    // console.log('🔗 Fazendo requisição para:', url);
                    
                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });

                    // console.log('📡 Status da resposta:', response.status);

                    if (!response.ok) {
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            const errorData = await response.json();
                            // console.log('❌ Erro do servidor:', errorData);
                            throw new Error(errorData.error || `Erro HTTP ${response.status}`);
                        } else {
                            const errorText = await response.text();
                            // console.log('❌ Resposta do servidor (texto):', errorText);
                            throw new Error(`Erro ${response.status}: ${errorText}`);
                        }
                    }

                    const data = await response.json();
                    // console.log('✅ Resposta do servidor:', data);
                    
                    return data;
                } catch (error) {
                    console.error('❌ Erro completo:', error);
                    
                    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
                        throw new Error('Servidor retornou resposta inválida. Verifique se a API está funcionando.');
                    }
                    
                    if (error.message.includes('404')) {
                        throw new Error('Rota não encontrada. Verifique se o servidor está rodando corretamente.');
                    }
                    
                    if (error.message.includes('401')) {
                        throw new Error('Token inválido ou expirado. Faça login novamente.');
                    }
                    
                    if (error.message.includes('500')) {
                        throw new Error('Erro interno do servidor. Verifique os logs do backend.');
                    }
                    
                    throw error;
                }
            };

            // Toast com a nova função
            toast.promise(updateUserWithImage(), {
                loading: 'Editando Agência...',
                success: () => {
                    setReference(true);
                    setImagem(null);
                    modalToggle();
                    revalidate("agencias");
                    return "Agência editada com sucesso!";
                },
                error: (error) => {
                    setReference(true);
                    return <b>{error.message}</b>;
                },
            });
        } else {
            // Usar método original se não há imagem
            toast.promise(editUser(event), {
                loading: 'Editando Agência...',
                success: () => {
                    setReference(true);
                    modalToggle();
                    revalidate("agencias");
                    return "Agência editada com sucesso!";
                },
                error: (error) => {
                    setReference(true);
                    return <b>{error.message}</b>;
                },
            });
        }
    }

    // Proteção contra dados undefined
    if (!info || !isOpen) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => closeModal(modalToggle, setSucess, setError)}
            contentLabel="Editar Agência"
            className="modalContainer modalAnimationUser"
            overlayClassName="modalOverlay modalAnimationUserOverlay"
        >
            <div className='modalEditHeader'>
                <p>Editar Agência</p>
                <GrFormClose onClick={() => closeModal(modalToggle, setSucess, setError)} />
            </div>
            <form onSubmit={(event) => formHandler(event)} className="containerForm">
                <div className="form-group">
                    <label className="required-field-label">Razão Social</label>
                    <input
                        defaultValue={info.razaoSocial || ''}
                        type="text"
                        className="form-control"
                        id="razaoSocial"
                        name="razaoSocial"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="required-field-label">Nome Fantasia</label>
                    <input
                        defaultValue={info.nomeFantasia || ''}
                        type="text"
                        className="form-control"
                        id="nomeFantasia"
                        name="nomeFantasia"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="required-field-label">CNPJ</label>
                    <InputMask
                        mask="99.999.999/9999-99"
                        defaultValue={info.cnpj || ''}
                        className="form-control"
                        type="text"
                        id="cnpj"
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
                        id="inscEstadual"
                        name="inscEstadual"
                    />
                </div>
                <div className="form-group">
                    <label>Insc. Municipal</label>
                    <input
                        defaultValue={info.inscMunicipal || ''}
                        type="text"
                        className="form-control"
                        id="inscMunicipal"
                        name="inscMunicipal"
                    />
                </div>
                <div className="form-group">
                    <label>Mostrar no site</label>
                    <select defaultValue={info.mostrarNoSite !== undefined ? info.mostrarNoSite.toString() : ''} className="form-control" id="mostrarNoSite" name="mostrarNoSite" required>
                        <option value="" disabled>Selecionar</option>
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Tipo</label>
                    <select defaultValue={info.tipo || ''} className="form-control" id="tipo" name="tipo" required>
                        <option value="" disabled>Selecionar</option>
                        <option value="Comum">Comum</option>
                        <option value="Master">Master</option>
                        <option value="Matriz">Matriz</option>
                    </select>
                </div>
                <div className="formDivider">
                    <p>Contato</p>
                </div>
                {/* CONTATO */}
                <div className="form-group f2">
                    <label className="required-field-label">Nome</label>
                    <input
                        defaultValue={info.nomeContato || ''}
                        type="text"
                        className="form-control"
                        id="nomeContato"
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
                        id="telefone"
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
                        id="celular"
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
                        id="emailContato"
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
                        id="emailSecundario"
                        name="emailSecundario"
                    />
                </div>
                {/* ENDEREÇO */}
                <div className="formDivider">
                    <p>Endereço</p>
                </div>
                <div className="form-group">
                    <label className="required-field-label">Logradouro</label>
                    <input
                        defaultValue={info.logradouro || ''}
                        type="text"
                        className="form-control"
                        id="logradouro"
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
                        id="numero"
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
                        id="cep"
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
                        id="complemento"
                        name="complemento"
                    />
                </div>
                <div className="form-group">
                    <label className="required-field-label">Bairro</label>
                    <input
                        defaultValue={info.bairro || ''}
                        type="text"
                        className="form-control"
                        id="bairro"
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
                        id="cidade"
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
                        id="estado"
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
                        id="regiao"
                        name="regiao"
                    />
                </div>
                {/* Unidade */}
                <div className="formDivider">
                    <p>Unidade</p>
                </div>
                <PlanosFields type={"Agencias"} defaultValue={info} />
                <div className="form-group">
                    <label className="required-field-label">Nome Franquia</label>
                    <input
                        type="text"
                        className="form-control"
                        defaultValue={info.conta?.nomeFranquia || ''}
                        id="nomeFranquia"
                        name="nomeFranquia"
                        required
                    />
                </div>
                <div className="formDivider">
                    <p>Operações</p>
                </div>
                {/* Operações */}
                <div className="form-group f2">
                    <label className="required-field-label f2">Limite Crédito</label>
                    <RealInput
                        defaultValue={info.conta?.limiteCredito || ''}
                        name="limiteCredito"
                        placeholder="Insira o limite"
                        reference={reference}
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label className="required-field-label">Limite de Venda Mensal</label>
                    <RealInput
                        defaultValue={info.conta?.limiteVendaMensal || ''}
                        name="limiteVendaMensal"
                        placeholder="Insira o limite"
                        reference={reference}
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label className="required-field-label">Limite de Venda Total</label>
                    <RealInput
                        defaultValue={info.conta?.limiteVendaTotal || ''}
                        name="limiteVendaTotal"
                        placeholder="Insira o limite"
                        reference={reference}
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label className="required-field-label">Taxa repasse Matriz em %</label>
                    <input
                        type="number"
                        defaultValue={info.conta?.taxaRepasseMatriz || ''}
                        className="form-control"
                        id="taxaRepasseMatriz"
                        name="taxaRepasseMatriz"
                        required
                    />
                </div>
                <div className="form-group f2">
                    <label>Data Vencimento Fatura</label>
                    <select
                        defaultValue={info.dataVencimentoFatura || ''}
                        className="form-control"
                        id="dataVencimentoFatura"
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
                        id="tipoOperacao"
                        name="tipoOperacao"
                        required
                    >
                        <option value="" disabled>Selecionar</option>
                        <option value={1}>Compra</option>
                        <option value={2}>Venda</option>
                        <option value={3}>Compra/Venda</option>
                    </select>
                </div>
                <div className="form-group f2">
                    <label className="required">Aceita Orçamento</label>
                    <select
                        defaultValue={info.aceitaOrcamento !== undefined ? info.aceitaOrcamento.toString() : ''}
                        className="form-control"
                        id="aceitaOrcamento"
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
                        id="aceitaVoucher"
                        name="aceitaVoucher"
                        required
                    >
                        <option value="" disabled>Selecionar</option>
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                    </select>
                </div>
                {/* DADOS USUÁRIO */}
                <div className="formDivider">
                    <p>Dados do usuário</p>
                </div>
                <div className="formImage">
                    <img
                        src={imagemReference || defaultImage}
                        className="rounded float-left img-fluid"
                        alt="Foto do usuário"
                        id="imagem-selecionada"
                        name="imagem-selecionada"
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
                            name="imagem"
                            onChange={(e) => imageReferenceHandler(e, setImageReference, setImagem)}
                        />
                    </label>
                </div>
                {/* NOVO: Mostrar nome do arquivo selecionado */}
                {/* {imagem && (
                    <div className="form-group">
                        <small className="text-muted">
                            📎 Arquivo selecionado: {imagem.name} ({(imagem.size / 1024 / 1024).toFixed(2)}MB)
                        </small>
                    </div>
                )} */}
                <div className="form-group">
                    <label className="required-field-label">Nome</label>
                    <input
                        defaultValue={info.nome || ''}
                        type="text"
                        className="form-control"
                        id="nome"
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
                        id="cpf"
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
                        id="email"
                        name="email"
                        required
                    />
                </div>
                {/* CAMPOS OCULTOS */}
                <input type="hidden" name="gerente" value={info.conta?.gerenteContaId || ''} />
                <input type="hidden" name="contaId" value={info.conta?.idConta || ''} />
                <input type="hidden" name="idUsuario" value={info.idUsuario || ''} />

                <div className="buttonContainer">
                    <button className='modalButtonClose' type='button' onClick={() => closeModal(modalToggle, setSucess, setError)} >
                        Fechar
                    </button>
                    <button className='modalButtonSave' type="submit" disabled={!reference}>
                        {reference ? 'Salvar alterações' : 'Salvando...'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditarAgenciaModal;