import { useEffect, useMemo, useState } from "react";
import { useQueryPlanos } from "@/hooks/ReactQuery/useQueryPlanos";
import { setPlano } from "@/pages/planos/setPlano";
import Modal from 'react-modal'; // Importe o react-modal

Modal.setAppElement('#root'); // Defina o elemento raiz da sua aplicação para o modal

const normalizeType = (value) => (value || "").toString().toLowerCase();

const shouldShowValorPlano = (type) => {
    const normalized = normalizeType(type);
    return (
        normalized.includes("associad") ||
        normalized.includes("agenc") ||
        normalized.includes("franquia")
    );
};

const shouldShowTaxaAnual = (type) => normalizeType(type).includes("associad");

const PlanosFields = ({ type, defaultValue, disabled = false }) => {
    const { data } = useQueryPlanos({ tipo: type });
    const [selectedId, setSelectedId] = useState(() =>
        defaultValue?.conta?.planoId ? String(defaultValue.conta.planoId) : ""
    );

    useEffect(() => {
        const novoId = defaultValue?.conta?.planoId
            ? String(defaultValue.conta.planoId)
            : "";
        setSelectedId(novoId);
    }, [defaultValue?.conta?.planoId]);

    const planosDisponiveis = useMemo(() => {
        if (!data) return [];
        const lista = setPlano(data, type) || [];
        return lista;
    }, [data, type]);

    const selectedPlano = useMemo(() => {
        if (!planosDisponiveis?.length) return null;
        if (!selectedId) return null;
        return planosDisponiveis.find((plano) => String(plano.idPlano) === String(selectedId)) || null;
    }, [planosDisponiveis, selectedId]);

    const showValorPlano = useMemo(() => shouldShowValorPlano(type), [type]);
    const showTaxaAnual = useMemo(() => shouldShowTaxaAnual(type), [type]);

    return (
        <>
            <div className="form-group">
                <label className="required">Plano de Inscrição</label>
                <select
                    id="planoAssociado"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    required
                    disabled={disabled}
                    className={disabled ? "readOnly" : ""}
                >
                    <option value="" disabled>
                        Selecione
                    </option>
                    {planosDisponiveis.map((plano) => (
                        <option key={plano.idPlano} value={plano.idPlano}>
                            {plano.nomePlano}
                        </option>
                    ))}
                </select>
            </div>
            {showValorPlano && (
                <div className="form-group">
                    <label className="required">Valor do Plano</label>
                    <input
                        type="text"
                        className="readOnly"
                        readOnly
                        required
                        value={selectedPlano?.taxaInscricao ?? (defaultValue?.conta?.plano?.taxaInscricao || "")}
                        onChange={() => {}} // Função vazia para input controlado readOnly
                    />
                    <input
                        type="hidden"
                        name="planoValor"
                        value={selectedPlano?.taxaInscricao ?? (defaultValue?.conta?.plano?.taxaInscricao || "")}
                    />
                </div>
            )}
            <div className="form-group">
                <label className="required">Percentual de Comissão %</label>
                <input
                    type="text"
                    className="readOnly"
                    readOnly
                    required
                    value={selectedPlano?.taxaComissao ?? (defaultValue?.conta?.plano?.taxaComissao || "")}
                    onChange={() => {}} // Função vazia para input controlado readOnly
                />
                <input
                    type="hidden"
                    name="comissao"
                    value={selectedPlano?.taxaComissao ?? (defaultValue?.conta?.plano?.taxaComissao || "")}
                />
            </div>
            {showTaxaAnual && (
                <div className="form-group">
                    <label className="required">Taxa Anual</label>
                    <input
                        type="text"
                        className="readOnly"
                        readOnly
                        required
                        value={selectedPlano?.taxaManutencaoAnual ?? (defaultValue?.conta?.plano?.taxaManutencaoAnual || "")}
                        onChange={() => {}} // Função vazia para input controlado readOnly
                    />
                    <input
                        type="hidden"
                        name="planoTaxa"
                        value={selectedPlano?.taxaManutencaoAnual ?? (defaultValue?.conta?.plano?.taxaManutencaoAnual || "")}
                    />
                </div>
            )}

            <input
                type="hidden"
                name="planoId"
                value={selectedId || (defaultValue?.conta?.planoId || '')}
            />
        </>
    );
};

export default PlanosFields;
