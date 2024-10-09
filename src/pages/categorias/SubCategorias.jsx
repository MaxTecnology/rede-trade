import { useEffect, useState } from "react";
import { createItem, getDate } from "../../hooks/ListasHook";
import EditarSubCategoriaModal from './../../Modals/EditarSubCategoriaModal';
import Footer from "../../components/Footer";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { activePage } from "../../utils/functions/setActivePage";
import CategoriesOptions from "../../components/Options/CategoriesOptions";
import { toast } from "sonner";
import SubCategoriaTable from "../../components/Tables/SubCategoriaTable";
import useModal from "@/hooks/useModal";
import { useQueryCategorias } from "@/hooks/ReactQuery/useQueryCategorias";
import useRevalidate from "@/hooks/ReactQuery/useRevalidate";
import ButtonMotion from "@/components/FramerMotion/ButtonMotion";

const columns = [
    {
        accessorKey: 'createdAt',
        header: 'Data',
    },
    {
        accessorKey: 'nomeSubcategoria',
        header: 'Nome da Sub Categoria',
    },
]

const filterSub = (data) => {
    // Verifica se a propriedade 'categorias' existe em data
    if (data && data.categorias) {
        // Filtra as categorias que têm subcategorias
        const filteredCategories = data.categorias.filter(category => category.subcategorias.length > 0);
        // Obtém apenas os valores das subcategorias
        const subcategoryValues = filteredCategories.flatMap(category => category.subcategorias);
        return subcategoryValues;
    } else {
        console.error("O objeto 'data' não possui a propriedade 'categorias'.");
        return null; // ou qualquer outro valor de retorno desejado
    }
}

const Categorias = () => {
    const revalidate = useRevalidate()
    const { data } = useQueryCategorias()
    const [modalIsOpen, modalToggle] = useModal(false);
    const [info, setInfo] = useState({ name: "", createAT: "" })
    const [id, setId] = useState()
    const [selectedOptionId, setSelectedOptionId] = useState('');
    useEffect(() => {
        activePage("categorias")
    }, []);

    const handleSelectChange = (event) => {
        const categoriaId = event.target.options[event.target.selectedIndex].getAttribute('id');
        setSelectedOptionId(categoriaId);
    };

    const navigate = useNavigate();
    const handleclick = () => {
        navigate("/categorias")
    }

    const formHandler = (event) => {
        event.preventDefault()
        toast.promise(createItem(event, `categorias/criar-subcategoria/${selectedOptionId}`), {
            loading: 'Criando Sub-Categoria...',
            success: () => {
                event.target.reset()
                revalidate('categorias')
                return "Sub-Categoria Criada com sucesso!"
            },
            error: <b>Erro ao cadastrar!</b>
        })
    }

    return (
        <div className="container">
            <EditarSubCategoriaModal
                isOpen={modalIsOpen}
                modalToggle={() => modalToggle()}
                revalidate={revalidate}
                info={info}
            />
            <div className="containerHeader">Sub Categorias</div>
            <form onSubmit={(event) => formHandler(event)} className="containerSearch">
                <div className="searchRow">
                    <div className="form-group"><label>Categoria</label>
                        <select defaultValue={""} className="form-control" required onChange={handleSelectChange}>
                            <option value="" disabled>Selecionar</option>
                            <CategoriesOptions url="categorias/listar-categorias" />
                        </select>
                    </div>
                    <div className="form-group f2">
                        <label htmlFor="nomePlano">Nome da sub-categoria</label>
                        <input type="text" id="nomePlano" name="nomeSubcategoria" />
                    </div>
                    <div className="form-group f2">
                        <label htmlFor="data">Data</label>
                        <input type="text" id="data" value={getDate()} readOnly />
                    </div>
                    <div className="buttonContainer">
                        <ButtonMotion type="submit">Cadastrar</ButtonMotion>
                        <ButtonMotion onClick={handleclick} className="purpleBtn" type="button"><FaPlus /> Nova Categoria</ButtonMotion>
                    </div>
                </div>

            </form>
            <div className="containerList">
                <SubCategoriaTable
                    columns={columns}
                    data={data ? filterSub(data) : []}
                    setId={setId}
                    setInfo={setInfo}
                    modaltoggle={modalToggle}
                />
            </div>
            <Footer />
        </div>)
};

export default Categorias;
