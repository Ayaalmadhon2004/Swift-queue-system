import axios from 'axios';

const api = axios.create({
    baseURL:'http://localhost:3000/api',
});
 // what do we mean by interceptors ? and when we use them ?
api.interceptors.request.use((config)=>{
    const token = localStorage.getItem('token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error)=>{
    return Promise.reject(error);
});

export default api;