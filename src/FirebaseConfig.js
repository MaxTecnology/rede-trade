// ==========================================
// ====== Configuração do Servidor de Upload
// ====== (Substitui Firebase mantendo mesma interface)
// ==========================================

// Configuração do servidor
const UPLOAD_CONFIG = {
    baseUrl: import.meta.env.VITE_API_URL?.replace(/\/$/, '') || (typeof window !== 'undefined' ? `${window.location.origin.replace(/\/$/, '')}/api` : 'http://localhost:3024'),
    endpoint: '/usuarios/upload-imagem', // Corrigido para a rota real
    deleteEndpoint: '/usuarios/delete-imagem', // Para implementar futuramente
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    timeout: 30000
};

// ==========================================
// ====== Mantendo exports originais para compatibilidade
// ==========================================

// Exports fictícios para manter compatibilidade com imports existentes
export const FIREBASE_APP = null;
export const FIREBASE_AUTH = null;

// ==========================================
// ====== Função uploadFile - MESMA INTERFACE DO FIREBASE
// ==========================================

export async function uploadFile(file) {
    try {
        // Validações de segurança
        if (!file) {
            throw new Error('Nenhum arquivo foi fornecido');
        }

        if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
            throw new Error(`Tipo de arquivo não permitido. Aceitos: ${UPLOAD_CONFIG.allowedTypes.join(', ')}`);
        }

        if (file.size > UPLOAD_CONFIG.maxFileSize) {
            const maxSizeMB = UPLOAD_CONFIG.maxFileSize / (1024 * 1024);
            throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
        }

        console.log("📸 Iniciando upload de:", file.name);

        // Preparar FormData
        const formData = new FormData();
        formData.append('image', file); // Campo 'image' conforme definido no backend

        // Timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), UPLOAD_CONFIG.timeout);

        // Fazer upload para o servidor
        const response = await fetch(`${UPLOAD_CONFIG.baseUrl}${UPLOAD_CONFIG.endpoint}`, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Verificar resposta
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                error: `Erro HTTP ${response.status}`
            }));
            throw new Error(errorData.error || `Erro no servidor: ${response.status}`);
        }

        // Processar resposta de sucesso
        const data = await response.json();

        // Ajustado para a resposta real do backend
        if (!data.imagePath) {
            throw new Error(data.error || 'Upload falhou - caminho da imagem não retornado');
        }

        // Retorna URL completa da imagem - MESMA INTERFACE DO FIREBASE
        const fullImageUrl = `${UPLOAD_CONFIG.baseUrl}${data.imagePath}`;

        console.log("✅ Upload concluído:", fullImageUrl);

        return fullImageUrl;

    } catch (error) {
        console.error("❌ Erro no upload:", error);

        // Tratamento de erros específicos
        if (error.name === 'AbortError') {
            throw new Error('Upload cancelado por timeout');
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Erro de conexão com o servidor');
        }

        throw error;
    }
}

// ==========================================
// ====== Função para upload direto nos formulários
// ====== (Para usar em criarUsuario, editarUsuario, etc.)
// ==========================================

/**
 * Adiciona a imagem diretamente ao FormData do formulário
 * Uso: adicionarImagemAoFormData(formData, arquivoImagem)
 */
export function adicionarImagemAoFormData(formData, file) {
    if (file && file instanceof File) {
        formData.append('imagem', file); // Campo 'imagem' para criar/editar usuário
        console.log("📎 Imagem adicionada ao FormData:", file.name);
        return true;
    }
    return false;
}

/**
 * Cria FormData completo para operações de usuário com imagem
 * Uso: const formData = criarFormDataComImagem(dadosFormulario, arquivoImagem)
 */
export function criarFormDataComImagem(dadosFormulario, file) {
    const formData = new FormData();
    
    // Adicionar todos os campos do formulário
    Object.keys(dadosFormulario).forEach(key => {
        const value = dadosFormulario[key];
        if (value !== null && value !== undefined) {
            formData.append(key, value.toString());
        }
    });
    
    // Adicionar imagem se fornecida
    if (file && file instanceof File) {
        formData.append('imagem', file);
        console.log("📎 FormData criado com imagem:", file.name);
    }
    
    return formData;
}

// ==========================================
// ====== Funções Auxiliares
// ==========================================

/**
 * Deleta uma imagem do servidor (para implementar no backend futuramente)
 * Uso: await deleteFile(filename ou url completa)
 */
export async function deleteFile(filenameOrUrl) {
    try {
        // Extrair apenas o nome do arquivo se for URL completa
        const filename = filenameOrUrl.split('/').pop() || filenameOrUrl;

        const response = await fetch(`${UPLOAD_CONFIG.baseUrl}${UPLOAD_CONFIG.deleteEndpoint}/${filename}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            console.error(`Erro ao deletar: ${response.status}`);
            return false;
        }

        const data = await response.json();
        console.log("🗑️ Arquivo deletado:", filename);
        return data.success;

    } catch (error) {
        console.error("Erro ao deletar:", error);
        return false;
    }
}

/**
 * Verifica se o servidor está funcionando
 */
export async function checkServerStatus() {
    try {
        const response = await fetch(`${UPLOAD_CONFIG.baseUrl}/usuarios/test`);
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Gera preview da imagem antes do upload
 * Uso: const previewUrl = await gerarPreviewImagem(file)
 */
export function gerarPreviewImagem(file) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('Arquivo não é uma imagem válida'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Erro ao ler arquivo'));
        reader.readAsDataURL(file);
    });
}

/**
 * Valida se a imagem atende aos critérios
 * Uso: const isValid = validarImagem(file)
 */
export function validarImagem(file) {
    const errors = [];

    if (!file) {
        errors.push('Nenhum arquivo selecionado');
        return { valid: false, errors };
    }

    if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
        errors.push(`Tipo não permitido. Aceitos: ${UPLOAD_CONFIG.allowedTypes.join(', ')}`);
    }

    if (file.size > UPLOAD_CONFIG.maxFileSize) {
        const maxSizeMB = UPLOAD_CONFIG.maxFileSize / (1024 * 1024);
        errors.push(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

// ==========================================
// ====== Modo de Desenvolvimento (Opcional)
// ==========================================

// Se quiser testar sem servidor, descomente as linhas abaixo:

/*
// MODO MOCK - Para testar sem servidor
export async function uploadFile(file) {
  // Simula delay do upload
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log("📸 MOCK - Simulando upload de:", file.name);

  // Retorna URL fictícia (igual ao seu código comentado)
  return `https://picsum.photos/200/200?random=${Date.now()}`;
}
*/
