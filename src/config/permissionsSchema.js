export const permissionsSchema = [
  {
    categoria: "inicio",
    label: "Início",
    items: [{ chave: "inicio.ver", label: "Acessar dashboard" }],
  },
  {
    categoria: "associados",
    label: "Associados",
    items: [
      { chave: "associados.ver", label: "Abrir módulo" },
      { chave: "associados.listar", label: "Listar associados" },
      { chave: "associados.criar", label: "Cadastrar" },
    ],
  },
  {
    categoria: "agencias",
    label: "Agências",
    items: [
      { chave: "agencias.ver", label: "Listar unidades" },
      { chave: "agencias.criar", label: "Cadastrar unidade" },
    ],
  },
  {
    categoria: "transacoes",
    label: "Transações",
    items: [
      { chave: "transacoes.listar", label: "Listar transações" },
      { chave: "transacoes.minhas", label: "Minhas transações" },
      { chave: "transacoes.criar", label: "Nova transação" },
      { chave: "transacoes.estornar", label: "Estornar" },
    ],
  },
  {
    categoria: "ofertas",
    label: "Ofertas",
    items: [
      { chave: "ofertas.ver", label: "Ver ofertas" },
      { chave: "ofertas.minhas", label: "Minhas ofertas" },
      { chave: "ofertas.criar", label: "Criar oferta" },
      { chave: "ofertas.excluir", label: "Excluir oferta" },
    ],
  },
  {
    categoria: "vouchers",
    label: "Vouchers",
    items: [
      { chave: "vouchers.gerenciar", label: "Gerenciar" },
      { chave: "vouchers.meus", label: "Meus vouchers" },
      { chave: "vouchers.solicitar", label: "Solicitar" },
      { chave: "vouchers.cancelar", label: "Cancelar" },
    ],
  },
  {
    categoria: "creditos",
    label: "Créditos",
    items: [
      { chave: "creditos.meus", label: "Meus créditos" },
      { chave: "creditos.solicitar", label: "Solicitar crédito" },
      { chave: "creditos.listar", label: "Listar créditos" },
      { chave: "creditos.analisar", label: "Analisar créditos" },
      { chave: "creditos.aprovar", label: "Aprovar créditos" },
    ],
  },
  {
    categoria: "extratos",
    label: "Extratos",
    items: [
      { chave: "extratos.ver", label: "Ver extratos" },
      { chave: "extratos.meu", label: "Meu extrato" },
      { chave: "extratos.estorno", label: "Estornar" },
    ],
  },
  {
    categoria: "financeiro",
    label: "Financeiro",
    items: [
      { chave: "financeiro.contasReceber", label: "Contas a receber" },
      { chave: "financeiro.contasPagar", label: "Contas a pagar" },
    ],
  },
  {
    categoria: "planos",
    label: "Planos",
    items: [
      { chave: "planos.associados", label: "Planos Associados" },
      { chave: "planos.agencias", label: "Planos Agências" },
      { chave: "planos.gerentes", label: "Planos Gerentes" },
    ],
  },
  {
    categoria: "categorias",
    label: "Categorias",
    items: [
      { chave: "categorias.ver", label: "Categorias" },
      { chave: "categorias.sub", label: "Subcategorias" },
    ],
  },
  {
    categoria: "gerentes",
    label: "Gerentes",
    items: [
      { chave: "gerentes.criar", label: "Criar gerente" },
      { chave: "gerentes.lista", label: "Listar gerentes" },
    ],
  },
  {
    categoria: "usuarios",
    label: "Usuários/Subcontas",
    items: [
      { chave: "usuarios.meusDados", label: "Meus dados" },
      { chave: "usuarios.listar", label: "Listar usuários" },
      { chave: "usuarios.editar", label: "Gerenciar subcontas" },
      { chave: "usuarios.criar", label: "Criar subconta" },
      { chave: "usuarios.permissoes", label: "Grupos de permissões" },
    ],
  },
];
