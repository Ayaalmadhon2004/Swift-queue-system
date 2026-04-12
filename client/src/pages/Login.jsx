import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Authenticating...");
        try {
            await login(email, password);
            toast.success("Access Granted", { id: loadingToast });
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || "Invalid Credentials", { id: loadingToast });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6">
            <div className="max-w-md w-full p-12 bg-[#0A0A0A] rounded-[3rem] border border-white/5 shadow-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black tracking-tighter text-white mb-2 italic">
                        SwiftQueue<span className="text-blue-600">.</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Admin Authorization Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                        <input 
                            type="email" 
                            required
                            placeholder="name@company.com"
                            className="w-full px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white focus:outline-none focus:border-blue-600/50 transition-all placeholder:text-slate-700"
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Secret Password</label>
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            className="w-full px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white focus:outline-none focus:border-blue-600/50 transition-all placeholder:text-slate-700"
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </div>
                    
                    <div className="pt-4">
                        <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 active:scale-95">
                            Authorize Access
                        </button>
                    </div>
                </form>
                
                <p className="mt-10 text-center text-slate-600 text-[10px] font-bold uppercase tracking-tighter">
                    Protected by Gaza Pulse Security Protocol
                </p>
            </div>
        </div>
    );
};

export default Login;