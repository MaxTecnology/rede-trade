import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-helpers.jsx";
import CadastrarAssociado from "../../pages/associados/CadastrarAssociado";
import { getApiData } from "../../hooks/ListasHook";
import { activePage } from "../../utils/functions/setActivePage";
import { toast } from "sonner";

vi.mock("../../hooks/ListasHook", () => ({
  getApiData: vi.fn(),
}));

vi.mock("../../utils/functions/setActivePage", () => ({
  activePage: vi.fn(),
}));

vi.mock("valtio", async () => {
  const actual = await vi.importActual("valtio");
  return {
    ...actual,
    useSnapshot: () => ({
      user: {
        idUsuario: 4,
        matrizId: 4,
        nomeFantasia: "Matriz Corp",
      },
    }),
  };
});

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("../../components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

vi.mock("../../components/FramerMotion/ButtonMotion", () => ({
  default: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock("../../components/Form/Form_InformacoesUsuario", () => ({
  default: () => <div data-testid="form-infos-usuario" />,
}));

vi.mock("../../components/Form/Form_Contato", () => ({
  default: () => <div data-testid="form-contato" />,
}));

vi.mock("../../components/Form/Form_Endereço", () => ({
  default: () => <div data-testid="form-endereco" />,
}));

vi.mock("../../components/Form/Form_Operacoes", () => ({
  default: () => <div data-testid="form-operacoes" />,
}));

vi.mock("../../components/Form/Form_Dados", () => ({
  default: () => <div data-testid="form-dados" />,
}));

vi.mock("../../components/Form/Form_Agencia", () => ({
  default: ({ planos = [] }) => (
    <div data-testid="planos-count">{planos.length}</div>
  ),
}));

describe("CadastrarAssociado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("carrega planos e filtra apenas tipo associado", async () => {
    vi.mocked(getApiData).mockResolvedValue({
      data: [
        { idPlano: 1, nomePlano: "Gold", tipoDoPlano: "Associado" },
        { idPlano: 2, nomePlano: "Diamante", tipoDoPlano: "Associados" },
        { idPlano: 3, nomePlano: "Agencia", tipoDoPlano: "Agencias" },
      ],
    });

    renderWithProviders(<CadastrarAssociado />);

    expect(screen.getByText("Novo Associado")).toBeInTheDocument();
    expect(activePage).toHaveBeenCalledWith("associados");

    await waitFor(() => {
      expect(getApiData).toHaveBeenCalledWith("planos/listar-planos");
    });

    await waitFor(() => {
      expect(screen.getByTestId("planos-count")).toHaveTextContent("2");
    });
  });

  it("exibe erro quando falha ao carregar planos", async () => {
    vi.mocked(getApiData).mockRejectedValue(new Error("falha"));

    renderWithProviders(<CadastrarAssociado />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao carregar planos");
    });
  });
});
