import SearchInput from '@/components/Search/SearchInput';
import { FaSearch, FaPlus } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import EstadoSelect from "@/components/Options/Estado";
import filters from '@/store/filters';
import CategoriesOptions from '@/components/Options/CategoriesOptions';
import { useEffect } from 'react';
import AgenciasOptions from '@/components/Options/AgenciasOptions';
import ButtonMotion from '@/components/FramerMotion/ButtonMotion';


const SearchField = () => {
    const navigate = useNavigate();

    const params = new URLSearchParams(window.location.search);
    let search = params.get('search');
    let agencia = params.get('agencia');
    let categoriaId = params.get('categoriaId');
    let account = params.get('account');
    let estado = params.get('estado');
    let cidade = params.get('cidade');
    let page = params.get('page') || 1;

    const handleclick = () => {
        navigate("/associadosCadastrar")
    }

    useEffect(() => {
        filters.table = {}
    }, [])

    const handleSearch = (e) => {
        filters.table[e.target.name] = e.target.value
    }

    return (
        <form action="" className="containerSearch">
            <div className="searchRow">
                <SearchInput />
                <div className="form-group f2">
                    <label>Agência</label>
                    <select defaultValue={""} className="form-control" id="categoria" name="agencia" required onChange={handleSearch} >
                        <option value="" disabled>Selecionar</option>
                        <option value="" >Nenhuma</option>
                        <AgenciasOptions />
                    </select>
                </div>
                <div className="form-group f2"><label>Categoria</label>
                    <select defaultValue={""} className="form-control" id="categoria" name="categoriaId" required onChange={handleSearch} >
                        <option value="" disabled>Selecionar</option>
                        <CategoriesOptions />
                    </select>
                </div>
            </div>
            <div className="searchRow">
                <div className="form-group f2">
                    <label htmlFor="nomePlano">Número da conta</label>
                    <input type="text" name="account" onChange={handleSearch} />
                </div>
                <div className="form-group f2">
                    <label>Estado</label>
                    <select name="estado" defaultValue={""} required onChange={handleSearch}>
                        <option value="" disabled>Selecionar</option>
                        <option value="" >Nenhum</option>
                        <EstadoSelect />
                    </select>
                </div>
                <div className="form-group f2">
                    <label htmlFor="nomePlano">Cidade</label>
                    <input type="text" id="nomePlano" name="cidade" onChange={handleSearch} />
                </div>
                <div className="buttonContainer">
                    <ButtonMotion type="submit">
                        <FaSearch /> Localizar
                    </ButtonMotion>
                    <ButtonMotion onClick={handleclick} className="purpleBtn" type="button">
                        <FaPlus /> Novo Associado
                    </ButtonMotion>
                </div>
            </div>
        </form>
    )
};

export default SearchField;
