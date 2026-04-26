import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const status = searchParams.get('status');
    const message = searchParams.get('message');

    useEffect(() => {
        if (status === 'success') {
            const role = searchParams.get('role');
            // Small delay for effect and to ensure session cookie is processed
            const timer = setTimeout(() => {
                if (role === 'ADMIN') navigate('/admin');
                else if (role === 'TECHNICIAN') navigate('/technician');
                else navigate('/student');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [status, searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 p-4">
            <div className="max-w-md w-full glass-card p-8 text-center animate-in fade-in zoom-in duration-300">
                {status === 'success' ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Login Successful!</h2>
                        <p className="text-gray-500">Welcome back. We're redirecting you to your dashboard...</p>
                        <div className="flex justify-center pt-4">
                            <Loader2 className="animate-spin text-teal-600" size={24} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Authentication Failed</h2>
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm break-words border border-red-100">
                            {message || "An unknown error occurred during Google authentication."}
                        </div>
                        <p className="text-gray-500 text-sm">
                            Please check your Google Cloud Console settings and ensure your Client ID and Secret are correct.
                        </p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="btn-primary w-full mt-4"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
