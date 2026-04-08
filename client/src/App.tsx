import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PublicDisplay from './pages/PublicDisplay'; 
import QueueDisplay from './pages/QueueDisplay';
import ProtectedRoute from './components/ProtectedRoute';
import TicketGenerator from './pages/TicketGenerator';
import Reports from './pages/Reports';
import MyOrders from './pages/MyOrders';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-center" reverseOrder={false} />
        
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/public-display" element={<PublicDisplay />} />
            <Route path="/display" element={<QueueDisplay />} />
            <Route path="/ticket" element={<TicketGenerator />} />

            {/* المسارات المحمية */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-orders" element={<MyOrders />} /> {/* 👈 إضافة المسار */}
              <Route path="/reports" element={<Reports />} />     {/* 👈 إضافة المسار */}
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;