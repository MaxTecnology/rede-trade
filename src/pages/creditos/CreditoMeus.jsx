import { useEffect, useState } from "react";
import Footer from '@/components/Footer';
import CreditosModal from "@/Modals/CreditosModal";
import SearchfieldCredito from "@/components/Search/SearchfieldCredito";
import { activePage } from "@/utils/functions/setActivePage";
import CreditosTable from "@/components/Tables/CreditosTable";
import { columns } from "./constantCreditos";
import { getApiData } from "@/hooks/ListasHook";
import { getId } from "@/hooks/getId";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const CreditoMeus = () => {
    const [id, setId] = useState("");
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [info, setInfo] = useState();
    const queryClient = useQueryClient();
    const userId = getId();

    useEffect(() => {
        activePage("creditos");
    }, []);

    const modalToggle = () => {
        setModalIsOpen(!modalIsOpen);
    };

    const { data } = useQuery({
        queryKey: ["creditos", "usuario", userId],
        queryFn: async () => getApiData(`creditos/listar/${userId}`),
        enabled: !!userId,
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
            <div className="containerHeader">Meus Créditos</div>
            <SearchfieldCredito />
            <div className="containerList">
                {data && data.solicitacoesCredito ?
                    <CreditosTable
                        columns={columns}
                        data={data.solicitacoesCredito}
                        setId={setId}
                        setInfo={setInfo}
                        modaltoggle={modalToggle}
                    />
                    :
                    <CreditosTable
                        columns={columns}
                        data={Array.isArray(data) ? data : []}
                        setId={setId}
                        setInfo={setInfo}
                        modaltoggle={modalToggle}
                    />
                }
            </div>
            <Footer />
        </div>)
};

export default CreditoMeus;
