import { useEffect, useState } from "react";
import { updateUser } from "@/hooks/ListasHook";
import { ColorRing } from 'react-loader-spinner'
import defaultImage from "@/assets/images/default_img.png"
import Footer from "@/components/Footer";
import RealInput from "@/components/Inputs/CampoMoeda";
import { BiSolidImageAdd } from "react-icons/bi";
import { activePage } from "@/utils/functions/setActivePage";
import InputMask from 'react-input-mask';
import SubCategoriesOptions from "@/components/Options/SubCategoriesOptions";
import CategoriesOptions from "@/components/Options/CategoriesOptions";
import { toast } from "sonner";
import { useSnapshot } from "valtio";
import state from "@/store";
import { imageReferenceHandler } from "@/utils/functions/formHandler";
import useRevalidate from "@/hooks/ReactQuery/useRevalidate";
import PlanosFields from "@/components/Form/PlanosFields";
import { getType } from "@/hooks/getId";
import ButtonMotion from "@/components/FramerMotion/ButtonMotion";

const UsuariosDados = () => {
    const userInfo = useSnapshot(state.user)
    const [imagemReference, setImageReference] = useState(null);
    const [imagem, setImagem] = useState(null); // ADICIONADO: estado para o arquivo da imagem
    const [reference, setReference] = useState(true)
    const [loading, setLoading] = useState(false)
    
    // Verificar se é usuário do tipo Associado (só pode editar email e imagem)
    const isAssociado = getType() === 'Associado';
    
    useEffect(() => {
        activePage("usuarios")
    }, []);

    const revalidate = useRevalidate()

    // Forçar revalidação quando componente carrega (para casos de edição externa)
    useEffect(() => {
        // Forçar revalidação dos dados do usuário para garantir dados atualizados
        revalidate("login");
    }, []); // Executar apenas uma vez ao carregar
    
    // Verificação de segurança - se não há dados do usuário, mostrar loading
    if (!userInfo || Object.keys(userInfo).length === 0) {
        return (
            <div className="container">
                <div className="containerHeader">Dados do Usuário</div>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '300px',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <ColorRing
                        visible={true}
                        height="80"
                        width="80"
                        ariaLabel="color-ring-loading"
                        wrapperStyle={{}}
                        wrapperClass="color-ring-wrapper"
                        colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
                    />
                    <p>Carregando dados do usuário...</p>
                </div>
                <Footer />
            </div>
        );
    }

    const isURL = (str) => {
        try {
            new URL(str);
            return true;
        } catch (_) {
            return false;
        }
    };

    // Construir URL da imagem (melhorada para lidar com caminhos relativos)
    let imageUrl = defaultImage;
    
    if (userInfo.imagem) {
        if (isURL(userInfo.imagem)) {
            // Se já é uma URL completa (https://... ou http://...)
            imageUrl = userInfo.imagem;
        } else if (userInfo.imagem.startsWith('/')) {
            // Se é um caminho relativo que começa com / (ex: /uploads/images/file.jpg)
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
            imageUrl = `${baseUrl}${userInfo.imagem}`;
        } else if (userInfo.imagem.includes('uploads/')) {
            // Se contém uploads/ mas não começa com /
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
            imageUrl = `${baseUrl}/${userInfo.imagem}`;
        } else {
            // Qualquer outro caso, tentar construir URL
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
            imageUrl = `${baseUrl}/uploads/images/${userInfo.imagem}`;
        }
    }

    const formHandler = (event) => {
        event.preventDefault()
        setLoading(true)
        
        // Se há imagem selecionada, usar FormData. Senão, usar método original
        if (imagem) {
            // Preparar FormData com a nova imagem
            const formData = new FormData(event.target);
            formData.set('imagem', imagem); // Substituir por arquivo real
            
            // Função para atualizar com FormData (igual ao modal de edição)
            const updateUserWithImage = async () => {
                try {
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3024';
                    const userId = state.user?.idUsuario;
                    
                    if (!userId) {
                        throw new Error("ID do usuário não encontrado");
                    }
                    
                    const url = `${baseUrl}/usuarios/atualizar-usuario-completo/${userId}`;
                    const token = localStorage.getItem('tokenRedeTrade');
                    
                    if (!token) {
                        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
                    }
                    
                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });

                    if (!response.ok) {
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || `Erro HTTP ${response.status}`);
                        } else {
                            const errorText = await response.text();
                            throw new Error(`Erro ${response.status}: ${errorText}`);
                        }
                    }

                    const data = await response.json();
                    
                    // Atualizar estado local
                    if (data) {
                        state.user = { ...state.user, ...data };
                    }
                    
                    return data;
                } catch (error) {
                    console.error('❌ Erro ao atualizar dados:', error);
                    throw error;
                }
            };

            toast.promise(updateUserWithImage(), {
                loading: 'Atualizando dados...',
                success: () => {
                    setLoading(false)
                    setImagem(null) // Limpar arquivo selecionado
                    revalidate("login")
                    return "Dados atualizados com sucesso!"
                },
                error: (error) => {
                    setLoading(false)
                    return `Erro: ${error.message}`
                },
            })
        } else {
            // Método original quando não há imagem
            setTimeout(() => {
                toast.promise(updateUser(event), {
                    loading: 'Atualizando dados...',
                    success: () => {
                        setLoading(false)
                        revalidate("login")
                        return "Dados atualizados com sucesso!"
                    },
                    error: (error) => {
                        setLoading(false)
                        return `Erro: ${error.message}`
                    },
                })
                setReference(true)
            }, 100);
        }
    }
    return (
        <div className="container">
            <div className="containerHeader">Meus Dados</div>
            <form onSubmit={(event) => formHandler(event)}
                className="containerForm">
                <div className="form-group">
                    <label className="required">Razão Social</label>
                    <input type="text" className="readOnly" id="razaoSocial" required defaultValue={userInfo.razaoSocial || ""} readOnly />
                </div>
                <div className="form-group">
                    <label className="required">Nome Fantasia</label>
                    <input type="text" className="readOnly" id="nomeFantasia" required defaultValue={userInfo.nomeFantasia || ""} readOnly />
                </div>
                <div className="form-group">
                    <label className="required">Descrição</label>
                    <textarea className="readOnly" cols="30" rows="1" required defaultValue={userInfo.descricao || ""} readOnly ></textarea>
                </div>
                <div className="form-group">
                    <label className="required">Status</label>
                    <select className="readOnly" required defaultValue={userInfo.status ?? true} disabled >
                        <option value="" disabled>Selecionar</option>
                        <option value={true}>Atendendo</option>
                        <option value={false}>Não Atendendo</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>CNPJ</label>
                    <InputMask 
                        mask="99.999.999/9999-99" 
                        value={userInfo.cnpj || ""} 
                        readOnly
                        type="text" 
                        required 
                        className="readOnly"
                    />
                </div>
                <div className="form-group">
                    <label>Insc. Estadual</label>
                    <input type="text" className="readOnly" defaultValue={userInfo.inscEstadual} readOnly />
                </div>
                <div className="form-group">
                    <label>Insc. Municipal</label>
                    <input type="text" className="readOnly" defaultValue={userInfo.inscMunicipal} readOnly />
                </div>
                <div className="form-group">
                    <label className="required">Restrições</label>
                    <textarea className="readOnly" defaultValue={userInfo.restricoes ? userInfo.restricoes : "Sem restrições"} cols="30" rows="1" required readOnly></textarea>
                </div>
                <div className="form-group">
                    <label>Categoria</label>
                    <select defaultValue={userInfo.categoria} className="readOnly" id="categoria" disabled>
                        <option value="" disabled>Selecionar</option>
                        <CategoriesOptions />
                    </select>
                </div>
                <div className="form-group">
                    <label>Subcategoria</label>
                    <select defaultValue={userInfo.subcategoria ? userInfo.subcategoria : ""} className="readOnly" disabled>
                        <option value="" disabled>Nenhuma</option>
                        <SubCategoriesOptions />
                    </select>
                </div>
                <div className="form-group">
                    <label className="required">Mostrar no site</label>
                    <select className="readOnly" required defaultValue={userInfo.mostrarSite} disabled>
                        <option value="" disabled>Selecionar</option>
                        <option value={true}>Sim</option>
                        <option value={false}>Não</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="required">Tipo</label>
                    <select className="readOnly" id="tipo" required defaultValue={userInfo.tipo} disabled>
                        <option value="" disabled>Indefinido</option>
                        <option value={userInfo.tipo ? userInfo.tipo : "Indefinido"}>{userInfo.tipo ? userInfo.tipo : "Indefinido"}</option>
                    </select>
                </div>
                <div className="formDivider">
                    <p>Contato</p>
                </div>
                {/* CONTATO */}
                <div className="form-group f2">
                    <label className="required">Nome</label>
                    <input type="text" className="readOnly" required defaultValue={userInfo.nomeContato} />
                </div>
                <div className="form-group f2">
                    <label>Telefone</label>
                    <InputMask 
                        mask="(99)9999-9999" 
                        readOnly 
                        value={userInfo.telefone || ""}
                        type="text" 
                        className="readOnly" 
                        id="telefone" 
                        required 
                    />
                </div>
                <div className="form-group f2">
                    <label className="required">Celular</label>
                    <InputMask 
                        mask="(99)99999-9999" 
                        value={userInfo.celular || ""} 
                        readOnly
                        type="text" 
                        className="readOnly" 
                        required 
                    />
                </div>
                <div className="form-group f2">
                    <label className="required">E-mail</label>
                    <input type="email" className="readOnly" disabled defaultValue={userInfo.email} required />
                </div>
                <div className="form-group f2">
                    <label>E-mail secundário</label>
                    <input type="email" className="readOnly" disabled defaultValue={userInfo.emailSecundario} />
                </div>
                <div className="form-group f2">
                    <label>Site</label>
                    <input type="text" className="readOnly" disabled defaultValue={userInfo.site} />
                </div>
                <div className="formDivider">
                    <p>Endereço</p>
                </div>
                {/* ENDEREÇO */}
                <div className="form-group">
                    <label className="required">Logradouro</label>
                    <input type="text" className="readOnly" disabled defaultValue={userInfo.logradouro} required />
                </div>
                <div className="form-group">
                    <label className="required">Número</label>
                    <input type="number" className="readOnly" disabled defaultValue={userInfo.numero} required />
                </div>
                <div className="form-group">
                    <label className="required">CEP</label>
                    <InputMask 
                        mask="99999-999" 
                        value={userInfo.cep || ""} 
                        readOnly
                        type="text" 
                        id="cep" 
                        className="readOnly" 
                    />
                </div>
                <div className="form-group">
                    <label>Complemento</label>
                    <input type="text" className="readOnly" disabled defaultValue={userInfo.complemento} />
                </div>
                <div className="form-group">
                    <label className="required">Bairro</label>
                    <input type="text" className="readOnly" disabled defaultValue={userInfo.bairro} required />
                </div>
                <div className="form-group f2">
                    <label className="required">Cidade</label>
                    <input type="text" className="readOnly" disabled defaultValue={userInfo.cidade} required />
                </div>
                <div className="form-group f1">
                    <label className="required">Estado</label>
                    <input type="text" className="readOnly" disabled defaultValue={userInfo.estado} required />
                </div>
                <div className="form-group">
                    <label>Região</label>
                    <input type="text" className="readOnly" disabled defaultValue={userInfo.regiao} />
                </div>
                {
                    getType() === "Matriz" ? null :
                        <>
                            <div className="formDivider">
                                <p>Agência</p>
                            </div>
                            <PlanosFields type={getType()} defaultValue={userInfo} disabled={isAssociado} />
                            <div className="form-group">
                                <label className="required">Data Vencimento Fatura</label>
                                <select required
                                    className="readOnly" readOnly defaultValue={userInfo.conta?.dataVencimentoFatura || ""} disabled>
                                    <option value="" disabled>Selecionar</option>
                                    <option>10</option>
                                    <option>20</option>
                                    <option>30</option>
                                </select>
                            </div>
                        </>

                }
                <div className="formDivider">
                    <p>Operações</p>
                </div>
                {/* ===============================================================
                //======================= Operações
                =============================================================== */}
                <div className="form-group">
                    <label>Gerente de Conta</label>
                    <select className="readOnly" required disabled>
                        <option>
                            {userInfo.conta?.gerenteConta?.nomeFantasia || 
                             userInfo.conta?.gerenteConta?.nome || 
                             "Sem Gerente"}
                        </option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="required">Taxa Gerente Conta em %</label>
                    <input 
                        type="number" 
                        className="readOnly" 
                        readOnly 
                        required 
                        value={userInfo.conta?.gerenteConta?.taxaComissaoGerente || "0"}
                        onChange={() => {}} // Função vazia para input controlado readOnly
                    />
                </div>
                <div className="form-group">
                    <label className="required">Tipo de Operação</label>
                    <select className="readOnly" defaultValue={userInfo.tipoOperacao} disabled >
                        <option value="" disabled>Selecionar</option>
                        <option value={1}>Compra</option>
                        <option value={2}>Venda</option>
                        <option value={3}>Compra/Venda</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="required">Limite Crédito</label>
                    <RealInput defaultValue={userInfo.conta?.limiteCredito || 0} placeholder="Insira o limite" reference={reference} required readOnly className="readOnly" />
                </div>
                <div className="form-group">
                    <label className="required">Limite de Venda Mensal</label>
                    <RealInput defaultValue={userInfo.conta?.limiteVendaMensal || 0} placeholder="Insira o limite" reference={reference} required readOnly className="readOnly" />
                </div>
                <div className="form-group">
                    <label className="required">Limite de Venda Total</label>
                    <RealInput defaultValue={userInfo.conta?.limiteVendaTotal || 0} placeholder="Insira o limite" reference={reference} required readOnly className="readOnly" />
                </div>
                <div className="form-group">
                    <label>Aceita Orçamento</label>
                    <select className="readOnly" defaultValue={userInfo.aceitaOrcamento ?? false} disabled >
                        <option value="" disabled>Selecionar</option>
                        <option value={true}>Sim</option>
                        <option value={false}>Não</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Aceita Voucher</label>
                    <select className="readOnly" defaultValue={userInfo.aceitaVoucher ?? false} disabled >
                        <option value="" disabled>Selecionar</option>
                        <option value={true}>Sim</option>
                        <option value={false}>Não</option>
                    </select>
                </div>
                <div className="formDivider">
                    <p>Dados do usuário</p>
                </div>
                <div className="formImage">
                    <img src={imagemReference ? imagemReference : imageUrl} className="rounded float-left img-fluid" alt="..." id="imagem-selecionada" />
                </div>
                <div className="form-group">
                    <label htmlFor="img_path" className="inputLabel">
                        <BiSolidImageAdd /> Selecione uma imagem
                        <input type="file" id="img_path" name="imagem" accept="image/*" className="custom-file-input" onChange={(e) => imageReferenceHandler(e, setImageReference, setImagem)} />
                    </label>
                </div>
                <div className="form-group">
                    <label className="required">Nome</label>
                    <input 
                        type="text" 
                        name="nome" 
                        required 
                        defaultValue={userInfo.nome || ""} 
                        readOnly={isAssociado}
                        disabled={isAssociado}
                        className={isAssociado ? "readOnly" : ""}
                    />
                </div>
                <div className="form-group">
                    <label className="required">Cpf</label>
                    <InputMask 
                        mask="999.999.999-99" 
                        defaultValue={userInfo.cpf || ""}
                        type="text" 
                        name="cpf" 
                        required 
                        readOnly={isAssociado}
                        disabled={isAssociado}
                        className={isAssociado ? "readOnly" : ""}
                    />                
                </div>
                <div className="form-group">
                    <label className="required ">E-mail</label>
                    <input type="email" name="email" required defaultValue={userInfo.email || ""} />
                </div>
                <div className="buttonContainer">
                    {loading
                        ? <ColorRing
                            visible={loading}
                            height="33"
                            width="80"
                            ariaLabel="blocks-loading"
                            wrapperStyle={{}}
                            wrapperClass="blocks-wrapper"
                            colors={['#2d6cdf', '#2d6cdf', '#2d6cdf', '#2d6cdf', '#2d6cdf']}
                        />
                        : <ButtonMotion className="purpleBtn" type="submit">Atualizar</ButtonMotion>}
                </div>
            </form>
            <Footer />
        </div>)
};

export default UsuariosDados;
