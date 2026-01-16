// ==========================================
// ====== FUNÇÃO ORIGINAL - Mantida para compatibilidade
// ==========================================

const BRAZIL_THOUSAND_PATTERN = /^\d{1,3}(\.\d{3})+(,\d+)?$/;

const parseNumericString = (rawValue) => {
    if (typeof rawValue !== "string") return null;
    const value = rawValue.trim();
    if (value === "") return null;

    const hasComma = value.includes(",");
    const hasDot = value.includes(".");

    if (hasDot && !hasComma) {
        const plainDecimalPattern = /^-?\d+(\.\d+)?$/;
        if (plainDecimalPattern.test(value) && !BRAZIL_THOUSAND_PATTERN.test(value)) {
            const parsed = parseFloat(value);
            return Number.isNaN(parsed) ? null : parsed;
        }
    }

    if (/^[0-9.]+(?:,[0-9]+)?$/.test(value)) {
        const normalized = value.replace(/\./g, '').replace(',', '.');
        const parsed = parseFloat(normalized);
        return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
};

export const formHandler = (item) => {
    var object = {};
    item.forEach((value, key) => {
        if (value === "true") {
            object[key] = true;
            return;
        }
        if (value === "false") {
            object[key] = false;
            return;
        }
        if (value === "null") {
            object[key] = null;
            return;
        }
        if (key === "complemento" || key === "senha" || key === "inscEstadual" || key === "inscMunicipal") {
            object[key] = value;
            return;
        }

        // Verifica se o valor começa com "RT$" ou "R$"
        const match = /^(RT\$|R\$)\s*([\d.,]+)$/.exec(value);

        if (match) {
            // Extrai o valor numérico da correspondência e substitui vírgula por ponto
            const numericValue = parseFloat(match[2].replace(/\./g, '').replace(',', '.'));
            return object[key] = numericValue;
        }

        const numericValue = parseNumericString(value);

        // Atribui o valor ao objeto
        object[key] = numericValue ?? value;
    });
    return object;
};

// ==========================================
// ====== NOVA FUNÇÃO - Para formulários com imagem
// ==========================================

/**
 * Processa FormData e cria FormData final com imagem
 * Uso: const formData = formHandlerComImagem(event, arquivoImagem)
 */
export const formHandlerComImagem = (item, arquivoImagem = null) => {
    const formData = new FormData();
    
    // Processar todos os campos do formulário
    item.forEach((value, key) => {
        let processedValue = value;

        // Aplicar as mesmas regras de processamento da função original
        if (value === "true") {
            processedValue = true;
        } else if (value === "false") {
            processedValue = false;
        } else if (value === "null") {
            processedValue = null;
        } else if (key === "complemento" || key === "senha" || key === "inscEstadual" || key === "inscMunicipal") {
            processedValue = value;
        } else {
            // Verifica se o valor começa com "RT$" ou "R$"
            const match = /^(RT\$|R\$)\s*([\d.,]+)$/.exec(value);

            if (match) {
                // Extrai o valor numérico da correspondência e substitui vírgula por ponto
                processedValue = parseFloat(match[2].replace(/\./g, '').replace(',', '.'));
            } else {
                const parsed = parseNumericString(value);
                processedValue = parsed ?? value;
            }
        }

        // Adicionar ao FormData (convertendo para string quando necessário)
        if (processedValue !== null && processedValue !== undefined) {
            formData.append(key, processedValue.toString());
        }
    });

    // Adicionar imagem se fornecida
    if (arquivoImagem && arquivoImagem instanceof File) {
        formData.append('imagens', arquivoImagem);
        console.log("📎 Imagem adicionada ao FormData:", arquivoImagem.name);
    }

    return formData;
};

// ==========================================
// ====== FUNÇÃO DE IMAGEM ATUALIZADA
// ==========================================

/**
 * Handler para seleção de imagem - NÃO faz upload imediato
 * Uso: imageReferenceHandler(event, setImageReference, setImagem)
 */
export const imageReferenceHandler = async (event, setImageReference, setImagem) => {
    const arquivo = event.target.files[0];

    if (arquivo) {
        // Validar tipo de arquivo
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!tiposPermitidos.includes(arquivo.type)) {
            alert('Tipo de arquivo não permitido. Use: JPG, PNG, GIF ou WebP');
            return;
        }

        // Validar tamanho (5MB)
        const tamanhoMaximo = 5 * 1024 * 1024;
        if (arquivo.size > tamanhoMaximo) {
            alert('Arquivo muito grande. Tamanho máximo: 5MB');
            return;
        }

        // Gerar preview da imagem
        const reader = new FileReader();
        reader.onload = (e) => {
            setImageReference(e.target.result);
        };
        reader.readAsDataURL(arquivo);

        console.log("📸 Imagem selecionada:", arquivo.name, `(${(arquivo.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    // Armazenar o arquivo para uso posterior
    if (setImagem) {
        setImagem(arquivo);
    }
};

// ==========================================
// ====== FUNÇÃO ORIGINAL MANTIDA
// ==========================================

export const formatForm = (form) => {
    console.log("the form", form);
    var object = {};

    // Use Object.keys() to get an array of keys from the object
    Object.keys(form).forEach((key) => {
        const value = form[key];

        if (typeof value !== 'string') {
            // If value is not a string, directly assign it to the object
            object[key] = value;
            return;
        }

        if (value === "true") {
            object[key] = true;
            return;
        }
        if (value === "false") {
            object[key] = false;
            return;
        }
        if (value === "null") {
            object[key] = null;
            return;
        }
        if (key === "complemento" || key === "senha" || key === "inscEstadual" || key === "inscMunicipal") {
            object[key] = value;
            return;
        }

        // Verifica se o valor começa com "RT$" ou "R$"
        const match = /^(RT\$|R\$)\s*([\d.,]+)$/.exec(value);

        if (match) {
            // Extrai o valor numérico da correspondência e substitui vírgula por ponto
            const numericValue = parseFloat(match[2].replace(/\./g, '').replace(',', '.'));
            object[key] = numericValue;
            return;
        }

        const numericValue = parseNumericString(value);

        // Atribui o valor ao objeto
        object[key] = numericValue ?? value;
    });
    return object;
}

// ==========================================
// ====== FUNÇÕES AUXILIARES NOVAS
// ==========================================

/**
 * Converte objeto JavaScript em FormData (para casos especiais)
 * Uso: const formData = objectToFormData(objeto, arquivoImagem)
 */
export const objectToFormData = (objeto, arquivoImagem = null) => {
    const formData = new FormData();
    
    Object.keys(objeto).forEach(key => {
        const value = objeto[key];
        if (value !== null && value !== undefined) {
            formData.append(key, value.toString());
        }
    });

    if (arquivoImagem && arquivoImagem instanceof File) {
        formData.append('imagens', arquivoImagem);
    }

    return formData;
};

/**
 * Helper para debug - mostra conteúdo do FormData
 * Uso: debugFormData(formData)
 */
export const debugFormData = (formData) => {
    console.log("🐛 Conteúdo do FormData:");
    for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`  ${key}: [Arquivo] ${value.name} (${(value.size / 1024).toFixed(2)}KB)`);
        } else {
            console.log(`  ${key}: ${value}`);
        }
    }
};

// ==========================================
// ====== EXEMPLO DE USO
// ==========================================

/*
// COMO USAR NOS SEUS COMPONENTES:

// 1. No estado do componente:
const [imagem, setImagem] = useState(null);
const [imagemReference, setImageReference] = useState(null);

// 2. No handler de envio do formulário:
const formHandler = (event) => {
    event.preventDefault();
    
    const formData = formHandlerComImagem(
        new FormData(event.target), 
        imagem
    );
    
    // Debug (opcional)
    debugFormData(formData);
    
    // Enviar para o backend
    fetch('/usuarios/criar-usuario', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => console.log('Sucesso:', data))
    .catch(error => console.error('Erro:', error));
};

// 3. No input de imagem:
<input 
    type="file" 
    name="imagem" 
    accept="image/*" 
    onChange={(e) => imageReferenceHandler(e, setImageReference, setImagem)} 
/>

// 4. Para mostrar preview:
{imagemReference && (
    <img src={imagemReference} alt="Preview" style={{width: '150px'}} />
)}
*/
