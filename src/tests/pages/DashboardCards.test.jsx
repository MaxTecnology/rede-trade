import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AssociadoCard_Dashboard from "../../pages/dashboard/cards/AssociadoCard_Dashboard";
import OfertasCard_Dashboard from "../../pages/dashboard/cards/OfertasCard_Dashboard";
import PermutasCard_Dashboard from "../../pages/dashboard/cards/PermutasCard_Dashboard";
import FundoPermutaCard_Dashboard from "../../pages/dashboard/cards/FundoPermutaCard_Dashboard";
import { useQueryAssociadosResumo } from "../../hooks/ReactQuery/useQueryAssociadosResumo";
import { useQueryOfertasResumo } from "../../hooks/ReactQuery/useQueryOfertasResumo";
import { useQueryFundoPermuta } from "../../hooks/ReactQuery/dashboard/useQueryFundoPermuta";
import { getApiData } from "../../hooks/ListasHook";
import { getId } from "../../hooks/getId";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

vi.mock("../../hooks/ReactQuery/useQueryAssociadosResumo", () => ({
  useQueryAssociadosResumo: vi.fn(),
}));

vi.mock("../../hooks/ReactQuery/useQueryOfertasResumo", () => ({
  useQueryOfertasResumo: vi.fn(),
}));

vi.mock("../../hooks/ReactQuery/dashboard/useQueryFundoPermuta", () => ({
  useQueryFundoPermuta: vi.fn(),
}));

vi.mock("../../hooks/ListasHook", () => ({
  getApiData: vi.fn(),
}));

vi.mock("../../hooks/getId", () => ({
  getId: vi.fn(),
}));

vi.mock("../../utils/functions/formartNumber", () => ({
  formatarNumeroParaReal: (value) => `fmt(${value})`,
}));

describe("Dashboard Cards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza card de associados com totais de unidade e geral", () => {
    vi.mocked(useQueryAssociadosResumo).mockReturnValue({
      data: { totalUnidade: 7, totalGeral: 30 },
    });

    render(<AssociadoCard_Dashboard />);

    expect(screen.getByText("Associados")).toBeInTheDocument();
    expect(screen.getByText("Unidade")).toBeInTheDocument();
    expect(screen.getByText("Geral")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("renderiza card de ofertas com totais de unidade e geral", () => {
    vi.mocked(useQueryOfertasResumo).mockReturnValue({
      data: { totalUnidade: 4, totalGeral: 12 },
    });

    render(<OfertasCard_Dashboard />);

    expect(screen.getByText("Ofertas")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renderiza card de permutas com chamadas de geral e unidade", async () => {
    vi.mocked(getId).mockReturnValue(26);
    vi.mocked(getApiData).mockImplementation((url, setState) => {
      if (url === "dashboard/total-valor-rt") {
        setState?.({ totalValorRT: 4500 });
      }
      if (url === "dashboard/total-valor-rt-por-unidade/26") {
        setState?.({ valorTotalTransacoes: 1200 });
      }
      return Promise.resolve({});
    });

    render(<PermutasCard_Dashboard />);

    await waitFor(() => {
      expect(getApiData).toHaveBeenCalledWith("dashboard/total-valor-rt", expect.any(Function));
      expect(getApiData).toHaveBeenCalledWith(
        "dashboard/total-valor-rt-por-unidade/26",
        expect.any(Function)
      );
    });

    expect(screen.getByText("Permutas Mês")).toBeInTheDocument();
    expect(screen.getByText("RT$ fmt(1200)")).toBeInTheDocument();
    expect(screen.getByText("RT$ fmt(4500)")).toBeInTheDocument();
  });

  it("renderiza card de fundo permuta com geral e unidade", async () => {
    vi.mocked(useQueryFundoPermuta).mockReturnValue({
      data: { valorFundoPermutaUnidade: 800 },
    });
    vi.mocked(getApiData).mockImplementation((url, setState) => {
      if (url === "dashboard/total-fundo-permuta-matriz/1") {
        setState?.({ valorFundoPermutaTotal: 15000 });
      }
      return Promise.resolve({});
    });

    render(<FundoPermutaCard_Dashboard />);

    await waitFor(() => {
      expect(getApiData).toHaveBeenCalledWith(
        "dashboard/total-fundo-permuta-matriz/1",
        expect.any(Function)
      );
    });

    expect(screen.getByText("Fundo Permuta")).toBeInTheDocument();
    expect(screen.getByText("RT$ fmt(800)")).toBeInTheDocument();
    expect(screen.getByText("RT$ fmt(15000)")).toBeInTheDocument();
  });
});
