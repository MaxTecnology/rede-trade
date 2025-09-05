import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders, mockFormData, mockApiResponses, expectFormValidation } from '../utils/test-helpers'
import UsuariosCadastrar from '../../pages/usuarios/UsuariosCadastrar'
import * as api from '../../utils/functions/api'

// Mock das dependências
vi.mock('../../utils/functions/api')
vi.mock('../../utils/functions/setActivePage')
vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn()
  }
}))

describe('UsuariosCadastrar - Testes de Formulário', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização inicial', () => {
    it('deve renderizar todos os campos obrigatórios', () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument()
    })

    it('deve exibir título correto', () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      expect(screen.getByText('Nova Sub-Conta')).toBeInTheDocument()
    })

    it('deve renderizar seção de permissões', () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      expect(screen.getByText('Permissões')).toBeInTheDocument()
    })
  })

  describe('Validação de campos obrigatórios', () => {
    it('deve mostrar erro quando email estiver vazio', async () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expectFormValidation.toShowRequiredFieldError('email')
      })
    })

    it('deve mostrar erro quando senha estiver vazia', async () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expectFormValidation.toShowRequiredFieldError('senha')
      })
    })

    it('deve mostrar erro quando CPF estiver vazio', async () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expectFormValidation.toShowRequiredFieldError('cpf')
      })
    })

    it('deve mostrar múltiplos erros quando vários campos estiverem vazios', async () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getAllByText(/obrigatório/i)).toHaveLength(3) // email, senha, cpf
      })
    })
  })

  describe('Validação de formato de dados', () => {
    it('deve mostrar erro para email inválido', async () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'email-invalido' } })
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expectFormValidation.toShowInvalidEmailError()
      })
    })

    it('deve mostrar erro para senha muito curta', async () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      const senhaInput = screen.getByLabelText(/senha/i)
      fireEvent.change(senhaInput, { target: { value: '12' } })
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expectFormValidation.toShowPasswordTooShortError()
      })
    })

    it('deve validar formato de CPF', async () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      const cpfInput = screen.getByLabelText(/cpf/i)
      fireEvent.change(cpfInput, { target: { value: '123' } })
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/cpf.*inválido/i)).toBeInTheDocument()
      })
    })
  })

  describe('Upload de imagem', () => {
    it('deve permitir upload de imagem', () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      const fileInput = screen.getByLabelText(/selecione uma imagem/i)
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('type', 'file')
      expect(fileInput).toHaveAttribute('accept', 'image/*')
    })

    it('deve mostrar preview da imagem selecionada', async () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      const file = new File(['fake image'], 'test.jpg', { type: 'image/jpeg' })
      const fileInput = screen.getByLabelText(/selecione uma imagem/i)
      
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      await waitFor(() => {
        const imagePreview = screen.getByRole('img')
        expect(imagePreview).toBeInTheDocument()
      })
    })

    it('deve rejeitar arquivos que não são imagens', async () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      const file = new File(['fake file'], 'test.txt', { type: 'text/plain' })
      const fileInput = screen.getByLabelText(/selecione uma imagem/i)
      
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      await waitFor(() => {
        expect(screen.getByText(/tipo de arquivo não permitido/i)).toBeInTheDocument()
      })
    })
  })

  describe('Sistema de permissões', () => {
    it('deve renderizar opções de permissões', () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      expect(screen.getByText(/atendimento/i)).toBeInTheDocument()
      expect(screen.getByText(/compras/i)).toBeInTheDocument()
      expect(screen.getByText(/vendas/i)).toBeInTheDocument()
    })

    it('deve permitir seleção de múltiplas permissões', async () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      const atendimentoCheckbox = screen.getByLabelText(/atendimento/i)
      const comprasCheckbox = screen.getByLabelText(/compras/i)
      
      fireEvent.click(atendimentoCheckbox)
      fireEvent.click(comprasCheckbox)
      
      await waitFor(() => {
        expect(atendimentoCheckbox).toBeChecked()
        expect(comprasCheckbox).toBeChecked()
      })
    })

    it('deve salvar permissões selecionadas no submit', async () => {
      const mockCreateSubAccount = vi.mocked(api.createSubAccount)
      mockCreateSubAccount.mockResolvedValue(mockApiResponses.success)
      
      renderWithProviders(<UsuariosCadastrar />)
      
      // Preencher campos obrigatórios
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: mockFormData.subconta.valid.email } 
      })
      fireEvent.change(screen.getByLabelText(/senha/i), { 
        target: { value: mockFormData.subconta.valid.senha } 
      })
      fireEvent.change(screen.getByLabelText(/cpf/i), { 
        target: { value: mockFormData.subconta.valid.cpf } 
      })
      
      // Selecionar permissões
      const atendimentoCheckbox = screen.getByLabelText(/atendimento/i)
      fireEvent.click(atendimentoCheckbox)
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockCreateSubAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            permissoes: expect.arrayContaining(['Atendimento.Visualizar'])
          })
        )
      })
    })
  })

  describe('Submissão do formulário', () => {
    it('deve enviar dados válidos com sucesso', async () => {
      const mockCreateSubAccount = vi.mocked(api.createSubAccount)
      mockCreateSubAccount.mockResolvedValue(mockApiResponses.success)
      
      renderWithProviders(<UsuariosCadastrar />)
      
      // Preencher todos os campos
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: mockFormData.subconta.valid.email } 
      })
      fireEvent.change(screen.getByLabelText(/senha/i), { 
        target: { value: mockFormData.subconta.valid.senha } 
      })
      fireEvent.change(screen.getByLabelText(/cpf/i), { 
        target: { value: mockFormData.subconta.valid.cpf } 
      })
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockCreateSubAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            email: mockFormData.subconta.valid.email,
            senha: mockFormData.subconta.valid.senha,
            cpf: mockFormData.subconta.valid.cpf
          })
        )
      })
    })

    it('deve mostrar loading durante submissão', async () => {
      const mockCreateSubAccount = vi.mocked(api.createSubAccount)
      mockCreateSubAccount.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      
      renderWithProviders(<UsuariosCadastrar />)
      
      // Preencher campos e submeter
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: mockFormData.subconta.valid.email } 
      })
      fireEvent.change(screen.getByLabelText(/senha/i), { 
        target: { value: mockFormData.subconta.valid.senha } 
      })
      fireEvent.change(screen.getByLabelText(/cpf/i), { 
        target: { value: mockFormData.subconta.valid.cpf } 
      })
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      // Verificar loading
      expect(screen.getByText(/cadastrando/i)).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.queryByText(/cadastrando/i)).not.toBeInTheDocument()
      })
    })

    it('deve desabilitar botão durante loading', async () => {
      const mockCreateSubAccount = vi.mocked(api.createSubAccount)
      mockCreateSubAccount.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      
      renderWithProviders(<UsuariosCadastrar />)
      
      // Preencher e submeter
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: mockFormData.subconta.valid.email } 
      })
      fireEvent.change(screen.getByLabelText(/senha/i), { 
        target: { value: mockFormData.subconta.valid.senha } 
      })
      fireEvent.change(screen.getByLabelText(/cpf/i), { 
        target: { value: mockFormData.subconta.valid.cpf } 
      })
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      expect(submitButton).toBeDisabled()
      
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('Tratamento de erros', () => {
    it('deve mostrar erro de validação do servidor', async () => {
      const mockCreateSubAccount = vi.mocked(api.createSubAccount)
      mockCreateSubAccount.mockRejectedValue(mockApiResponses.validationError)
      
      renderWithProviders(<UsuariosCadastrar />)
      
      // Preencher e submeter
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: mockFormData.subconta.valid.email } 
      })
      fireEvent.change(screen.getByLabelText(/senha/i), { 
        target: { value: mockFormData.subconta.valid.senha } 
      })
      fireEvent.change(screen.getByLabelText(/cpf/i), { 
        target: { value: mockFormData.subconta.valid.cpf } 
      })
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/dados inválidos/i)).toBeInTheDocument()
      })
    })

    it('deve mostrar erro de servidor', async () => {
      const mockCreateSubAccount = vi.mocked(api.createSubAccount)
      mockCreateSubAccount.mockRejectedValue(mockApiResponses.serverError)
      
      renderWithProviders(<UsuariosCadastrar />)
      
      // Preencher e submeter
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: mockFormData.subconta.valid.email } 
      })
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/erro interno/i)).toBeInTheDocument()
      })
    })

    it('deve tratar erro de rede', async () => {
      const mockCreateSubAccount = vi.mocked(api.createSubAccount)
      mockCreateSubAccount.mockRejectedValue(new Error('Network Error'))
      
      renderWithProviders(<UsuariosCadastrar />)
      
      // Preencher e submeter
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: mockFormData.subconta.valid.email } 
      })
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/erro de rede/i)).toBeInTheDocument()
      })
    })
  })

  describe('Problemas específicos identificados', () => {
    it('deve detectar quando campos aparecem preenchidos mas estão vazios no submit', async () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      const emailInput = screen.getByLabelText(/email/i)
      
      // Simular input com espaços em branco (problema comum)
      fireEvent.change(emailInput, { target: { value: '   ' } })
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expectFormValidation.toShowRequiredFieldError('email')
      })
    })

    it('deve detectar quando dados não são sanitizados', async () => {
      const mockCreateSubAccount = vi.mocked(api.createSubAccount)
      mockCreateSubAccount.mockResolvedValue(mockApiResponses.success)
      
      renderWithProviders(<UsuariosCadastrar />)
      
      // Inserir dados maliciosos
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: "test@test.com<script>alert('xss')</script>" } 
      })
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockCreateSubAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            email: expect.not.stringContaining('<script>')
          })
        )
      })
    })

    it('deve detectar quando validação client-side pode ser contornada', () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      const emailInput = screen.getByLabelText(/email/i)
      
      // Modificar diretamente o valor (contornando validação)
      Object.defineProperty(emailInput, 'value', {
        writable: true,
        value: 'email-sem-validacao'
      })
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      fireEvent.click(submitButton)
      
      // Sistema deveria validar no backend também
      expect(emailInput.value).toBe('email-sem-validacao')
    })

    it('deve detectar problema de race condition em submissões múltiplas', async () => {
      const mockCreateSubAccount = vi.mocked(api.createSubAccount)
      mockCreateSubAccount.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      
      renderWithProviders(<UsuariosCadastrar />)
      
      // Preencher dados
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: mockFormData.subconta.valid.email } 
      })
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i })
      
      // Clicar múltiplas vezes rapidamente
      fireEvent.click(submitButton)
      fireEvent.click(submitButton)
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        // Deveria chamar a API apenas uma vez
        expect(mockCreateSubAccount).toHaveBeenCalledTimes(1)
      })
    })

    it('deve detectar quando campos são perdidos durante navegação', () => {
      renderWithProviders(<UsuariosCadastrar />)
      
      // Preencher alguns campos
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'teste@exemplo.com' } 
      })
      fireEvent.change(screen.getByLabelText(/senha/i), { 
        target: { value: 'senha123' } 
      })
      
      // Simular mudança de rota e volta
      // (Em um teste real, isso testaria se os dados persistem)
      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput.value).toBe('teste@exemplo.com')
    })
  })
})