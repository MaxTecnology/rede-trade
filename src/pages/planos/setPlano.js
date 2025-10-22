const normalize = (value) => {
    if (!value) return "";
    return value
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
};

const TYPE_ALIASES = {
    associado: ["associado", "associados"],
    agencias: ["agencia", "agencias", "agencia master", "franquia", "franquias"],
    gerentes: ["gerente", "gerentes"],
    matriz: ["matriz", "matriz master"],
};

export const setPlano = (apiData, type) => {
    if (!apiData || !apiData.planos) {
        return [];
    }

    const normalizedType = normalize(type);
    const validTargets =
        TYPE_ALIASES[normalizedType] || [normalizedType].filter(Boolean);

    const planosFiltrados = apiData.planos.filter((plano) => {
        const planoTipo = normalize(plano.tipoDoPlano);
        if (!planoTipo) return false;
        return validTargets.some((target) => planoTipo.includes(target));
    });

    return planosFiltrados.length > 0 ? planosFiltrados : apiData.planos;
};
