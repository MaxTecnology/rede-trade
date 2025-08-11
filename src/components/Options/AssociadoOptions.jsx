import { useQueryAssociados } from '@/hooks/ReactQuery/useQueryAssociados';
const AssociadoOptions = ({ voucher }) => {
    const { data } = useQueryAssociados();

    return (
        <>
            {data && data.data ?
                data.data
                    .filter(item => item.tipo === 'Associado') // Filtrar apenas associados
                    .map((item, index) => (
                        <option
                            value={item.nome}
                            id={item.nome}
                            key={index}
                        >
                            {item.nomeFantasia} ({item.nome})
                        </option>
                    ))
                : <option disabled>Nenhum Associado Disponível</option>
            }
        </>
    )
};

export default AssociadoOptions;
