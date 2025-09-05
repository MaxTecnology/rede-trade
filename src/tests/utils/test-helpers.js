import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock do AuthContext
export const mockAuthContext = {
  user: {
    id: 1,
    nome: 'Usuario Teste',
    email: 'teste@exemplo.com',
    tipo: 'Associado'
  },
  token: 'fake-jwt-token',
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true
}

// Wrapper personalizado para testes
export const TestWrapper = ({ children, queryClient }) => {
  const client = queryClient || new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Helper para renderizar com providers
export const renderWithProviders = (ui, options = {}) => {
  const { queryClient, ...renderOptions } = options
  
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper queryClient={queryClient}>
        {children}
      </TestWrapper>
    ),
    ...renderOptions,
  })
}

// Dados de teste para formulários
export const mockFormData = {
  usuario: {
    valid: {
      nome: 'João Silva',
      email: 'joao@teste.com',
      cpf: '12345678901',
      senha: 'senha123',
      tipo: 'Associado'
    },
    invalid: {
      emptyFields: {
        nome: '',
        email: '',
        cpf: '',
        senha: ''
      },
      invalidEmail: {
        nome: 'João Silva',
        email: 'email-invalido',
        cpf: '12345678901',
        senha: 'senha123'
      },
      shortPassword: {
        nome: 'João Silva',
        email: 'joao@teste.com',
        cpf: '12345678901',
        senha: '12'
      }
    }
  },
  oferta: {
    valid: {
      titulo: 'Produto Teste',
      descricao: 'Descrição do produto',
      tipo: 'Produto',
      quantidade: 10,
      valor: 100.50,
      limiteCompra: 5,
      vencimento: '2024-12-31T10:00',
      retirada: 'Local',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    invalid: {
      emptyRequired: {
        titulo: '',
        tipo: '',
        quantidade: '',
        valor: '',
        limiteCompra: '',
        vencimento: '',
        retirada: ''
      },
      negativeValues: {
        titulo: 'Produto Teste',
        tipo: 'Produto',
        quantidade: -1,
        valor: -50,
        limiteCompra: -2,
        vencimento: '2024-12-31T10:00',
        retirada: 'Local'
      },
      pastDate: {
        titulo: 'Produto Teste',
        tipo: 'Produto',
        quantidade: 10,
        valor: 100,
        limiteCompra: 5,
        vencimento: '2020-01-01T10:00', // Data no passado
        retirada: 'Local'
      }
    }
  },
  transacao: {
    valid: {
      compradorId: 1,
      vendedorId: 2,
      valorRt: 100.0,
      numeroParcelas: 3,
      descricao: 'Transação teste'
    },
    invalid: {
      sameUser: {
        compradorId: 1,
        vendedorId: 1, // Mesmo usuário
        valorRt: 100.0,
        numeroParcelas: 3
      },
      invalidAmount: {
        compradorId: 1,
        vendedorId: 2,
        valorRt: -50, // Valor negativo
        numeroParcelas: 3
      },
      invalidParcels: {
        compradorId: 1,
        vendedorId: 2,
        valorRt: 100,
        numeroParcelas: 0 // Parcelas inválidas
      }
    }
  },
  subconta: {
    valid: {
      nome: 'Subconta Teste',
      email: 'subconta@teste.com',
      cpf: '98765432109',
      senha: 'senha123',
      permissoes: JSON.stringify(['Atendimento.Visualizar'])
    },
    invalid: {
      duplicateEmail: {
        nome: 'Subconta Teste',
        email: 'email-ja-existe@teste.com',
        cpf: '98765432109',
        senha: 'senha123'
      },
      invalidPermissions: {
        nome: 'Subconta Teste',
        email: 'subconta@teste.com',
        cpf: '98765432109',
        senha: 'senha123',
        permissoes: 'invalid-json'
      }
    }
  }
}

// Helper para simular interação com formulário
export const fillFormField = async (getByLabelText, fieldLabel, value) => {
  const field = getByLabelText(fieldLabel)
  fireEvent.change(field, { target: { value } })
  return field
}

// Helper para simular submit de formulário
export const submitForm = async (getByRole) => {
  const submitButton = getByRole('button', { name: /cadastrar|enviar|salvar/i })
  fireEvent.click(submitButton)
  return submitButton
}

// Mock para axios responses
export const mockApiResponses = {
  success: {
    status: 201,
    data: { message: 'Operação realizada com sucesso' }
  },
  validationError: {
    status: 400,
    response: {
      data: { error: 'Dados inválidos' }
    }
  },
  serverError: {
    status: 500,
    response: {
      data: { error: 'Erro interno do servidor' }
    }
  },
  unauthorized: {
    status: 401,
    response: {
      data: { error: 'Não autorizado' }
    }
  }
}

// Helper para mock de upload de arquivo
export const mockFileUpload = (filename = 'test.jpg', type = 'image/jpeg') => {
  return new File(['fake file content'], filename, { type })
}

// Helper para aguardar loading states
export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/carregando|loading/i)).not.toBeInTheDocument()
  })
}

// Helper para verificar validações de formulário
export const expectFormValidation = {
  toShowRequiredFieldError: (fieldName) => {
    expect(screen.getByText(new RegExp(`${fieldName}.*obrigatório`, 'i'))).toBeInTheDocument()
  },
  toShowInvalidEmailError: () => {
    expect(screen.getByText(/email.*inválido/i)).toBeInTheDocument()
  },
  toShowPasswordTooShortError: () => {
    expect(screen.getByText(/senha.*muito curta/i)).toBeInTheDocument()
  },
  toShowNegativeValueError: () => {
    expect(screen.getByText(/valor.*não pode ser negativo/i)).toBeInTheDocument()
  }
}

// Tipos de erro comuns identificados
export const commonFormErrors = {
  REQUIRED_FIELD_MISSING: 'Campo obrigatório não preenchido',
  INVALID_EMAIL_FORMAT: 'Formato de email inválido',
  PASSWORD_TOO_SHORT: 'Senha muito curta',
  NEGATIVE_VALUE: 'Valor não pode ser negativo',
  DUPLICATE_ENTRY: 'Entrada duplicada',
  INVALID_DATE: 'Data inválida',
  FILE_TYPE_NOT_ALLOWED: 'Tipo de arquivo não permitido',
  FILE_TOO_LARGE: 'Arquivo muito grande',
  NETWORK_ERROR: 'Erro de rede',
  SERVER_ERROR: 'Erro interno do servidor',
  UNAUTHORIZED: 'Não autorizado',
  VALIDATION_FAILED: 'Validação falhou'
}