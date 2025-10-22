import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { VscChromeClose } from "react-icons/vsc";
import { menuConfigMap } from "@/config/menuConfig";
import { usePermissions } from "@/hooks/usePermissions";

const ModalContent = ({ modalItem, modalFunction }) => {
  const navigate = useNavigate();
  const { hasAnyPermission } = usePermissions();

  const menuDefinition = useMemo(() => {
    if (!modalItem) return null;
    return menuConfigMap[modalItem] ?? null;
  }, [modalItem]);

  const options =
    menuDefinition?.children?.filter((option) =>
      hasAnyPermission(option.permissions)
    ) ?? [];

  const handleNavigation = (route) => {
    if (!route) return;
    navigate(route);
    modalFunction();
  };

  if (!menuDefinition) {
    return null;
  }

  return (
    <div className="sidebarModal">
      <div>
        <div className="sidebarModalHeader">
          <p>Navegação Rápida</p>
          <VscChromeClose color="white" onClick={() => modalFunction()} />
        </div>

        <div className="sidebarModalBody">
          {options.length === 0 ? (
            <div className="sidebarModalItem disabled">
              <p>Você não possui permissões para esta área.</p>
            </div>
          ) : (
            options.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.id} className="sidebarModalItem">
                  {Icon ? <Icon /> : null}
                  <p onClick={() => handleNavigation(option.route)}>
                    {option.label}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalContent;
