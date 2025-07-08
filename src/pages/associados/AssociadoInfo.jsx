import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import { activePage } from '@/utils/functions/setActivePage';
import { useQueryCategorias } from '@/hooks/ReactQuery/useQueryCategorias';
import StarRating from '@/components/Stars/StarRating';
import ButtonMotion from '@/components/FramerMotion/ButtonMotion';
import { BsWhatsapp, BsBrowserChrome, BsEnvelope, BsTelephone, BsGeoAlt } from 'react-icons/bs';
import state from '@/store';

const AssociadoInfo = () => {
    const navigate = useNavigate();
    const { data: categorias, isLoading: categoriasLoading } = useQueryCategorias();
    const [associado, setAssociado] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        activePage("associados");
        
        // Tentar obter dados do localStorage
        try {
            const storedData = localStorage.getItem("userCard");
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                setAssociado(parsedData);
                console.log('📋 Dados do associado:', parsedData);
            } else {
                // Se não há dados no localStorage, tentar obter do state
                if (state.userCard) {
                    setAssociado(state.userCard);
                } else {
                    console.warn('Nenhum dado de associado encontrado');
                    // Redirecionar para a lista se não houver dados
                    navigate('/associados');
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados do associado:', error);
            navigate('/associados');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Função para obter nome da categoria
    const obterNomeCategoria = () => {
        if (categoriasLoading) return 'Carregando...';
        
        if (!categorias || !categorias.categorias || !Array.isArray(categorias.categorias)) {
            return 'Sem Categoria';
        }

        if (!associado?.categoriaId) {
            return 'Sem Categoria';
        }

        const categoria = categorias.categorias.find(
            cat => cat.idCategoria === associado.categoriaId
        );

        return categoria ? categoria.nomeCategoria : 'Categoria não encontrada';
    };

    // Função para formatar telefone
    const formatarTelefone = (telefone) => {
        if (!telefone) return null;
        
        const numero = telefone.replace(/\D/g, '');
        
        if (numero.length === 11) {
            return `(${numero.slice(0,2)}) ${numero.slice(2,7)}-${numero.slice(7)}`;
        } else if (numero.length === 10) {
            return `(${numero.slice(0,2)}) ${numero.slice(2,6)}-${numero.slice(6)}`;
        }
        
        return telefone;
    };

    // Função para abrir WhatsApp
    const abrirWhatsApp = (telefone) => {
        if (!telefone) return;
        
        const telefoneClean = telefone.replace(/\D/g, "");
        const url = `https://wa.me/55${telefoneClean}`;
        window.open(url, "_blank");
    };

    // Função para abrir site
    const abrirSite = (site) => {
        if (!site) return;
        
        let url = site;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
        }
        
        window.open(url, "_blank");
    };

    // Função para formatar endereço
    const formatarEndereco = () => {
        if (!associado) return '';
        
        const partes = [];
        
        if (associado.logradouro) partes.push(associado.logradouro);
        if (associado.numero) partes.push(associado.numero);
        if (associado.complemento) partes.push(associado.complemento);
        
        return partes.join(', ') || 'Endereço não informado';
    };

    // Função para obter tipos de atendimento
    const obterTiposAtendimento = () => {
        if (!associado) return 'Não informado';
        
        const tipos = [];
        
        // Verificar diferentes formatos possíveis
        const aceitaVoucher = associado.aceitaVoucher === true || 
                             associado.aceitaVoucher === 'true' || 
                             associado.aceitaVoucher === 1;
                             
        const aceitaOrcamento = associado.aceitaOrcamento === true || 
                               associado.aceitaOrcamento === 'true' || 
                               associado.aceitaOrcamento === 1;

        if (aceitaVoucher) tipos.push('Voucher');
        if (aceitaOrcamento) tipos.push('Orçamento');
        
        return tipos.length > 0 ? tipos.join(' / ') : 'Nenhum tipo de atendimento especificado';
    };

    // Verificar se está carregando
    if (loading) {
        return (
            <div className="container">
                <div className="containerHeader">Informações do Associado</div>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Carregando...</p>
                </div>
            </div>
        );
    }

    // Verificar se há dados do associado
    if (!associado) {
        return (
            <div className="container">
                <div className="containerHeader">Informações do Associado</div>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Nenhum associado selecionado</p>
                    <ButtonMotion onClick={() => navigate('/associados')}>
                        Voltar para Associados
                    </ButtonMotion>
                </div>
            </div>
        );
    }

    const nomeCategoria = obterNomeCategoria();
    const imagemPadrao = "https://cdn.vectorstock.com/i/preview-1x/65/30/default-image-icon-missing-picture-page-vector-40546530.jpg";
    
    // Verificar status
    const statusAtivo = associado.status === true || 
                       associado.status === 'true' || 
                       associado.status === 'Ativo' ||
                       associado.status === 'Atendendo';

    return (
        <div className="container">
            <div className="containerHeader">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>Informações do Associado</span>
                    <ButtonMotion onClick={() => navigate('/associados')}>
                        Voltar
                    </ButtonMotion>
                </div>
            </div>

            <div className="associadoInfoContainer">
                <h1>{associado.nomeFantasia || associado.nome || 'Nome não informado'}</h1>
                
                <div className="associadoInfo">
                    {/* Imagem do associado */}
                    <div className='associadoImage'>
                        <img 
                            src={associado.imagem || imagemPadrao} 
                            alt={`Foto de ${associado.nomeFantasia || 'Associado'}`}
                            onError={(e) => {
                                e.target.src = imagemPadrao;
                            }}
                        />
                    </div>

                    {/* Informações detalhadas */}
                    <div className="associadoInfoItens">
                        {/* Categoria */}
                        <h2 className="associadoInfoCategoria">
                            📋 {nomeCategoria}
                        </h2>

                        {/* Status */}
                        <h2 className={statusAtivo ? "associadoInfoStatus" : "associadoInfoStatus disabled"}>
                            {statusAtivo ? "🟢 Atendendo" : "🔴 Não atendendo"}
                        </h2>

                        {/* Avaliação */}
                        <div style={{ marginBottom: '20px' }}>
                            <div className='flex items-center gap-2' style={{ marginBottom: '10px' }}>
                                <span style={{ fontWeight: 'bold' }}>⭐ Reputação: </span>
                                <StarRating rating={associado.reputacao || 0} />
                                <span style={{ marginLeft: '8px', color: '#666' }}>
                                    ({associado.reputacao || 0}/5)
                                </span>
                            </div>
                        </div>

                        {/* Descrição */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3>📝 Descrição</h3>
                            <p style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '15px', 
                                borderRadius: '8px',
                                minHeight: '60px',
                                lineHeight: '1.5'
                            }}>
                                {associado.descricao || 'Nenhuma descrição fornecida.'}
                            </p>
                        </div>

                        {/* Informações de contato */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3>📞 Contato</h3>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {associado.nomeContato && (
                                    <p>
                                        <span style={{ fontWeight: 'bold' }}>👤 Nome de Contato:</span> 
                                        {associado.nomeContato}
                                    </p>
                                )}
                                
                                {/* Telefone fixo */}
                                {associado.telefone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <BsTelephone />
                                        <span style={{ fontWeight: 'bold' }}>Telefone:</span>
                                        <span>{formatarTelefone(associado.telefone)}</span>
                                    </div>
                                )}
                                
                                {/* Celular */}
                                {associado.celular && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <BsTelephone />
                                        <span style={{ fontWeight: 'bold' }}>Celular:</span>
                                        <span>{formatarTelefone(associado.celular)}</span>
                                        <button
                                            onClick={() => abrirWhatsApp(associado.celular)}
                                            style={{
                                                backgroundColor: '#25D366',
                                                color: 'white',
                                                border: 'none',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <BsWhatsapp size={12} />
                                            WhatsApp
                                        </button>
                                    </div>
                                )}
                                
                                {/* Email principal */}
                                {associado.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <BsEnvelope />
                                        <span style={{ fontWeight: 'bold' }}>Email:</span>
                                        <a 
                                            href={`mailto:${associado.email}`}
                                            style={{ color: '#2d6cdf', textDecoration: 'none' }}
                                        >
                                            {associado.email}
                                        </a>
                                    </div>
                                )}
                                
                                {/* Email de contato */}
                                {associado.emailContato && associado.emailContato !== associado.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <BsEnvelope />
                                        <span style={{ fontWeight: 'bold' }}>Email Contato:</span>
                                        <a 
                                            href={`mailto:${associado.emailContato}`}
                                            style={{ color: '#2d6cdf', textDecoration: 'none' }}
                                        >
                                            {associado.emailContato}
                                        </a>
                                    </div>
                                )}
                                
                                {/* Email secundário */}
                                {associado.emailSecundario && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <BsEnvelope />
                                        <span style={{ fontWeight: 'bold' }}>Email Secundário:</span>
                                        <a 
                                            href={`mailto:${associado.emailSecundario}`}
                                            style={{ color: '#2d6cdf', textDecoration: 'none' }}
                                        >
                                            {associado.emailSecundario}
                                        </a>
                                    </div>
                                )}
                                
                                {associado.site && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <BsBrowserChrome />
                                        <span style={{ fontWeight: 'bold' }}>Site:</span>
                                        <button
                                            onClick={() => abrirSite(associado.site)}
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: '#2d6cdf',
                                                border: '1px solid #2d6cdf',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Acessar Site
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Endereço */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3>📍 Endereço</h3>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <p>
                                    <BsGeoAlt style={{ marginRight: '8px' }} />
                                    <span style={{ fontWeight: 'bold' }}>Logradouro:</span> {formatarEndereco()}
                                </p>
                                {associado.bairro && (
                                    <p><span style={{ fontWeight: 'bold' }}>Bairro:</span> {associado.bairro}</p>
                                )}
                                <p>
                                    <span style={{ fontWeight: 'bold' }}>Cidade:</span> {associado.cidade || 'Não informado'}
                                    {associado.estado && ` - ${associado.estado}`}
                                </p>
                                {associado.cep && (
                                    <p><span style={{ fontWeight: 'bold' }}>CEP:</span> {associado.cep}</p>
                                )}
                            </div>
                        </div>

                        {/* Atendimento */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3>🛎️ Tipos de Atendimento</h3>
                            <p style={{ 
                                backgroundColor: '#e3f2fd', 
                                padding: '12px', 
                                borderRadius: '8px',
                                border: '1px solid #2196f3'
                            }}>
                                {obterTiposAtendimento()}
                            </p>
                        </div>

                        {/* Restrições */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3>⚠️ Restrições</h3>
                            <p style={{ 
                                backgroundColor: '#fff3e0', 
                                padding: '12px', 
                                borderRadius: '8px',
                                border: '1px solid #ff9800',
                                minHeight: '50px'
                            }}>
                                {associado.restricao || 'Nenhuma restrição informada.'}
                            </p>
                        </div>

                        {/* Informações adicionais */}
                        {(associado.razaoSocial || associado.cnpj || associado.inscEstadual) && (
                            <div style={{ marginBottom: '20px' }}>
                                <h3>🏢 Dados da Empresa</h3>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {associado.razaoSocial && (
                                        <p><span style={{ fontWeight: 'bold' }}>Razão Social:</span> {associado.razaoSocial}</p>
                                    )}
                                    {associado.cnpj && (
                                        <p><span style={{ fontWeight: 'bold' }}>CNPJ:</span> {associado.cnpj}</p>
                                    )}
                                    {associado.inscEstadual && (
                                        <p><span style={{ fontWeight: 'bold' }}>Inscrição Estadual:</span> {associado.inscEstadual}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Informações da conta */}
                        {associado.conta && (
                            <div style={{ marginBottom: '20px' }}>
                                <h3>💳 Informações da Conta</h3>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {associado.conta.numeroConta && (
                                        <p><span style={{ fontWeight: 'bold' }}>Número da Conta:</span> {associado.conta.numeroConta}</p>
                                    )}
                                    {associado.conta.nomeFranquia && (
                                        <p><span style={{ fontWeight: 'bold' }}>Franquia:</span> {associado.conta.nomeFranquia}</p>
                                    )}
                                    {associado.conta.gerenteConta?.nome && (
                                        <p><span style={{ fontWeight: 'bold' }}>Gerente:</span> {associado.conta.gerenteConta.nome}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default AssociadoInfo;