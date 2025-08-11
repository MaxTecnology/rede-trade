import { useEffect, useState } from "react";
import EditarGerenteModal from '@/Modals/EditarGerenteModal';
import Footer from "@/components/Footer";
import { activePage } from "@/utils/functions/setActivePage";
import GerentesTable from "@/components/Tables/GerentesTable";
import { columns } from "./constants";
import useModal from "@/hooks/useModal";
import { useQueryGerentes } from "@/hooks/ReactQuery/useQueryGerentes";
import GerenteSearch from "@/components/Search/GerenteSearch";
import { getType } from "@/hooks/getId";

const GerentesLista = () => {
    const { data, isLoading, error, refetch } = useQueryGerentes();
    const [modalIsOpen, modalToggle] = useModal();
    const [userInfo, setUserInfo] = useState();
    const [userId, setUserId] = useState();

    useEffect(() => {
        activePage("gerentes");
    }, []);

    // Mostrar loading
    if (isLoading) {
        return (
            <div className="container">
                <div className="containerHeader">Gerentes</div>
                <div style={{ 
                    padding: '20px', 
                    textAlign: 'center',
                    background: '#f0f8ff',
                    margin: '20px 0',
                    borderRadius: '8px'
                }}>
                    🔄 Carregando gerentes...
                </div>
                <Footer />
            </div>
        );
    }

    // Mostrar erro
    if (error) {
        return (
            <div className="container">
                <div className="containerHeader">Gerentes</div>
                <div style={{ 
                    padding: '20px', 
                    background: '#ffe6e6',
                    margin: '20px 0',
                    borderRadius: '8px',
                    border: '1px solid #ff9999'
                }}>
                    <h3>❌ Erro ao carregar gerentes</h3>
                    <p><strong>Erro:</strong> {error.message}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Recarregar Página
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    // Verificar se data existe mas está vazio
    if (!data || !data.data) {
        return (
            <div className="container">
                <div className="containerHeader">Gerentes</div>
                <div style={{ 
                    padding: '20px', 
                    background: '#fff3cd',
                    margin: '20px 0',
                    borderRadius: '8px',
                    border: '1px solid #ffeaa7'
                }}>
                    <h3>⚠️ Nenhum gerente encontrado</h3>
                    <p>Não há gerentes cadastrados no sistema ou houve um problema na busca.</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="container">
            {modalIsOpen && (
                <EditarGerenteModal
                    isOpen={true}
                    modalToggle={modalToggle}
                    associadoInfo={userInfo}
                    id={userId}
                />
            )}
            <div className="containerHeader">
                Gerentes
                {data?.meta?.total !== undefined && (
                    <span style={{ 
                        marginLeft: '10px', 
                        fontSize: '14px', 
                        color: '#666',
                        background: '#e9ecef',
                        padding: '4px 8px',
                        borderRadius: '12px'
                    }}>
                        {data.meta.total} total
                    </span>
                )}
            </div>
            <GerenteSearch />
            <div className="containerList">
                <GerentesTable
                    columns={columns}
                    data={data.data || []}
                    setId={setUserId}
                    setInfo={setUserInfo}
                    modaltoggle={modalToggle}
                    type={getType()}
                    revalidate={refetch}
                />
            </div>
            <Footer />
        </div>
    );
};

export default GerentesLista;