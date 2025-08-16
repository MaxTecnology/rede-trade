import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { formatDate } from "@/hooks/ListasHook";
import { activePage } from "@/utils/functions/setActivePage";
import RealInput from "@/components/Inputs/CampoMoeda";
import defaultImage from "@/assets/images/default_img.png";

const OfertasInfo = () => {
    const [reference, setReference] = useState(true)
    const storedData = JSON.parse(localStorage.getItem("ofertaCard"));
    
    const formatarNumeroParaReal = (numero) => {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numero);
    };
    
    // Função para verificar se é uma URL válida
    const isURL = (str) => {
        try {
            new URL(str);
            return true;
        } catch (_) {
            return false;
        }
    };
    
    // Construir URL da imagem
    const getImageUrl = () => {
        if (!storedData?.imagens || !storedData.imagens[0]) {
            return defaultImage;
        }
        
        const imagePath = storedData.imagens[0];
        
        if (isURL(imagePath)) {
            // Se já é uma URL completa
            return imagePath;
        } else if (imagePath.startsWith('/')) {
            // Se é um caminho relativo que começa com /
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
            return `${baseUrl}${imagePath}`;
        } else if (imagePath.includes('uploads/')) {
            // Se contém uploads/ mas não começa com /
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
            return `${baseUrl}/${imagePath}`;
        } else {
            // Qualquer outro caso
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
            return `${baseUrl}/uploads/images/${imagePath}`;
        }
    };
    
    useEffect(() => {
        activePage("ofertas");
        
        // DEBUG: Verificar dados da oferta
        console.log('🔍 DEBUG OfertasInfo - storedData:', storedData);
        console.log('🔍 DEBUG OfertasInfo - imagens:', storedData?.imagens);
        console.log('🔍 DEBUG OfertasInfo - primeira imagem:', storedData?.imagens?.[0]);
        console.log('🔍 DEBUG OfertasInfo - URL construída:', getImageUrl());
    }, []);
    return (
        <div className="container">
            <div className="containerHeader">Informações da Oferta</div>
            <div className="associadoInfoContainer">
                <h1>{storedData.titulo}</h1>
                <div className="associadoInfo ofertasInfo">
                    <div className="ofertasImage">
                        <img src={getImageUrl()} alt={storedData?.titulo || "Imagem da oferta"} />
                    </div>
                    <div className="associadoInfoItens">
                        <h2 className="associadoInfoCategoria ofertasInfoH2">
                            {formatDate(storedData.vencimento, "full")}</h2>
                        <div className="ofertasInfoValor">
                            <p>RT$ {formatarNumeroParaReal(storedData.valor)}</p>
                            <div>
                                <RealInput name="limiteCredito" placeholder="Quantidade da permuta" reference={reference} required />
                                <button>Permultar</button>
                            </div>
                        </div>
                        <div className="ofertasInfoInfo">
                            <h3>Informações:</h3>
                            <p><span>Vendido por:</span> {storedData.nomeUsuario ? storedData.nomeUsuario : "Ninguem"}</p>
                            <p><span>Cidade:</span> {storedData.cidade}</p>
                            <p><span>Agência:</span> {storedData.nomeAgencia ? storedData.nomeAgencia : "Nenhuma"}</p>
                            <p><span>Tipo:</span> {storedData.tipo}</p>
                        </div>
                        <div>
                            <h3>Descrição da Oferta</h3>
                            <p>{storedData.descricao}</p>
                        </div>
                        <div>
                            <h3>Observações</h3>
                            <p>{storedData.obs ? storedData.obs : "Nenhuma"}</p>
                        </div>
                        <h2 className={storedData.status ? "associadoInfoStatus" : "associadoInfoStatus disabled"}>{storedData.status ? "Oferta Ativa" : "Oferta Desativada"}</h2>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default OfertasInfo;
