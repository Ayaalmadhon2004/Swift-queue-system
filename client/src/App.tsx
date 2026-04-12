import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// استيراد المزودات (Providers)
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

// استيراد المكونات والصفحات
import AdminSidebar from "./components/AdminSidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import MyOrders from "./pages/MyOrders";
import TicketGenerator from "./pages/TicketGenerator";
import QueueDisplay from "./pages/QueueDisplay";
import Login from "./pages/Login";

// 1. إنشاء نسخة الـ QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // لمنع إعادة التحميل عند التنقل بين النوافذ
      retry: 1,
    },
  },
});

function App() {
  return (
    // 2. تغليف التطبيق بمزود TanStack Query لإصلاح خطأ (No QueryClient set)
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <div className="flex min-h-screen bg-slate-900">
              {/* عرض القائمة الجانبية فقط للمسؤولين */}
              <AdminSidebar />
              
              <main className="flex-1">
                <Routes>
                  {/* المسارات العامة */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<TicketGenerator />} />
                  <Route path="/display" element={<QueueDisplay />} />
                  
                  {/* المسارات المحمية (للمستخدمين والمسؤولين) */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/reports" element={<Reports />} />
                  </Route>

                  {/* إعادة توجيه أي مسار غير معروف للرئيسية */}
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