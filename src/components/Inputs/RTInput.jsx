import { useEffect, useState } from 'react';

const RTInput = ({ name, required, defaultValue }) => {
    const [value, setValue] = useState("");

    const formatCurrency = (numero) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        })
            .format(numero)
            .replace("R$", "RT$");
    };

    const formatValueFromInput = (inputValue) => {
        const normalizedInput = `${inputValue ?? ""}`;
        const numericValue = parseFloat(normalizedInput.replace(/[^\d]/g, "")) || 0;
        return formatCurrency(numericValue / 100);
    };

    const formatValueFromDefault = (defaultVal) => {
        if (defaultVal === null || defaultVal === undefined || defaultVal === "") {
            return "";
        }

        if (typeof defaultVal === "number") {
            return formatCurrency(defaultVal);
        }

        const normalized = defaultVal
            .toString()
            .replace(/RT\$/gi, "")
            .replace(/R\$/gi, "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(",", ".");

        const numericValue = parseFloat(normalized);

        if (Number.isNaN(numericValue)) {
            return formatCurrency(0);
        }

        return formatCurrency(numericValue);
    };

    const handleChange = (event) => {
        const inputValue = event.target.value;
        setValue(formatValueFromInput(inputValue));
    };

    useEffect(() => {
        setValue(formatValueFromDefault(defaultValue));
    }, [defaultValue]);

    return (
        <input
            type="text"
            value={value}
            onChange={handleChange}
            name={name}
            required={required}
            placeholder='Valor RT$'
        />
    );
};

export default RTInput;
