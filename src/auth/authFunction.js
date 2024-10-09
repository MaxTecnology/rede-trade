import axios from "axios";
import state from "../store";

const mainUrl = `${state.url}`
const config = {
    headers: {
        Authorization: `Bearer ${localStorage.getItem('tokenRedeTrade')}`
    }
};

export const getUserInfo = async () => {
    return axios.get(`${mainUrl}usuarios/user-info`, config)
        .then((response) => {
            state.user = response.data
            state.logged = true
            return true
        }).catch((error) => {
            return false
        })
}