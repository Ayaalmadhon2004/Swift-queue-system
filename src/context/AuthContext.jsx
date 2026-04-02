import { createContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // دالة للتحقق من التوكن عند تشغيل التطبيق لأول مرة
    useEffect(() => {
        const checkUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const { data } = await api.get('/auth/me'); // المسار الذي برمجناه في الباك أند
                    setUser(data.data);
                }
            } catch (error) {
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setUser(data.user);
    };

    const logout = () => {
        // why i am using localStorage here instead of prisma , we use prisma 
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};