# Sidebar – Modelo de Permissões

> Arquitetura vigente a partir da refatoração que introduziu `menuConfig` e o hook `usePermissions`.

## Fluxo geral

1. O backend retorna `permissoesDoUsuario` junto com os demais dados do usuário logado (`/usuarios/user-info`).
2. O hook [`usePermissions`](../src/hooks/usePermissions.js) monta um `Set` com:
   - Permissões explícitas recebidas da API (aceita string JSON ou array).
   - Presets automáticos baseados em `tipo` (`Matriz`, `Associado`, `Agência Master`, etc.).
3. O componente [`Sidebar`](../src/components/Sidebar.jsx) consome o hook para decidir quais menus renderizar.
4. O modal de navegação rápida [`ModalContent`](../src/Modals/ModalContent.jsx) filtra as opções internas do menu usando o mesmo hook.

### Hook `usePermissions`

- Normaliza o tipo de usuário removendo acentos e forçando minúsculas.
- Presets embutidos:
  - `matriz` → `["*"]` (acesso integral).
  - `associado` → permissões equivalentes ao comportamento antigo (transações próprias, créditos, vouchers, etc.).
  - `agência master` / `master` → conjunto descrito no quadro “Agência Master”.
- `hasPermission(code)` retorna `true` quando:
  - O usuário é Matriz (por tipo ou `matrizId === null`);
  - O set contém `"*"` ou `"ADMIN"`; ou
  - O código informado existe no set.
- `hasAnyPermission(list)` aceita array e retorna `true` se qualquer item estiver autorizado.

## Configuração centralizada

`src/config/menuConfig.js` descreve cada menu da sidebar.

```js
{
  id: MENU_IDS.ASSOCIADOS,
  label: "ASSOCIADOS",
  icon: FaUsers,
  stateKey: "associados",      // usado para highlight
  action: { type: "modal", value: MENU_IDS.ASSOCIADOS },
  permissions: {
    menu: ["associados.ver", "READ"], // códigos aceitos para exibir o menu
  },
  children: [
    {
      id: "associados.listar",
      label: "Lista de Associados",
      route: "/associadosLista",
      icon: BsFillPersonVcardFill,
      permissions: ["associados.listar", "MANAGE_ACCOUNTS"],
    },
    // ...
  ],
}
```

- `action.type === "route"` → navegação direta.
- `action.type === "modal"` → abre `ModalContent`, que lista `children`.
- `allowForMatriz: true` força visibilidade adicional para Matriz (caso usada).
- As permissões legadas (`READ`, `MANAGE_ACCOUNTS`, `MANAGE_FRANCHISES`, `ADMIN`) ainda aparecem nos arrays para manter compatibilidade enquanto o backend migra para os novos códigos `recurso.acao`.

## Permissões por menu

