import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Providers
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

// Components & Pages
import AdminSidebar from "./components/AdminSidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import MyOrders from "./pages/MyOrders";
import TicketGenerator from "./pages/TicketGenerator";
import QueueDisplay from "./pages/QueueDisplay";
import Login from "./pages/Login";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, 
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            {/* إزالة الـ Sidebar من هنا لضمان عدم ظهوره في الصفحة العامة */}
            <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
              <main className="flex-1">
                <Routes>
                  {/* مسارات عامة بدون Sidebar (شاشة نظيفة للعميل) */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<TicketGenerator />} />
                  <Route path="/display" element={<QueueDisplay />} />
                  
                  {/* مسارات الإدارة (يظهر فيها الـ Sidebar) */}
                  <Route element={<ProtectedRoute />}>
                    <Route 
                      path="*" 
                      element={
                        <div className="flex">
                          <AdminSidebar /> {/* يظهر هنا فقط */}
                          <div className="flex-1 overflow-x-hidden">
                            <Routes>
                              <Route path="/dashboard" element={<Dashboard />} />
                              <Route path="/my-orders" element={<MyOrders />} />
                              <Route path="/reports" element={<Reports />} />
                            </Routes>
                          </div>
                        </div>
                      } 
                    />
                  </Route>

                  <Route path="*" element={<Navigate replace to="/" />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;