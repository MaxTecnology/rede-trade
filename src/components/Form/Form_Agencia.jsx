import { useEffect, useMemo } from "react";
import FormSelect from "./formItens/FormSelect";
import FormInput from "./formItens/FormInput";
import FormPlano from "./formItens/FormPlano";
import FormInputMoney from "./formItens/FormInputMoney";

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
};

const Form_Agencia = ({ form, type, planos, defaultValues }) => {
  useEffect(() => {
    if (!defaultValues) return;

    if (defaultValues.formaPagamentoPlano !== undefined && defaultValues.formaPagamentoPlano !== null) {
      form.setValue("formaPagamento", String(defaultValues.formaPagamentoPlano));
    }

    if (defaultValues.dataVencimentoFatura !== undefined && defaultValues.dataVencimentoFatura !== null) {
      form.setValue("dataVencimentoFatura", String(defaultValues.dataVencimentoFatura));
    }

    if (defaultValues.saldoDinheiro !== undefined && defaultValues.saldoDinheiro !== null) {
      form.setValue("saldoDinheiro", formatCurrency(defaultValues.saldoDinheiro));
    }

    if (defaultValues.saldoPermuta !== undefined && defaultValues.saldoPermuta !== null) {
      form.setValue("saldoPermuta", formatCurrency(defaultValues.saldoPermuta));
    }
  }, [defaultValues, form]);

  const pagamentoSelecionado = form.watch("formaPagamento");
  const exibirCamposMistos = useMemo(
    () => String(pagamentoSelecionado || "") === "50",
    [pagamentoSelecionado]
  );

  return (
    <>
      <FormPlano type={type} form={form} planos={planos} />
      <FormSelect
        required
        form={form}
        name="formaPagamento"
        label="Forma de pagamento do Plano"
        placeholder="Selecionar"
        items={[
          { value: 100, label: "Permuta" },
          { value: 0, label: "Dinheiro" },
          { value: 50, label: "Permuta / Dinheiro" },
        ]}
      />
      <input type="hidden" name="formaPagamentoPlano" value={pagamentoSelecionado || ""} />
      {exibirCamposMistos && (
        <>
          <FormInputMoney
            required
            form={form}
            name="saldoDinheiro"
            label="Dinheiro"
            placeholder="R$ 0,00"
          />

          <FormInputMoney
            required
            form={form}
            name="saldoPermuta"
            label="Permuta"
            placeholder="R$ 0,00"
          />
        </>
      )}

      <FormSelect
        required
        form={form}
        name="dataVencimentoFatura"
        label="Data Vencimento Fatura"
        placeholder="Selecionar"
        items={[
          { value: 10, label: "10" },
          { value: 20, label: "20" },
          { value: 30, label: "30" },
        ]}
      />
      <FormInput
        required
        form={form}
        name="nomeFranquia"
        label="Nome da Agência"
        placeholder="Franquia"
        divClassName={""}
        disabled
      />
    </>
  );
};

export default Form_Agencia;
