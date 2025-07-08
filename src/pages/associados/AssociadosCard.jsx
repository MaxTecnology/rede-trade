import { useEffect } from "react";
import {
  BsGlobe,
  BsUniversalAccessCircle,
  BsWhatsapp,
  BsBrowserChrome,
  BsTagsFill,
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import state from "@/store";
import logoBrazil from "@/assets/images/flagofBrazil.png";
import { activePage } from "@/utils/functions/setActivePage";
import StarRating from "@/components/Stars/StarRating";
import ButtonMotion from "@/components/FramerMotion/ButtonMotion";
import { motion } from "framer-motion";
import { useQueryCategorias } from "@/hooks/ReactQuery/useQueryCategorias";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function truncarTexto(texto, comprimentoMaximo) {
  if (!texto || typeof texto !== 'string') return '';
  if (texto.length > comprimentoMaximo) {
    return texto.slice(0, comprimentoMaximo - 3) + "...";
  }
  return texto;
}

const AssociadosCard = ({ associado, index }) => {
  const { data: categorias, isLoading: categoriasLoading } = useQueryCategorias();
  const navigate = useNavigate();

  // Verificação de segurança
  if (!associado) {
    console.warn('AssociadosCard: associado é null ou undefined');
    return null;
  }

  // Função para obter nome da categoria
  const obterNomeCategoria = () => {
    if (categoriasLoading) return 'Carregando...';
    
    if (!categorias || !categorias.categorias || !Array.isArray(categorias.categorias)) {
      return 'Sem Categoria';
    }

    if (!associado.categoriaId) {
      return 'Sem Categoria';
    }

    const categoria = categorias.categorias.find(
      cat => cat.idCategoria === associado.categoriaId
    );

    return categoria ? categoria.nomeCategoria : 'Categoria não encontrada';
  };

  // Função para obter informações de contato
  const obterTelefone = () => {
    // Prioridade: celular > telefone > conta.gerenteConta.telefone
    if (associado.celular) {
      return associado.celular;
    }
    if (associado.telefone) {
      return associado.telefone;
    }
    if (associado.conta?.gerenteConta?.telefone) {
      return associado.conta.gerenteConta.telefone;
    }
    return null;
  };

  // Função para obter nome da franquia/agência
  const obterNomeFranquia = () => {
    if (associado.conta?.nomeFranquia) {
      return associado.conta.nomeFranquia;
    }
    if (associado.conta?.gerenteConta?.nome) {
      return associado.conta.gerenteConta.nome;
    }
    return associado.nomeFantasia || 'Sem agência';
  };

  // Função para obter nome do criador
  const obterNomeCriador = () => {
    // Como não temos usuarioCriador na estrutura, usar o gerente da conta
    if (associado.conta?.gerenteConta?.nome) {
      return associado.conta.gerenteConta.nome;
    }
    return 'Sistema';
  };

  // Função para verificar status
  const obterStatus = () => {
    if (typeof associado.status === 'boolean') {
      return associado.status;
    }
    if (typeof associado.status === 'string') {
      return associado.status.toLowerCase() === 'ativo' || 
             associado.status.toLowerCase() === 'atendendo' ||
             associado.status === 'true';
    }
    return true; // Default
  };

  useEffect(() => {
    activePage("associados");
  }, []);

  const handleNavigation = () => {
    // Armazenar dados do associado
    state.userCard = associado;
    localStorage.setItem("userCard", JSON.stringify(associado));
    navigate("/associadoInfo");
  };

  const handleWhatsApp = () => {
    const telefone = obterTelefone();
    
    if (!telefone) {
      console.warn('Nenhum telefone disponível para WhatsApp');
      return;
    }

    try {
      // Limpar telefone (apenas números)
      const telefoneClean = telefone.replace(/\D/g, "");
      
      if (telefoneClean.length < 10) {
        console.warn('Telefone muito curto:', telefoneClean);
        return;
      }

      // Montar URL do WhatsApp
      const url = `https://wa.me/55${telefoneClean}`;
      
      // Abrir WhatsApp
      window.open(url, "_blank");
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
    }
  };

  const handleWebsite = () => {
    if (!associado.site) {
      console.warn('Associado não possui site');
      return;
    }

    try {
      // Verificar se a URL tem protocolo
      let url = associado.site;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      
      window.open(url, "_blank");
    } catch (error) {
      console.error('Erro ao abrir site:', error);
    }
  };

  // Obter dados processados
  const nomeCategoria = obterNomeCategoria();
  const telefone = obterTelefone();
  const nomeFranquia = obterNomeFranquia();
  const nomeCriador = obterNomeCriador();
  const statusAtivo = obterStatus();
  const temTelefone = !!telefone;
  const temSite = !!associado.site;

  // Imagem padrão
  const imagemPadrao = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, translate: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="associadoCard"
    >
      {/* Imagem do associado */}
      <img
        src={associado.imagem || imagemPadrao}
        alt={`Foto de ${associado.nomeFantasia || 'Associado'}`}
        className="associadoCardImagem"
        onError={(e) => {
          e.target.src = imagemPadrao;
        }}
      />

      {/* Tag com categoria e localização */}
      <div className="associadoCardTag">
        <div>
          <BsTagsFill />
          {truncarTexto(nomeCategoria, 20)}
        </div>
        <div>
          {associado.estado || 'SC'}
          <img src={logoBrazil} alt="Brasil" />
        </div>
      </div>

      {/* Nome e rating */}
      <div className="associadoCardName flex justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span>
                {truncarTexto(associado.nomeFantasia || associado.nome || 'Sem nome', 25)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{associado.nomeFantasia || associado.nome || 'Sem nome'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <StarRating rating={associado.reputacao || 0} />
      </div>

      {/* Status */}
      <div className={statusAtivo ? "associadoCardStatus" : "associadoCardStatus disabled"}>
        {statusAtivo ? "Atendendo" : "Não atendendo"}
      </div>

      {/* Descrição */}
      <div className="associadoCardDesc">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span>
                {truncarTexto(associado.descricao || 'Sem descrição', 100)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{associado.descricao || 'Sem descrição'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Ícones de informações */}
      <div className="associadoCardIconsContainer">
        {/* Criador */}
        <div>
          <BsGlobe />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span>{truncarTexto(nomeCriador, 15)}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Criado por: {nomeCriador}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Franquia */}
        <div className="flex2">
          <BsUniversalAccessCircle />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span>{truncarTexto(nomeFranquia, 15)}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Franquia: {nomeFranquia}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* WhatsApp */}
        <div 
          className={temTelefone ? "whats" : "whats disabled"} 
          onClick={temTelefone ? handleWhatsApp : null}
          style={{ 
            opacity: temTelefone ? 1 : 0.5,
            cursor: temTelefone ? 'pointer' : 'not-allowed'
          }}
        >
          <BsWhatsapp />
          Contato
        </div>

        {/* Site */}
        <div 
          className={temSite ? "website" : "website disabled"}
          onClick={temSite ? handleWebsite : null}
          style={{ 
            opacity: temSite ? 1 : 0.5,
            cursor: temSite ? 'pointer' : 'not-allowed'
          }}
        >
          <BsBrowserChrome />
          Site
        </div>
      </div>

      {/* Botão Ver Mais */}
      <div className="buttonContainer">
        <ButtonMotion onClick={handleNavigation}>
          Ver Mais
        </ButtonMotion>
      </div>
    </motion.div>
  );
};

export default AssociadosCard;