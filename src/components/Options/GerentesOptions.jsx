import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import state from '@/store';
import { useQueryGerentes } from '@/hooks/ReactQuery/useQueryGerentes';

const getStoredUser = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    try {
        const serialized = localStorage.getItem('userRedeTrade');
        return serialized ? JSON.parse(serialized) : null;
    } catch (error) {
        console.error('❌ Erro ao recuperar usuário do storage:', error);
        return null;
    }
};

const GerentesOptions = ({ restrictToCurrentFilial = false } = {}) => {
    const { data, isLoading, error } = useQueryGerentes();
    const snapshot = useSnapshot(state);
    const currentUser = snapshot.user ?? getStoredUser();
    const currentFilialId = currentUser?.filialId
        ?? currentUser?.conta?.filialId
        ?? currentUser?.filialAuth?.id
        ?? null;

    const filteredGerentes = useMemo(() => {
        const lista = data?.data ?? [];
        if (!restrictToCurrentFilial) {
            return lista;
        }

        if (!currentFilialId) {
            return lista.filter((item) => Boolean(
                item?.filialId || item?.conta?.filialId || item?.filialAuth?.id
            ));
        }

        return lista.filter((item) => {
            const gerenteFilialId = item?.filialId
                ?? item?.conta?.filialId
                ?? item?.filialAuth?.id
                ?? null;
            return gerenteFilialId === currentFilialId;
        });
    }, [data?.data, restrictToCurrentFilial, currentFilialId]);

    if (isLoading) {
        return <option disabled>Carregando gerentes...</option>;
    }

    if (error) {
        return <option disabled>Erro ao carregar gerentes</option>;
    }

    if (!filteredGerentes || filteredGerentes.length === 0) {
        return (
            <option disabled>
                {restrictToCurrentFilial
                    ? 'Nenhum gerente disponível para esta filial'
                    : 'Nenhum gerente disponível'}
            </option>
        );
    }

    return (
        <>
            {filteredGerentes.map((item) => (
                <option
                    value={String(item.idUsuario)}
                    key={item.idUsuario}
                >
                    {item.nomeFantasia || item.nome}
                </option>
            ))}
        </>
    );
};

export default GerentesOptions;
