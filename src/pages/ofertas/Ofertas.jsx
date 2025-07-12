import { useEffect, useState } from "react";
import OfertasCard from "./OfertasCard";
import Footer from "@/components/Footer";
import SearchfieldOfertas from "@/components/Search/SearchfieldOfertas";
import { activePage } from "@/utils/functions/setActivePage";
import { useQueryOfertas } from "@/hooks/ReactQuery/useQueryOfertas";
import PaginationCards from "@/components/cards/PaginationCards";

const Ofertas = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(12); // Ofertas por página

    // Usar paginação do backend
    const { data, isLoading, error } = useQueryOfertas(currentPage, cardsPerPage);

    useEffect(() => {
        activePage("ofertas")
    }, []);

    // Usar ofertas diretamente do backend (já filtradas)
    const ofertas = data?.ofertas || [];

    console.log('🎯 Ofertas recebidas da página', currentPage, ':', ofertas.length);
    console.log('📊 Meta dados:', data?.meta);

    // Backend já retorna apenas ofertas ativas e não vencidas
    const currentCards = ofertas;


    // Loading state
    if (isLoading) {
        return (
            <div className="container">
                <div className="containerHeader">Ofertas</div>
                <SearchfieldOfertas />
                <div className="loading-container" style={{ 
                    textAlign: 'center', 
                    padding: '40px' 
                }}>
                    <p>Carregando ofertas...</p>
                    <div className="spinner"></div>
                </div>
                <Footer />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container">
                <div className="containerHeader">Ofertas</div>
                <SearchfieldOfertas />
                <div className="error-container" style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    color: '#dc2626'
                }}>
                    <p>❌ Erro ao carregar ofertas</p>
                    <p>{error.message}</p>
                </div>
                <Footer />
            </div>
        );
    }

    // Calcular informações de paginação
    const totalOfertas = data?.meta?.totalOfertas || 0;
    const totalPages = data?.meta?.totalPages || 1;

    return (
        <div className="container">
            <div className="containerHeader">
                Ofertas
                {/* Contador de resultados */}
                {totalOfertas > 0 && (
                    <span style={{ 
                        fontSize: '14px', 
                        color: '#6c757d', 
                        marginLeft: '10px' 
                    }}>
                        ({totalOfertas} total | Página {currentPage} de {totalPages})
                    </span>
                )}
            </div>
            <SearchfieldOfertas />
            
            <div className="associadosCardContainer">
                {currentCards.length > 0 ? (
                    currentCards.map((filho, index) => (
                        <OfertasCard associado={filho} key={`oferta-${filho.idOferta || index}`} index={index} />
                    ))
                ) : (
                    <div className="no-results" style={{ 
                        textAlign: 'center', 
                        padding: '40px',
                        color: '#6c757d'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛍️</div>
                        <h3>Nenhuma oferta disponível</h3>
                        <p>Não há ofertas ativas no momento.</p>
                    </div>
                )}
            </div>
            
            {/* Paginação - usar dados do backend */}
            {totalPages > 1 && (
                <PaginationCards 
                    cardsPerPage={cardsPerPage} 
                    totalCards={totalOfertas} 
                    setCurrentPage={setCurrentPage} 
                    currentPage={currentPage} 
                />
            )}
            
            <Footer />
        </div>
    )
};

export default Ofertas;
