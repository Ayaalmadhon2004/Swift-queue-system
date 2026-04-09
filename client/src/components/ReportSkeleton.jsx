import React from 'react';

const ReportSkeleton = () => {
    return (
        <div className="p-8 bg-slate-900 min-h-screen text-white" dir="rtl">
            <div className="h-10 w-64 bg-slate-800 rounded-lg animate-pulse mb-10"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 h-[400px] flex flex-col">
                    <div className="h-6 w-48 bg-slate-700 rounded mb-6 animate-pulse"></div>
                    <div className="flex-1 w-full bg-slate-700/50 rounded-2xl animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 flex flex-col justify-between p-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="border-b border-slate-600 w-full h-px"></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 h-[400px] flex flex-col items-center">
                    <div className="h-6 w-48 bg-slate-700 rounded mb-10 self-start animate-pulse"></div>
                    <div className="w-56 h-56 bg-slate-700/50 rounded-full animate-pulse border-8 border-slate-700 flex items-center justify-center">
                        <div className="w-24 h-24 bg-slate-800 rounded-full"></div>
                    </div>
                    <div className="mt-8 flex gap-4">
                        <div className="h-4 w-12 bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-4 w-12 bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-4 w-12 bg-slate-700 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportSkeleton;