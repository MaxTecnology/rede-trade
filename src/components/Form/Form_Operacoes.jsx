import GerentesOptions from "../Options/GerentesOptions";
import { getId } from "@/hooks/getId";
import FormInput from "./formItens/FormInput";
import FormSelect from "./formItens/FormSelect";
import RealInput from '@/components/Inputs/CampoMoeda';
import { useQueryGerentes } from "@/hooks/ReactQuery/useQueryGerentes";
import { useEffect } from "react";

const Form_Operacoes = ({ form, type, reference = true }) => {
    const { data: gerentesData } = useQueryGerentes();
    
    // Observar mudanças no campo gerente e atualizar a taxa automaticamente
    const gerenteSelecionado = form.watch("gerente");
    
    useEffect(() => {
        if (gerenteSelecionado && gerentesData?.data) {
            const gerente = gerentesData.data.find(g => g.idUsuario.toString() === gerenteSelecionado.toString());
            if (gerente && gerente.taxaComissaoGerente) {
                form.setValue("taxaGerenteConta", gerente.taxaComissaoGerente.toString());
            } else if (gerenteSelecionado === "" || !gerente) {
                form.setValue("taxaGerenteConta", "0");
            }
        }
    }, [gerenteSelecionado, gerentesData, form]);
    
    return (
        <>
            <FormSelect required form={form} name="gerente" label="Gerente de Conta" placeholder="Selecionar" items={[
                { value: "", label: "Nenhum" },
            ]} options={<GerentesOptions />} />
            <FormInput disabled required name="taxaGerenteConta" label="Porcentagem do Gerente" placeholder="2%" form={form} />
            <FormSelect required form={form} name="tipoOperacao" label="Tipo de Operação" placeholder="Selecionar" items={[
                { value: 1, label: "Compra" },
                { value: 2, label: "Venda" },
                { value: 3, label: "Compra/Venda" },
            ]}
            />
            <div className="form-group">
                <label className="required-field-label">Limite Crédito</label>
                <RealInput name="limiteCredito" placeholder="0,00" reference={reference} required />
            </div>
            <div className="form-group">
                <label className="required-field-label">Limite de Venda Mensal</label>
                <RealInput name="limiteVendaMensal" placeholder="0,00" reference={reference} required />
            </div>
            <div className="form-group">
                <label className="required-field-label">Limite de Venda Total</label>
                <RealInput name="limiteVendaTotal" placeholder="0,00" reference={reference} required />
            </div>
            <FormSelect required form={form} name="aceitaOrcamento" label="Aceita Orcamento" placeholder="Selecionar" items={[
                { value: true, label: "Sim" },
                { value: false, label: "Não" },
            ]} />
            <FormSelect required form={form} name="aceitaVoucher" label="Aceita Voucher" placeholder="Selecionar" items={[
                { value: true, label: "Sim" },
                { value: false, label: "Não" },
            ]} />
        </>
    )
};

export default Form_Operacoes;
