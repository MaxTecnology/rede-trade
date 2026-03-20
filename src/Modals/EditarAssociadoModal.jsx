import { useState, useEffect, useMemo } from 'react';
import Modal from 'react-modal';
import { editUser, getApiData } from '@/hooks/ListasHook';
import { closeModal } from '@/hooks/Functions';
import { GrFormClose } from "react-icons/gr";
import { BiSolidImageAdd } from 'react-icons/bi';
import RealInput from '@/components/Inputs/CampoMoeda';
import { toast } from 'sonner';
import useRevalidate from '@/hooks/ReactQuery/useRevalidate';
import PlanosFields from '@/components/Form/PlanosFields';
import Categoria_SubCategoriaOptions from '@/components/Options/Categoria_SubCategoriaOptions';
import { useQueryGerentes } from '@/hooks/ReactQuery/useQueryGerentes';
import { useQueryClient } from '@tanstack/react-query';
import { imageReferenceHandler, formHandlerComImagem, debugFormData } from '@/utils/functions/formHandler';
import ButtonMotion from '@/components/FramerMotion/ButtonMotion';
import InputMask from 'react-input-mask';
import defaultImage from "@/assets/images/default_img.png"
import { API_URL } from "@/config/api";

const EditarAssociadoModal = ({ isOpen, modalToggle, associadoInfo }) => {
    const [imagemReference, setImageReference] = useState(null);
    const [imagem, setImagem] = useState(null);
    const [reference, setReference] = useState(true)
    const [error, setError] = useState(false)
    const [sucess, setSucess] = useState(false)
    const [gerenteSelecionado, setGerenteSelecionado] = useState("");
    const [taxaGerente, setTaxaGerente] = useState("0");
    const [infoDetalhada, setInfoDetalhada] = useState(associadoInfo);
    const infoBase = associadoInfo || {};
    const infoCompleto = infoDetalhada || infoBase;
    const contaInfo = infoCompleto?.conta || infoBase?.conta || {};

    const info = {
        ...infoBase,
        ...infoCompleto,
        conta: contaInfo,
    };
    const { data: gerentesData, refetch: refetchGerentes } = useQueryGerentes();
    const queryClient = useQueryClient();
    
    // Debug logs removidos - funcionando corretamente

    // Função para verificar se é uma URL válida (igual ao UsuariosDados.jsx)
    const isURL = (str) => {
        try {
            new URL(str);
            return true;
        } catch (_) {
            return false;
        }
    };

    useEffect(() => {
        let ativo = true;
        const carregarInfo = async () => {
            if (!isOpen || !associadoInfo?.idUsuario) {
                setInfoDetalhada(associadoInfo);
                return;
            }

            setInfoDetalhada(associadoInfo);

            try {
                const dados = await getApiData(`usuarios/buscar-usuario/${associadoInfo.idUsuario}`);
                if (ativo && dados) {
                    setInfoDetalhada(dados);
                }
            } catch (erro) {
                console.error('❌ Erro ao buscar detalhes do associado:', erro);
                setInfoDetalhada(associadoInfo);
            }
        };

        carregarInfo();

        return () => {
            ativo = false;
        };
    }, [isOpen, associadoInfo]);

    useEffect(() => {
        if (isOpen && info) {
            // Forçar refetch dos gerentes para garantir dados atualizados
            refetchGerentes();
            
            // Construir URL da imagem (mesma lógica melhorada do UsuariosDados.jsx)
            let imageUrl = defaultImage;
            
            if (info.imagem) {
                if (isURL(info.imagem)) {
                    // Se já é uma URL completa (https://... ou http://...)
                    imageUrl = info.imagem;
                } else if (info.imagem.startsWith('/')) {
                    // Se é um caminho relativo que começa com / (ex: /uploads/images/file.jpg)
                    const baseUrl = API_URL;
                    imageUrl = `${baseUrl}${info.imagem}`;
                } else if (info.imagem.includes('uploads/')) {
                    // Se contém uploads/ mas não começa com /
                    const baseUrl = API_URL;
                    imageUrl = `${baseUrl}/${info.imagem}`;
                } else {
                    // Qualquer outro caso, tentar construir URL
                    const baseUrl = API_URL;
                    imageUrl = `${baseUrl}/uploads/images/${info.imagem}`;
                }
            }
            
            setImageReference(imageUrl);
            setImagem(null); // Reset do arquivo quando abrir modal
            
            // Configurar gerente selecionado
            const gerenteId = contaInfo?.gerenteContaId;
            console.log('🔍 Debug gerente:', {
                gerenteId,
                gerenteIdType: typeof gerenteId,
                gerenteIdString: gerenteId?.toString(),
                conta: info?.conta
            });
            
            if (gerenteId) {
                setGerenteSelecionado(gerenteId.toString());
                console.log('👨‍💼 Gerente carregado:', gerenteId);
            } else {
                setGerenteSelecionado("");
                console.log('👨‍💼 Nenhum gerente selecionado');
            }
        }
    }, [info, contaInfo?.gerenteContaId, isOpen, refetchGerentes]);
    
    const normalizarTaxa = (valor) => {
        if (valor === undefined || valor === null || Number.isNaN(Number(valor))) {
            return "0";
        }
        const numero = Number(valor);
        if (numero > 1 && numero > 100) {
            return (numero / 100).toString();
        }
        if (numero > 1 && numero % 1 === 0 && numero > 10) {
            return (numero / 100).toString();
        }
        return numero.toString();
    };

    // Effect para atualizar taxa quando gerente mudar ou dados dos gerentes carregarem
    useEffect(() => {
        if (gerenteSelecionado && gerentesData?.data) {
            const gerente = gerentesData.data.find(g => g.idUsuario.toString() === gerenteSelecionado.toString());
            if (gerente && gerente.taxaComissaoGerente !== undefined && gerente.taxaComissaoGerente !== null) {
                setTaxaGerente(normalizarTaxa(gerente.taxaComissaoGerente));
                return;
            }
        }

        const taxaGerenteConta = contaInfo?.gerenteConta?.taxaComissaoGerente;
        if (taxaGerenteConta !== undefined && taxaGerenteConta !== null) {
            setTaxaGerente(normalizarTaxa(taxaGerenteConta));
            return;
        }

        if (info?.taxaComissaoGerente !== undefined && info?.taxaComissaoGerente !== null) {
            setTaxaGerente(normalizarTaxa(info.taxaComissaoGerente));
        } else {
            setTaxaGerente("0");
        }
    }, [gerenteSelecionado, gerentesData, contaInfo, info?.taxaComissaoGerente]);
    
    // Função para atualizar gerente selecionado
    const handleGerenteChange = (event) => {
        const novoGerenteId = event.target.value;
        setGerenteSelecionado(novoGerenteId);
        console.log('👨‍💼 Gerente alterado para:', novoGerenteId);
    };

    const revalidate = useRevalidate();

    const targetFilialId = useMemo(() => {
        return contaInfo?.filialId
            ?? contaInfo?.filial?.id
            ?? info?.filialId
            ?? info?.filial?.id
            ?? null;
    }, [contaInfo?.filialId, contaInfo?.filial?.id, info?.filialId, info?.filial?.id]);

    const gerentesDisponiveis = useMemo(() => {
        const listaOriginal = gerentesData?.data ? [...gerentesData.data] : [];
        const gerenteAtual = contaInfo?.gerenteConta;

        const listaFiltrada = targetFilialId
            ? listaOriginal.filter((item) => {
                const gerenteFilialId =
                    item?.filialId ??
                    item?.conta?.filialId ??
                    item?.filialAuth?.id ??
                    null;
                return gerenteFilialId === targetFilialId;
            })
            : listaOriginal.filter((item) =>
                Boolean(item?.filialId || item?.conta?.filialId || item?.filialAuth?.id)
            );

        if (
            gerenteAtual &&
            gerenteAtual.idUsuario &&
            !listaFiltrada.some((item) => item.idUsuario === gerenteAtual.idUsuario)
        ) {
            listaFiltrada.unshift({
                idUsuario: gerenteAtual.idUsuario,
                nome: gerenteAtual.nome || gerenteAtual.nomeContato || gerenteAtual.nomeFantasia,
                nomeFantasia: gerenteAtual.nomeFantasia || gerenteAtual.nome,
            });
        }

        return listaFiltrada;
    }, [gerentesData?.data, contaInfo?.gerenteConta, targetFilialId]);

    const formHandler = (event) => {
        event.preventDefault();
        setReference(false);
        
        // Se há imagem, usar FormData. Senão, usar método original
        if (imagem) {
            // NOVO: Usar formHandlerComImagem para processar FormData
            const formData = formHandlerComImagem(new FormData(event.target), imagem);
            
            // IMPORTANTE: Adicionar campos que podem estar faltando
            formData.append('tipo', 'Associado'); // Força o tipo
            
            // Debug opcional - descomente se precisar debugar
            debugFormData(formData);
            
            // NOVO: Função para update com imagem
            const updateUserWithImage = async () => {
                try {
                    const baseUrl = API_URL;
                    
                    // TESTE: Vamos usar a rota de atualizar-usuario-completo que pode ser mais robusta
                    const url = `${baseUrl}/usuarios/atualizar-usuario-completo/${info.idUsuario}`;
                    
                    // Obter token da mesma forma que o backend usa
                    const token = localStorage.getItem('tokenRedeTrade');
                    
                    if (!token) {
                        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
                    }
                    
                    // Opcional: logs para debug
                    // console.log('🔗 Fazendo requisição para:', url);
                    // console.log('📡 Status da resposta:', response.status);
                    // console.log('✅ Resposta do servidor:', data);

                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });

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
                loading: 'Editando Associado...',
                success: () => {
                    setReference(true);
                    setImagem(null);
                    
                    // Invalidar múltiplas queries para garantir atualização
                    revalidate("associados");
                    revalidate("usuarios");
                    revalidate("gerentes");
                    
                    // Invalidação mais agressiva do React Query
                    queryClient.invalidateQueries({ queryKey: ['associados'] });
                    queryClient.invalidateQueries({ queryKey: ['usuarios'] });
                    queryClient.invalidateQueries({ queryKey: ['gerentes'] });
                    
                    // Remover dados específicos do cache para forçar refetch
                    queryClient.removeQueries({ queryKey: ['associados'] });
                    
                    // Fechar modal com pequeno delay para garantir atualização
                    setTimeout(() => {
                        modalToggle();
                    }, 1000);
                    
                    return "Associado editado com sucesso!";
                },
                error: (error) => {
                    setReference(true);
                    return <b>{error.message}</b>;
                },
            });
        } else {
            // Usar método original se não há imagem
            toast.promise(editUser(event), {
                loading: 'Editando Associado...',
                success: () => {
                    setReference(true);
                    
                    // Invalidar múltiplas queries para garantir atualização
                    revalidate("associados");
                    revalidate("usuarios");
                    revalidate("gerentes");
                    
                    // Invalidação mais agressiva do React Query
                    queryClient.invalidateQueries({ queryKey: ['associados'] });
                    queryClient.invalidateQueries({ queryKey: ['usuarios'] });
                    queryClient.invalidateQueries({ queryKey: ['gerentes'] });
                    
                    // Remover dados específicos do cache para forçar refetch
                    queryClient.removeQueries({ queryKey: ['associados'] });
                    
                    // Fechar modal com pequeno delay para garantir atualização
                    setTimeout(() => {
                        modalToggle();
                    }, 1000);
                    
                    return "Associado editado com sucesso!";
                },
                error: (error) => {
                    setReference(true);
                    return <b>{error.message}</b>;
                },
            });
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => closeModal(modalToggle, setSucess, setError)}
            contentLabel="Editar Associado"
            className="modalContainer modalAnimationUser"
            overlayClassName="modalOverlay modalAnimationUserOverlay"
        >
            <div className='modalEditHeader'>
                <p>Editar Associado</p>
                <GrFormClose onClick={() => closeModal(modalToggle, setSucess, setError)} />
            </div>
            <div className='modalDivider'></div>
            <form onSubmit={(event) => formHandler(event)} className="containerForm">
                <div className="form-group">
                    <label className="required-field-label">Razão Social</label>
                    <input
                        defaultValue={info?.razaoSocial} 
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
                        defaultValue={info?.nomeFantasia} 
                        type="text" 
                        className="form-control" 
                        id="nomeFantasia" 
                        name="nomeFantasia" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label className="required-field-label">Descrição</label>
                    <input
                        defaultValue={info?.descricao} 
                        type="text" 
                        className="form-control" 
                        id="descricao" 
                        name="descricao" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Status</label>
                    <select defaultValue={info?.status ? "true" : "false"} className="form-control" id="status" name="status">
                        <option value="" disabled>Selecionar</option>
                        <option value="true">Atendendo</option>
                        <option value="false">Não Atendendo</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="required-field-label">CNPJ</label>
                    <InputMask 
                        mask="99.999.999/9999-99" 
 
                        defaultValue={info?.cnpj}
                        type="text" 
                        className="form-control"
                        id="cnpj" 
                        name="cnpj" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Insc. Estadual</label>
                    <input
                        defaultValue={info?.inscEstadual} 
                        type="text" 
                        className="form-control" 
                        id="inscEstadual" 
                        name="inscEstadual" 
                    />
                </div>
                <div className="form-group">
                    <label>Insc. Municipal</label>
                    <input
                        defaultValue={info?.inscMunicipal} 
                        type="text" 
                        className="form-control" 
                        id="inscMunicipal" 
                        name="inscMunicipal" 
                    />
                </div>
                <div className="form-group">
                    <label className="required-field-label">Restrições</label>
                    <input
                        defaultValue={info?.restricao} 
                        type="text" 
                        className="form-control" 
                        id="restricoes" 
                        name="restricao" 
                        required 
                    />
                </div>
                <Categoria_SubCategoriaOptions defaultValue={info} required />
                <div className="form-group">
                    <label>Mostrar no site</label>
                    <select defaultValue={info?.mostrarNoSite ? "true" : "false"} className="form-control" id="mostrarNoSite" name="mostrarNoSite">
                        <option value="" disabled>Selecionar</option>
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Tipo</label>
                    <select defaultValue={info?.tipo} className="form-control" id="tipo">
                        <option value="" disabled>Selecionar</option>
                        <option value="Associado">Associado</option>
                    </select>
                </div>
                <div className="formDivider">
                    <p>Contato</p>
                </div>
                {/* CONTATO */}
                <div className="form-group f2">
                    <label className="required-field-label">Nome</label>
                    <input
                        defaultValue={info?.nomeContato} 
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
 
                        defaultValue={info?.telefone}
                        type="text" 
                        className="form-control"
                        id="telefone" 
                        name="telefone"
                    />
                </div>
                <div className="form-group f2">
                    <label className="required-field-label">Celular</label>
                    <InputMask 
                        mask="(99)99999-9999" 
 
                        defaultValue={info.celular}
                        type="text" 
                        className="form-control"
                        id="celular" 
                        name="celular" 
                        required 
                    />
                </div>
                <div className="form-group f2">
                    <label className="required-field-label">E-mail</label>
                    <input
                        defaultValue={info?.emailContato} 
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
                        defaultValue={info?.emailSecundario} 
                        type="email" 
                        className="form-control" 
                        id="emailSecundario" 
                        name="emailSecundario" 
                    />
                </div>
                <div className="form-group f2">
                    <label>Site</label>
                    <input 
                        defaultValue={info?.site} 
                        type="text" 
                        className="form-control" 
                        id="site" 
                        name="site" 
                    />
                </div>
                <div className="formDivider">
                    <p>Endereço</p>
                </div>
                {/* ENDEREÇO */}
                <div className="form-group">
                    <label className="required-field-label">Logradouro</label>
                    <input
                        defaultValue={info?.logradouro} 
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
                        defaultValue={info?.numero} 
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
 
                        defaultValue={info?.cep}
                        type="text" 
                        className="form-control"
                        id="cep" 
                        name="cep" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Complemento</label>
                    <input
                        defaultValue={info?.complemento} 
                        type="text" 
                        className="form-control" 
                        id="complemento" 
                        name="complemento" 
                    />
                </div>
                <div className="form-group">
                    <label className="required-field-label">Bairro</label>
                    <input
                        defaultValue={info?.bairro} 
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
                        defaultValue={info?.cidade} 
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
                        defaultValue={info?.estado} 
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
                        defaultValue={info?.regiao} 
                        type="text" 
                        className="form-control" 
                        id="regiao" 
                        name="regiao" 
                    />
                </div>
                <div className="formDivider">
                    <p>Agência</p>
                </div>
                {/* AGENCIA */}
                <PlanosFields type={"Associado"} defaultValue={info} />
                <div className="form-group">
                    <label>Data Vencimento Fatura</label>
                    <select defaultValue={contaInfo?.dataVencimentoFatura ? String(contaInfo.dataVencimentoFatura) : (info?.dataVencimentoFatura ? String(info.dataVencimentoFatura) : "")} className="form-control" id="dataVencimentoFatura" name="dataVencimentoFatura">
                        <option value="" disabled>Selecionar</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Dinheiro</label>
                    <input type="text" className='readOnly' value={contaInfo?.saldoDinheiro ?? 0} disabled/>
                </div>
                <div className="form-group">
                    <label>Permuta</label>
                    <input type="text" className='readOnly' value={contaInfo?.saldoPermuta ?? 0} disabled/>
                </div>
                <div className="formDivider">
                    <p>Operações</p>
                </div>
                {/* Operações */}
                <div className="form-group">
                    <label>Gerente de Conta</label>
                    <select 
                        value={gerenteSelecionado} 
                        className="form-control" 
                        id="gerentesSelect" 
                        name="gerente"
                        onChange={handleGerenteChange}
                    >
                        <option value="" disabled>Selecionar</option>
                        <option value="">Sem Gerente</option>
                        {gerentesDisponiveis.map((item) => (
                            <option value={String(item.idUsuario)} key={item.idUsuario}>
                                {item.nomeFantasia || item.nome}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="required-field-label">Taxa Gerente Conta em %</label>
                    <input
                        value={taxaGerente} 
                        type="number" 
                        className="form-control readOnly" 
                        id="taxaGerenteConta" 
                        name="taxaGerenteConta"
                        readOnly 
                    />
                </div>
                <div className="form-group">
                    <label className="required">Tipo de Operação</label>
                    <select defaultValue={info?.tipoOperacao ? String(info.tipoOperacao) : ""} className="form-control" id="tipoOperacao" name="tipoOperacao">
                        <option value="" disabled>Selecionar</option>
                        <option value="1">Compra</option>
                        <option value="2">Venda</option>
                        <option value="3">Compra/Venda</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="required-field-label">Limite Crédito</label>
                    <RealInput defaultValue={contaInfo?.limiteCredito ?? 0} name="limiteCredito" placeholder="Insira o limite" reference={reference} required />
                </div>
                <div className="form-group">
                    <label className="required-field-label">Limite de Venda Mensal</label>
                    <RealInput defaultValue={contaInfo?.limiteVendaMensal ?? 0} name="limiteVendaMensal" placeholder="Insira o limite" reference={reference} required />
                </div>
                <div className="form-group">
                    <label className="required-field-label">Limite de Venda Total</label>
                    <RealInput defaultValue={contaInfo?.limiteVendaTotal ?? 0} name="limiteVendaTotal" placeholder="Insira o limite" reference={reference} required />
                </div>
                <div className="form-group">
                    <label>Aceita Orçamento</label>
                    <select defaultValue={info?.aceitaOrcamento ? "true" : "false"} className="form-control" id="aceitaOrcamento" name="aceitaOrcamento">
                        <option value="" disabled>Selecionar</option>
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Aceita Voucher</label>
                    <select defaultValue={info?.aceitaVoucher ? "true" : "false"} className="form-control" id="aceitaVoucher" name="aceitaVoucher">
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
                        name="imagem-selecionada" 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="img_path" className="inputLabel">
                        <BiSolidImageAdd /> Selecione uma imagem
                        <input 
                            type="file" 
                            name='imagem' 
                            accept="image/*" 
                            className="custom-file-input" 
                            id="img_path" 
                            onChange={(e) => imageReferenceHandler(e, setImageReference, setImagem)} 
                        />
                    </label>
                </div>
                {/* NOVO: Mostrar nome do arquivo selecionado */}
                {imagem && (
                    <div className="form-group">
                        <small className="text-muted">
                            📎 Arquivo selecionado: {imagem.name} ({(imagem.size / 1024 / 1024).toFixed(2)}MB)
                        </small>
                    </div>
                )}
                <div className="form-group">
                    <label className="required-field-label">Nome</label>
                    <input 
                        defaultValue={info?.nome} 
                        type="text" 
                        className="form-control" 
                        id="nome" 
                        name="nome" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label className="required-field-label">Cpf</label>
                    <InputMask 
                        mask="999.999.999-99" 
 
                        defaultValue={info?.cpf}
                        type="text" 
                        className="form-control"
                        id="cpf" 
                        name="cpf" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label className="required-field-label ">E-mail</label>
                    <input 
                        defaultValue={info?.email} 
                        type="email" 
                        className="form-control" 
                        id="email" 
                        name="email" 
                        required 
                    />
                </div>
                {contaInfo?.idConta && <input type="hidden" name="contaId" value={contaInfo.idConta} />}
                {contaInfo?.taxaRepasseMatriz !== undefined && (
                    <input type="hidden" name="taxaRepasseMatriz" value={contaInfo.taxaRepasseMatriz ?? 0} />
                )}
                <input type="hidden" name="idUsuario" value={info?.idUsuario || infoBase?.idUsuario || ''} />

                <div className="buttonContainer">
                    <ButtonMotion className='modalButtonClose' type='button' onClick={() => closeModal(modalToggle, setSucess, setError)} >
                        Fechar
                    </ButtonMotion>
                    <ButtonMotion className='modalButtonSave' type="submit" disabled={!reference}>
                        {reference ? 'Salvar alterações' : 'Salvando...'}
                    </ButtonMotion>
                </div>
            </form>
        </Modal>
    );
};

export default EditarAssociadoModal;
