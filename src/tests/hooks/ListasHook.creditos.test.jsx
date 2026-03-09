import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import axios from "axios";
import {
  requestCredit,
  aproveCreditos,
  negateCreditos,
  forwardCreditos,
  deleteCreditos,
  atualizarCreditos,
} from "../../hooks/ListasHook";
import { formHandler } from "../../utils/functions/formHandler";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("../../utils/functions/formHandler", () => ({
  formHandler: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    promise: vi.fn((promise, handlers = {}) =>
      Promise.resolve(promise).then(() => handlers.success?.())
    ),
  },
}));

describe("ListasHook - creditos contratos front/back", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage.getItem.mockImplementation((key) => {
      if (key === "tokenRedeTrade") return "token-teste";
      return null;
    });
  });

  const buildEvent = (fields = {}) => {
    const form = document.createElement("form");
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    return {
      preventDefault: vi.fn(),
      target: form,
    };
  };

  it("requestCredit envia para endpoint correto com body parseado", async () => {
    const event = buildEvent({ usuarioId: "10", valorSolicitado: "500,00" });
    vi.mocked(formHandler).mockReturnValue({
      usuarioId: 10,
      valorSolicitado: 500,
    });
    vi.mocked(axios.post).mockResolvedValue({ data: {} });

    await requestCredit(event, "creditos/solicitar");

    expect(event.preventDefault).toHaveBeenCalled();
    expect(formHandler).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringMatching(/creditos\/solicitar$/),
      { usuarioId: 10, valorSolicitado: 500 },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-teste",
        }),
      })
    );
  });

  it("aproveCreditos usa endpoint de finalizacao com status APROVADO", async () => {
    vi.mocked(axios.put).mockResolvedValue({ data: {} });
    const modalHandler = vi.fn();
    const onSuccess = vi.fn();

    await aproveCreditos(123, modalHandler, onSuccess);

    expect(axios.put).toHaveBeenCalledWith(
      expect.stringMatching(/creditos\/finalizar-analise\/123$/),
      { status: "APROVADO" },
      expect.any(Object)
    );
    await waitFor(() => {
      expect(modalHandler).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("negateCreditos usa endpoint correto para matriz e agencia", async () => {
    vi.mocked(axios.put).mockResolvedValue({ data: {} });

    await negateCreditos(7, vi.fn(), vi.fn(), "matriz");
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringMatching(/creditos\/finalizar-analise\/7$/),
      { status: "NEGADO" },
      expect.any(Object)
    );

    await negateCreditos(8, vi.fn(), vi.fn(), "agencia");
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringMatching(/creditos\/encaminhar\/8$/),
      { status: "NEGADO" },
      expect.any(Object)
    );
  });

  it("forwardCreditos encaminha com status ENCAMINHADO_PARA_MATRIZ", async () => {
    vi.mocked(axios.put).mockResolvedValue({ data: {} });

    await forwardCreditos(55, vi.fn(), vi.fn());

    expect(axios.put).toHaveBeenCalledWith(
      expect.stringMatching(/creditos\/encaminhar\/55$/),
      { status: "ENCAMINHADO_PARA_MATRIZ" },
      expect.any(Object)
    );
  });

  it("deleteCreditos chama endpoint de exclusao da solicitacao", async () => {
    vi.mocked(axios.delete).mockResolvedValue({ data: {} });

    await deleteCreditos(42, vi.fn(), vi.fn());

    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringMatching(/creditos\/apagar\/42$/),
      expect.any(Object)
    );
  });

  it("atualizarCreditos envia dados parseados para editar", async () => {
    const event = buildEvent({ valorSolicitado: "350,00", descricaoSolicitante: "ajuste" });
    vi.mocked(formHandler).mockReturnValue({
      valorSolicitado: 350,
      descricaoSolicitante: "ajuste",
    });
    vi.mocked(axios.put).mockResolvedValue({ data: {} });

    await atualizarCreditos(event, 91, vi.fn(), vi.fn());

    expect(event.preventDefault).toHaveBeenCalled();
    expect(formHandler).toHaveBeenCalled();
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringMatching(/creditos\/editar\/91$/),
      { valorSolicitado: 350, descricaoSolicitante: "ajuste" },
      expect.any(Object)
    );
  });
});
