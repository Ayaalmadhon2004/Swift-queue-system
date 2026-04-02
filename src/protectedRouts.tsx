import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute=()=>{
    const {user,loading} = useContext(AuthContext);
    if (loading) return <div className="flex justify-center p-10">Loading...</div>;
    return user ? <Outlet/> : <Navigate to="/login"/> // what is these and why we use them ?
}