import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchField from "@/components/Search/SearchField";
import Footer from "@/components/Footer";
import { activePage } from "@/utils/functions/setActivePage";
import AssociadosTable from "@/components/Tables/AssociadosTable";
import EditarUsuariosModal from "@/Modals/EditarUsuariosModal";
import useModal from "@/hooks/useModal";
import { useQuerySubContas } from "@/hooks/ReactQuery/usuario/useQuerySubContas";
import { FaPlus, FaCog, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ButtonMotion from "@/components/FramerMotion/ButtonMotion";
import { toast } from "sonner";
import { ColorRing } from 'react-loader-spinner';
import { getType } from "@/hooks/getId";

const UsuariosMeus = () => {
    const navigate = useNavigate();
    const { data, isLoading, error } = useQuerySubContas();
    const [modalIsOpen, modalToggle] = useModal(false);
    const [userInfo, setUserInfo] = useState();
    const [userId, setUserId] = useState();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const userType = getType();

    useEffect(() => {
        activePage("usuarios");
        
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Colunas específicas para subcontas - diferentes para Matriz
    const subcontasColumns = [
        {
            accessorKey: 'numeroSubConta',
            header: 'Número da Subconta',
        },
        {
            accessorKey: 'nome',
            header: 'Nome',
        },
        {
            accessorKey: 'email',
            header: 'E-mail',
        },
        // Só mostrar proprietário para usuários Matriz
        ...(userType === 'Matriz' ? [{
            accessorKey: 'contaPai.nomeFranquia',
            header: 'Proprietário',
            cell: (value) => value.getValue() || 'N/A',
        }] : []),
        {
            accessorKey: 'statusConta',
            header: 'Status',
            cell: (value) => value.getValue() ? "Ativa" : "Inativa",
        },
        {
            accessorKey: 'reputacao',
            header: 'Reputação',
            cell: (value) => value.getValue() ? `${value.getValue()}/5` : "0/5",
        }
    ];

    // Ações personalizadas para subcontas
    const SubcontaActions = ({ subconta }) => {
        const handleEditPermissions = () => {
            navigate('/subcontasPermissoes', { 
                state: { subcontaId: subconta.idSubContas } 
            });
        };

        const handleView = () => {
            setUserInfo(subconta);
            setUserId(subconta.idSubContas);
            modalToggle();
        };

        const handleDelete = async () => {
            if (window.confirm(`Tem certeza que deseja excluir a subconta "${subconta.nome}"?`)) {
                try {
                    const token = localStorage.getItem('tokenRedeTrade');
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
                    
                    const response = await fetch(`${apiUrl}/contas/deletar-subconta/${subconta.idSubContas}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        toast.success('Subconta excluída com sucesso!');
                        // Recarregar a lista
                        window.location.reload();
                    } else {
                        throw new Error('Erro ao excluir subconta');
                    }
                } catch (error) {
                    toast.error('Erro ao excluir subconta');
                    console.error('Erro:', error);
                }
            }
        };

        return (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                    onClick={handleView}
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.2s'
                    }}
                    title="Visualizar"
                    onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                >
                    <FaEye /> Ver
                </button>
                <button
                    onClick={handleEditPermissions}
                    style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.2s'
                    }}
                    title="Editar Permissões"
                    onMouseOver={(e) => e.target.style.backgroundColor = '#1e7e34'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                >
                    <FaCog /> Permissões
                </button>
                <button
                    onClick={handleDelete}
                    style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.2s'
                    }}
                    title="Excluir"
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                >
                    <FaTrash /> Excluir
                </button>
            </div>
        );
    };

    // Renderizar cards mobile para subcontas
    const renderSubcontaCards = () => {
        const subcontas = data?.subcontas || [];
        
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {subcontas.map((subconta) => (
                    <div key={subconta.idSubContas} style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: '1px solid #e9ecef'
                    }}>
                        <div style={{ marginBottom: '15px' }}>
                            <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>{subconta.nome}</h4>
                            <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>{subconta.numeroSubConta}</p>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                                <strong>Email:</strong> {subconta.email}
                            </p>
                            {userType === 'Matriz' && (
                                <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                                    <strong>Proprietário:</strong> {subconta.contaPai?.nomeFranquia || 'N/A'}
                                </p>
                            )}
                            <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                                <strong>Status:</strong> 
                                <span style={{
                                    backgroundColor: subconta.statusConta ? '#d4edda' : '#f8d7da',
                                    color: subconta.statusConta ? '#155724' : '#721c24',
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    fontSize: '12px',
                                    marginLeft: '8px'
                                }}>
                                    {subconta.statusConta ? 'Ativa' : 'Inativa'}
                                </span>
                            </p>
                            <p style={{ margin: '0', fontSize: '14px' }}>
                                <strong>Reputação:</strong> {subconta.reputacao || 0}/5
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <SubcontaActions subconta={subconta} />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Renderizar tabela customizada para subcontas
    const renderSubcontasTable = () => {
        const subcontas = data?.subcontas || [];

        if (subcontas.length === 0) {
            return (
                <div style={{ 
                    textAlign: 'center', 
                    padding: isMobile ? '40px 20px' : '60px 40px',
                    color: '#6c757d',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    margin: '0 auto',
                    maxWidth: '600px'
                }}>
                    <div style={{ fontSize: isMobile ? '48px' : '64px', marginBottom: '24px', opacity: 0.6 }}>👥</div>
                    <h3 style={{ marginBottom: '12px', color: '#495057', fontSize: isMobile ? '18px' : '20px' }}>Nenhuma subconta encontrada</h3>
                    <p style={{ marginBottom: '24px', fontSize: isMobile ? '14px' : '16px' }}>Você ainda não possui subcontas criadas. Crie sua primeira subconta para começar a gerenciar usuários adicionais.</p>
                    <ButtonMotion 
                        className="purpleBtn"
                        onClick={() => navigate('/subcontasCadastrar')}
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            padding: isMobile ? '10px 20px' : '12px 24px',
                            fontSize: isMobile ? '14px' : '16px'
                        }}
                    >
                        <FaPlus /> Criar Primeira Subconta
                    </ButtonMotion>
                </div>
            );
        }

        return (
            <div style={{ 
                backgroundColor: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                                Número
                            </th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                                Nome
                            </th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                                Email
                            </th>
                            {userType === 'Matriz' && (
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                                    Proprietário
                                </th>
                            )}
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                                Status
                            </th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                                Reputação
                            </th>
                            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {subcontas.map((subconta, index) => (
                            <tr key={subconta.idSubContas} style={{ 
                                borderBottom: '1px solid #dee2e6',
                                backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                            }}>
                                <td style={{ padding: '12px' }}>
                                    {subconta.numeroSubConta}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {subconta.nome}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {subconta.email}
                                </td>
                                {userType === 'Matriz' && (
                                    <td style={{ padding: '12px' }}>
                                        {subconta.contaPai?.nomeFranquia || 'N/A'}
                                    </td>
                                )}
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        backgroundColor: subconta.statusConta ? '#d4edda' : '#f8d7da',
                                        color: subconta.statusConta ? '#155724' : '#721c24',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px'
                                    }}>
                                        {subconta.statusConta ? 'Ativa' : 'Inativa'}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {subconta.reputacao || 0}/5
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <SubcontaActions subconta={subconta} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="container">
                <div className="containerHeader">Lista de Subcontas</div>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '300px' 
                }}>
                    <ColorRing
                        visible={true}
                        height="80"
                        width="80"
                        ariaLabel="color-ring-loading"
                        colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
                    />
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="containerHeader">Lista de Subcontas</div>
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    color: '#dc3545'
                }}>
                    <h3>Erro ao carregar subcontas</h3>
                    <p>{error.message}</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="container">
            {modalIsOpen && (
                <EditarUsuariosModal
                    isOpen={true}
                    modalToggle={modalToggle}
                    associadoInfo={userInfo}
                    id={userId}
                />
            )}
            
            <div className="containerHeader">
                {userType === 'Matriz' ? 'Todas as Subcontas do Sistema' : 'Lista de Subcontas'}
                <span style={{ 
                    fontSize: '14px', 
                    color: '#6c757d', 
                    marginLeft: '10px' 
                }}>
                    ({data?.subcontas?.length || 0} subconta{(data?.subcontas?.length || 0) !== 1 ? 's' : ''})
                </span>
            </div>
            
            <div className="containerSearch">
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '15px 20px',
                    flexWrap: 'wrap',
                    gap: '15px'
                }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                        <SearchField showNewButton={false} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <ButtonMotion 
                            className="purpleBtn"
                            onClick={() => navigate('/subcontasCadastrar')}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                whiteSpace: 'nowrap',
                                padding: '10px 16px',
                                fontSize: '14px'
                            }}
                        >
                            <FaPlus /> Nova Subconta
                        </ButtonMotion>
                    </div>
                </div>
            </div>
            
            <div className="containerList">
                {isMobile ? renderSubcontaCards() : renderSubcontasTable()}
            </div>
            
            <Footer />
        </div>
    );
};

export default UsuariosMeus;
