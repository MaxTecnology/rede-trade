import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

const FormPlano = ({ type, form, planos }) => {
    const planoId = form.watch("planoId");
    const planoSelecionado = planos?.find(p => p.idPlano === parseInt(planoId));

    useEffect(() => {
        if (planoSelecionado) {
            form.setValue("valorPlano", planoSelecionado.taxaInscricao || 0);
            form.setValue("percentualComissao", planoSelecionado.taxaComissao || 0);
            form.setValue("taxaAnual", planoSelecionado.taxaManutencaoAnual || 0);
        }
    }, [planoSelecionado, form]);

    return (
        <>
            <FormField
                control={form.control}
                name="planoId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Plano de Inscrição *</FormLabel>
                        <Select 
                            onValueChange={field.onChange} 
                            value={field.value?.toString() || ""}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {planos?.map((plano) => (
                                    <SelectItem 
                                        key={plano.idPlano} 
                                        value={plano.idPlano.toString()}
                                    >
                                        {plano.nomePlano}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {type === "Associado" && (
                <>
                    <FormField
                        control={form.control}
                        name="valorPlano"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor do Plano *</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        type="text"
                                        readOnly 
                                        className="readOnly"
                                        value={planoSelecionado?.taxaInscricao || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="percentualComissao"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Percentual de Comissão % *</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        type="text"
                                        readOnly 
                                        className="readOnly"
                                        value={planoSelecionado?.taxaComissao || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="taxaAnual"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Taxa Anual *</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        type="text"
                                        readOnly 
                                        className="readOnly"
                                        value={planoSelecionado?.taxaManutencaoAnual || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </>
            )}
        </>
    );
};

export default FormPlano;