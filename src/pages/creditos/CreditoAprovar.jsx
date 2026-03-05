import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Footer from '@/components/Footer';
import CreditosModal from "@/Modals/CreditosModal";
import SearchfieldCredito from "@/components/Search/SearchfieldCredito";
import { activePage } from "@/utils/functions/setActivePage";
import CreditosTable from "@/components/Tables/CreditosTable";
import { columns } from "./constantCreditos";
import useModal from "@/hooks/useModal";
import { useQueryCreditosAprovar } from "@/hooks/ReactQuery/useQueryCreditosAprovar";

const CreditoAprovar = () => {
    const { data: creditosAprovar } = useQueryCreditosAprovar();
    const [id, setId] = useState("");
    const [modalIsOpen, modalToggle] = useModal(false);
    const [info, setInfo] = useState();
    const queryClient = useQueryClient();

    useEffect(() => {
        activePage("creditos");
    }, []);

    const handleActionSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ["creditos"] });
    };

    const data = creditosAprovar?.solicitacoesEmAnalise ?? [];

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
            <div className="containerHeader">Créditos a Aprovar</div>
            <SearchfieldCredito />
            <div className="containerList">
                <CreditosTable
                    columns={columns}
                    data={data}
                    setId={setId}
                    setInfo={setInfo}
                    modaltoggle={modalToggle}
                />
            </div>
            <Footer />
        </div>)
};

export default CreditoAprovar;
