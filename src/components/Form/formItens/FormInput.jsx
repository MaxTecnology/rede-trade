import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FormInput = ({ form, name, label, placeholder, required, type, className, divClassName, disabled, variant, textarea, ...props}) => {
    return (<>
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn("form-group", divClassName && divClassName, type === "hidden" && "hidden")}>
                    <div className="flex gap-2 items-center">
                        <FormLabel
                            className={cn("pl-2 text-md", required && "required", className && className)}
                        >
                            {label}
                        </FormLabel>
                        {variant === "bottom" ? null : <FormMessage />}
                    </div>
                    {variant === "bottom" ? <FormMessage className="text-left" /> : null}
                    <FormControl>
                        {textarea ? (
                            <textarea 
                                disabled={disabled} 
                                className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-0" 
                                placeholder={placeholder} 
                                {...field} 
                                {...props}
                            />
                        ) : (
                            <Input disabled={disabled} type={type ? type : "text"} className="mt-0" placeholder={placeholder} {...field} {...props} {...form.register(name)}/>
                        )}
                    </FormControl>

                </FormItem>
            )}
        />
    </>);
};

export default FormInput;