| Menu (`id`)    | Permissões para exibir | Ações internas (permite…) |
|----------------|------------------------|---------------------------|
| `INICIO`       | —                      | — |
| `ASSOCIADOS`   | `associados.ver`, `READ` | `associados.ver`, `associados.listar`, `associados.criar` |
| `AGENCIAS`     | `agencias.ver`, `MANAGE_FRANCHISES`, `MANAGE_ACCOUNTS`, `ADMIN` | `agencias.ver`, `agencias.criar` |
| `TRANSACOES`   | `transacoes.ver`, `READ` | `transacoes.listar`, `transacoes.minhas`, `transacoes.criar`, `transacoes.estornar` |
| `OFERTAS`      | `ofertas.ver`, `READ`   | `ofertas.ver`, `ofertas.minhas`, `ofertas.excluir`, `ofertas.criar` |
| `VOUCHER`      | `vouchers.ver`, `READ`  | `vouchers.gerenciar`, `vouchers.meus`, `vouchers.solicitar`, `vouchers.cancelar` |
| `CREDITOS`     | `creditos.ver`, `READ`  | `creditos.meus`, `creditos.solicitar`, `creditos.listar`, `creditos.analisar`, `creditos.aprovar` |
| `EXTRATOS`     | `extratos.ver`, `READ`  | `extratos.ver`, `extratos.meu`, `extratos.estorno` |
| `CONTAS`       | `contas.ver`, `financeiro.ver`, `MANAGE_ACCOUNTS`, `ADMIN` | `financeiro.contasReceber`, `financeiro.contasPagar` |
| `PLANOS`       | `planos.ver`, `MANAGE_ACCOUNTS`, `ADMIN` (`allowForMatriz`) | `planos.associados`, `planos.agencias`, `planos.gerentes` |
| `CATEGORIAS`   | `categorias.ver`, `MANAGE_ACCOUNTS`, `ADMIN` (`allowForMatriz`) | `categorias.ver`, `categorias.sub` |
| `GERENTES`     | `gerentes.ver`, `MANAGE_ACCOUNTS`, `MANAGE_FRANCHISES`, `ADMIN` | `gerentes.criar`, `gerentes.lista` |
| `USUARIOS`     | `usuarios.ver`, `MANAGE_ACCOUNTS`, `ADMIN` | `usuarios.meusDados`, `usuarios.listar`, `usuarios.editar`, `usuarios.criar` |

> O botão **Sair** continua fora da configuração e sempre aparece.

## Preset “Agência Master”

Permissões incluídas automaticamente pelo hook:

- Associados: `associados.ver`, `associados.listar`, `associados.criar`, `associados.bloquear`
- Agências: `agencias.ver`, `agencias.criar`, `agencias.bloquear`
- Transações: `transacoes.ver`, `transacoes.listar`, `transacoes.minhas`, `transacoes.criar`, `transacoes.estornar`
- Ofertas: `ofertas.ver`, `ofertas.minhas`, `ofertas.criar`, `ofertas.excluir`
- Créditos: `creditos.ver`, `creditos.listar`, `creditos.meus`, `creditos.solicitar`, `creditos.analisar`, `creditos.aprovar`
- Vouchers: `vouchers.ver`, `vouchers.gerenciar`, `vouchers.meus`, `vouchers.solicitar`, `vouchers.cancelar`
- Extratos: `extratos.ver`, `extratos.meu`, `extratos.estorno`
- Financeiro / Contas: `financeiro.ver`, `financeiro.contasPagar`, `financeiro.contasReceber`
- Usuário: `usuarios.ver`, `usuarios.meusDados`, `usuarios.listar`, `usuarios.editar`, `usuarios.criar`

Essa lista foi baseada no documento “Painel Agência Master” fornecido. Para customizações diferenciadas por usuário, basta alterar o array recebido do backend.

## Como ajustar / testar

1. **Adicionar nova permissão**: inclua o código nas seeds/atualizações do backend e adicione-o nos arrays correspondentes de `menuConfig`.
2. **Criar novo menu**: adicione objeto em `menuConfig`, apontando `action`, `permissions.menu` e `children` (opcional). O componente Sidebar passa a exibir automaticamente.
3. **Restringir opções internas**: ajuste `permissions` de cada `child`. Sem permissão, o item desaparece do modal.
4. **Testar perfis**:
   - Matriz: deve visualizar tudo independentemente do payload.
   - Agência Master: garantir que o backend envie `tipo = "Agência Master"` (ou `"Master"`) e opcionalmente um array vazio de permissões (o preset já cobre).
   - Usuários customizados: envie o array de permissões desejadas em `permissoesDoUsuario` e confira se o menu/ação aparece ou não.

## Próximos passos

- Consolidar os códigos `recurso.acao` no backend (ex.: enum compartilhado) para evitar divergências.
- Expor um endpoint de “catálogo de permissões” caso seja útil para o painel administrativo.
- Atualizar cada página/botão crítico para validar permissões específicas além do modal (ex.: impedir POST se faltar `transacoes.criar`).
