import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-helpers.jsx";
import GerentesCadastrar from "../../pages/gerentes/GerentesCadastrar";
import { createUser } from "../../hooks/ListasHook";
import { getId } from "../../hooks/getId";
import { activePage } from "../../utils/functions/setActivePage";
import { toast } from "sonner";

vi.mock("../../hooks/ListasHook", () => ({
  createUser: vi.fn(),
}));

vi.mock("../../hooks/getId", () => ({
  getId: vi.fn(),
}));

vi.mock("../../utils/functions/setActivePage", () => ({
  activePage: vi.fn(),
}));

vi.mock("../../hooks/ReactQuery/useRevalidate", () => ({
  default: () => vi.fn(),
}));

vi.mock("valtio", async () => {
  const actual = await vi.importActual("valtio");
  return {
    ...actual,
    useSnapshot: () => ({
      user: {
        nomeFantasia: "Agencia Bronze",
      },
    }),
  };
});

vi.mock("react-input-mask", () => ({
  default: (props) => <input {...props} />,
}));

vi.mock("../../components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

vi.mock("../../components/Inputs/InvisibleInputs", () => ({
  default: () => <div data-testid="invisible-inputs" />,
}));

vi.mock("../../components/Form/PlanosFields", () => ({
  default: () => <div data-testid="planos-fields" />,
}));

vi.mock("../../components/Inputs/CampoMoeda", () => ({
  default: ({ name, placeholder, required }) => (
    <input name={name} placeholder={placeholder} required={required} />
  ),
}));

vi.mock("../../components/FramerMotion/ButtonMotion", () => ({
  default: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock("../../utils/functions/formHandler", async () => {
  const actual = await vi.importActual("../../utils/functions/formHandler");
  return {
    ...actual,
    imageReferenceHandler: vi.fn(),
    debugFormData: vi.fn(),
  };
});

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    promise: vi.fn((promise) => promise),
  },
}));

describe("GerentesCadastrar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("nao envia quando ID do usuario logado nao esta disponivel", async () => {
    vi.mocked(getId).mockReturnValue(undefined);

    const { container } = renderWithProviders(<GerentesCadastrar />);
    const form = container.querySelector("form.containerForm");

    expect(activePage).toHaveBeenCalledWith("gerentes");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Erro: ID do usuário não encontrado. Faça login novamente."
      );
    });

    expect(createUser).not.toHaveBeenCalled();
  });

  it("dispara createUser com rota correta quando contexto esta valido", async () => {
    vi.mocked(getId).mockReturnValue(25);
    vi.mocked(createUser).mockResolvedValue({ ok: true });

    const { container } = renderWithProviders(<GerentesCadastrar />);
    const form = container.querySelector("form.containerForm");

    fireEvent.submit(form);

    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith(
        expect.any(Object),
        "usuarios/criar-usuario"
      );
    });

    expect(toast.promise).toHaveBeenCalled();
  });
});
