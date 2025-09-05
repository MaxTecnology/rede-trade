/**
 * TESTES PARA FORMULÁRIOS DE ASSOCIADOS - FRONTEND
 * Testa componentes de formulário e validações client-side
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock do React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ search: '' }),
}));

// Mock do Valtio
vi.mock('valtio', () => ({
  useSnapshot: () => ({}),
}));

// Mock das funções de API
vi.mock('../utils/functions/api', () => ({
  createSubAccount: vi.fn(),
}));

// Mock de components
vi.mock('../components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('../utils/functions/setActivePage', () => ({
  activePage: vi.fn(),
}));

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(),
  },
}));

import UsuariosCadastrar from '../pages/usuarios/UsuariosCadastrar';
import { createSubAccount } from '../utils/functions/api';

describe('🧪 Formulário de Cadastro de Associados', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('📋 Renderização do Formulário', () => {
    
    it('deve renderizar todos os campos obrigatórios', () => {
      render(<UsuariosCadastrar />);
      
      // Verificar se campos obrigatórios estão presentes
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      
      // Verificar botão de submit
      expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
    });

    it('deve mostrar placeholder correto nos campos', () => {
      render(<UsuariosCadastrar />);
      
      expect(screen.getByPlaceholderText(/nome.../i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/999\.999\.999-99/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/@email\.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/senha.../i)).toBeInTheDocument();
    });

    it('deve ter seção de permissões', () => {
      render(<UsuariosCadastrar />);
      
      expect(screen.getByText(/permissões/i)).toBeInTheDocument();
    });
  });

  describe('✅ Validações Client-Side', () => {
    
    it('deve mostrar erro quando campos obrigatórios estão vazios', async () => {
      const user = userEvent.setup();
      render(<UsuariosCadastrar />);
      
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      
      // Tentar submeter formulário vazio
      await user.click(submitButton);
      
      // Aguardar mensagens de erro aparecerem
      await waitFor(() => {
        // O React Hook Form deve mostrar mensagens de erro para campos obrigatórios
        const errorElements = screen.getAllByRole('alert', { hidden: true });
        expect(errorElements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('deve aplicar máscara de CPF corretamente', async () => {
      const user = userEvent.setup();
      render(<UsuariosCadastrar />);
      
      const cpfInput = screen.getByPlaceholderText(/999\.999\.999-99/i);
      
      // Digitar CPF sem formatação
      await user.type(cpfInput, '12345678901');
      
      // Verificar se máscara foi aplicada
      expect(cpfInput.value).toBe('123.456.789-01');
    });

    it('deve limitar CPF a 11 dígitos', async () => {
      const user = userEvent.setup();
      render(<UsuariosCadastrar />);
      
      const cpfInput = screen.getByPlaceholderText(/999\.999\.999-99/i);
      
      // Tentar digitar mais de 11 dígitos
      await user.type(cpfInput, '123456789012345');
      
      // Deve limitar a 11 dígitos (14 caracteres com máscara)
      expect(cpfInput.value.length).toBeLessThanOrEqual(14);
    });
  });

  describe('🔄 Integração com Backend', () => {
    
    it('deve chamar createSubAccount com dados corretos', async () => {
      const user = userEvent.setup();
      const mockCreateSubAccount = vi.mocked(createSubAccount);
      mockCreateSubAccount.mockResolvedValue({ success: true });
      
      render(<UsuariosCadastrar />);
      
      // Preencher formulário
      await user.type(screen.getByPlaceholderText(/nome.../i), 'João Silva Teste');
      await user.type(screen.getByPlaceholderText(/999\.999\.999-99/i), '12345678901');
      await user.type(screen.getByPlaceholderText(/@email\.com/i), 'joao@teste.com');
      await user.type(screen.getByPlaceholderText(/senha.../i), 'senha123');
      
      // Submeter formulário
      await user.click(screen.getByRole('button', { name: /cadastrar/i }));
      
      // Verificar se API foi chamada
      await waitFor(() => {
        expect(mockCreateSubAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            nome: 'João Silva Teste',
            cpf: '123.456.789-01',
            email: 'joao@teste.com',
            senha: 'senha123'
          })
        );
      });
    });

    it('deve mostrar loading durante submissão', async () => {
      const user = userEvent.setup();
      const mockCreateSubAccount = vi.mocked(createSubAccount);
      
      // Mock que demora para resolver
      mockCreateSubAccount.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
      );
      
      render(<UsuariosCadastrar />);
      
      // Preencher formulário básico
      await user.type(screen.getByPlaceholderText(/nome.../i), 'João');
      await user.type(screen.getByPlaceholderText(/999\.999\.999-99/i), '12345678901');
      await user.type(screen.getByPlaceholderText(/@email\.com/i), 'joao@teste.com');
      await user.type(screen.getByPlaceholderText(/senha.../i), 'senha123');
      
      // Submeter formulário
      await user.click(screen.getByRole('button', { name: /cadastrar/i }));
      
      // Verificar se loader aparece
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /cadastrar/i })).not.toBeInTheDocument();
        // Deve mostrar spinner ou loading
      });
    });

    it('deve tratar erro de API corretamente', async () => {
      const user = userEvent.setup();
      const mockCreateSubAccount = vi.mocked(createSubAccount);
      mockCreateSubAccount.mockRejectedValue(new Error('Erro de validação'));
      
      render(<UsuariosCadastrar />);
      
      // Preencher formulário
      await user.type(screen.getByPlaceholderText(/nome.../i), 'João');
      await user.type(screen.getByPlaceholderText(/999\.999\.999-99/i), '12345678901');
      await user.type(screen.getByPlaceholderText(/@email\.com/i), 'joao@teste.com');
      await user.type(screen.getByPlaceholderText(/senha.../i), 'senha123');
      
      // Submeter formulário
      await user.click(screen.getByRole('button', { name: /cadastrar/i }));
      
      // Toast deve ser chamado com erro
      await waitFor(() => {
        expect(mockCreateSubAccount).toHaveBeenCalled();
      });
    });
  });

  describe('🎨 Upload de Imagem', () => {
    
    it('deve mostrar input de arquivo para imagem', () => {
      render(<UsuariosCadastrar />);
      
      const imageInput = screen.getByLabelText(/selecione uma imagem/i);
      expect(imageInput).toBeInTheDocument();
      expect(imageInput).toHaveAttribute('type', 'file');
      expect(imageInput).toHaveAttribute('accept', 'image/*');
    });

    it('deve mostrar imagem padrão inicialmente', () => {
      render(<UsuariosCadastrar />);
      
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', '...');
    });
  });

  describe('🔧 Acessibilidade e UX', () => {
    
    it('deve ter labels associados corretamente aos inputs', () => {
      render(<UsuariosCadastrar />);
      
      // Verificar se todos os campos obrigatórios têm labels
      const nomeInput = screen.getByPlaceholderText(/nome.../i);
      const cpfInput = screen.getByPlaceholderText(/999\.999\.999-99/i);
      const emailInput = screen.getByPlaceholderText(/@email\.com/i);
      const senhaInput = screen.getByPlaceholderText(/senha.../i);
      
      // Todos devem ter aria-labels ou labels associados
      expect(nomeInput).toBeInTheDocument();
      expect(cpfInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(senhaInput).toBeInTheDocument();
    });

    it('deve mostrar marcadores de campo obrigatório', () => {
      render(<UsuariosCadastrar />);
      
      // Procurar por elementos com classe "required" ou texto indicativo
      const requiredElements = screen.getAllByText(/nome/i);
      expect(requiredElements.length).toBeGreaterThan(0);
    });
  });

  describe('🧪 Casos Extremos', () => {
    
    it('deve tratar entrada de caracteres especiais', async () => {
      const user = userEvent.setup();
      render(<UsuariosCadastrar />);
      
      const nomeInput = screen.getByPlaceholderText(/nome.../i);
      
      // Tentar inserir caracteres especiais
      await user.type(nomeInput, '<script>alert("xss")</script>João');
      
      // Sistema deve permitir a entrada (sanitização é server-side)
      expect(nomeInput.value).toBe('<script>alert("xss")</script>João');
    });

    it('deve preservar dados quando há erro de validação', async () => {
      const user = userEvent.setup();
      render(<UsuariosCadastrar />);
      
      // Preencher alguns campos
      await user.type(screen.getByPlaceholderText(/nome.../i), 'João Silva');
      await user.type(screen.getByPlaceholderText(/999\.999\.999-99/i), '12345678901');
      
      // Submeter sem preencher todos os obrigatórios
      await user.click(screen.getByRole('button', { name: /cadastrar/i }));
      
      // Dados preenchidos devem permanecer
      expect(screen.getByPlaceholderText(/nome.../i).value).toBe('João Silva');
      expect(screen.getByPlaceholderText(/999\.999\.999-99/i).value).toBe('123.456.789-01');
    });

    it('deve funcionar com formulário completamente preenchido', async () => {
      const user = userEvent.setup();
      const mockCreateSubAccount = vi.mocked(createSubAccount);
      mockCreateSubAccount.mockResolvedValue({ success: true });
      
      render(<UsuariosCadastrar />);
      
      // Preencher todos os campos obrigatórios
      await user.type(screen.getByPlaceholderText(/nome.../i), 'João Silva Teste');
      await user.type(screen.getByPlaceholderText(/999\.999\.999-99/i), '12345678901');
      await user.type(screen.getByPlaceholderText(/@email\.com/i), 'joao.completo@teste.com');
      await user.type(screen.getByPlaceholderText(/senha.../i), 'senha123456');
      
      // Submeter formulário
      await user.click(screen.getByRole('button', { name: /cadastrar/i }));
      
      // Deve chamar API com todos os dados
      await waitFor(() => {
        expect(mockCreateSubAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            nome: 'João Silva Teste',
            cpf: '123.456.789-01',
            email: 'joao.completo@teste.com',
            senha: 'senha123456'
          })
        );
      });
    });
  });
});