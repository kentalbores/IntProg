import axios from "axios";

axios.defaults.baseURL = "https://sysarch.glitch.me";
axios.defaults.withCredentials = true;

export default axios;