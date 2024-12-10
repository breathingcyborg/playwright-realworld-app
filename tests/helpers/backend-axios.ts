import axios from "axios";
import { BACKEND_URL } from "../constants";

export const backendAxios = axios.create({
    baseURL: BACKEND_URL,
})