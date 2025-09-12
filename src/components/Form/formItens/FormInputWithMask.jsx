import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCallback } from 'react';

const FormInputWithMask = ({ form, name, label, placeholder, required, mask, divClassName }) => {
    // Função para aplicar máscara manualmente sem usar react-input-mask
    const applyMask = useCallback((value, maskPattern) => {
        if (!value || !maskPattern) return value;
        
        // Remove caracteres não numéricos
        const cleanValue = value.replace(/\D/g, '');
        
        // Aplica a máscara baseada no padrão
        if (maskPattern === '99.999.999/9999-99') {
            // CNPJ: XX.XXX.XXX/XXXX-XX
            return cleanValue
                .replace(/^(\d{2})(\d)/, '$1.$2')
                .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2')
                .substring(0, 18);
        } else if (maskPattern === '(99)9999-9999') {
            // Telefone: (XX)XXXX-XXXX
            return cleanValue
                .replace(/^(\d{2})(\d)/, '($1)$2')
                .replace(/(\d{4})(\d)/, '$1-$2')
                .substring(0, 13);
        } else if (maskPattern === '(99)99999-9999') {
            // Celular: (XX)XXXXX-XXXX
            return cleanValue
                .replace(/^(\d{2})(\d)/, '($1)$2')
                .replace(/(\d{5})(\d)/, '$1-$2')
                .substring(0, 14);
        } else if (maskPattern === '99999-999') {
            // CEP: XXXXX-XXX
            return cleanValue
                .replace(/^(\d{5})(\d)/, '$1-$2')
                .substring(0, 9);
        }
        
        return cleanValue;
    }, []);

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn("form-group", divClassName)}>
                    <div className="flex gap-2 items-center">
                        <FormLabel className={cn("pl-2 text-md", required && "required")}>
                            {label}
                        </FormLabel>
                        <FormMessage />
                    </div>
                    <FormControl>
                        <Input 
                            placeholder={placeholder || mask}
                            value={field.value || ''}
                            onChange={(e) => {
                                const maskedValue = applyMask(e.target.value, mask);
                                field.onChange(maskedValue);
                            }}
                            onBlur={field.onBlur}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    );
};

export default FormInputWithMask;