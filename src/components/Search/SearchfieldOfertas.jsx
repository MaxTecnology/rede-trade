import { FaSearch, FaPlus, FaTimes } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import AgenciasOptions from '@/components/Options/AgenciasOptions';
import CategoriesOptions from '@/components/Options/CategoriesOptions';
import { useState } from 'react';
import ButtonMotion from '@/components/FramerMotion/ButtonMotion';

const SearchfieldOfertas = ({ 
    filtrosAtivos = {}, 
    onFiltrosChange = () => {}, 
    onLimparFiltros = () => {}
}) => {
    const navigate = useNavigate();

    // Estado local para os filtros
    const [localFilters, setLocalFilters] = useState({
        titulo: filtrosAtivos.titulo || '',
        agencia: filtrosAtivos.agencia || '',
        cidade: filtrosAtivos.cidade || '',
        nomeCategoria: filtrosAtivos.nomeCategoria || '',
        tipo: filtrosAtivos.tipo || ''
    });

    const handleclick = () => {
        navigate("/ofertasCadastrar")
    }

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
        
        console.log('🔍 Filtros de ofertas aplicados:', filtrosLimpos);
    }

    // Função para limpar todos os filtros
    const clearAllFilters = (e) => {
        e.preventDefault();
        
        // Limpar estado local
        const clearedFilters = {
            titulo: '',
            agencia: '',
            cidade: '',
            nomeCategoria: '',
            tipo: ''
        };
        
        setLocalFilters(clearedFilters);
        
        // Chamar callback do componente pai
        onLimparFiltros();
        
        console.log('🧹 Filtros de ofertas limpos');
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
                            {localFilters.titulo && ` Título: "${localFilters.titulo}"`}
                            {localFilters.agencia && ` | Agência: ${localFilters.agencia}`}
                            {localFilters.cidade && ` | Cidade: ${localFilters.cidade}`}
                            {localFilters.nomeCategoria && ` | Categoria: ${localFilters.nomeCategoria}`}
                            {localFilters.tipo && ` | Tipo: ${localFilters.tipo}`}
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
                    {/* Campo de busca por título integrado */}
                    <div className="form-group f2 m10 searchInput">
                        <label htmlFor="titulo">Título da Oferta</label>
                        <input
                            type="text"
                            id="titulo"
                            name="titulo"
                            value={localFilters.titulo}
                            onChange={handleSearch}
                            placeholder="Pesquisar por título..."
                        />
                        <FaSearch className="icon" />
                    </div>
                    <div className="form-group f2">
                        <label>Agência</label>
                        <select 
                            value={localFilters.agencia} 
                            className="form-control" 
                            name="agencia" 
                            onChange={handleSearch}
                        >
                            <option value="">Todas as Agências</option>
                            <AgenciasOptions />
                        </select>
                    </div>
                    <div className="form-group f2">
                        <label htmlFor="cidade">Cidade</label>
                        <input 
                            type="text" 
                            id="cidade" 
                            name="cidade" 
                            value={localFilters.cidade}
                            onChange={handleSearch}
                            placeholder="Digite a cidade..."
                        />
                    </div>
                </div>
                <div className="searchRow">
                    <div className="form-group f2">
                        <label>Categoria</label>
                        <select 
                            value={localFilters.nomeCategoria} 
                            className="form-control" 
                            name="nomeCategoria" 
                            onChange={handleSearch}
                        >
                            <option value="">Todas as Categorias</option>
                            <CategoriesOptions />
                        </select>
                    </div>
                    <div className="form-group f2">
                        <label>Tipo</label>
                        <select 
                            name="tipo" 
                            value={localFilters.tipo} 
                            onChange={handleSearch}
                        >
                            <option value="">Todos os Tipos</option>
                            <option value="Produto">Produto</option>
                            <option value="Serviço">Serviço</option>
                        </select>
                    </div>
                    <div className="buttonContainer">
                        <ButtonMotion type="submit">
                            <FaSearch /> Localizar
                        </ButtonMotion>
                        <ButtonMotion onClick={handleclick} className="purpleBtn" type="button">
                            <FaPlus /> Nova Oferta
                        </ButtonMotion>
                    </div>
                </div>
            </form>
        </div>
    )
};

export default SearchfieldOfertas;
