import axios from "axios";
import state from "../store";

const mainUrl = `${state.url}`

// MUDANÇA: Função que gera config dinamicamente
const getConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('tokenRedeTrade')}`
    }
});

export const getUserInfo = async () => {
    return axios.get(`${mainUrl}usuarios/user-info`, getConfig()) // <-- Mudança aqui
        .then((response) => {
            state.user = response.data
            state.logged = true
            return true
        }).catch((error) => {
            // Limpar estado se der erro de autenticação
            if (error.response?.status === 401) {
                localStorage.removeItem('tokenRedeTrade')
                state.logged = false
                state.user = null
            }
            return false
        })
}