import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// how login front and back different of route ? and how to connect them with each other ?
function App(){
    return (
        <AuthProvider>
            <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                </Route>
            </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}