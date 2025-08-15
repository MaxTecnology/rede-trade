import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EditarAssociadoModal from '@/Modals/EditarAssociadoModal';
import SearchField from "@/components/Search/SearchField";
import Footer from "@/components/Footer";
import { activePage } from "@/utils/functions/setActivePage";
import AssociadosTable from "@/components/Tables/AssociadosTable";
import { columns, processarDadosTabela } from "./constants";
import { useQueryAssociados } from "@/hooks/ReactQuery/useQueryAssociados";
import { useQueryCategorias } from "@/hooks/ReactQuery/useQueryCategorias";
import useModal from "@/hooks/useModal";
import { getType } from "@/hooks/getId";
import { BsDownload, BsFileEarmarkExcel, BsFiletypeCsv } from 'react-icons/bs';

const AssociadosLista = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [modalIsOpen, modalToggle] = useModal(false);
    const [userInfo, setUserInfo] = useState(null);
    const [userId, setUserId] = useState(null);
    
    // Função personalizada para abrir modal com refetch
    const openModalWithRefresh = () => {
        refetch(); // Forçar refetch antes de abrir modal
        setTimeout(() => {
            modalToggle();
        }, 200); // Pequeno delay para garantir que refetch termine
    };
    const [dadosProcessados, setDadosProcessados] = useState([]);

    // Estados para filtros
    const [filtros, setFiltros] = useState({
        search: '',
        agencia: '',
        categoriaId: '',
        account: '',
        estado: '',
        cidade: '',
        page: 1
    });

    // Queries
    const { data: categorias, isLoading: categoriasLoading } = useQueryCategorias();

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

    // Ler parâmetros da URL
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
        // console.log('🔍 Filtros da URL (Lista):', newFiltros); // Comentado para produção
    }, [location.search]);

    // Query para buscar associados
    const { data, isLoading, error, refetch } = useQueryAssociados(
        1,                        // page - buscar todos
        'Associado',              // tipoDaConta
        filtros.search,           // nome
        filtros.search,           // nomeFantasia
        '',                       // razaoSocial
        '',                       // nomeContato  
        filtros.estado,           // estado
        filtros.cidade,           // cidade
        '',                       // usuarioCriadorId
        1000,                     // pageSize - buscar muitos para filtrar localmente
        filtros.categoriaId,      // categoriaId
        filtros.agencia,          // agencia  
        filtros.account           // account
    );

    useEffect(() => {
        activePage("associados");
    }, []);

    // Processar dados quando recebidos
    useEffect(() => {
        if (data && data.data) {
            // console.log('📊 Dados brutos da API:', data); // Comentado para produção
            // console.log('📊 Meta informações:', data.meta); // Comentado para produção
            
            // Extrair dados da resposta
            const associados = data.data;

            // Processar e filtrar dados
            const dadosFiltrados = processarDadosTabela(associados, filtros);
            setDadosProcessados(dadosFiltrados);
            
            // console.log('🏢 Associados processados para tabela:', dadosFiltrados); // Comentado para produção
        }
    }, [data, filtros]);

    // Função para aplicar filtros
    const aplicarFiltros = (novosFiltros) => {
        const filtrosAtualizados = {
            ...filtros,
            ...novosFiltros,
            page: 1
        };
        
        setFiltros(filtrosAtualizados);
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
        navigate(location.pathname, { replace: true });
    };

    // Função para exportar dados
    // const exportarDados = (formato) => {
    //     if (!dadosProcessados.length) {
    //         alert('Nenhum dado para exportar');
    //         return;
    //     }

    //     try {
    //         if (formato === 'csv') {
    //             exportarCSV();
    //         } else if (formato === 'excel') {
    //             exportarExcel();
    //         }
    //     } catch (error) {
    //         console.error('Erro ao exportar:', error);
    //         alert('Erro ao exportar dados');
    //     }
    // };

    // Exportar CSV
    // const exportarCSV = () => {
    //     const headers = [
    //         'Nome Fantasia', 'Email', 'Telefone', 'Estado', 'Cidade', 
    //         'Status', 'Categoria', 'Agência', 'Conta'
    //     ];

    //     const csvData = dadosProcessados.map(item => [
    //         item.nomeFantasia || item.nome || '',
    //         item.email || item.emailContato || '',
    //         item.telefone || item.celular || '',
    //         item.estado || '',
    //         item.cidade || '',
    //         (item.status === true || item.status === 'Ativo') ? 'Ativo' : 'Inativo',
    //         (() => {
    //             if (!item.categoriaId || !categorias?.categorias) return 'Sem categoria';
    //             const cat = categorias.categorias.find(c => c.idCategoria === item.categoriaId);
    //             return cat ? cat.nomeCategoria : 'Categoria não encontrada';
    //         })(),
    //         item.conta?.nomeFranquia || item.agencia || '',
    //         item.conta?.numeroConta || ''
    //     ]);

    //     const csvContent = [headers, ...csvData]
    //         .map(row => row.map(field => `"${field}"`).join(';'))
    //         .join('\n');

    //     const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    //     const link = document.createElement('a');
    //     link.href = URL.createObjectURL(blob);
    //     link.download = `associados_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
    //     link.click();
    // };

    // // Exportar Excel (simulado como CSV)
    // const exportarExcel = () => {
    //     exportarCSV(); // Por simplicidade, usar CSV como Excel
    // };

    // Verificar se há filtros ativos
    const hasFiltrosAtivos = Object.values(filtros).some(valor => 
        valor && valor !== '' && valor !== 1
    );

    // Loading state
    if (isLoading) {
        return (
            <div className="container">
                <div className="containerHeader">Lista de Associados</div>
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
                <div className="containerHeader">Lista de Associados</div>
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

    return (
        <div className="container">
            {/* Modal de Edição */}
            {modalIsOpen && (
                <EditarAssociadoModal
                    isOpen={true}
                    modalToggle={modalToggle}
                    associadoInfo={userInfo}
                    id={userId}
                />
            )}

            {/* Header */}
            <div className="containerHeader">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        Lista de Associados
                        {/* Contador de resultados */}
                        {dadosProcessados.length > 0 && (
                            <span style={{ 
                                fontSize: '14px', 
                                color: '#6c757d', 
                                marginLeft: '10px' 
                            }}>
                                ({dadosProcessados.length} encontrado{dadosProcessados.length !== 1 ? 's' : ''})
                                {hasFiltrosAtivos && ' com filtros aplicados'}
                            </span>
                        )}
                    </div>

                    {/* Botões de exportação */}
                    {/* {dadosProcessados.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => exportarDados('csv')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 12px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                                title="Exportar como CSV"
                            >
                                <BsFiletypeCsv />
                                CSV
                            </button>
                            <button
                                onClick={() => exportarDados('excel')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 12px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                                title="Exportar como Excel"
                            >
                                <BsFileEarmarkExcel />
                                Excel
                            </button>
                        </div>
                    )} */}
                </div>
            </div>

            {/* Campo de busca */}
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

            {/* Conteúdo da lista */}
            <div className="containerList">
                {dadosProcessados.length > 0 ? (
                    <div style={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                    }}>
                        <AssociadosTable
                            columns={columns}
                            data={dadosProcessados}
                            setId={setUserId}
                            setInfo={setUserInfo}
                            modaltoggle={openModalWithRefresh}
                            type={getType()}
                            categorias={categorias?.categorias || []}
                            revalidate={refetch}
                        />
                    </div>
                ) : (
                    <div className="no-results" style={{ 
                        textAlign: 'center', 
                        padding: '40px',
                        color: '#6c757d',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
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
            
            <Footer />
        </div>
    );
};

export default AssociadosLista;