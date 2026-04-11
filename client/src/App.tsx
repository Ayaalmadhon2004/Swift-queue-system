import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast'; 

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PublicDisplay from './pages/PublicDisplay'; 
import QueueDisplay from './pages/QueueDisplay';
import TicketGenerator from './pages/TicketGenerator';
import Reports from './pages/Reports';
import MyOrders from './pages/MyOrders';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import EnhancedQueuePage from './components/EnhancedQueuePage';
import SmartTracker from './components/SmartTracker';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        {/* Toaster لإظهار تنبيهات Socket اللحظية بشكل جميل */}
        <Toaster position="top-center" reverseOrder={false} />
        
        <BrowserRouter>
          <Routes>
            {/* 1. المسارات العامة (يمكن لأي شخص دخولها) */}
            <Route path="/" element={<EnhancedQueuePage />} />
            <Route path="/tracker" element={<SmartTracker />} />
            <Route path="/login" element={<Login />} />
            <Route path="/public-display" element={<PublicDisplay />} />
            <Route path="/display" element={<QueueDisplay />} />
            <Route path="/ticket" element={<TicketGenerator />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/reports" element={<Reports />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;