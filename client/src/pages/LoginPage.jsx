import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Send } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleMagicLink = async () => {
        if (!email) {
            setStatus('error');
            setMessage('Please enter your email first to send a magic link.');
            return;
        }
        setStatus('loading');
        try {
            const res = await fetch('http://localhost:5000/auth/request-magic-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('magic_sent');
                setMessage('Magic Link Sent! Check your inbox.');
            } else {
                setStatus('error');
                setMessage(data.message);
            }
        } catch (err) {
            setStatus('error');
            setMessage('Failed to send magic link');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                if (data.user.role === 'admin') navigate('/admin/dashboard');
                else navigate('/student/dashboard');
            } else {
                setStatus('error');
                setMessage(data.message || 'Login failed');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Failed to connect to server');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[url('https://www.transparenttextures.com/patterns/snow.png')] bg-christmas-red/10 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-t-8 border-christmas-red">
                <div className="flex justify-center mb-6">
                    <div className="bg-christmas-green p-4 rounded-full shadow-lg">
                        <Gift className="w-12 h-12 text-christmas-gold" />
                    </div>
                </div>

                <h1 className="text-4xl font-christmas font-bold text-center text-christmas-red mb-2">
                    Secret Santa CEK
                </h1>
                <p className="text-center text-gray-600 mb-8 font-medium">
                    Exclusive for CEK Students
                </p>

                {status === 'success' ? (
                    <div className="text-center bg-green-50 p-6 rounded-xl border border-green-200 animate-fade-in">
                        <h3 className="text-xl font-bold text-green-800 mb-2">Login Successful!</h3>
                        <p className="text-green-700">Redirecting...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="auth-input"
                                placeholder="you@cek.ac.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="auth-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-christmas-red hover:bg-red-800 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {status === 'loading' ? 'Verifying...' : <>Login <Send className="w-4 h-4" /></>}
                        </button>

                        <div className="text-center text-sm space-y-2">
                            <div>
                                <span className="text-gray-600">Forgot Password? </span>
                                <button
                                    type="button"
                                    onClick={handleMagicLink}
                                    className="text-christmas-green font-bold hover:underline"
                                >
                                    Use Magic Link
                                </button>
                            </div>
                            <div>
                                <span className="text-gray-600">New here? </span>
                                <a href="/register" className="text-christmas-red font-bold hover:underline">Create Account</a>
                            </div>
                        </div>

                        {status === 'error' && (
                            <div className="text-center text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium">
                                {message}
                            </div>
                        )}
                        {status === 'magic_sent' && (
                            <div className="text-center text-green-600 bg-green-50 p-3 rounded-lg text-sm font-medium">
                                Magic Link sent to your email!
                            </div>
                        )}
                    </form>
                )}
            </div>

            <p className="mt-8 text-christmas-green/60 text-sm font-christmas text-xl">
                Ho Ho Ho! Merry Christmas! 🎄
            </p>
        </div>
    );
}
