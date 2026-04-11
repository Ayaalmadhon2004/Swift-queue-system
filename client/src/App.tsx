import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PublicDisplay from './pages/PublicDisplay'; 
import QueueDisplay from './pages/QueueDisplay';
import TicketGenerator from './pages/TicketGenerator';
import Reports from './pages/Reports';
import MyOrders from './pages/MyOrders';
import ProtectedRoute from './components/ProtectedRoute';
import EnhancedQueuePage from './components/EnhancedQueuePage';
import SmartTracker from './components/SmartTracker';

// مكون القائمة الجانبية المخصص للأدمن
const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // لا تظهر القائمة إلا إذا كان المستخدم مسجل دخول وفي صفحات الإدارة
  if (!user) return null;

  const navLinks = [
    { path: '/dashboard', label: 'لوحة التحكم', icon: '📊' },
    { path: '/reports', label: 'التقارير الإحصائية', icon: '📈' },
    { path: '/my-orders', label: 'طلباتي', icon: '📦' },
    { path: '/display', label: 'شاشة العرض', icon: '🖥️' },
  ];

  return (
    <nav className="fixed right-0 top-0 h-full w-64 bg-[#0A0A0A] border-l border-gray-800 p-6 flex flex-col z-50">
      <div className="mb-10">
        <h2 className="text-blue-500 font-bold text-xl tracking-wider">GAZA PULSE</h2>
        <p className="text-gray-500 text-xs">نظام إدارة الطوابير</p>
      </div>
      
      <div className="flex flex-col gap-2 flex-1">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === link.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-gray-800 text-gray-400'
            }`}
          >
            <span>{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}
      </div>

      <button 
        onClick={logout}
        className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
      >
        <span>🚪</span> <span className="font-medium">تسجيل الخروج</span>
      </button>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-center" reverseOrder={false} />
        
        <BrowserRouter>
          <div className="flex min-h-screen bg-black">
            {/* القائمة الجانبية ستظهر هنا تلقائياً للأدمن */}
            <AdminSidebar />
            
            {/* محتوى الصفحة سيتعدل عرضه بناءً على وجود القائمة */}
            <main className="flex-1 transition-all">
              <Routes>
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
            </main>
          </div>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;