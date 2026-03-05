export const CREDIT_STATUS = {
  PENDING: "PENDENTE",
  FORWARDED: "ENCAMINHADO_PARA_MATRIZ",
  APPROVED: "APROVADO",
  DENIED: "NEGADO",
};

const STATUS_LABELS = {
  [CREDIT_STATUS.PENDING]: "Pendente",
  [CREDIT_STATUS.FORWARDED]: "Encaminhado para a matriz",
  [CREDIT_STATUS.APPROVED]: "Aprovado",
  [CREDIT_STATUS.DENIED]: "Negado",
};

const normalizeText = (value) =>
  (value ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const normalizeCreditStatus = (status) => {
  const normalized = normalizeText(status);

  if (normalized === "pendente") return CREDIT_STATUS.PENDING;
  if (
    normalized === "encaminhado para a matriz" ||
    normalized === "encaminhado para matriz" ||
    normalized === "encaminhado_para_matriz"
  ) {
    return CREDIT_STATUS.FORWARDED;
  }
  if (normalized === "aprovado") return CREDIT_STATUS.APPROVED;
  if (normalized === "negado") return CREDIT_STATUS.DENIED;

  return null;
};

export const getCreditStatusLabel = (status) => {
  const normalized = normalizeCreditStatus(status);
  if (!normalized) {
    return status || "Indefinido";
  }
  return STATUS_LABELS[normalized] || status || "Indefinido";
};

export const isCreditStatusFinal = (status) => {
  const normalized = normalizeCreditStatus(status);
  return (
    normalized === CREDIT_STATUS.APPROVED ||
    normalized === CREDIT_STATUS.DENIED
  );
};

export const isCreditStatusPending = (status) => {
  return normalizeCreditStatus(status) === CREDIT_STATUS.PENDING;
};

export const normalizeUserRole = (role) => {
  const normalized = normalizeText(role);

  if (normalized === "matriz") return "MATRIZ";
  if (normalized.includes("associado")) return "ASSOCIADO";
  if (
    normalized.includes("franquia") ||
    normalized.includes("agencia") ||
    normalized.includes("gerente") ||
    normalized.includes("master")
  ) {
    return "AGENCIA";
  }

  return "OUTRO";
};
