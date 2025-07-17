import { useQueryGerentes } from '@/hooks/ReactQuery/useQueryGerentes';

const GerentesOptions = () => {
    const { data, isLoading, error } = useQueryGerentes();

    console.log('🔍 GerentesOptions Debug:', {
        data,
        dataExists: !!data,
        dataDataExists: !!(data && data.data),
        dataLength: data?.data?.length || 0,
        isLoading,
        error
    });

    if (isLoading) {
        return <option disabled>Carregando gerentes...</option>;
    }

    if (error) {
        console.error('❌ Erro ao carregar gerentes:', error);
        return <option disabled>Erro ao carregar gerentes</option>;
    }

    if (!data || !data.data || data.data.length === 0) {
        return <option disabled>Nenhum gerente disponível</option>;
    }

    return (
        <>
            {data.data.map((item, index) => (
                <option
                    value={item.idUsuario}
                    key={item.idUsuario || index}
                >
                    {item.nomeFantasia || item.nome}
                </option>
            ))}
        </>
    );
};

export default GerentesOptions;
