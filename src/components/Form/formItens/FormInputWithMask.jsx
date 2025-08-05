import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import InputMask from 'react-input-mask';

const FormInputWithMask = ({ form, name, label, placeholder, required, mask, divClassName }) => {
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
                        <InputMask
                            mask={mask}
                            maskChar=""
                            value={field.value || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                        >
                            {/* @ts-ignore */}
                            <Input 
                                placeholder={placeholder || mask}
                            />
                        </InputMask>
                    </FormControl>
                </FormItem>
            )}
        />
    );
};

export default FormInputWithMask;