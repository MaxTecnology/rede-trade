import { useEffect, useState } from 'react';
import { useQueryCategorias } from '@/hooks/ReactQuery/useQueryCategorias';
const Categoria_SubCategoriaOptions = ({ defaultValue, required }) => {
    const { data } = useQueryCategorias();
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const [selectedCategoriaId, setSelectedCategoriaId] = useState('');
    const [sub, setSub] = useState('');

    useEffect(() => {
        if (!data?.categorias) return;

        const categoriaIdPadrao = defaultValue?.categoriaId
            ? String(defaultValue.categoriaId)
            : '';

        const categoriaPadrao = categoriaIdPadrao
            ? data.categorias.find((cat) => String(cat.idCategoria) === categoriaIdPadrao) || null
            : null;

        setSelectedCategoria(categoriaPadrao);
        setSelectedCategoriaId(categoriaIdPadrao);
        setSub(defaultValue?.subcategoriaId ? String(defaultValue.subcategoriaId) : '');
    }, [data, defaultValue]);

    const handleCategoriaChange = (event) => {
        const novoId = event.target.value;
        setSelectedCategoriaId(novoId);

        const categoriaEncontrada = data?.categorias?.find(
            (cat) => String(cat.idCategoria) === String(novoId)
        ) || null;

        setSelectedCategoria(categoriaEncontrada);
        setSub('');
    };

    const categoriaIdValue =
        selectedCategoriaId ||
        (defaultValue?.categoriaId ? String(defaultValue.categoriaId) : '');

    const categoriaAtual =
        selectedCategoria ||
        (categoriaIdValue && data?.categorias
            ? data.categorias.find(
                (cat) => String(cat.idCategoria) === categoriaIdValue
              ) || null
            : null);

    const subcategoriaValue =
        sub ||
        (defaultValue?.subcategoriaId
            ? String(defaultValue.subcategoriaId)
            : defaultValue?.subcategoria
            ? String(defaultValue.subcategoria.idSubcategoria ?? defaultValue.subcategoria.id ?? '')
            : '');

    const fallbackSubcategoria = defaultValue?.subcategoria
        ? {
              idSubcategoria:
                  defaultValue.subcategoria.idSubcategoria ??
                  defaultValue.subcategoria.id ??
                  defaultValue.subcategoriaId ??
                  '',
              nomeSubcategoria:
                  defaultValue.subcategoria.nomeSubcategoria ??
                  defaultValue.subcategoria.nome ??
                  defaultValue.subcategoria.descricao ??
                  'Subcategoria atual',
          }
        : defaultValue?.subcategoriaId
        ? {
              idSubcategoria: defaultValue.subcategoriaId,
              nomeSubcategoria: defaultValue.subcategoriaNome || 'Subcategoria atual',
          }
        : null;

    const subcategoriasDisponiveis = (() => {
        const lista = categoriaAtual?.subcategorias ? [...categoriaAtual.subcategorias] : [];
        if (
            fallbackSubcategoria &&
            fallbackSubcategoria.idSubcategoria &&
            !lista.some(
                (item) =>
                    String(item.idSubcategoria) ===
                    String(fallbackSubcategoria.idSubcategoria)
            )
        ) {
            lista.unshift({
                idSubcategoria: fallbackSubcategoria.idSubcategoria,
                nomeSubcategoria: fallbackSubcategoria.nomeSubcategoria,
            });
        }
        return lista;
    })();

    return (
        <>
            <div className="form-group">
                <label>Categoria</label>
                <select
                    value={categoriaIdValue}
                    onChange={handleCategoriaChange}
                    required={required}
                >
                    <option value="" disabled>Selecione uma Categoria</option>
                    {data && data.categorias ?
                        data.categorias.map((item, index) => (
                            <option
                                value={String(item.idCategoria)}
                                key={item.idCategoria}
                            >
                                {item.nomeCategoria}
                            </option>
                        ))
                        : <option disabled>Nenhuma Categoria</option>}
                </select>
            </div>
            <input
                type="hidden"
                name="categoriaId"
                value={categoriaAtual?.idCategoria || ''}
            />
            <div className="form-group">
                <label>Sub-Categoria</label>
                <select
                    onChange={(e) => setSub(e.target.value)}
                    value={subcategoriaValue}
                    name="subcategoriaId"
                >
                    <option disabled value="">
                        {
                            categoriaAtual && categoriaAtual?.subcategorias.length > 0 ? "Selecione uma Sub-Categoria" : "Nenhuma Sub-Categoria"
                        }
                    </option>
                    {subcategoriasDisponiveis.length > 0 ?
                        subcategoriasDisponiveis.map((item, index) => {
                            return (
                                <option value={String(item.idSubcategoria)} key={index}>
                                    {item.nomeSubcategoria}
                                </option>
                            )
                        })
                        : null}
                </select>
            </div>

        </>
    )
};

export default Categoria_SubCategoriaOptions;
