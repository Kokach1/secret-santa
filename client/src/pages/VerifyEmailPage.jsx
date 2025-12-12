import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('token');
            const email = searchParams.get('email');

            if (!token || !email) {
                setStatus('error');
                setMessage('Invalid link parameters');
                return;
            }

            try {
                const res = await fetch(`http://localhost:5000/auth/verify-email?token=${token}&email=${email}`);
                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    // Delay to show success, then redirect
                    setTimeout(() => {
                        if (!data.user.detailsCompleted) {
                            navigate('/complete-profile');
                        } else {
                            navigate('/student/dashboard');
                        }
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Connection failed');
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-christmas-white p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader className="w-12 h-12 text-christmas-gold animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-gray-800">Verifying Email...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-bounce-in">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-green-800 mb-2">Verified!</h2>
                        <p className="text-gray-600">Redirecting to complete setup...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h2 className="text-xl font-bold text-red-800 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <a href="/login" className="px-6 py-2 bg-gray-800 text-white rounded-lg">Back to Login</a>
                    </div>
                )}
            </div>
        </div>
    );
}
