import { proxy } from "valtio";


const state = proxy({
    //url: "http://localhost:3024/",
    url: "https://api.redetrade.com.br/",
    logged: false,
    titulo: "Operação Concluida!",
    arquivo: "",
    // message: "Usuário deletado com sucesso!"
});


export default state;
