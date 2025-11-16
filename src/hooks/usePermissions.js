import { useMemo } from "react";
import { useSnapshot } from "valtio";
import state from "@/store";
import { permissionsSchema } from "@/config/permissionsSchema";

const parsePermissions = (rawPermissions) => {
  if (!rawPermissions) {
    return [];
  }

  if (Array.isArray(rawPermissions)) {
    return rawPermissions
      .map((perm) => (typeof perm === "string" ? perm.trim() : ""))
      .filter(Boolean);
  }

  if (typeof rawPermissions === "string") {
    try {
      const parsed = JSON.parse(rawPermissions);
      if (Array.isArray(parsed)) {
        return parsed
          .map((perm) => (typeof perm === "string" ? perm.trim() : ""))
          .filter(Boolean);
      }
    } catch {
      return rawPermissions
        .split(",")
        .map((perm) => perm.trim())
        .filter(Boolean);
    }
  }

  return [];
};

export const usePermissions = () => {
  const snap = useSnapshot(state);

  const permissionsArray = useMemo(
    () => parsePermissions(snap.user?.permissoesDoUsuario),
    [snap.user?.permissoesDoUsuario]
  );

  const permissionSet = useMemo(
    () => new Set(permissionsArray),
    [permissionsArray]
  );

  const isSuperUser = useMemo(() => {
    return (
      permissionsArray.includes("*") ||
      permissionsArray.includes("ADMIN") ||
      snap.user?.tipo === "Matriz"
    );
  }, [permissionsArray, snap.user?.tipo]);

  const hasPermission = (permission) => {
    if (!permission) return true;
    if (isSuperUser) return true;
    return permissionSet.has(permission);
  };

  const hasPermissionInCategory = (categoria, chave) => {
    if (!categoria || !chave) return false;
    const key = chave.includes(".") ? chave : `${categoria}.${chave}`;
    return hasPermission(key);
  };

  const hasAnyPermission = (permissions = []) => {
    if (!permissions || permissions.length === 0) return true;
    return permissions.some((permission) => hasPermission(permission));
  };

  const permissionMatrix = useMemo(() => {
    const matrix = {};
    permissionsSchema.forEach((categoria) => {
      matrix[categoria.categoria] = {};
      categoria.items.forEach((item) => {
        matrix[categoria.categoria][item.chave] = hasPermission(item.chave);
      });
    });
    return matrix;
  }, [permissionsArray, isSuperUser]);

  return {
    userType: snap.user?.tipo ?? "",
    permissionSet,
    permissionMatrix,
    hasPermission,
    hasPermissionInCategory,
    hasAnyPermission,
    isMatriz: isSuperUser,
  };
};
