import { useEffect, useState } from "react";
import SearchField from '@/components/Search/SearchField';
import AssociadosCard from "./AssociadosCard";
import Footer from "@/components/Footer";
import { activePage } from "@/utils/functions/setActivePage";
import { useQueryAssociados } from "@/hooks/ReactQuery/useQueryAssociados";
import PaginationCards from "@/components/cards/PaginationCards";
import { useSnapshot } from "valtio";
import state from "@/store";

const Associados = () => {

    const params = new URLSearchParams(window.location.search);
    let search = params.get('search');
    let agencia = params.get('agencia');
    let categoriaId = params.get('categoriaId');
    let account = params.get('account');
    let estado = params.get('estado');
    let cidade = params.get('cidade');
    let page = params.get('page') || 1;

    useSnapshot(state);
    const { data } = useQueryAssociados(page, 'Associado', search, search, '', '', estado, cidade  );
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage, setCardsPerPage] = useState(6);
    const user = state.user;

    useEffect(() => {
        activePage("associados")
    }, []);

    const filteredData = data && data.data ? data.data : [];
    const activeCards = filteredData.filter( c => !c.bloqueado )
    const lastCardIndex = currentPage * cardsPerPage;
    const firstCardIndex = lastCardIndex - cardsPerPage;
    const currentCards = activeCards ? activeCards.slice(firstCardIndex, lastCardIndex) : [];
 
    return (
        <div className="container">
            <div className="containerHeader">Associados  </div>
            <SearchField />
            <div className="associadosCardContainer">
                {activeCards.map((filho, index) => (
                    <AssociadosCard associado={filho} key={index} index={index} />
                ))}
            </div>
            <PaginationCards cardsPerPage={cardsPerPage} totalCards={data && data.data ? currentCards.length : 0} setCurrentPage={setCurrentPage} currentPage={currentPage} />
            <Footer />
        </div>
    )
};

export default Associados;