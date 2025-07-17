import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ColorRing } from 'react-loader-spinner';
import Footer from "@/components/Footer";
import { activePage } from "@/utils/functions/setActivePage";
import ButtonMotion from "@/components/FramerMotion/ButtonMotion";
import useRevalidate from "@/hooks/ReactQuery/useRevalidate";
import { FaCheck, FaTimes, FaUser } from "react-icons/fa";

const SubcontasPermissoes = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const revalidate = useRevalidate();
    const [loading, setLoading] = useState(false);
    const [subconta, setSubconta] = useState(null);
    const [permissoes, setPermissoes] = useState({});
    const [loadingData, setLoadingData] = useState(true);

    // Obter ID da subconta da URL ou estado
    const subcontaId = location.state?.subcontaId || new URLSearchParams(location.search).get('id');

    useEffect(() => {
        activePage("usuarios");
        if (subcontaId) {
            buscarSubconta();
        } else {
            toast.error('ID da subconta não encontrado');
            navigate('/usuariosEditar');
        }
    }, [subcontaId]);

    // Buscar dados da subconta
    const buscarSubconta = async () => {
        try {
            setLoadingData(true);
            
            const token = localStorage.getItem('tokenRedeTrade');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';

            // Buscar dados da subconta
            const responseSubconta = await fetch(`${apiUrl}/contas/buscar-subconta/${subcontaId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!responseSubconta.ok) {
                throw new Error('Erro ao buscar subconta');
            }

            const dataSubconta = await responseSubconta.json();
            setSubconta(dataSubconta);

            // Buscar permissões da subconta
            const responsePermissoes = await fetch(`${apiUrl}/contas/subcontas/permissoes/${subcontaId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (responsePermissoes.ok) {
                const dataPermissoes = await responsePermissoes.json();
                setPermissoes(dataPermissoes.permissoes || {});
            } else {
                // Se não há permissões, inicializar com vazio
                setPermissoes({});
            }

        } catch (error) {
            console.error('❌ Erro ao buscar subconta:', error);
            toast.error('Erro ao carregar dados da subconta');
        } finally {
            setLoadingData(false);
        }
    };

    // Salvar permissões
    const salvarPermissoes = async () => {
        if (!subcontaId) {
            toast.error('ID da subconta não encontrado');
            return;
        }

        try {
            setLoading(true);
            
            const token = localStorage.getItem('tokenRedeTrade');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';

            const response = await fetch(`${apiUrl}/contas/subcontas/atualizar-permissoes/${subcontaId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ permissoes })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao salvar permissões');
            }

            toast.success('Permissões atualizadas com sucesso!');
            revalidate('sub-contas');
            navigate('/usuariosEditar');

        } catch (error) {
            console.error('❌ Erro ao salvar permissões:', error);
            toast.error(error.message || 'Erro ao salvar permissões');
        } finally {
            setLoading(false);
        }
    };

    // Alterar permissão específica
    const alterarPermissao = (categoria, item) => {
        setPermissoes(prev => ({
            ...prev,
            [categoria]: {
                ...prev[categoria],
                [item]: !prev[categoria]?.[item]
            }
        }));
    };

    // Alterar categoria inteira
    const alterarCategoria = (categoria, status) => {
        const itemsCategoria = permissoesDisponiveis[categoria];
        const novaPermissaoCategoria = {};
        
        itemsCategoria.forEach(item => {
            novaPermissaoCategoria[item.key] = status;
        });

        setPermissoes(prev => ({
            ...prev,
            [categoria]: novaPermissaoCategoria
        }));
    };

    // Definir permissões disponíveis
    const permissoesDisponiveis = {
        atendimento: [
            { key: 'visualizar', label: 'Visualizar Atendimentos' },
            { key: 'responder', label: 'Responder Atendimentos' },
            { key: 'criar', label: 'Criar Atendimentos' }
        ],
        compras: [
            { key: 'visualizar', label: 'Visualizar Compras' },
            { key: 'criar', label: 'Realizar Compras' },
            { key: 'aprovar', label: 'Aprovar Compras' }
        ],
        vendas: [
            { key: 'visualizar', label: 'Visualizar Vendas' },
            { key: 'criar', label: 'Realizar Vendas' },
            { key: 'cancelar', label: 'Cancelar Vendas' }
        ],
        ofertas: [
            { key: 'visualizar', label: 'Visualizar Ofertas' },
            { key: 'criar', label: 'Criar Ofertas' },
            { key: 'editar', label: 'Editar Ofertas' },
            { key: 'excluir', label: 'Excluir Ofertas' }
        ],
        extratos: [
            { key: 'visualizar', label: 'Visualizar Extratos' },
            { key: 'solicitar_estorno', label: 'Solicitar Estorno' }
        ],
        vouchers: [
            { key: 'visualizar', label: 'Visualizar Vouchers' },
            { key: 'solicitar', label: 'Solicitar Vouchers' },
            { key: 'aprovar', label: 'Aprovar Vouchers' },
            { key: 'recusar', label: 'Recusar Vouchers' }
        ],
        faturas: [
            { key: 'visualizar', label: 'Visualizar Faturas' },
            { key: 'pagar', label: 'Pagar Faturas' }
        ],
        minhaConta: [
            { key: 'visualizar', label: 'Ver Dados da Conta' },
            { key: 'editar', label: 'Editar Dados da Conta' }
        ],
        meusUsuarios: [
            { key: 'visualizar', label: 'Visualizar Usuários' },
            { key: 'criar', label: 'Criar Usuários' },
            { key: 'editar', label: 'Editar Usuários' }
        ],
        permissoesConta: [
            { key: 'gerenciar', label: 'Gerenciar Permissões' }
        ]
    };

    if (loadingData) {
        return (
            <div className="container">
                <div className="containerHeader">Carregando...</div>
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

    return (
        <div className="container">
            <div className="containerHeader">
                <FaUser /> Permissões de {subconta?.nome || 'Subconta'}
            </div>

            {subconta && (
                <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '15px', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    border: '1px solid #e9ecef'
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>
                        Informações da Subconta
                    </h4>
                    <p style={{ margin: '5px 0', color: '#6c757d' }}>
                        <strong>Nome:</strong> {subconta.nome}
                    </p>
                    <p style={{ margin: '5px 0', color: '#6c757d' }}>
                        <strong>Email:</strong> {subconta.email}
                    </p>
                    <p style={{ margin: '5px 0', color: '#6c757d' }}>
                        <strong>Número da Subconta:</strong> {subconta.numeroSubConta}
                    </p>
                </div>
            )}

            <div className="containerForm">
                <div className="formDivider">
                    <p>Configurar Permissões</p>
                </div>

                {Object.keys(permissoesDisponiveis).map((categoria) => (
                    <div key={categoria} style={{ 
                        marginBottom: '25px', 
                        border: '1px solid #e9ecef', 
                        borderRadius: '8px',
                        padding: '15px'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '15px',
                            paddingBottom: '10px',
                            borderBottom: '1px solid #dee2e6'
                        }}>
                            <h5 style={{ 
                                margin: 0, 
                                textTransform: 'capitalize', 
                                color: '#495057' 
                            }}>
                                {categoria.replace(/([A-Z])/g, ' $1').trim()}
                            </h5>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => alterarCategoria(categoria, true)}
                                    style={{
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        marginRight: '5px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    <FaCheck /> Todos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => alterarCategoria(categoria, false)}
                                    style={{
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    <FaTimes /> Nenhum
                                </button>
                            </div>
                        </div>

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                            gap: '10px' 
                        }}>
                            {permissoesDisponiveis[categoria].map((item) => (
                                <label 
                                    key={item.key} 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        backgroundColor: permissoes[categoria]?.[item.key] ? '#e7f5e7' : '#f8f9fa'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={permissoes[categoria]?.[item.key] || false}
                                        onChange={() => alterarPermissao(categoria, item.key)}
                                        style={{ marginRight: '10px' }}
                                    />
                                    {item.label}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Botões */}
                <div className="buttonContainer">
                    {loading ? (
                        <ColorRing
                            visible={loading}
                            height="33"
                            width="80"
                            ariaLabel="blocks-loading"
                            colors={['#2d6cdf', '#2d6cdf', '#2d6cdf', '#2d6cdf', '#2d6cdf']}
                        />
                    ) : (
                        <ButtonMotion 
                            className="purpleBtn" 
                            onClick={salvarPermissoes}
                        >
                            Salvar Permissões
                        </ButtonMotion>
                    )}
                    
                    <ButtonMotion 
                        type="button" 
                        className="secondaryBtn"
                        onClick={() => navigate('/usuariosEditar')}
                    >
                        Cancelar
                    </ButtonMotion>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SubcontasPermissoes;