import filters from "@/store/filters";
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";

const SearchInput = () => {
    // Estado local para sincronizar com a URL
    const [searchValue, setSearchValue] = useState('');

    // Sincronizar com parâmetros da URL ao carregar
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const search = params.get('search') || '';
        setSearchValue(search);
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        filters.table[e.target.name] = value;
    }

    return (
        <div className="form-group f2 m10 searchInput">
            <label htmlFor="nomePlano">Pesquisar</label>
            <input
                type="text"
                id="search"
                name="search"
                value={searchValue}
                onChange={handleSearch}
                placeholder="Pesquisar..."
            />
            <FaSearch className="icon" />
        </div>
    );
};

export default SearchInput;