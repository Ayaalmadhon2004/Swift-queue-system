import { createContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                // لا نحتاج للبحث عن توكن يدوياً، الكوكي ستُرسل تلقائياً لـ /me
                const { data } = await api.get('/auth/me'); 
                setUser(data.data);
            } catch (error) {
                // إذا فشل الطلب (401)، يعني لا يوجد كوكي صالحة
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        // السيرفر سيقوم بوضع الكوكي في المتصفح عند نجاح هذا الطلب
        const { data } = await api.post('/auth/login', { email, password });
        setUser(data.user);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout'); // طلب للسيرفر لمسح الكوكي
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};