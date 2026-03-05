import { useEffect, useState } from "react";
import Footer from '@/components/Footer';
import CreditosModal from "@/Modals/CreditosModal";
import SearchfieldCredito from "@/components/Search/SearchfieldCredito";
import { activePage } from "@/utils/functions/setActivePage";
import CreditosTable from "@/components/Tables/CreditosTable";
import { columns } from "./constantCreditos";
import { getApiData } from "@/hooks/ListasHook";
import useModal from "@/hooks/useModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const Credito = () => {
    const [id, setId] = useState("");
    const [modalIsOpen, modalToggle] = useModal(false);
    const [info, setInfo] = useState();
    const queryClient = useQueryClient();

    useEffect(() => {
        activePage("creditos");
    }, []);

    const { data } = useQuery({
        queryKey: ["creditos", "todos"],
        queryFn: async () => getApiData("creditos/listar-todos"),
        staleTime: 30000,
    });

    const handleActionSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ["creditos"] });
    };

    return (
        <div className="container">
            {modalIsOpen ?
                <CreditosModal
                    isOpen={true}
                    modalToggle={modalToggle}
                    info={info}
                    onActionSuccess={handleActionSuccess}
                />
                : null}
            <div className="containerHeader">Creditos</div>
            <SearchfieldCredito />
            <div className="containerList">
                <CreditosTable
                    columns={columns}
                    data={data && data.todasSolicitacoes ? data.todasSolicitacoes : []}
                    setId={setId}
                    setInfo={setInfo}
                    modaltoggle={modalToggle}
                />
            </div>
            <Footer />
        </div>)
};

export default Credito;
