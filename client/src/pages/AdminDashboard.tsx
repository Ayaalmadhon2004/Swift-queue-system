import { useState } from "react";

const [reportData,setReportData]=useState([]);
const fetchStats=async()=>{
    try{
        const {data}=await api.get('/orders/admin/stats');
        setStats(data);
        const ordersRes=await api.get('/orders/public');
        setReportData(ordersRes.data.map((o:any)=>({
            "رقم الطلب": o.queueNumber,
            "الاسم": o.customerName,
            "الحالة": o.status,
            "وقت الإنشاء": new Date(o.createdAt).toLocaleString('ar-EG'),
            "وقت التحديث": new Date(o.updatedAt).toLocaleString('ar-EG'),
        })));
    } catch(err){console.error(err);}
};

<div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-4">
    <h1 className="text-3xl font-black text-white">لوحة تحكم المدير 📊</h1>
    
    <CSVLink 
        data={reportData} 
        filename={`report-${new Date().toLocaleDateString()}.csv`}
        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
    >
        <span>تحميل تقرير اليوم (CSV)</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
    </CSVLink>
</div>

// what iscsv this here 