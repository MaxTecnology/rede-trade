import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import SearchfieldOfertas from "@/components/Search/SearchfieldOfertas";
import { getId } from "@/hooks/getId";
import { activePage } from "@/utils/functions/setActivePage";
import MinhasOfertasModal from "@/Modals/MinhasOfertasModal";
import OfertasTable from "@/components/Tables/OfertasTable";
import { columns } from "./constants";
import useModal from "@/hooks/useModal";
import { useQueryOfertas } from "@/hooks/ReactQuery/useQueryOfertas";

const OfertasMinhas = () => {
    const userId = getId();
    const [modalIsOpen, modalToggle] = useModal(false);
    const [info, setInfo] = useState({ nome: "", porcentagem: "" });
    const [id, setId] = useState();

    // Filtros para buscar apenas as ofertas do usuário logado
    const filtros = { usuarioId: userId };

    // Passar os filtros para o hook
    const { data, isLoading, error } = useQueryOfertas(1, 100, filtros); // Pag 1, Limite 100

    useEffect(() => {
        activePage("ofertas");
    }, []);

    console.log("DEBUG: OfertasMinhas - isLoading:", isLoading);
    console.log("DEBUG: OfertasMinhas - error:", error);
    console.log("DEBUG: OfertasMinhas - data:", data);
    console.log("DEBUG: OfertasMinhas - userId:", userId);

    // Os dados já vêm filtrados do backend
    const minhasOfertas = data?.ofertas || [];

    console.log("DEBUG: OfertasMinhas - minhasOfertas.length:", minhasOfertas.length);

    if (isLoading) return <div>Carregando...</div>;
    if (error) return <div>Erro ao carregar ofertas.</div>;

    return (
        <div className="container">
            <MinhasOfertasModal
                isOpen={modalIsOpen}
                modalToggle={modalToggle}
                ofertaInfo={info}
                id={id}
            />
            <div className="containerHeader">Minhas Ofertas</div>
            <SearchfieldOfertas type={"list"} />
            <div className="containerList">
                <OfertasTable
                    columns={columns}
                    data={minhasOfertas}
                    setId={setId}
                    setInfo={setInfo}
                    modaltoggle={modalToggle}
                    admin
                />
            </div>
            <Footer />
        </div>
    );
};

export default OfertasMinhas;
