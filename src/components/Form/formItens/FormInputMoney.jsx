import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const handleInputChange = (event) => {
    const inputValue = event;
    // Remove caracteres não numéricos
    const numericValue = inputValue.replace(/[^0-9]/g, '');

    // Converte para número e divide por 100 (igual ao RealInput)
    const numericAmount = parseFloat(numericValue) / 100;

    // Verifica se o valor é zero ou vazio
    const isZeroOrEmpty = numericAmount === 0 || isNaN(numericAmount);

    // Formata o valor como número sem símbolo (igual ao RealInput)
    const formattedValue = isZeroOrEmpty
        ? new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(0)
        : new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericAmount);

    return formattedValue; // Retorna o valor formatado sem símbolo
};


const FormInputMoney = ({ form, name, label, placeholder, required, type, className, divClassName, disabled }) => {
    return (<>
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn("form-group", divClassName && divClassName)}>
                    <div className="flex gap-2 items-center">
                        <FormLabel className={cn("pl-2 text-md", required && "required", className && className)}>{label}</FormLabel>
                        <FormMessage />
                    </div>
                    <FormControl
                        onChange={
                            (e) => {
                                const { value } = e.target
                                form.setValue(name, handleInputChange(value))
                            }
                        }
                    >
                        <Input disabled={disabled} type="text" className="mt-0" placeholder={placeholder} {...field} />
                    </FormControl>
                </FormItem>
            )}
        />
    </>);
};

export default FormInputMoney;
