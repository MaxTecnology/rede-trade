// import SearchInput from '@/components/Search/SearchInput'; // Removido
import { FaSearch, FaPlus, FaTimes } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import EstadoSelect from "@/components/Options/Estado";
import CategoriesOptions from '@/components/Options/CategoriesOptions';
import { useEffect, useState } from 'react';
import AgenciasOptions from '@/components/Options/AgenciasOptions';
import ButtonMotion from '@/components/FramerMotion/ButtonMotion';

const SearchField = ({ 
    filtrosAtivos = {}, 
    onFiltrosChange = () => {}, 
    onLimparFiltros = () => {},
    showNewButton = true 
}) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Estado local para os filtros baseado nos props
    const [localFilters, setLocalFilters] = useState({
        search: filtrosAtivos.search || '',
        agencia: filtrosAtivos.agencia || '',
        categoriaId: filtrosAtivos.categoriaId || '',
        account: filtrosAtivos.account || '',
        estado: filtrosAtivos.estado || '',
        cidade: filtrosAtivos.cidade || ''
    });

    const handleclick = () => {
        navigate("/associadosCadastrar")
    }

    // Atualizar estado local quando props mudarem
    useEffect(() => {
        setLocalFilters({
            search: filtrosAtivos.search || '',
            agencia: filtrosAtivos.agencia || '',
            categoriaId: filtrosAtivos.categoriaId || '',
            account: filtrosAtivos.account || '',
            estado: filtrosAtivos.estado || '',
            cidade: filtrosAtivos.cidade || ''
        });
    }, [filtrosAtivos]);

    const handleSearch = (e) => {
        const { name, value } = e.target;
        
        // Atualizar estado local
        setLocalFilters(prev => ({
            ...prev,
            [name]: value
        }));
    }

    // Função para aplicar os filtros (submit do form)
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Limpar filtros vazios
        const filtrosLimpos = {};
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value && value.trim() && value !== "Selecionar" && value !== "") {
                filtrosLimpos[key] = value.trim();
            }
        });
        
        // Chamar callback do componente pai
        onFiltrosChange(filtrosLimpos);
        
        console.log('🔍 Filtros aplicados:', filtrosLimpos);
    }

    // Função para limpar todos os filtros 
    const clearAllFilters = async (e) => {
        e.preventDefault();
        
        // Limpar estado local
        const clearedFilters = {
            search: '',
            agencia: '',
            categoriaId: '',
            account: '',
            estado: '',
            cidade: ''
        };
        
        setLocalFilters(clearedFilters);
        
        // INVALIDAR O CACHE do React Query
        await queryClient.invalidateQueries({ queryKey: ['associados'] });
        
        // Chamar callback do componente pai
        onLimparFiltros();
        
        console.log('🧹 Filtros limpos');
    }

    // Verificar se há filtros ativos
    const hasActiveFilters = Object.values(localFilters).some(value => value && value.trim());

    return (
        <div>
            {/* Mostrar filtros ativos e botão de limpar */}
            {hasActiveFilters && (
                <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '10px', 
                    borderRadius: '5px', 
                    marginBottom: '10px',
                    border: '1px solid #e9ecef'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#6c757d' }}>
                            <strong>Filtros ativos:</strong>
                            {localFilters.search && ` Busca: "${localFilters.search}"`}
                            {localFilters.agencia && ` | Agência: ${localFilters.agencia}`}
                            {localFilters.categoriaId && ` | Categoria: ${localFilters.categoriaId}`}
                            {localFilters.account && ` | Conta: ${localFilters.account}`}
                            {localFilters.estado && ` | Estado: ${localFilters.estado}`}
                            {localFilters.cidade && ` | Cidade: ${localFilters.cidade}`}
                        </span>
                        <button
                            onClick={clearAllFilters}
                            style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <FaTimes /> Limpar Filtros
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="containerSearch">
                <div className="searchRow">
                    {/* Campo de busca integrado */}
                    <div className="form-group f2 m10 searchInput">
                        <label htmlFor="search">Pesquisar</label>
                        <input
                            type="text"
                            id="search"
                            name="search"
                            value={localFilters.search}
                            onChange={handleSearch}
                            placeholder="Pesquisar por nome, nome fantasia..."
                        />
                        <FaSearch className="icon" />
                    </div>
                    <div className="form-group f2">
                        <label>Agência</label>
                        <select 
                            value={localFilters.agencia} 
                            className="form-control" 
                            id="agencia" 
                            name="agencia" 
                            onChange={handleSearch}
                        >
                            <option value="">Todas as Agências</option>
                            <AgenciasOptions />
                        </select>
                    </div>
                    <div className="form-group f2">
                        <label>Categoria</label>
                        <select 
                            value={localFilters.categoriaId} 
                            className="form-control" 
                            id="categoria" 
                            name="categoriaId" 
                            onChange={handleSearch}
                        >
                            <option value="">Todas as Categorias</option>
                            <CategoriesOptions />
                        </select>
                    </div>
                </div>
                <div className="searchRow">
                    <div className="form-group f2">
                        <label htmlFor="account">Número da conta</label>
                        <input 
                            type="text" 
                            id="account"
                            name="account" 
                            value={localFilters.account}
                            placeholder="Digite o número da conta..."
                            onChange={handleSearch} 
                        />
                    </div>
                    <div className="form-group f2">
                        <label>Estado</label>
                        <select 
                            name="estado" 
                            value={localFilters.estado} 
                            onChange={handleSearch}
                        >
                            <option value="">Todos os Estados</option>
                            <EstadoSelect />
                        </select>
                    </div>
                    <div className="form-group f2">
                        <label htmlFor="cidade">Cidade</label>
                        <input 
                            type="text" 
                            id="cidade" 
                            name="cidade" 
                            value={localFilters.cidade}
                            placeholder="Digite a cidade..."
                            onChange={handleSearch} 
                        />
                    </div>
                    <div className="buttonContainer">
                        <ButtonMotion type="submit">
                            <FaSearch /> Localizar
                        </ButtonMotion>
                        {showNewButton && (
                            <ButtonMotion onClick={handleclick} className="purpleBtn" type="button">
                                <FaPlus /> Novo Associado
                            </ButtonMotion>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
};

export default SearchField;