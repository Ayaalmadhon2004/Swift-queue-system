import { createContext, useState } from "react";
import api from "../api/axiosConfig";

export const AuthContext = createContext();
export const AuthProvider = ({children})=>{
    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(true);

    const login=async(email,password)=>{
        const {data} = await api.post('/auth/login',{email,password});
        localStorage.setItem('token',data.token);
        setUser(data.user);
    };

    const logout=()=>{
        // why i am using localStorage here instead of prisma , we use prisma 
        localStorage.removeItem('token');
        setUser(null);
    };

    return(
        <AuthContext.Provider value={{user,login,logout,loading}}>
            {children}
        </AuthContext.Provider>
    )
}