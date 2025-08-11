import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ColorRing } from 'react-loader-spinner';
import { BiSolidImageAdd } from "react-icons/bi";
import Footer from "@/components/Footer";
import { activePage } from "@/utils/functions/setActivePage";
import { imageReferenceHandler } from "@/utils/functions/formHandler";
import InputMask from 'react-input-mask';
import defaultImage from "@/assets/images/default_img.png";
import ButtonMotion from "@/components/FramerMotion/ButtonMotion";
import useRevalidate from "@/hooks/ReactQuery/useRevalidate";
import { useSnapshot } from "valtio";
import state from "@/store";

const SubcontasCadastrar = () => {
    const navigate = useNavigate();
    const revalidate = useRevalidate();
    const userInfo = useSnapshot(state.user);
    const [loading, setLoading] = useState(false);
    const [imagemReference, setImageReference] = useState(null);
    const [userValidation, setUserValidation] = useState({ isValid: true, message: '' });

    useEffect(() => {
        activePage("usuarios");
        
        // Validar dados do usuário ao carregar o componente
        const validateUser = () => {
            try {
                // Verificar primeiro o estado global (Valtio)
                if (userInfo && userInfo.conta && userInfo.conta.idConta) {
                    setUserValidation({ isValid: true, message: '' });
                    return;
                }

                // Fallback para localStorage se o estado global não estiver disponível
                const userDataString = localStorage.getItem('userRedeTrade');
                if (!userDataString) {
                    setUserValidation({
                        isValid: false,
                        message: 'Dados do usuário não encontrados. Faça login novamente.'
                    });
                    return;
                }

                const userData = JSON.parse(userDataString);
                if (!userData || !userData.conta || !userData.conta.idConta) {
                    setUserValidation({
                        isValid: false,
                        message: 'Conta do usuário não encontrada. Verifique se sua conta está configurada corretamente.'
                    });
                    return;
                }

                setUserValidation({ isValid: true, message: '' });
            } catch (error) {
                console.error('❌ Erro na validação:', error);
                setUserValidation({
                    isValid: false,
                    message: 'Erro ao validar dados do usuário. Faça login novamente.'
                });
            }
        };

        validateUser();
    }, [userInfo]);

    // Função para criar subconta
    const createSubconta = async (formData) => {
        try {
            let userData = null;
            let idConta = null;

            // Tentar usar estado global primeiro
            if (userInfo && userInfo.conta && userInfo.conta.idConta) {
                userData = userInfo;
                idConta = userInfo.conta.idConta;
            } else {
                // Fallback para localStorage
                const userDataString = localStorage.getItem('userRedeTrade');
                if (!userDataString) {
                    throw new Error('Dados do usuário não encontrados. Faça login novamente.');
                }

                try {
                    userData = JSON.parse(userDataString);
                } catch (parseError) {
                    throw new Error('Dados do usuário corrompidos. Faça login novamente.');
                }

                if (!userData || !userData.conta || !userData.conta.idConta) {
                    throw new Error('Conta do usuário não encontrada. Verifique se sua conta está configurada corretamente.');
                }

                idConta = userData.conta.idConta;
            }

            const token = localStorage.getItem('tokenRedeTrade');
            if (!token) {
                throw new Error('Token de autenticação não encontrado. Faça login novamente.');
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
            const url = `${apiUrl}/contas/criar-subconta/${idConta}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || `Erro ${response.status}: ${response.statusText}`;
                } catch (parseError) {
                    // Se não conseguir fazer parse do JSON, usar erro genérico
                    errorMessage = `Erro ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Erro ao criar subconta:', error);
            throw error;
        }
    };

    const formHandler = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(event.target);
            
            // Adicionar imagem se selecionada
            const imagemInput = document.getElementById('img_path');
            if (imagemInput && imagemInput.files[0]) {
                formData.append('imagem', imagemInput.files[0]);
            }

            
            const result = await createSubconta(formData);
            
            toast.success('Subconta criada com sucesso!');
            
            // Revalidar queries e navegar para lista
            revalidate(['sub-contas']);
            navigate('/usuariosEditar');
            
        } catch (error) {
            console.error('❌ Erro:', error);
            toast.error(error.message || 'Erro ao criar subconta');
        } finally {
            setLoading(false);
        }
    };

    // Se o usuário não é válido, mostrar mensagem de erro
    if (!userValidation.isValid) {
        return (
            <div className="container">
                <div className="containerHeader">Nova Subconta</div>
                <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 40px',
                    color: '#dc3545',
                    backgroundColor: '#f8d7da',
                    borderRadius: '8px',
                    border: '1px solid #f5c6cb',
                    margin: '20px auto',
                    maxWidth: '600px'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '24px' }}>⚠️</div>
                    <h3 style={{ marginBottom: '12px', color: '#721c24' }}>Erro de Validação</h3>
                    <p style={{ marginBottom: '24px', fontSize: '16px' }}>{userValidation.message}</p>
                    <ButtonMotion 
                        className="purpleBtn"
                        onClick={() => navigate('/usuariosEditar')}
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            padding: '12px 24px',
                            fontSize: '16px'
                        }}
                    >
                        Voltar
                    </ButtonMotion>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="container">
            <div className="containerHeader">Nova Subconta</div>
            <form onSubmit={formHandler} className="containerForm">
                
                {/* Dados Básicos */}
                <div className="formDivider">
                    <p>Dados Básicos</p>
                </div>

                <div className="form-group">
                    <label className="required">Nome</label>
                    <input 
                        type="text" 
                        name="nome" 
                        required 
                        placeholder="Nome completo da subconta"
                    />
                </div>

                <div className="form-group">
                    <label className="required">Email</label>
                    <input 
                        type="email" 
                        name="email" 
                        required 
                        placeholder="email@exemplo.com"
                    />
                </div>

                <div className="form-group">
                    <label className="required">CPF</label>
                    <InputMask 
                        mask="999.999.999-99" 
                        name="cpf" 
                        type="text" 
                        required 
                        placeholder="000.000.000-00"
                    />
                </div>

                <div className="form-group">
                    <label className="required">Senha</label>
                    <input 
                        type="password" 
                        name="senha" 
                        required 
                        placeholder="Senha para acesso da subconta"
                        minLength="6"
                    />
                </div>

                {/* Contato */}
                <div className="formDivider">
                    <p>Contato</p>
                </div>

                <div className="form-group f2">
                    <label>Telefone</label>
                    <InputMask 
                        mask="(99)9999-9999" 
                        name="telefone" 
                        type="text" 
                        placeholder="(11)1234-5678"
                    />
                </div>

                <div className="form-group f2">
                    <label>Celular</label>
                    <InputMask 
                        mask="(99)99999-9999" 
                        name="celular" 
                        type="text" 
                        placeholder="(11)91234-5678"
                    />
                </div>

                <div className="form-group">
                    <label>Email de Contato</label>
                    <input 
                        type="email" 
                        name="emailContato" 
                        placeholder="contato@exemplo.com"
                    />
                </div>

                {/* Endereço */}
                <div className="formDivider">
                    <p>Endereço</p>
                </div>

                <div className="form-group">
                    <label>Logradouro</label>
                    <input 
                        type="text" 
                        name="logradouro" 
                        placeholder="Rua, Avenida, etc."
                    />
                </div>

                <div className="form-group f2">
                    <label>Número</label>
                    <input 
                        type="number" 
                        name="numero" 
                        placeholder="123"
                    />
                </div>

                <div className="form-group f2">
                    <label>CEP</label>
                    <InputMask 
                        mask="99999-999" 
                        name="cep" 
                        type="text" 
                        placeholder="12345-678"
                    />
                </div>

                <div className="form-group">
                    <label>Complemento</label>
                    <input 
                        type="text" 
                        name="complemento" 
                        placeholder="Apartamento, Bloco, etc."
                    />
                </div>

                <div className="form-group f2">
                    <label>Bairro</label>
                    <input 
                        type="text" 
                        name="bairro" 
                        placeholder="Nome do bairro"
                    />
                </div>

                <div className="form-group f2">
                    <label>Cidade</label>
                    <input 
                        type="text" 
                        name="cidade" 
                        placeholder="Nome da cidade"
                    />
                </div>

                <div className="form-group">
                    <label>Estado</label>
                    <input 
                        type="text" 
                        name="estado" 
                        placeholder="Nome do estado"
                        maxLength="2"
                    />
                </div>

                {/* Imagem */}
                <div className="formDivider">
                    <p>Foto da Subconta</p>
                </div>

                <div className="formImage">
                    <img 
                        src={imagemReference || defaultImage} 
                        className="rounded float-left img-fluid" 
                        alt="Imagem da subconta" 
                        id="imagem-selecionada" 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="img_path" className="inputLabel">
                        <BiSolidImageAdd /> Selecione uma imagem
                        <input 
                            type="file" 
                            id="img_path" 
                            accept="image/*" 
                            className="custom-file-input" 
                            onChange={(e) => imageReferenceHandler(e, setImageReference)} 
                        />
                    </label>
                </div>

                {/* Configurações */}
                <div className="formDivider">
                    <p>Configurações</p>
                </div>

                <div className="form-group">
                    <label>Status da Conta</label>
                    <select name="statusConta" defaultValue="true">
                        <option value="true">Ativa</option>
                        <option value="false">Inativa</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Reputação</label>
                    <input 
                        type="number" 
                        name="reputacao" 
                        defaultValue="0" 
                        min="0" 
                        max="5" 
                        step="0.1"
                        placeholder="0.0"
                    />
                </div>

                {/* Botões */}
                <div className="buttonContainer">
                    {loading ? (
                        <ColorRing
                            visible={loading}
                            height="33"
                            width="80"
                            ariaLabel="blocks-loading"
                            wrapperStyle={{}}
                            wrapperClass="blocks-wrapper"
                            colors={['#2d6cdf', '#2d6cdf', '#2d6cdf', '#2d6cdf', '#2d6cdf']}
                        />
                    ) : (
                        <ButtonMotion className="purpleBtn" type="submit">
                            Criar Subconta
                        </ButtonMotion>
                    )}
                    
                    <ButtonMotion 
                        type="button" 
                        className="secondaryBtn"
                        onClick={() => navigate('/usuariosEditar')}
                    >
                        Cancelar
                    </ButtonMotion>
                </div>
            </form>
            <Footer />
        </div>
    );
};

export default SubcontasCadastrar;