import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchField from '@/components/Search/SearchField';
import AssociadosCard from "./AssociadosCard";
import Footer from "@/components/Footer";
import { activePage } from "@/utils/functions/setActivePage";
import { useQueryAssociados } from "@/hooks/ReactQuery/useQueryAssociados";
import PaginationCards from "@/components/cards/PaginationCards";
import { useSnapshot } from "valtio";
import state from "@/store";

const Associados = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const snap = useSnapshot(state);
    
    // Estados para filtros locais
    const [filtros, setFiltros] = useState({
        search: '',
        agencia: '',
        categoriaId: '',
        account: '',
        estado: '',
        cidade: '',
        page: 1
    });
    
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(6);

    // Função para atualizar URL com filtros
    const updateURL = (newFiltros) => {
        const params = new URLSearchParams();
        
        Object.keys(newFiltros).forEach(key => {
            if (newFiltros[key] && newFiltros[key] !== '') {
                params.set(key, newFiltros[key]);
            }
        });
        
        const newSearch = params.toString();
        const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
        
        navigate(newPath, { replace: true });
    };

    // Ler parâmetros da URL e atualizar estado
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const newFiltros = {
            search: params.get('search') || '',
            agencia: params.get('agencia') || '',
            categoriaId: params.get('categoriaId') || '',
            account: params.get('account') || '',
            estado: params.get('estado') || '',
            cidade: params.get('cidade') || '',
            page: parseInt(params.get('page')) || 1
        };
        
        setFiltros(newFiltros);
        setCurrentPage(newFiltros.page);
        
        console.log('🔍 Filtros atualizados:', newFiltros);
    }, [location.search]);

    // Query para buscar associados
    const { data, isLoading, error, refetch } = useQueryAssociados(
        filtros.page,              // page
        'Associado',               // tipoDaConta
        filtros.search,            // nome
        filtros.search,            // nomeFantasia
        '',                        // razaoSocial
        '',                        // nomeContato  
        filtros.estado,            // estado
        filtros.cidade,            // cidade
        '',                        // usuarioCriadorId
        100,                       // pageSize
        filtros.categoriaId,       // categoriaId
        filtros.agencia,           // agencia  
        filtros.account            // account
    );

    useEffect(() => {
        activePage("associados");
    }, []);

    // Função para aplicar filtros
    const aplicarFiltros = (novosFiltros) => {
        console.log('🔍 Aplicando filtros:', novosFiltros);
        
        const filtrosAtualizados = {
            ...filtros,
            ...novosFiltros,
            page: 1 // Reset para primeira página
        };
        
        console.log('🔍 Filtros atualizados:', filtrosAtualizados);
        
        setFiltros(filtrosAtualizados);
        setCurrentPage(1);
        updateURL(filtrosAtualizados);
    };

    // Função para limpar filtros
    const limparFiltros = () => {
        const filtrosLimpos = {
            search: '',
            agencia: '',
            categoriaId: '',
            account: '',
            estado: '',
            cidade: '',
            page: 1
        };
        
        setFiltros(filtrosLimpos);
        setCurrentPage(1);
        navigate(location.pathname, { replace: true });
    };

    // Função para mudança de página
    const handlePageChange = (novaPagina) => {
        const filtrosComNovaPagina = {
            ...filtros,
            page: novaPagina
        };
        
        setFiltros(filtrosComNovaPagina);
        setCurrentPage(novaPagina);
        updateURL(filtrosComNovaPagina);
    };

    // Debug dos dados
    console.log('📊 Dados da API:', data);
    console.log('🔄 Loading:', isLoading);
    console.log('❌ Error:', error);

    // Processar dados da API
    const processarDados = () => {
        if (!data || !data.data) return [];
        
        console.log('🏢 Associados recebidos da API:', data.data);
        console.log('📊 Meta informações:', data.meta);
        
        // Filtrar apenas associados ativos e não bloqueados
        return data.data.filter(associado => {
            if (!associado) return false;
            
            // Verificar se não está bloqueado
            if (associado.bloqueado === true) return false;
            
            // Verificar se tem conta ativa
            if (associado.statusConta === false) return false;
            
            return true;
        });
    };

    const associadosProcessados = processarDados();
    
    // Paginação local (se necessário)
    const totalAssociados = associadosProcessados.length;
    const lastCardIndex = currentPage * cardsPerPage;
    const firstCardIndex = lastCardIndex - cardsPerPage;
    const associadosPaginados = associadosProcessados.slice(firstCardIndex, lastCardIndex);

    // Loading state
    if (isLoading) {
        return (
            <div className="container">
                <div className="containerHeader">Associados</div>
                <SearchField 
                    onFiltrosChange={aplicarFiltros}
                    onLimparFiltros={limparFiltros}
                    filtrosAtivos={filtros}
                />
                <div className="loading-container" style={{ 
                    textAlign: 'center', 
                    padding: '40px' 
                }}>
                    <p>Carregando associados...</p>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container">
                <div className="containerHeader">Associados</div>
                <SearchField 
                    onFiltrosChange={aplicarFiltros}
                    onLimparFiltros={limparFiltros}
                    filtrosAtivos={filtros}
                />
                <div className="error-container" style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    color: '#dc2626'
                }}>
                    <p>❌ Erro ao carregar associados</p>
                    <p>{error.message}</p>
                    <button 
                        onClick={() => refetch()}
                        className="retry-button"
                        style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#2d6cdf',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    // Verificar se há filtros ativos
    const hasFiltrosAtivos = Object.values(filtros).some(valor => 
        valor && valor !== '' && valor !== 1
    );

    return (
        <div className="container">
            <div className="containerHeader">
                Associados
                {/* Contador de resultados */}
                {totalAssociados > 0 && (
                    <span style={{ 
                        fontSize: '14px', 
                        color: '#6c757d', 
                        marginLeft: '10px' 
                    }}>
                        ({totalAssociados} encontrado{totalAssociados !== 1 ? 's' : ''})
                        {hasFiltrosAtivos && ' com filtros aplicados'}
                    </span>
                )}
            </div>
            
            <SearchField 
                onFiltrosChange={aplicarFiltros}
                onLimparFiltros={limparFiltros}
                filtrosAtivos={filtros}
            />
            
            {/* Indicador de filtros ativos */}
            {hasFiltrosAtivos && (
                <div className="filtros-ativos" style={{
                    backgroundColor: '#e3f2fd',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ fontSize: '14px', color: '#1976d2' }}>
                        🔍 Filtros aplicados
                    </span>
                    <button 
                        onClick={limparFiltros}
                        style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #1976d2',
                            color: '#1976d2',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Limpar filtros
                    </button>
                </div>
            )}
            
            <div className="associadosCardContainer">
                {associadosPaginados.length > 0 ? (
                    associadosPaginados.map((associado, index) => {
                        // Verificação de segurança
                        if (!associado) {
                            console.warn(`Associado ${index} é null ou undefined`);
                            return null;
                        }

                        return (
                            <AssociadosCard 
                                associado={associado} 
                                key={`associado-${associado.idUsuario || associado.id || index}`} 
                                index={index} 
                            />
                        );
                    })
                ) : (
                    <div className="no-results" style={{ 
                        textAlign: 'center', 
                        padding: '40px',
                        color: '#6c757d'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                        <h3>Nenhum associado encontrado</h3>
                        {hasFiltrosAtivos ? (
                            <>
                                <p>Não encontramos associados com os filtros aplicados.</p>
                                <button 
                                    onClick={limparFiltros}
                                    style={{
                                        marginTop: '16px',
                                        padding: '8px 16px',
                                        backgroundColor: '#2d6cdf',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Limpar filtros e ver todos
                                </button>
                            </>
                        ) : (
                            <p>Nenhum associado cadastrado no sistema.</p>
                        )}
                    </div>
                )}
            </div>
            
            {/* Paginação - mostrar apenas se houver mais de uma página */}
            {totalAssociados > cardsPerPage && (
                <PaginationCards 
                    cardsPerPage={cardsPerPage} 
                    totalCards={totalAssociados} 
                    setCurrentPage={handlePageChange} 
                    currentPage={currentPage} 
                />
            )}
            
            <Footer />
        </div>
    );
};

export default Associados;