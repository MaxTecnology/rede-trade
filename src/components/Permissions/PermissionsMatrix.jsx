import { useMemo } from "react";
import PropTypes from "prop-types";

const PermissionsMatrix = ({ schema, value = {}, onChange, disabled }) => {
  const normalizedValue = useMemo(() => {
    const result = {};
    schema.forEach((categoria) => {
      result[categoria.categoria] = {
        ...(value[categoria.categoria] || {}),
      };
    });
    return result;
  }, [schema, value]);

  const toggleItem = (categoria, chave, status) => {
    if (disabled) return;

    const updated = {
      ...normalizedValue,
      [categoria]: {
        ...normalizedValue[categoria],
        [chave]: status,
      },
    };
    onChange?.(updated);
  };

  const toggleCategoria = (categoria, status) => {
    if (disabled) return;
    const categoriaSchema = schema.find(
      (item) => item.categoria === categoria
    );
    if (!categoriaSchema) return;

    const updated = {
      ...normalizedValue,
      [categoria]: categoriaSchema.items.reduce(
        (acc, item) => ({ ...acc, [item.chave]: status }),
        {}
      ),
    };

    onChange?.(updated);
  };

  return (
    <div className="permissions-matrix">
      {schema.map((categoria) => (
        <section key={categoria.categoria} className="perm-section">
          <header className="perm-section__header">
            <div className="perm-section__actions">
              <h4>{categoria.label}</h4>
              {categoria.description && (
                <p className="perm-section__description">
                  {categoria.description}
                </p>
              )}
            </div>
            <div className="perm-section__actions">
              <button
                type="button"
                onClick={() => toggleCategoria(categoria.categoria, true)}
                disabled={disabled}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => toggleCategoria(categoria.categoria, false)}
                disabled={disabled}
              >
                Nenhum
              </button>
            </div>
          </header>

          <div className="perm-section__grid">
            {categoria.items.map((item) => (
              <label key={item.chave} className="perm-checkbox">
                <input
                  type="checkbox"
                  checked={
                    normalizedValue[categoria.categoria]?.[item.chave] || false
                  }
                  onChange={(event) =>
                    toggleItem(
                      categoria.categoria,
                      item.chave,
                      event.target.checked
                    )
                  }
                  disabled={disabled}
                />
                <span>{item.label}</span>
                {item.description && (
                  <small>{item.description}</small>
                )}
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

PermissionsMatrix.propTypes = {
  schema: PropTypes.arrayOf(
    PropTypes.shape({
      categoria: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          chave: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          description: PropTypes.string,
        })
      ),
    })
  ).isRequired,
  value: PropTypes.object,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default PermissionsMatrix;
