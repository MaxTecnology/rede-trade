import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import { PiListFill } from "react-icons/pi";
import { FaSignOutAlt } from "react-icons/fa";
import userImage from "@/assets/images/mini-logo.jpeg";
import state from "@/store";
import ModalContent from "@/Modals/ModalContent";
import ModalMotion from "@/components/FramerMotion/ModalMotion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { truncarTexto } from "@/utils/functions";
import { getType } from "@/hooks/getId";
import { menuConfig } from "@/config/menuConfig";
import { usePermissions } from "@/hooks/usePermissions";

const Sidebar = () => {
  const snap = useSnapshot(state);
  const navigate = useNavigate();
  const { hasAnyPermission, isMatriz, userType } = usePermissions();

  const [modalItem, setModalItem] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [sidebarClosed, setSidebarClosed] = useState(false);

  const menuItems = useMemo(() => menuConfig, []);

  const toggleSidebar = () => {
    setSidebarClosed((previous) => !previous);
  };

  const logout = () => {
    state.logged = false;
    localStorage.clear();
    window.location.reload();
  };

  const modalHandler = (value = null) => {
    setModalIsOpen((previous) => !previous);
    if (value) {
      setModalItem(value);
    }
  };

  const handleMenuClick = (menu) => {
    if (!menu?.action) return;

    if (menu.action.type === "route") {
      navigate(menu.action.value);
    }

    if (menu.action.type === "modal") {
      modalHandler(menu.id);
    }
  };

  const getName = () => {
    const type = getType();
    if (type === "Associado") {
      return snap.user?.conta?.nomeFranquia;
    }
    return snap.user?.nomeFantasia;
  };

  const canShowMenu = (menu) => {
    if (!menu) return false;

    if (isMatriz) {
      return true;
    }

    if (menu.allowForMatriz && userType === "Matriz") {
      return true;
    }

    if (!menu.permissions?.menu || menu.permissions.menu.length === 0) {
      return true;
    }

    return hasAnyPermission(menu.permissions.menu);
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
              <img className="userImage" src={userImage} alt="user" />
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
        {menuItems.map((menu) => {
          if (!canShowMenu(menu)) {
            return null;
          }

          const Icon = menu.icon;
          const isActive = snap.activePage === menu.stateKey;
          const defaultClass =
            menu.stateKey === "home" ? "search" : undefined;

          return (
            <li
              key={menu.id}
              className={isActive ? "active" : defaultClass}
              onClick={() => handleMenuClick(menu)}
            >
              {Icon ? <Icon className="sideContentIcon" /> : null}
              <p>{menu.label}</p>
            </li>
          );
        })}

        <li className="pb-20" onClick={logout}>
          <FaSignOutAlt className="sideContentIcon" />
          <p>SAIR</p>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
