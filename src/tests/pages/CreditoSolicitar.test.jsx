import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-helpers.jsx";
import CreditoSolicitar from "../../pages/creditos/CreditoSolicitar";
import { activePage } from "../../utils/functions/setActivePage";
import { formateValue } from "../../hooks/Mascaras";
import { getId, getName } from "../../hooks/getId";
import { requestCredit } from "../../hooks/ListasHook";
import { toast } from "sonner";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../utils/functions/setActivePage", () => ({
  activePage: vi.fn(),
}));

vi.mock("../../hooks/Mascaras", () => ({
  formateValue: vi.fn(),
}));

vi.mock("../../hooks/getId", () => ({
  getId: vi.fn(),
  getName: vi.fn(),
}));

vi.mock("../../hooks/ListasHook", () => ({
  requestCredit: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    promise: vi.fn((promise, handlers) =>
      Promise.resolve(promise).then(() => handlers?.success?.())
    ),
  },
}));

vi.mock("../../components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

vi.mock("../../components/Inputs/CampoMoeda", () => ({
  default: ({ name, placeholder, required }) => (
    <input name={name} placeholder={placeholder} required={required} />
  ),
}));

vi.mock("../../components/FramerMotion/ButtonMotion", () => ({
  default: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

describe("CreditoSolicitar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getId).mockReturnValue(31);
    vi.mocked(getName).mockReturnValue("Associado 01");
    vi.mocked(requestCredit).mockResolvedValue({ ok: true });
  });

  it("inicializa pagina com mascara e activePage", () => {
    renderWithProviders(<CreditoSolicitar />);

    expect(screen.getByText("Solicitar Credito")).toBeInTheDocument();
    expect(formateValue).toHaveBeenCalled();
    expect(activePage).toHaveBeenCalledWith("creditos");
  });

  it("solicita credito usando endpoint correto", async () => {
    const { container } = renderWithProviders(<CreditoSolicitar />);
    fireEvent.change(screen.getByPlaceholderText("Valor R$"), {
      target: { value: "500,00" },
    });
    const form = container.querySelector("form.containerForm");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(requestCredit).toHaveBeenCalledWith(expect.any(Object), "creditos/solicitar");
    }, { timeout: 3000 });
    expect(toast.promise).toHaveBeenCalled();
  });

  it("botao voltar redireciona para /creditos", () => {
    renderWithProviders(<CreditoSolicitar />);

    fireEvent.click(screen.getByRole("button", { name: /voltar/i }));
    expect(navigateMock).toHaveBeenCalledWith("/creditos");
  });
});
