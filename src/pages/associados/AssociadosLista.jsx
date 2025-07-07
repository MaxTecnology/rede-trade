import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import EditarAssociadoModal from '@/Modals/EditarAssociadoModal';
import SearchField from "@/components/Search/SearchField";
import Footer from "@/components/Footer";
import { activePage } from "@/utils/functions/setActivePage";
import AssociadosTable from "@/components/Tables/AssociadosTable";
import { columns } from "./constants";
import { useQueryAssociados } from "@/hooks/ReactQuery/useQueryAssociados";
import useModal from "@/hooks/useModal";
import { getType } from "@/hooks/getId";

const AssociadosLista = () => {
    const location = useLocation();
    const [modalIsOpen, modalToggle] = useModal(false);
    const [userInfo, setUserInfo] = useState()
    const [userId, setUserId] = useState()

    // Ler parâmetros da URL para aplicar filtros
    const params = new URLSearchParams(location.search);
    let search = params.get('search') || '';
    let agencia = params.get('agencia') || '';
    let categoriaId = params.get('categoriaId') || '';
    let account = params.get('account') || '';
    let estado = params.get('estado') || '';
    let cidade = params.get('cidade') || '';
    let page = params.get('page') || '1';

    // Debug: verificar parâmetros
    console.log('🔍 Parâmetros da URL (Lista):', {
        search, agencia, categoriaId, account, estado, cidade, page
    });

    // Aplicar filtros na consulta
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
        categoriaId,              // categoriaId
        agencia,                  // agencia  
        account                   // account
    );

    useEffect(() => {
        activePage("associados")
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <div className="container">
                <div className="containerHeader">Lista de Associados</div>
                <SearchField />
                <p>Carregando...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container">
                <div className="containerHeader">Lista de Associados</div>
                <SearchField />
                <p>Erro ao carregar dados: {error.message}</p>
            </div>
        );
    }

    const filteredData = data && data.data ? data.data : [];

    return (
        <div className="container">
            {modalIsOpen ?
                <EditarAssociadoModal
                    isOpen={true}
                    modalToggle={modalToggle}
                    associadoInfo={userInfo}
                    id={userId}
                />
                : null}
            <div className="containerHeader">
                Lista de Associados
                {/* Mostrar contador de resultados */}
                {filteredData.length > 0 && (
                    <span style={{ fontSize: '14px', color: '#6c757d', marginLeft: '10px' }}>
                        ({filteredData.length} encontrado{filteredData.length !== 1 ? 's' : ''})
                    </span>
                )}
            </div>
            <SearchField />
            <div className="containerList">
                {filteredData.length > 0 ? (
                    <AssociadosTable
                        columns={columns}
                        data={filteredData}
                        setId={setUserId}
                        setInfo={setUserInfo}
                        modaltoggle={modalToggle}
                        type={getType()}
                    />
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
            <Footer />
        </div>)
};

export default AssociadosLista;
