import { useMemo } from "react";
import { useSnapshot } from "valtio";
import state from "@/store";

const normalizeString = (value) => {
  if (!value) return "";
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const AGENCIA_MASTER_PERMISSIONS = [
  "associados.ver",
  "associados.listar",
  "associados.criar",
  "associados.bloquear",
  "agencias.ver",
  "agencias.criar",
  "agencias.bloquear",
  "transacoes.ver",
  "transacoes.listar",
  "transacoes.minhas",
  "transacoes.criar",
  "transacoes.estornar",
  "ofertas.ver",
  "ofertas.minhas",
  "ofertas.criar",
  "ofertas.excluir",
  "creditos.ver",
  "creditos.listar",
  "creditos.meus",
  "creditos.solicitar",
  "creditos.analisar",
  "creditos.aprovar",
  "vouchers.ver",
  "vouchers.gerenciar",
  "vouchers.meus",
  "vouchers.solicitar",
  "vouchers.cancelar",
  "extratos.ver",
  "extratos.meu",
  "extratos.estorno",
  "financeiro.ver",
  "financeiro.contasPagar",
  "financeiro.contasReceber",
  "usuarios.ver",
  "usuarios.meusDados",
  "usuarios.listar",
  "usuarios.editar",
  "usuarios.criar",
];

const ASSOCIADO_PERMISSIONS = [
  "associados.ver",
  "transacoes.ver",
  "transacoes.minhas",
  "transacoes.criar",
  "ofertas.ver",
  "ofertas.minhas",
  "ofertas.criar",
  "creditos.ver",
  "creditos.meus",
  "creditos.solicitar",
  "vouchers.ver",
  "vouchers.meus",
  "vouchers.solicitar",
  "extratos.ver",
  "extratos.meu",
  "financeiro.ver",
  "financeiro.contasPagar",
  "usuarios.ver",
  "usuarios.meusDados",
  "usuarios.listar",
  "usuarios.criar",
];

const ROLE_PRESETS = {
  matriz: ["*"],
  associado: ASSOCIADO_PERMISSIONS,
  "agencia master": AGENCIA_MASTER_PERMISSIONS,
  "agência master": AGENCIA_MASTER_PERMISSIONS,
  "franquia master": AGENCIA_MASTER_PERMISSIONS,
  master: AGENCIA_MASTER_PERMISSIONS,
};

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
    } catch (error) {
      // Não é JSON válido; tenta separar por vírgula
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
  const rawType = snap.user?.tipo;
  const normalizedType = normalizeString(rawType);

  const matrizByHierarchy =
    snap.user?.matrizId === null && normalizedType !== "associado";

  const basePermissions = parsePermissions(snap.user?.permissoesDoUsuario);
  const presetPermissions =
    ROLE_PRESETS[normalizedType] ??
    (matrizByHierarchy ? ROLE_PRESETS.matriz : []);

  const permissionSet = useMemo(() => {
    const set = new Set();

    [...basePermissions, ...presetPermissions].forEach((permission) => {
      if (permission) {
        set.add(permission);
      }
    });

    return set;
  }, [basePermissions, presetPermissions]);

  const hasPermission = (permission) => {
    if (!permission) return true;
    if (permissionSet.has("*")) return true;
    if (permissionSet.has("ADMIN")) return true;
    if (normalizedType === "matriz" || matrizByHierarchy) return true;
    return permissionSet.has(permission);
  };

  const hasAnyPermission = (permissions = []) => {
    if (!permissions || permissions.length === 0) return true;
    return permissions.some((permission) => hasPermission(permission));
  };

  return {
    userType: snap.user?.tipo ?? "",
    permissionSet,
    hasPermission,
    hasAnyPermission,
    isMatriz:
      permissionSet.has("*") ||
      permissionSet.has("ADMIN") ||
      normalizedType === "matriz" ||
      matrizByHierarchy,
  };
};
