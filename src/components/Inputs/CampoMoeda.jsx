import { useEffect, useState } from 'react';

const RealInput = ({ name, placeholder, required, reference, defaultValue, readOnly, className, maxValue }) => {
    const [value, setValue] = useState('');
    const [decimalValue, setDecimalValue] = useState('');
    const [valueStatus, setValueStatus] = useState(true)

    const handleInputChange = (event) => {
        const inputValue = event.target.value;

        // Remove caracteres não numéricos
        const numericValue = inputValue.replace(/[^0-9]/g, '');

        // Formata o valor para o formato de moeda brasileira (Real) sem o símbolo "R$"
        const formattedValue = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(parseFloat(numericValue) / 100);

        // Transforma o valor em decimal
        const decimalValue = parseFloat(numericValue) / 100;

        // Limita o valor máximo
        if (maxValue && decimalValue > maxValue) {
            return;
        }

        setValue(formattedValue);
        setDecimalValue(decimalValue);
    };

    useEffect(() => {
        if (reference === true) {
            setValue("")
            setValueStatus(true)
        } else {
            setValueStatus(false)
        }
    }, [reference]);

    useEffect(() => {
        if (defaultValue) {
            const valor = defaultValue
            const formatter = new Intl.NumberFormat('pt-BR', {
                style: 'decimal', // Alterado para 'decimal' para remover o símbolo de moeda
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            const valorEmReal = formatter.format(valor);
            setValue(valorEmReal);
            setDecimalValue(valor);
        }
    }, [defaultValue]); // Adicionei defaultValue como dependência

    return (
        <input
            type="text"
            value={valueStatus ? value : decimalValue}
            onChange={handleInputChange}
            // Removido defaultValue - não pode usar com value
            name={name}
            placeholder={placeholder ? placeholder : "Digite o valor"}
            required={required}
            readOnly={readOnly}
            className={className}
        />
    );
};

export default RealInput;