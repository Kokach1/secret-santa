import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function VerifyPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Validating your magic link...');
    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        const email = searchParams.get('email');
        const token = searchParams.get('token');

        if (!email || !token) {
            setStatus('error');
            setMessage('Invalid link parameters.');
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch('http://localhost:5000/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, token }),
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage('Login Successful! Redirecting...');

                    // Save to local storage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    // Redirect to dashboard (or admin)
                    setTimeout(() => {
                        if (data.user.role === 'admin') {
                            navigate('/admin/dashboard');
                        } else {
                            navigate('/student/dashboard');
                        }
                    }, 1500);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Network error during verification');
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-christmas-white p-4">
            <div className="text-center max-w-md w-full">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <Loader2 className="w-16 h-16 text-christmas-red animate-spin" />
                        <h2 className="text-2xl font-bold text-gray-800">Verifying...</h2>
                        <p className="text-gray-600">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4 animate-bounce-in">
                        <CheckCircle className="w-16 h-16 text-green-600" />
                        <h2 className="text-2xl font-bold text-green-800">Success!</h2>
                        <p className="text-gray-600">{message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4 bg-red-50 p-8 rounded-2xl border border-red-100">
                        <XCircle className="w-16 h-16 text-red-600" />
                        <h2 className="text-2xl font-bold text-red-800">Oops!</h2>
                        <p className="text-gray-700">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-4 px-6 py-2 bg-christmas-red text-white rounded-full font-bold hover:bg-red-800 transition"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
