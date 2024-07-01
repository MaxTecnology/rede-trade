import FormSelect from "./formItens/FormSelect";
import FormInput from "./formItens/FormInput";
import FormPlano from "./formItens/FormPlano";
import { useState } from "react";

const Form_Agencia = ({ form, type }) => {
  const [pagamentoValue, setPagamento] = useState(100);
  return (
    <>
      <FormPlano type={type} form={form} />
      <FormSelect
        required
        form={form}
        name="formaPagamento"
        label="Forma de pagamento do Plano"
        placeholder="Selecionar"
        onChange={(e) => {
          setPagamento(e.target.value);
        }}
        items={[
          { value: 100, label: "Permuta" },
          { value: 0, label: "Dinheiro" },
          { value: 50, label: "Permuta / Dinheiro" },
        ]}
      />
      {pagamentoValue == 50 && (
        <>
          <FormInput
            required
            form={form}
            name="dinheiro"
            label="Dinheiro"
            placeholder="R$ 0,00"
            divClassName={""}
          />
          <FormInput
            required
            form={form}
            name="permulta"
            label="Permulta"
            placeholder="R$ 0,00"
            divClassName={""}
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
