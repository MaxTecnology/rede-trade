import { useState } from "react";
import userImage from "../assets/images/mini-logo.jpeg";
import { useNavigate } from "react-router-dom";
import { PiListFill } from "react-icons/pi";
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaHandshake,
  FaTags,
  FaPercentage,
  FaHandHoldingUsd,
  FaAdjust,
  FaUserPlus,
  FaSignOutAlt,
  FaSearch,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { BsBookmarkFill, BsCashCoin } from "react-icons/bs";
import ModalContent from "../Modals/ModalContent";
import state from "../store";
import { getType } from "../hooks/getId";
import { useSnapshot } from "valtio";
import ModalMotion from "./FramerMotion/ModalMotion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { truncarTexto } from "@/utils/functions";

const Sidebar = () => {
  useSnapshot(state);
  const navigate = useNavigate();
  const [modalItem, setModalItem] = useState(false);
  const [modalIsOpen, setmodalIsOpen] = useState(false);
  const [sidebarClosed, setSidebarClosed] = useState(false);

  const toggleSidebar = () => {
    setSidebarClosed(!sidebarClosed);
  };

  const handleSidebarItemClick = (route) => {
    navigate(route);
  };

  const logout = async () => {
    state.logged = false;
    localStorage.clear();
    window.location.reload();
  };

  const modalHandler = (value) => {
    setmodalIsOpen(!modalIsOpen);
    if (value) {
      setModalItem(value);
    }
  };

  function getName() {
    const userType = getType();
    if (userType === "Associado") {
      return state.user?.conta?.nomeFranquia;
    }
    return state.user?.nomeFantasia;
  }

  // 🔑 SISTEMA DE PERMISSÕES GRANULAR
  const getUserPermissions = () => {
    try {
      const permissions = JSON.parse(state.user?.permissoesDoUsuario || "[]");
      console.log('👤 Permissões do usuário:', permissions);
      return permissions;
    } catch (error) {
      console.error('Erro ao parsear permissões:', error);
      return [];
    }
  };

  const hasPermission = (permission) => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes(permission) || userPermissions.includes("ADMIN");
  };

  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Função para identificar se é usuário Matriz (sem matriz superior)
  const isMatrizUser = () => {
    return state.user?.matrizId === null || userType === "Matriz";
  };

  // Para compatibilidade com sistema antigo
  const userType = getType();

  // 🔒 DEFINIÇÃO DE PERMISSÕES POR FUNCIONALIDADE
  const menuPermissions = {
    INICIO: [], // Todos podem ver
    ASSOCIADOS: ["READ"], // Precisa pelo menos READ
    AGENCIAS: ["MANAGE_FRANCHISES", "MANAGE_ACCOUNTS", "ADMIN"], // Ajustado para incluir MANAGE_ACCOUNTS
    TRANSACOES: ["READ"], // Todos com READ
    OFERTAS: ["READ"], // Todos com READ
    VOUCHER: ["READ"], // Todos com READ
    CREDITOS: ["READ"], // Todos com READ
    EXTRATOS: ["READ"], // Todos com READ
    CONTAS: ["MANAGE_ACCOUNTS", "ADMIN"], // Gerenciar contas ou admin
    PLANOS: ["ADMIN", "MANAGE_ACCOUNTS"], // Admin ou manage accounts (para Matriz)
    CATEGORIAS: ["ADMIN", "MANAGE_ACCOUNTS"], // Admin ou manage accounts (para Matriz)
    GERENTES: ["MANAGE_ACCOUNTS", "MANAGE_FRANCHISES", "ADMIN"], // Gerenciar contas/franquias ou admin
    USUARIOS: ["MANAGE_ACCOUNTS", "ADMIN"], // Gerenciar contas ou admin
  };

  const canShowMenuItem = (menuItem) => {
    const requiredPermissions = menuPermissions[menuItem];
    
    // Se não há permissões definidas, mostra para todos
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    
    // LÓGICA ESPECIAL: PLANOS e CATEGORIAS são exclusivos da Matriz
    if (menuItem === 'PLANOS' || menuItem === 'CATEGORIAS') {
      return hasAnyPermission(requiredPermissions) || isMatrizUser();
    }
    
    // COMPATIBILIDADE: Para AGENCIAS e GERENTES, verificar se NÃO é Associado
    if (menuItem === 'AGENCIAS' || menuItem === 'GERENTES') {
      return hasAnyPermission(requiredPermissions) || userType !== "Associado";
    }
    
    // Se tem permissões definidas, verifica se o usuário tem alguma delas
    return hasAnyPermission(requiredPermissions);
  };

  return (
    <div className={`sidebar ${sidebarClosed ? "sidebarClosed" : ""}`}>
      <ModalMotion isOpen={modalIsOpen} onClick={() => modalHandler()}>
        <ModalContent modalItem={modalItem} modalFunction={modalHandler} />
      </ModalMotion>
      <div className="sideInfo">
        <div
          className={`flex w-full max-w-[200px] ${
            sidebarClosed ? "justify-center" : "justify-between"
          }`}
        >
          {sidebarClosed ? null : (
            <div className="sideUserInfo flex flex-col gap-2 md">
              <img className="userImage" src={userImage} alt="userImage" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>{truncarTexto(getName(), 20)}</TooltipTrigger>
                  <TooltipContent>
                    <p>{getName()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          <div className="self-center">
            <button className="hamburgerButton" onClick={toggleSidebar}>
              <PiListFill size={24} />
            </button>
          </div>
        </div>
      </div>
      <ul className="sideContent">
        {/* INÍCIO - Todos podem ver */}
        {canShowMenuItem('INICIO') && (
          <li
            className={state.activePage === "home" ? "active" : "search"}
            onClick={() => handleSidebarItemClick("/")}
          >
            <FaHome className="sideContentIcon" />
            <p>INÍCIO</p>
          </li>
        )}

        {/* ASSOCIADOS - Precisa READ */}
        {canShowMenuItem('ASSOCIADOS') && (
          <li
            className={state.activePage === "associados" ? "active" : ""}
            onClick={() => modalHandler("Associado")}
          >
            <FaUsers className="sideContentIcon" />
            <p>ASSOCIADOS</p>
          </li>
        )}

        {/* AGÊNCIAS - Precisa MANAGE_FRANCHISES ou ADMIN */}
        {canShowMenuItem('AGENCIAS') && (
          <li
            className={state.activePage === "agencias" ? "active" : ""}
            onClick={() => modalHandler("Agencias")}
          >
            <FaBuilding className="sideContentIcon" />
            <p>AGÊNCIAS</p>
          </li>
        )}

        {/* TRANSAÇÕES - Precisa READ */}
        {canShowMenuItem('TRANSACOES') && (
          <li
            className={state.activePage === "transações" ? "active" : ""}
            onClick={() => modalHandler("Transações")}
          >
            <FaHandshake className="sideContentIcon" />
            <p>TRANSAÇÕES</p>
          </li>
        )}

        {/* OFERTAS - Precisa READ */}
        {canShowMenuItem('OFERTAS') && (
          <li
            className={state.activePage === "ofertas" ? "active" : ""}
            onClick={() => modalHandler("Ofertas")}
          >
            <FaTags className="sideContentIcon" />
            <p>OFERTAS</p>
          </li>
        )}

        {/* VOUCHER - Precisa READ */}
        {canShowMenuItem('VOUCHER') && (
          <li
            className={state.activePage === "voucher" ? "active" : ""}
            onClick={() => modalHandler("Voucher")}
          >
            <FaPercentage className="sideContentIcon" />
            <p>VOUCHER</p>
          </li>
        )}

        {/* CRÉDITOS - Precisa READ */}
        {canShowMenuItem('CREDITOS') && (
          <li
            className={state.activePage === "creditos" ? "active" : ""}
            onClick={() => modalHandler("Créditos")}
          >
            <BsCashCoin className="sideContentIcon orange" />
            <p>CRÉDITOS</p>
          </li>
        )}

        {/* EXTRATOS - Precisa READ */}
        {canShowMenuItem('EXTRATOS') && (
          <li
            className={state.activePage === "extratos" ? "active" : ""}
            onClick={() => modalHandler("Estratos")}
          >
            <FaFileInvoiceDollar className="sideContentIcon" />
            <p>EXTRATOS</p>
          </li>
        )}

        {/* CONTAS - Precisa MANAGE_ACCOUNTS ou ADMIN */}
        {canShowMenuItem('CONTAS') && (
          <li
            className={state.activePage === "contas" ? "active" : ""}
            onClick={() => modalHandler("Conta")}
          >
            <FaHandHoldingUsd className="sideContentIcon" />
            <p>CONTAS</p>
          </li>
        )}

        {/* PLANOS - Só ADMIN */}
        {canShowMenuItem('PLANOS') && (
          <li
            className={
              state.activePage === "planos" ? "active planos" : "planos"
            }
            onClick={() => modalHandler("Planos")}
          >
            <BsBookmarkFill className="sideContentIcon orange" />
            <p>PLANOS</p>
          </li>
        )}

        {/* CATEGORIAS - Só ADMIN */}
        {canShowMenuItem('CATEGORIAS') && (
          <li
            className={state.activePage === "categorias" ? "active" : ""}
            onClick={() => modalHandler("Categorias")}
          >
            <FaAdjust className="sideContentIcon" />
            <p>CATEGORIAS</p>
          </li>
        )}

        {/* GERENTES - Precisa MANAGE_ACCOUNTS, MANAGE_FRANCHISES ou ADMIN */}
        {canShowMenuItem('GERENTES') && (
          <li
            className={state.activePage === "gerentes" ? "active" : ""}
            onClick={() => modalHandler("Gerentes")}
          >
            <FaUserPlus className="sideContentIcon" />
            <p>GERENTES</p>
          </li>
        )}

        {/* USUÁRIOS - Precisa MANAGE_ACCOUNTS ou ADMIN */}
        {canShowMenuItem('USUARIOS') && (
          <li
            className={state.activePage === "usuarios" ? "active" : ""}
            onClick={() => modalHandler("Usuarios")}
          >
            <FaUsers className="sideContentIcon" />
            <p>USUÁRIOS</p>
          </li>
        )}

        {/* SAIR - Todos podem */}
        <li className="pb-20" onClick={logout}>
          <FaSignOutAlt className="sideContentIcon" />
          <p>SAIR</p>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;