export const columns = [
    {
        id: 'conta',
        accessorKey: 'conta.numeroConta',
        header: 'Conta',
    },
    {
        id: 'nomeFranquia',
        accessorKey: 'conta.nomeFranquia',
        header: 'Unidade',
    },
    {
        accessorKey: 'email',
        header: 'E-mail',
    },
    {
        accessorKey: 'estado',
        header: 'Estado',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const bloqueado = row.original?.bloqueado;
            const status = row.original?.status;
            
            // Prioridade: se bloqueado, mostrar bloqueado
            if (bloqueado === true) {
                return '🔒 Bloqueado';
            }
            
            // Caso contrário, mostrar status normal
            if (status === true || status === 'true' || 
                status === 'Ativo' || status === 'Atendendo') {
                return '🟢 Ativo';
            }
            return '🔴 Inativo';
        }
    },
    {
        id: 'tipo',
        accessorKey: 'tipo',
        header: 'Tipo',
    },
]
