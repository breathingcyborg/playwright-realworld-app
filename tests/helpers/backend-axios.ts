import axios from "axios";
import { BACKEND_URL } from "../constants";
import axiosRetry from 'axios-retry';

export const backendAxios = axios.create({
    baseURL: BACKEND_URL,
});

axiosRetry(
    backendAxios,    
    { 
        retries: 3, 
        retryDelay: axiosRetry.exponentialDelay 
    }
)
