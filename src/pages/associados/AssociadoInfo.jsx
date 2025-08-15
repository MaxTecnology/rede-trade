import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import { activePage } from '@/utils/functions/setActivePage';
import { useQueryCategorias } from '@/hooks/ReactQuery/useQueryCategorias';
import StarRating from '@/components/Stars/StarRating';
import state from '@/store';

const AssociadoInfo = () => {
    const navigate = useNavigate();
    const { data: categorias } = useQueryCategorias();
    const [associado, setAssociado] = useState(null);

    useEffect(() => {
        activePage("associados");
        
        // Tentar obter dados do localStorage primeiro
        try {
            const storedData = localStorage.getItem("userCard");
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                setAssociado(parsedData);
            } else if (state.userCard) {
                // Fallback para state se localStorage estiver vazio
                setAssociado(state.userCard);
            } else {
                console.warn('Nenhum dado de associado encontrado');
                navigate('/associados');
            }
        } catch (error) {
            console.error('Erro ao carregar dados do associado:', error);
            navigate('/associados');
        }
    }, [navigate]);

    // Se não há dados, não renderizar
    if (!associado) {
        return (
            <div className="container">
                <div className="containerHeader">Informações Associado</div>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Carregando...</p>
                </div>
            </div>
        );
    }

    // Obter nome da categoria
    const nomeCategoria = categorias && categorias.categorias 
        ? categorias.categorias.find(categoria => categoria.idCategoria === associado.categoriaId)?.nomeCategoria || "Sem Categoria" 
        : "Sem Categoria";

    // Função para construir URL da imagem
    const construirUrlImagem = (imagemPath) => {
        if (!imagemPath) return "https://cdn.vectorstock.com/i/preview-1x/65/30/default-image-icon-missing-picture-page-vector-40546530.jpg";
        
        // Se já é uma URL completa, usar diretamente
        if (imagemPath.startsWith('http://') || imagemPath.startsWith('https://')) {
            return imagemPath;
        }
        
        // Se é um caminho relativo, construir URL completa
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
        if (imagemPath.startsWith('/')) {
            return `${baseUrl}${imagemPath}`;
        } else if (imagemPath.includes('uploads/')) {
            return `${baseUrl}/${imagemPath}`;
        } else {
            return `${baseUrl}/uploads/images/${imagemPath}`;
        }
    };

    // Função para formatar telefone
    const formatarTelefone = (telefone) => {
        if (!telefone) return 'Não informado';
        return telefone;
    };

    // Função para formatar endereço
    const formatarEndereco = () => {
        const partes = [];
        if (associado.logradouro) partes.push(associado.logradouro);
        if (associado.numero) partes.push(associado.numero);
        return partes.length > 0 ? partes.join(', ') : 'Endereço não informado';
    };

    // Função para obter tipos de atendimento
    const obterTiposAtendimento = () => {
        const tipos = [];
        if (associado.atendimento || associado.tipoOperacao) {
            tipos.push('Atendimento');
        }
        if (associado.aceitaVoucher) {
            tipos.push('Voucher');
        }
        return tipos.length > 0 ? tipos.join(' / ') : 'Atendimento / Voucher';
    };

    // Status ativo baseado no status do associado
    const statusAtivo = associado.status === true || associado.status === 'Ativo';

    return (
        <div className="container">
            <div className="containerHeader">Ver mais Associado</div>
            <div className="associadoInfoContainer">
                <h1>{associado.nomeFantasia || associado.nome || 'Nome não informado'}</h1>
                <div className="associadoInfo ofertasInfo">
                    <div className="associadoImage">
                        <img 
                            src={construirUrlImagem(associado.imagem)} 
                            alt={associado.nomeFantasia || associado.nome}
                            onError={(e) => {
                                e.target.src = "https://cdn.vectorstock.com/i/preview-1x/65/30/default-image-icon-missing-picture-page-vector-40546530.jpg";
                            }}
                        />
                    </div>
                    <div className="associadoInfoItens">
                        <h2 className="associadoInfoCategoria ofertasInfoH2">
                            {nomeCategoria}
                        </h2>
                        
                        <div className="ofertasInfoInfo">
                            <h3>Informações:</h3>
                            <p><span>Scor de Atendimento:</span> <StarRating rating={associado.reputacao || 5} /></p>
                            {associado.nomeContato && (
                                <p><span>Nome:</span> {associado.nomeContato}</p>
                            )}
                            {(associado.telefone || associado.celular) && (
                                <p><span>Telefone:</span> {formatarTelefone(associado.telefone || associado.celular)}</p>
                            )}
                            {associado.email && (
                                <p><span>Email:</span> {associado.email}</p>
                            )}
                            <p><span>Endereço:</span> {formatarEndereco()}</p>
                            {associado.bairro && (
                                <p><span>Bairro:</span> {associado.bairro}</p>
                            )}
                            {associado.cidade && (
                                <p><span>Cidade:</span> {associado.cidade}{associado.estado && `, ${associado.estado}`}</p>
                            )}
                            {associado.site && (
                                <p><span>Site:</span> {associado.site}</p>
                            )}
                        </div>
                        
                        <div>
                            <h3>Descrição</h3>
                            <p>{associado.descricao || 'Desenvolvimento de soluções tecnológicas para pequenas empresas'}</p>
                        </div>
                        
                        <div>
                            <h3>Atendimento</h3>
                            <p><span>Tipo:</span> {obterTiposAtendimento()}</p>
                            <p><span>Restrições:</span> {associado.restricao || 'Não'}</p>
                        </div>
                        
                        <h2 className={statusAtivo ? "associadoInfoStatus" : "associadoInfoStatus disabled"}>
                            {statusAtivo ? 'Cliente Atendendo' : 'Cliente Não Atendendo'}
                        </h2>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AssociadoInfo;