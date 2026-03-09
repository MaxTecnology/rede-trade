import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-helpers.jsx";
import Home from "../../pages/dashboard/Home";
import { activePage } from "../../utils/functions/setActivePage";

vi.mock("../../utils/functions/setActivePage", () => ({
  activePage: vi.fn(),
}));

vi.mock("../../components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

vi.mock("../../pages/dashboard/cards/AssociadoCard_Dashboard", () => ({
  default: () => <div data-testid="card-associados" />,
}));

vi.mock("../../pages/dashboard/cards/OfertasCard_Dashboard", () => ({
  default: () => <div data-testid="card-ofertas" />,
}));

vi.mock("../../pages/dashboard/cards/PermutasCard_Dashboard", () => ({
  default: () => <div data-testid="card-permutas" />,
}));

vi.mock("../../pages/dashboard/cards/FundoPermutaCard_Dashboard", () => ({
  default: () => <div data-testid="card-fundo" />,
}));

vi.mock("../../pages/dashboard/ResumoFinanceiro", () => ({
  default: () => <div data-testid="resumo-financeiro" />,
}));

vi.mock("../../pages/dashboard/ResumoAdiministrativo", () => ({
  default: () => <div data-testid="resumo-admin" />,
}));

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza dashboard com cards e aciona activePage", () => {
    renderWithProviders(<Home />);

    expect(screen.getByText("Bem vindo a Rede Trade")).toBeInTheDocument();
    expect(screen.getByTestId("card-associados")).toBeInTheDocument();
    expect(screen.getByTestId("card-ofertas")).toBeInTheDocument();
    expect(screen.getByTestId("card-permutas")).toBeInTheDocument();
    expect(screen.getByTestId("card-fundo")).toBeInTheDocument();
    expect(activePage).toHaveBeenCalledWith("home");
  });
});
