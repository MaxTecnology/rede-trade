import { proxy } from "valtio";


const state = proxy({
    url: import.meta.env.VITE_API_URL || "http://localhost:3024/",
    //url: "https://api.rt.maximizebot.com.br/",
    //url: "https://api.redetrade.com.br/",
    logged: false,
    titulo: "Operação Concluida!",
    arquivo: "",
    // message: "Usuário deletado com sucesso!"
});

export default state;
