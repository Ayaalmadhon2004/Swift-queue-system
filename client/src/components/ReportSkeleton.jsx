import React from 'react';

const ReportSkeleton = () => {
    return (
        <div className="p-8 bg-[#050505] min-h-screen text-white">
            {/* Header Skeleton */}
            <div className="h-12 w-80 bg-white/5 border border-white/5 rounded-2xl animate-pulse mb-12"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Chart Box Skeleton */}
                <div className="bg-[#0A0A0A] p-8 rounded-[3rem] border border-white/5 h-[450px] flex flex-col">
                    <div className="h-4 w-40 bg-white/5 rounded-full mb-10 animate-pulse"></div>
                    <div className="flex-1 w-full bg-white/5 rounded-3xl animate-pulse relative overflow-hidden">
                        {/* Fake Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between p-8 opacity-20">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="border-b border-white/10 w-full h-px"></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Distribution Box Skeleton */}
                <div className="bg-[#0A0A0A] p-8 rounded-[3rem] border border-white/5 h-[450px] flex flex-col items-center">
                    <div className="h-4 w-40 bg-white/5 rounded-full mb-12 self-start animate-pulse"></div>
                    {/* Circle Loader */}
                    <div className="w-64 h-64 bg-white/5 rounded-full animate-pulse border-[16px] border-white/5 flex items-center justify-center relative">
                        <div className="w-32 h-32 bg-[#050505] rounded-full"></div>
                    </div>
                    {/* Legend Skeleton */}
                    <div className="mt-12 flex gap-6">
                        <div className="h-3 w-16 bg-white/10 rounded-full animate-pulse"></div>
                        <div className="h-3 w-16 bg-white/10 rounded-full animate-pulse"></div>
                        <div className="h-3 w-16 bg-white/10 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportSkeleton;