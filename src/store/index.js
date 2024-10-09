import { proxy } from "valtio";


const state = proxy({
    url: "https://tradeapi.maximizebot.com.br/",
    //url: "https://api.redetrade.com.br/",
    logged: false,
    titulo: "Operação Concluida!",
    arquivo: "",
    // message: "Usuário deletado com sucesso!"
});

export default state;
