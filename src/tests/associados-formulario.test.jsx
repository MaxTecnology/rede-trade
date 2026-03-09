import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UsuariosCadastrar from "../pages/usuarios/UsuariosCadastrar";
import { createSubAccount } from "../utils/functions/api";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ search: "" }),
}));

vi.mock("valtio", () => ({
  useSnapshot: () => ({}),
}));

vi.mock("../utils/functions/api", () => ({
  createSubAccount: vi.fn(),
}));

vi.mock("../utils/functions/setActivePage", () => ({
  activePage: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    promise: vi.fn((promise) => promise),
  },
}));

describe("Formulario de cadastro de subconta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza campos basicos do formulario", () => {
    render(<UsuariosCadastrar />);

    expect(screen.getByText("Nova Sub-Conta")).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it("mostra preview padrao de imagem", () => {
    render(<UsuariosCadastrar />);

    const imagePreview = screen.getByRole("img");
    expect(imagePreview).toBeInTheDocument();
    expect(imagePreview).toHaveAttribute("id", "imagem-selecionada");
  });

  it("submete com dados validos", async () => {
    const mockedCreateSubAccount = vi.mocked(createSubAccount);
    mockedCreateSubAccount.mockResolvedValue({ idSubContas: 99 });

    render(<UsuariosCadastrar />);

    const imageFile = new File(["img"], "perfil.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText(/selecione uma imagem/i), {
      target: { files: [imageFile] },
    });
    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Joao Teste" },
    });
    fireEvent.change(screen.getByLabelText(/cpf/i), {
      target: { value: "12345678901" },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "joao@teste.com" },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "senha123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(mockedCreateSubAccount).toHaveBeenCalledTimes(1);
    });

    expect(mockedCreateSubAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Joao Teste",
        cpf: "123.456.789-01",
        email: "joao@teste.com",
        senha: "senha123",
        imagem: imageFile,
      })
    );
  });
});
