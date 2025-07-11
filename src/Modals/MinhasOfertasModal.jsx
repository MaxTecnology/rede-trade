import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Mascaras from '@/hooks/Mascaras';
import { editItem } from '@/hooks/ListasHook';
import { closeModal } from '@/hooks/Functions';
import { GrFormClose } from "react-icons/gr";
import { BiSolidImageAdd } from 'react-icons/bi';
import RealInput from '@/components/Inputs/CampoMoeda';
import { getId } from '@/hooks/getId';
import defaultImage from '@/assets/images/default_img.png'
import CategoriesOptions from '@/components/Options/CategoriesOptions';
import { toast } from 'sonner';
import useRevalidate from '@/hooks/ReactQuery/useRevalidate';
import { imageReferenceHandler, formHandlerComImagem, debugFormData } from '@/utils/functions/formHandler';

const MinhasOfertasModal = ({ isOpen, modalToggle, setState, ofertaInfo }) => {
    const [imagemReference, setImageReference] = useState(null);
    const [imagem, setImagem] = useState(null); // NOVO: Para armazenar o arquivo
    const [reference, setReference] = useState(true)
    const [error, setError] = useState(false)
    const [sucess, setSucess] = useState(false)
    const info = ofertaInfo
    var urlOferta = `ofertas/atualizar-oferta/${info.idOferta}`

    const revalidate = useRevalidate();

    useEffect(() => {
        if (isOpen && info) {
            Mascaras();
            
            // Construir URL completa da imagem da oferta
            let imageUrl = defaultImage; // Fallback padrão
            
            if (info.imagens && info.imagens.length > 0) {
                const primeiraImagem = info.imagens[0];
                
                if (primeiraImagem.startsWith('http')) {
                    // URL completa (ex: http://exemplo.com/imagem.jpg)
                    imageUrl = primeiraImagem;
                } else if (primeiraImagem.startsWith('/uploads')) {
                    // Caminho relativo do servidor (ex: /uploads/images/123.jpg)
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
                    imageUrl = `${baseUrl}${primeiraImagem}`;
                } else {
                    // URL externa ou outros casos
                    imageUrl = primeiraImagem;
                }
                
                console.log('🖼️ URL da imagem da oferta construída:', imageUrl);
            }
            
            setImageReference(imageUrl);
            setImagem(null); // Reset do arquivo quando abrir modal
        }
    }, [info, isOpen]);

    // Função para formatar data (mantida original)
    function formatarDataParaInputData(dataISO8601) {
        // Criar objeto Date a partir da string ISO 8601
        const dataObj = new Date(dataISO8601);

        // Extrair partes da data
        const ano = dataObj.getFullYear();
        const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0'); // Mês é base 0, então adicionamos 1
        const dia = dataObj.getDate().toString().padStart(2, '0');
        const hora = dataObj.getHours().toString().padStart(2, '0');
        const minuto = dataObj.getMinutes().toString().padStart(2, '0');

        // Criar string no formato datetime-local
        const datetimeLocalString = `${ano}-${mes}-${dia}T${hora}:${minuto}`;

        return datetimeLocalString;
    }

    const formHandler = (event) => {
        event.preventDefault();
        setReference(false);
        
        // Se há imagem, usar FormData. Senão, usar método original
        if (imagem) {
            // NOVO: Usar formHandlerComImagem para processar FormData
            const formData = formHandlerComImagem(new FormData(event.target), imagem);
            
            // Debug opcional - descomente se precisar debugar
            // debugFormData(formData);
            
            // NOVO: Função para update com imagem (adaptada para ofertas)
            const updateOfertaWithImage = async () => {
                try {
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
                    
                    // Para ofertas, usar a rota específica de ofertas
                    const url = `${baseUrl}/${urlOferta}`;
                    
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
            toast.promise(updateOfertaWithImage(), {
                loading: 'Editando Oferta...',
                success: () => {
                    setReference(true);
                    setImagem(null);
                    modalToggle();
                    revalidate("ofertas");
                    return "Oferta editada com sucesso!";
                },
                error: (error) => {
                    setReference(true);
                    return <b>Erro: {error.message}</b>;
                },
            });
        } else {
            // Usar método original se não há imagem
            setTimeout(() => {
                toast.promise(editItem(event, urlOferta, setState, "ofertas"), {
                    loading: 'Editando Oferta...',
                    success: () => {
                        setReference(true);
                        modalToggle();
                        revalidate("ofertas");
                        return "Oferta editada com sucesso!";
                    },
                    error: (error) => {
                        setReference(true);
                        return <b>Erro: {error.message}</b>;
                    },
                });
            }, 200);
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => closeModal(modalToggle, setSucess, setError)}
            contentLabel="Editar Oferta"
            className="modalContainer modalAnimationUser"
            overlayClassName="modalOverlay modalAnimationUserOverlay"
        >
            <div className='modalEditHeader'>
                <p>Editar Oferta</p>
                <GrFormClose onClick={() => closeModal(modalToggle, setSucess, setError)} />
            </div>
            <form onSubmit={(event) => { formHandler(event) }} className="containerForm ofertasContainer">
                <div className="ofertasTop">
                    <div className="ofertasImageContainer">
                        <img 
                            src={imagemReference || defaultImage} 
                            className="rounded float-left img-fluid" 
                            alt="Imagem da oferta" 
                            id="imagem-selecionada" 
                            name="imagem-selecionada" 
                        />
                    </div>
                    <div className="ofertasRightside">
                        <div className="containerRow">
                            <div className="form-group f1">
                                <label className="required">Titulo</label>
                                <input defaultValue={info.titulo} type="text" className="form-control" id="razaoSocial" name="titulo" required />
                            </div>
                            <div className="form-group f1">
                                <label className="required" >Tipo</label>
                                <select name="tipo" defaultValue={info.tipo} required >
                                    <option value="" disabled>Selecionar</option>
                                    <option value="Produto">Produto</option>
                                    <option value="Serviço">Serviço</option>
                                </select>
                            </div>
                            <div className="form-group f1">
                                <label className="required" name="">Status</label>
                                <select name="status" defaultValue={info.status} required>
                                    <option value="" disabled >Selecionar</option>
                                    <option value="true">Disponível</option>
                                    <option value="false">Indisponível</option>
                                </select>
                            </div>
                            <div className="form-group f1">
                                <label className="required">Categorias</label>
                                <select id="planoAssociado" defaultValue={info.categoria} name="categoria">
                                    <option value="" disabled>
                                        Selecione
                                    </option>
                                    <CategoriesOptions />
                                </select>
                            </div>
                        </div>

                        <div className="form-group f4 desc">
                            <label className="required">Descrição</label>
                            <textarea defaultValue={info.descricao} maxLength="150" type="text" rows={9} name="descricao" required />
                        </div>
                    </div>
                </div>
                <div className="containerRow">
                    <div className="form-group">
                        <label htmlFor="img_path" className="inputLabel">
                            <BiSolidImageAdd /> Selecione uma imagem
                            <input 
                                type="file" 
                                accept="image/*" 
                                id="img_path" 
                                className="custom-file-input" 
                                name='imagem' 
                                onChange={(e) => imageReferenceHandler(e, setImageReference, setImagem)} 
                            />
                        </label>
                    </div>
                    <div className="form-group"></div>
                    <div className="form-group"></div>
                </div>

                {/* NOVO: Mostrar nome do arquivo selecionado */}
                {imagem && (
                    <div className="containerRow">
                        <div className="form-group">
                            <small className="text-muted">
                                📎 Arquivo selecionado: {imagem.name} ({(imagem.size / 1024 / 1024).toFixed(2)}MB)
                            </small>
                        </div>
                        <div className="form-group"></div>
                        <div className="form-group"></div>
                    </div>
                )}

                <div className="containerRow">
                    <div className="form-group f2">
                        <label className="required">Quantidade</label>
                        <input defaultValue={info.quantidade} type="number" className="form-control" id="nomeContato" name="quantidade" required />
                    </div>
                    <div className="form-group f2">
                        <label className='required'>Valor</label>
                        <RealInput name="valor" defaultValue={info.valor} reference={reference} required />
                    </div>
                    <div className="form-group f2">
                        <label className="required">Limite de Compra</label>
                        <input type="number" defaultValue={info.limiteCompra} className="form-control" name="limiteCompra" required />
                    </div>
                </div>
                <div className="containerRow">
                    <div className="form-group f2">
                        <label className="required">Vencimento</label>
                        <input type="datetime-local" defaultValue={formatarDataParaInputData(info.vencimento)} className="form-control" name="vencimento" required />
                    </div>
                    <div className="form-group f2">
                        <label>Cidade</label>
                        <input type="text" defaultValue={info.cidade} className="form-control" name="cidade" />
                    </div>
                    <div className="form-group f2">
                        <label className="required">Retirada</label>
                        <select id="planoAssociado" defaultValue={info.retirada} name="retirada">
                            <option value="" disabled>
                                Selecione
                            </option>
                            <option value="Local">
                                Local
                            </option>
                            <option value="Entrega" >
                                Entrega
                            </option>
                        </select>
                    </div>
                </div>
                <div className="form-group desc">
                    <label>Observações</label>
                    <textarea defaultValue={info.obs} name="obs" rows={9} />
                </div>
                <input readOnly style={{ display: "none" }} type="text" name="usuarioId" value={getId()} />
                <div className="buttonContainer">
                    <button onClick={() => closeModal(modalToggle, setSucess, setError)} className="purpleBtn" type="button">Fechar</button>
                    <button type="submit" disabled={!reference}>
                        {reference ? 'Editar' : 'Editando...'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default MinhasOfertasModal;