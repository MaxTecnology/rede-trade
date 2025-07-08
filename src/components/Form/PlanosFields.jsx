import { useEffect, useState } from "react";
import PlanosOptions from "../Options/PlanosOptions";
import { useQueryPlanos } from "@/hooks/ReactQuery/useQueryPlanos";
import Modal from 'react-modal'; // Importe o react-modal

Modal.setAppElement('#root'); // Defina o elemento raiz da sua aplicação para o modal

const PlanosFields = ({ type, defaultValue }) => {
    const { data } = useQueryPlanos()
    const [selected, setSelected] = useState(null);
    const [defaultPlano, setDefaultPlano] = useState(null);

    useEffect(() => {
        if (defaultValue && data && data.planos) {
            const defaultPlan = data.planos.find(p => p.idPlano === defaultValue?.conta?.planoId);
            setDefaultPlano(defaultPlan);
        }
    }, [defaultValue, data]);

    return (
        <>
            <div className="form-group">
                <label className="required">Plano de Inscrição</label>
                <select
                    id="planoAssociado"
                    defaultValue={defaultValue && defaultValue.conta ? defaultValue.conta.planoId : ""}
                    onChange={(e) => setSelected(JSON.parse(e.target.value))}
                    required
                >
                    <option value="" disabled>
                        Selecione
                    </option>
                    <PlanosOptions type={type} complex />
                </select>
            </div>
            {type === "Associado" &&
                <div className="form-group">
                    <label className="required">Valor do Plano</label>
                    <input
                        type="text"
                        className="readOnly"
                        readOnly
                        required
                        value={selected ? selected.taxaInscricao : (defaultPlano?.taxaInscricao || '')}
                        onChange={() => {}} // Função vazia para input controlado readOnly
                    />
                </div>
            }
            <div className="form-group">
                <label className="required">Percentual de Comissão %</label>
                <input
                    type="text"
                    className="readOnly"
                    readOnly
                    required
                    value={selected ? selected.taxaComissao : (defaultPlano?.taxaComissao || '')}
                    onChange={() => {}} // Função vazia para input controlado readOnly
                />
            </div>
            {type === "Associado" &&
                <div className="form-group">
                    <label className="required">Taxa Anual</label>
                    <input
                        type="text"
                        className="readOnly"
                        readOnly
                        required
                        value={selected ? selected.taxaManutencaoAnual : (defaultPlano?.taxaManutencaoAnual || '')}
                        onChange={() => {}} // Função vazia para input controlado readOnly
                    />
                </div>
            }

            <input type="hidden" name="planoId" value={selected ? selected.idPlano : (defaultValue?.conta?.planoId || '')} />
        </>
    );
};

export default PlanosFields;