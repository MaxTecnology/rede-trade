import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-helpers.jsx";
import Credito from "../../pages/creditos/Credito";
import CreditoMeus from "../../pages/creditos/CreditoMeus";
import CreditoAnalise from "../../pages/creditos/CreditoAnalise";
import CreditoAprovar from "../../pages/creditos/CreditoAprovar";
import { getApiData } from "../../hooks/ListasHook";
import { getId } from "../../hooks/getId";
import { activePage } from "../../utils/functions/setActivePage";
import { useQueryCreditosAnalisar } from "../../hooks/ReactQuery/useQueryCreditosAnalisar";
import { useQueryCreditosAprovar } from "../../hooks/ReactQuery/useQueryCreditosAprovar";

vi.mock("../../hooks/ListasHook", () => ({
  getApiData: vi.fn(),
}));

vi.mock("../../hooks/getId", () => ({
  getId: vi.fn(),
}));

vi.mock("../../utils/functions/setActivePage", () => ({
  activePage: vi.fn(),
}));

vi.mock("../../hooks/useModal", () => ({
  default: () => [false, vi.fn()],
}));

vi.mock("../../hooks/ReactQuery/useQueryCreditosAnalisar", () => ({
  useQueryCreditosAnalisar: vi.fn(),
}));

vi.mock("../../hooks/ReactQuery/useQueryCreditosAprovar", () => ({
  useQueryCreditosAprovar: vi.fn(),
}));

vi.mock("../../components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

vi.mock("../../Modals/CreditosModal", () => ({
  default: () => <div data-testid="creditos-modal" />,
}));

vi.mock("../../components/Search/SearchfieldCredito", () => ({
  default: () => <div data-testid="creditos-search" />,
}));

vi.mock("../../components/Tables/CreditosTable", () => ({
  default: ({ data = [] }) => (
    <div data-testid="table-size">{Array.isArray(data) ? data.length : 0}</div>
  ),
}));

describe("Paginas de Creditos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Credito (matriz) consulta listar-todos e repassa dados para tabela", async () => {
    vi.mocked(getApiData).mockResolvedValue({
      todasSolicitacoes: [{ idSolicitacaoCredito: 1 }, { idSolicitacaoCredito: 2 }],
    });

    renderWithProviders(<Credito />);

    expect(screen.getByText("Creditos")).toBeInTheDocument();
    expect(activePage).toHaveBeenCalledWith("creditos");

    await waitFor(() => {
      expect(getApiData).toHaveBeenCalledWith("creditos/listar-todos");
    });

    await waitFor(() => {
      expect(screen.getByTestId("table-size")).toHaveTextContent("2");
    });
  });

  it("CreditoMeus (associado) consulta creditos do proprio usuario", async () => {
    vi.mocked(getId).mockReturnValue(77);
    vi.mocked(getApiData).mockResolvedValue({
      solicitacoesCredito: [{ idSolicitacaoCredito: 10 }],
    });

    renderWithProviders(<CreditoMeus />);

    expect(screen.getByText("Meus Créditos")).toBeInTheDocument();

    await waitFor(() => {
      expect(getApiData).toHaveBeenCalledWith("creditos/listar/77");
    });

    await waitFor(() => {
      expect(screen.getByTestId("table-size")).toHaveTextContent("1");
    });
  });

  it("CreditoAnalise (agencia) usa hook de filhos e exibe tabela", () => {
    vi.mocked(useQueryCreditosAnalisar).mockReturnValue({
      data: {
        solicitacoesDosFilhos: [{ idSolicitacaoCredito: 1 }, { idSolicitacaoCredito: 2 }],
      },
    });

    renderWithProviders(<CreditoAnalise />);

    expect(screen.getByText("Análise de Créditos")).toBeInTheDocument();
    expect(screen.getByTestId("table-size")).toHaveTextContent("2");
  });

  it("CreditoAprovar (matriz) usa hook de aprovacao e exibe tabela", () => {
    vi.mocked(useQueryCreditosAprovar).mockReturnValue({
      data: {
        solicitacoesEmAnalise: [{ idSolicitacaoCredito: 99 }],
      },
    });

    renderWithProviders(<CreditoAprovar />);

    expect(screen.getByText("Créditos a Aprovar")).toBeInTheDocument();
    expect(screen.getByTestId("table-size")).toHaveTextContent("1");
  });
});
