import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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

    // Usar useLocation para reagir a mudanças na URL
    const params = new URLSearchParams(location.search);
    let search = params.get('search') || '';
    let agencia = params.get('agencia') || '';
    let categoriaId = params.get('categoriaId') || '';
    let account = params.get('account') || '';
    let estado = params.get('estado') || '';
    let cidade = params.get('cidade') || '';
    let page = params.get('page') || '1';

    useSnapshot(state);
    
    // Debug: verificar parâmetros
    console.log('🔍 Parâmetros da URL:', {
        search, agencia, categoriaId, account, estado, cidade, page
    });

    // Passar parâmetros corretos para o hook com os novos filtros
    const { data, isLoading, error } = useQueryAssociados(
        parseInt(page) || 1,      // page
        'Associado',              // tipoDaConta
        search,                   // nome (busca por nome)
        search,                   // nomeFantasia (busca por nome fantasia)
        '',                       // razaoSocial
        '',                       // nomeContato  
        estado,                   // estado
        cidade,                   // cidade
        '',                       // usuarioCriadorId
        100,                      // pageSize
        categoriaId,              // categoriaId (NOVO)
        agencia,                  // agencia (NOVO)  
        account                   // account (NOVO)
    );
    
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage, setCardsPerPage] = useState(6);
    const user = state.user;

    useEffect(() => {
        activePage("associados")
    }, []);

    // Debug: verificar dados retornados
    console.log('📥 Dados da API:', data);
    console.log('🔄 Loading:', isLoading);
    console.log('❌ Error:', error);

    const filteredData = data && data.data ? data.data : [];
    const activeCards = filteredData.filter(c => !c.bloqueado);
    const lastCardIndex = currentPage * cardsPerPage;
    const firstCardIndex = lastCardIndex - cardsPerPage;
    const currentCards = activeCards ? activeCards.slice(firstCardIndex, lastCardIndex) : [];

    // Loading state
    if (isLoading) {
        return (
            <div className="container">
                <div className="containerHeader">Associados</div>
                <SearchField />
                <p>Carregando...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container">
                <div className="containerHeader">Associados</div>
                <SearchField />
                <p>Erro ao carregar dados: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="containerHeader">
                Associados
                {/* Mostrar contador de resultados */}
                {filteredData.length > 0 && (
                    <span style={{ fontSize: '14px', color: '#6c757d', marginLeft: '10px' }}>
                        ({filteredData.length} encontrado{filteredData.length !== 1 ? 's' : ''})
                    </span>
                )}
            </div>
            
            <SearchField />
            
            <div className="associadosCardContainer">
                {activeCards.length > 0 ? (
                    activeCards.map((filho, index) => {
                        // Verificação de segurança antes de renderizar
                        if (!filho) {
                            console.warn(`Item ${index} é null ou undefined`);
                            return null;
                        }

                        return (
                            <AssociadosCard 
                                associado={filho} 
                                key={`associado-${filho.idUsuario || index}`} 
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
                        <p>Nenhum associado encontrado com os filtros aplicados.</p>
                        {(search || estado || cidade || categoriaId || account || agencia) && (
                            <p>Tente ajustar os filtros ou limpar todos os filtros.</p>
                        )}
                    </div>
                )}
            </div>
            
            <PaginationCards 
                cardsPerPage={cardsPerPage} 
                totalCards={activeCards.length} 
                setCurrentPage={setCurrentPage} 
                currentPage={currentPage} 
            />
            <Footer />
        </div>
    )
};

export default Associados;