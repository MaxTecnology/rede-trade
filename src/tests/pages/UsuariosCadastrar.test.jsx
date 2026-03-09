import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-helpers.jsx";
import UsuariosCadastrar from "../../pages/usuarios/UsuariosCadastrar";
import * as api from "../../utils/functions/api";

vi.mock("../../utils/functions/api", () => ({
  createSubAccount: vi.fn(),
}));

vi.mock("../../utils/functions/setActivePage", () => ({
  activePage: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    promise: vi.fn((promise) => promise),
  },
}));

describe("UsuariosCadastrar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillValidForm = () => {
    const fileInput = screen.getByLabelText(/selecione uma imagem/i);
    const imageFile = new File(["image"], "avatar.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [imageFile] } });

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: "Subconta Teste" },
    });
    fireEvent.change(screen.getByLabelText(/cpf/i), {
      target: { value: "12345678901" },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "subconta@teste.com" },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: "senha123" },
    });

    return imageFile;
  };

  it("renderiza campos obrigatorios e botao de cadastro", () => {
    renderWithProviders(<UsuariosCadastrar />);

    expect(screen.getByText("Nova Sub-Conta")).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cadastrar/i })).toBeInTheDocument();
  });

  it("aplica mascara de CPF ao digitar", () => {
    renderWithProviders(<UsuariosCadastrar />);

    const cpfInput = screen.getByLabelText(/cpf/i);
    fireEvent.change(cpfInput, { target: { value: "12345678901" } });

    expect(cpfInput).toHaveValue("123.456.789-01");
  });

  it("bloqueia envio invalido e mostra mensagem de validacao", async () => {
    const createSubAccount = vi.mocked(api.createSubAccount);
    createSubAccount.mockResolvedValue({ idSubContas: 1 });

    renderWithProviders(<UsuariosCadastrar />);
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/selecione uma imagem\./i)).toBeInTheDocument();
    });
    expect(createSubAccount).not.toHaveBeenCalled();
  });

  it("envia dados validos para createSubAccount", async () => {
    const createSubAccount = vi.mocked(api.createSubAccount);
    createSubAccount.mockResolvedValue({ idSubContas: 1 });

    renderWithProviders(<UsuariosCadastrar />);
    const imageFile = fillValidForm();

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(createSubAccount).toHaveBeenCalledTimes(1);
    });

    const payload = createSubAccount.mock.calls[0][0];
    expect(payload).toMatchObject({
      nome: "Subconta Teste",
      cpf: "123.456.789-01",
      email: "subconta@teste.com",
      senha: "senha123",
    });
    expect(payload.imagem).toBe(imageFile);
  });

  it("nao envia quando email esta invalido", async () => {
    const createSubAccount = vi.mocked(api.createSubAccount);
    createSubAccount.mockResolvedValue({ idSubContas: 1 });

    renderWithProviders(<UsuariosCadastrar />);
    fillValidForm();
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "email-invalido" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(createSubAccount).not.toHaveBeenCalled();
    });
  });
});
