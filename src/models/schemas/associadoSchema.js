import { z } from "zod"

// Helper para converter boolean/string para boolean
const booleanTransform = z.union([z.boolean(), z.string(), z.number()]).transform(val => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
        const lowercaseVal = val.toLowerCase();
        return lowercaseVal === 'true' || lowercaseVal === '1' || lowercaseVal === 'sim' || lowercaseVal === 'yes';
    }
    if (typeof val === 'number') return val === 1;
    return false;
});

export const associadoSchema = z.object({
    // DADOS BÁSICOS - Obrigatórios para associados
    nome: z.string().min(3, "Nome é obrigatório"),
    cpf: z.string().min(11, "CPF é obrigatório"),
    email: z.string().email("Email inválido").min(5, "Email é obrigatório"),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    
    // DADOS DA EMPRESA - Obrigatórios
    nomeFantasia: z.string().min(3, "Nome fantasia é obrigatório"),
    razaoSocial: z.string().min(3, "Razão social é obrigatória"),
    cnpj: z.string().min(14, "CNPJ é obrigatório"),
    inscEstadual: z.string().optional(),
    inscMunicipal: z.string().optional(),
    descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
    
    // CONTATO - Obrigatórios
    telefone: z.string().optional(),
    celular: z.string().min(14, "Celular é obrigatório"),
    emailContato: z.string().email("Email de contato inválido").min(5, "Email de contato é obrigatório"),
    emailSecundario: z.string().email("Email secundário inválido").optional().or(z.literal("")),
    site: z.string().optional(),
    
    // ENDEREÇO - Obrigatórios
    logradouro: z.string().min(3, "Logradouro é obrigatório"),
    numero: z.string().min(1, "Número é obrigatório"),
    cep: z.string().min(9, "CEP é obrigatório"),
    complemento: z.string().optional(),
    bairro: z.string().min(3, "Bairro é obrigatório"),
    cidade: z.string().min(3, "Cidade é obrigatória"),
    estado: z.string().min(2, "Estado é obrigatório"),
    regiao: z.string().optional(),
    
    // CONFIGURAÇÕES - Obrigatórios para associados
    tipoOperacao: z.string().min(1, "Tipo de operação é obrigatório"),
    aceitaOrcamento: z.union([booleanTransform, z.literal("")]).refine(val => val !== "", "Aceita orçamento é obrigatório").transform(val => val === true || val === "true"),
    aceitaVoucher: z.union([booleanTransform, z.literal("")]).refine(val => val !== "", "Aceita voucher é obrigatório").transform(val => val === true || val === "true"),
    mostrarNoSite: z.union([booleanTransform, z.literal("")]).refine(val => val !== "", "Mostrar no site é obrigatório").transform(val => val === true || val === "true"),
    
    // CATEGORIA - Opcionais
    categoriaId: z.string().optional(),
    subcategoriaId: z.string().optional(),
    
    // PLANO - Opcional
    planoId: z.string().optional(),
    
    // CONFIGURAÇÕES AUTOMÁTICAS - Não validados no form
    tipo: z.string().optional(),
    status: z.union([booleanTransform, z.literal("")]).refine(val => val !== "", "Status é obrigatório").transform(val => val === true || val === "true"),
    imagem: z.string().optional(), // Agora é opcional pois será tratado pelo upload
    
    // CAMPOS INVISÍVEIS/AUTOMÁTICOS
    reputacao: z.string().optional().or(z.literal("")),
    saldoDinheiro: z.string().optional().or(z.literal("")),
    saldoPermuta: z.string().optional().or(z.literal("")),
    nomeFranquia: z.string().optional().or(z.literal("")),
    usuarioCriadorId: z.union([z.string(), z.number()]).optional().or(z.literal("")),
    matrizId: z.union([z.string(), z.number()]).optional().or(z.literal("")),
    tipoDeMoeda: z.string().optional().or(z.literal("")),
    statusConta: booleanTransform.optional(),
    taxaRepasseMatriz: z.string().optional().or(z.literal("")),
    bloqueado: booleanTransform.optional(),
    
    // CAMPOS ADICIONAIS OPCIONAIS
    restricoes: z.string().optional().or(z.literal("")),
    limiteCredito: z.string().optional().or(z.literal("")),
    limiteVendaMensal: z.string().optional().or(z.literal("")),
    limiteVendaTotal: z.string().optional().or(z.literal("")),
    limiteVendaEmpresa: z.string().optional().or(z.literal("")),
    formaPagamento: z.string().optional().or(z.literal("")),
    percentualGerente: z.string().optional().or(z.literal("")),
    valorPlano: z.string().optional().or(z.literal("")),
    percentualComissao: z.string().optional().or(z.literal("")),
    taxaAnual: z.string().optional().or(z.literal("")),
})