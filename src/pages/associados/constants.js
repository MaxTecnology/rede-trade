// constants.js - Configuração das colunas da tabela de associados

export const columns = [
    {
        id: 'account',
        accessorKey: 'conta.numeroConta',
        header: 'Conta',
        cell: ({ row }) => {
            const numeroConta = row.original?.conta?.numeroConta;
            return numeroConta || 'N/A';
        }
    },
    {
        accessorKey: 'nomeFantasia',
        header: 'Nome Fantasia',
        cell: ({ row }) => {
            const nome = row.original?.nomeFantasia || row.original?.nome;
            return nome || 'Sem nome';
        }
    },
    {
        accessorKey: 'email',
        header: 'E-mail',
        cell: ({ row }) => {
            const email = row.original?.email || row.original?.emailContato;
            return email || 'N/A';
        }
    },
    {
        accessorKey: 'telefone',
        header: 'Telefone',
        cell: ({ row }) => {
            const telefone = row.original?.telefone || row.original?.celular;
            
            if (!telefone) return 'N/A';
            
            // Formatar telefone
            const numeroLimpo = telefone.replace(/\D/g, '');
            if (numeroLimpo.length === 11) {
                return `(${numeroLimpo.slice(0,2)}) ${numeroLimpo.slice(2,7)}-${numeroLimpo.slice(7)}`;
            } else if (numeroLimpo.length === 10) {
                return `(${numeroLimpo.slice(0,2)}) ${numeroLimpo.slice(2,6)}-${numeroLimpo.slice(6)}`;
            }
            
            return telefone;
        }
    },
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
            const estado = row.original?.estado;
            return estado || 'N/A';
        }
    },
    {
        accessorKey: 'cidade',
        header: 'Cidade',
        cell: ({ row }) => {
            const cidade = row.original?.cidade;
            return cidade || 'N/A';
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original?.status;
            
            if (status === true || status === 'true' || 
                status === 'Ativo' || status === 'Atendendo') {
                return '🟢 Ativo';
            }
            return '🔴 Inativo';
        }
    },
    {
        id: 'reputacao',
        accessorKey: 'reputacao',
        header: 'Reputação',
        cell: ({ row }) => {
            const reputacao = row.original?.reputacao || 0;
            const stars = '⭐'.repeat(Math.floor(reputacao));
            return `${reputacao} ${stars}`;
        }
    }
];

// Função auxiliar para filtrar e ordenar dados
export const processarDadosTabela = (dados, filtros = {}) => {
    if (!dados || !Array.isArray(dados)) return [];
    
    let dadosFiltrados = dados.filter(item => {
        if (!item) return false;
        
        // Filtrar bloqueados
        if (item.bloqueado === true) return false;
        
        // Filtrar contas inativas
        if (item.statusConta === false) return false;
        
        // Aplicar filtros
        if (filtros.search) {
            const busca = filtros.search.toLowerCase();
            const nome = (item.nomeFantasia || item.nome || '').toLowerCase();
            const email = (item.email || item.emailContato || '').toLowerCase();
            const razaoSocial = (item.razaoSocial || '').toLowerCase();
            
            if (!nome.includes(busca) && !email.includes(busca) && !razaoSocial.includes(busca)) {
                return false;
            }
        }
        
        if (filtros.estado && item.estado !== filtros.estado) {
            return false;
        }
        
        if (filtros.cidade) {
            const cidade = (item.cidade || '').toLowerCase();
            if (!cidade.includes(filtros.cidade.toLowerCase())) {
                return false;
            }
        }
        
        if (filtros.categoriaId && item.categoriaId !== parseInt(filtros.categoriaId)) {
            return false;
        }
        
        if (filtros.agencia) {
            const agencia = (
                item.conta?.nomeFranquia || 
                item.conta?.gerenteConta?.nome || 
                ''
            ).toLowerCase();
            
            if (!agencia.includes(filtros.agencia.toLowerCase())) {
                return false;
            }
        }
        
        if (filtros.account) {
            const numeroConta = (item.conta?.numeroConta || '').toString();
            if (!numeroConta.includes(filtros.account)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Ordenar por nome fantasia
    dadosFiltrados.sort((a, b) => {
        const nomeA = (a.nomeFantasia || a.nome || '').toLowerCase();
        const nomeB = (b.nomeFantasia || b.nome || '').toLowerCase();
        return nomeA.localeCompare(nomeB);
    });
    
    return dadosFiltrados;
};

// Configurações para exportação
export const configExportacao = {
    excel: {
        filename: 'associados.xlsx',
        headers: [
            'Nome Fantasia',
            'Email',
            'Telefone',
            'Estado',
            'Cidade',
            'Status',
            'Categoria',
            'Agência',
            'Número da Conta',
            'Data de Cadastro'
        ]
    },
    csv: {
        filename: 'associados.csv',
        separator: ';'
    }
};

// Função para preparar dados para exportação
export const prepararDadosExportacao = (dados, categorias = []) => {
    return dados.map(item => ({
        'Nome Fantasia': item.nomeFantasia || item.nome || '',
        'Email': item.email || item.emailContato || '',
        'Telefone': item.telefone || item.celular || '',
        'Estado': item.estado || '',
        'Cidade': item.cidade || '',
        'Status': (item.status === true || item.status === 'true' || 
                  item.status === 'Ativo') ? 'Ativo' : 'Inativo',
        'Categoria': (() => {
            if (!item.categoriaId) return 'Sem categoria';
            const categoria = categorias.find(cat => cat.idCategoria === item.categoriaId);
            return categoria ? categoria.nomeCategoria : 'Categoria não encontrada';
        })(),
        'Agência': item.conta?.gerenteConta?.nome || '',
        'Número da Conta': item.conta?.numeroConta || '',
        'Data de Cadastro': item.dataCriacao ? 
            new Date(item.dataCriacao).toLocaleDateString('pt-BR') : ''
    }));
};