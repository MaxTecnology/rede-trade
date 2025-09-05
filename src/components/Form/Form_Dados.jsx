import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import defaultImage from "@/assets/images/default_img.png"
import { Input } from "@/components/ui/input";
import { BiSolidImageAdd } from "react-icons/bi";
import { imageReferenceHandler } from "@/utils/functions/formHandler";
import { useEffect, useState } from "react";

const Form_Dados = ({ form, setImagem }) => {
    const [imagemReference, setImageReference] = useState(null)
    const watch = form.watch("imagem")
    
    // Função para verificar se é uma URL válida
    const isURL = (str) => {
        try {
            new URL(str);
            return true;
        } catch (_) {
            return false;
        }
    };

    useEffect(() => {
        if (watch && watch.length && watch !== "imagem_selecionada") {
            // Se for uma URL válida, usar diretamente
            if (isURL(watch)) {
                setImageReference(watch);
            } else if (typeof watch === 'string') {
                // Se é uma string mas não uma URL, construir URL completa
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
                if (watch.startsWith('/')) {
                    setImageReference(`${baseUrl}${watch}`);
                } else if (watch.includes('uploads/')) {
                    setImageReference(`${baseUrl}/${watch}`);
                } else {
                    setImageReference(`${baseUrl}/uploads/images/${watch}`);
                }
            } else {
                // Fallback para imagem padrão
                setImageReference(defaultImage);
            }
        } else {
            // Se não há watch ou é "imagem_selecionada", manter estado atual
            // (o imageReferenceHandler já atualizou com preview da imagem selecionada)
            if (!watch || watch === "imagem_selecionada") {
                // Não alterar imagemReference se já foi setado pelo handler
                if (!imagemReference) {
                    setImageReference(null);
                }
            } else {
                setImageReference(null);
            }
        }
    }, [watch])
    
    // Função para aplicar máscara de CPF
    const applyCPFMask = (value) => {
        if (!value) return '';
        
        const numbers = value.replace(/\D/g, '');
        
        return numbers
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };
    
    return (
        <>
            <div className="formImage">
                <img src={imagemReference ? imagemReference : defaultImage} className="rounded float-left img-fluid" alt="..." id="imagem-selecionada" />
            </div>
            <FormField
                control={form.control}
                name="imagem"
                type="file"
                render={({ field: { value, onChange, ...field } }) => (
                    <FormItem className="form-group">
                        <div className="flex flex-col h-full">
                            <FormMessage />
                            <FormLabel className="pl-2 text-md inputLabel mt-auto">
                                <BiSolidImageAdd /> Selecione uma imagem
                            </FormLabel>
                        </div>
                        <FormControl>
                            <Input 
                                type="file" 
                                {...field}
                                value={undefined}
                                accept="image/*" 
                                className="custom-file-input"
                                onChange={(event) => {
                                    // Atualizar o campo do formulário
                                    if (event.target.files && event.target.files[0]) {
                                        onChange("imagem_selecionada"); // Marca que uma imagem foi selecionada
                                    }
                                    imageReferenceHandler(event, setImageReference, setImagem);
                                }}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                    <FormItem className="form-group">
                        <div className="flex gap-2 items-center">
                            <FormLabel className="required pl-2 text-md">Nome</FormLabel>
                            <FormMessage />
                        </div>
                        <FormControl>
                            <Input className="mt-0" placeholder="Nome..." {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                    <FormItem className="form-group">
                        <div className="flex gap-2 items-center">
                            <FormLabel className="required pl-2 text-md">Cpf</FormLabel>
                            <FormMessage />
                        </div>
                        <FormControl>
                            <Input 
                                className="mt-0" 
                                placeholder="999.999.999-99" 
                                {...field}
                                onChange={(e) => {
                                    const masked = applyCPFMask(e.target.value);
                                    field.onChange(masked);
                                }}
                                maxLength={14}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem className="form-group">
                        <div className="flex gap-2 items-center">
                            <FormLabel className="required pl-2 text-md">E-mail</FormLabel>
                            <FormMessage />
                        </div>
                        <FormControl>
                            <Input className="mt-0" placeholder="@email.com..." {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                    <FormItem className="form-group">
                        <div className="flex gap-2 items-center items-center">
                            <FormLabel className="required pl-2 text-md">Senha</FormLabel>
                            <FormMessage />
                        </div>
                        <FormControl>
                            <Input className="mt-0" placeholder="Senha..." {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
        </>
    )
};

export default Form_Dados;