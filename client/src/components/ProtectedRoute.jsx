import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black gap-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Verifying Identity</p>
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />; 
};

export default ProtectedRoute;