import { useEffect } from "react";
import { useQueryPlanos } from "@/hooks/ReactQuery/useQueryPlanos";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import { useWatch } from "react-hook-form";
import PlanosOptions from "@/components/Options/PlanosOptions";

const normalizeType = (type) => (type || "").toString().toLowerCase();

const shouldShowValorPlano = (type) => {
    const normalized = normalizeType(type);
    return (
        normalized.includes("associad") ||
        normalized.includes("agenc") ||
        normalized.includes("franquia")
    );
};

const shouldShowTaxaAnual = (type) => normalizeType(type).includes("associad");

const FormPlano = ({ type, form }) => {
    const { data } = useQueryPlanos({ tipo: type })
    const planoId = useWatch({ control: form.control, name: "planoId" });

    useEffect(() => {
        if (planoId && data?.planos) {
            const plano = data.planos.find(p => p.idPlano == planoId);
            if (plano) {
                console.log('📋 Plano selecionado:', plano);
                form.setValue("planoValor", plano?.taxaInscricao)
                form.setValue("comissao", plano?.taxaComissao)
                form.setValue("planoTaxa", plano?.taxaManutencaoAnual)
            }
        }
    }, [planoId, data, form])

    return <>
        <FormSelect required form={form} name="planoId" label="Plano de Inscrição" placeholder="Selecionar" options={<PlanosOptions type={type} />} />
        {shouldShowValorPlano(type) ?
            <FormInput required form={form} name="planoValor" label="Valor do Plano" disabled />
            :
            null
        }
        <FormInput required form={form} name="comissao" label="Percentual de Comissão %" disabled />
        {shouldShowTaxaAnual(type) ?
            <FormInput required form={form} name="planoTaxa" label="Taxa Anual" disabled />
            :
            null
        }
    </>
};

export default FormPlano;
