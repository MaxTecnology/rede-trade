import { proxy } from "valtio";
import { API_URL } from "../config/api.js";

const state = proxy({
    url: API_URL,
    //url: "https://api.rt.maximizebot.com.br/",
    //url: "https://api.redetrade.com.br/",
    logged: false,
    titulo: "Operação Concluida!",
    arquivo: "",
    // message: "Usuário deletado com sucesso!"
});

export default state;
