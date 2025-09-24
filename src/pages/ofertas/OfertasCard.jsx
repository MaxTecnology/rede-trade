import { useEffect, useState } from "react";
import state from "@/store";
import { useNavigate } from 'react-router-dom';
import brazilIcon from "@/assets/images/flagofBrazil.png"
import { activePage } from "@/utils/functions/setActivePage";
import { formatarNumeroParaReal } from "@/utils/functions/formartNumber";
import ButtonMotion from "@/components/FramerMotion/ButtonMotion";
import { motion } from "framer-motion";

const OfertasCard = ({ associado, index }) => {
    const navigate = useNavigate();
    const data = associado

    const [dias, setDias] = useState(0);
    const [horas, setHoras] = useState(0);
    const [minutos, setMinutos] = useState(0);
    const [segundos, setSegundos] = useState(0);

    // Configuração da API para imagens
    const API_BASE_URL = "http://localhost:3024"; // ou process.env.REACT_APP_API_URL
    const imagemPadrao = "https://cdn.vectorstock.com/i/preview-1x/65/30/default-image-icon-missing-picture-page-vector-40546530.jpg";

    // Função para construir URL da imagem
    const construirUrlImagem = (imagemPath) => {
        if (!imagemPath) return imagemPadrao;
        
        // Se já é uma URL completa, usar diretamente
        if (imagemPath.startsWith('http://') || imagemPath.startsWith('https://')) {
            return imagemPath;
        }
        
        // Se é um caminho relativo, construir URL completa
        if (imagemPath.startsWith('/uploads/')) {
            return `${API_BASE_URL}${imagemPath}`;
        }
        
        // Se não tem o prefixo /uploads/, adicionar
        return `${API_BASE_URL}/uploads/images/${imagemPath}`;
    };

    // Função para obter primeira imagem
    const obterPrimeiraImagem = () => {
        if (!data.imagens || data.imagens.length === 0) {
            return imagemPadrao;
        }

        // Se imagens é um array de strings
        if (Array.isArray(data.imagens)) {
            return construirUrlImagem(data.imagens[0]);
        }

        // Se imagens é uma string que parece um array JSON
        if (typeof data.imagens === 'string') {
            try {
                // Remover chaves {} se existirem
                const cleanString = data.imagens.replace(/[{}]/g, '');
                // Dividir por vírgula
                const imagensArray = cleanString.split(',');
                if (imagensArray.length > 0 && imagensArray[0].trim()) {
                    return construirUrlImagem(imagensArray[0].trim());
                }
            } catch (error) {
                console.warn('Erro ao processar imagens:', error);
            }
        }

        return imagemPadrao;
    };

    useEffect(() => {
        activePage("ofertas")
    }, []);

    function calcularDiferenca(vencimento) {
        const dataVencimento = new Date(vencimento);
        const dataAtual = new Date();

        // Obter o fuso horário local em minutos (levando em consideração o horário de verão, se aplicável)
        const fusoHorarioLocalEmMinutos = dataAtual.getTimezoneOffset();

        // Calcular a diferença de tempo em milissegundos, incluindo o fuso horário local
        const diferencaEmMilissegundos = dataVencimento - dataAtual + fusoHorarioLocalEmMinutos * 60 * 1000;

        // Calcular dias, horas, minutos e segundos a partir da diferença em milissegundos
        const segundos = Math.floor(diferencaEmMilissegundos / 1000) % 60;
        const minutos = Math.floor(diferencaEmMilissegundos / (1000 * 60)) % 60;
        const horas = Math.floor(diferencaEmMilissegundos / (1000 * 60 * 60)) % 24;
        const dias = Math.floor(diferencaEmMilissegundos / (1000 * 60 * 60 * 24));

        return { dias, horas, minutos, segundos };
    }


    // Atualiza os campos de dias, horas, minutos e segundos
    function atualizarCampos(dias, horas, minutos, segundos) {
        setDias(dias)
        setHoras(horas)
        setMinutos(minutos)
        setSegundos(segundos)
    }


    // Chame a função de início da contagem regressiva ao montar o componente
    useEffect(() => {
        // Função para iniciar a contagem regressiva
        function iniciarContagemRegressiva(data) {
            const { dias, horas, minutos, segundos } = calcularDiferenca(data);

            atualizarCampos(dias, horas, minutos, segundos);

            setInterval(() => {
                const { dias, horas, minutos, segundos } = calcularDiferenca(data);
                atualizarCampos(dias, horas, minutos, segundos);
            }, 1000);
        }
        if (data && data.vencimento) {
            iniciarContagemRegressiva(data.vencimento);
        }

    }, [data]);



    const handleNavigation = () => {
        state.ofertaCard = data
        localStorage.setItem('ofertaCard', JSON.stringify(data));
        navigate("/ofertasInfo")
    }

    if (data.status) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8, translate: 0 }} // Adicionado translate: 0
                animate={{ opacity: 1, scale: 1, translate: 0 }}
                transition={{ duration: 1, delay: index * 0.3 }}
                exit={{ opacity: 0, scale: 0 }}
                className=" ofertasCard"
            >
                <img 
                    src={obterPrimeiraImagem()} 
                    alt={`Imagem da oferta: ${data.titulo}`} 
                    className="ofertasCardImage"
                    onError={(e) => {
                        console.warn('Erro ao carregar imagem da oferta:', data.imagens);
                        e.target.src = imagemPadrao;
                    }}
                />
                <div className="ofertasCardType">
                    <span>{data.tipo}</span>
                    <div >
                        SC
                        <img src={brazilIcon} alt="" />
                    </div>
                </div>
                <div className="ofertasCardTime">
                    <span>Expira em</span>
                    <div>
                        <span id="dias">
                            {dias}
                            <p>dias</p>
                        </span>

                        <span id="horas">
                            {horas}
                            <p>horas</p>
                        </span>

                        <span id="minutos">
                            {minutos}
                            <p>minutos</p>
                        </span>

                        <span id="segundos">
                            {segundos}
                            <p>segundos</p>
                        </span>

                    </div>
                </div>
                <div className="associadoCardName">
                    {data.titulo}
                </div>

                <div className="associadoCardDesc">
                    {data.descricao}
                </div>
                <div className="ofertasCardValor">
                    RT$ {formatarNumeroParaReal(data.valor)}
                </div>
                <ButtonMotion className="buttonContainer">
                    <button className="border-none" onClick={handleNavigation}>Ver Mais</button>
                </ButtonMotion>
            </motion.div>
        )
    } else {
        return
    }

};

export default OfertasCard;
