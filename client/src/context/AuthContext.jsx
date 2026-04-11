import { createContext, useState, useEffect, useContext } from 'react'; // 1. أضيفي useContext هنا
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await api.get('/auth/me'); 
                setUser(data.data);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setUser(data.user);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout'); 
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

// 2. دالة useAuth يجب أن تكون خارج الـ Provider وبشكل مستقل
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};