import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const login=()=>{
    const[email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const {login} =useContext(AuthContext);
    
    const handleSubmit=async(e)=>{
        e.preventDefault();
        try{
            await login(email,password);
            alert('welcome');
        } catch (err){
            alert(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-lg rounded-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">SwiftQueue Login</h2>
                <input 
                    type="email" 
                    placeholder="Email" 
                    className="w-full p-2 mb-4 border rounded"
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full p-2 mb-6 border rounded"
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    Sign In
                </button>
            </form>
        </div>
    );
}