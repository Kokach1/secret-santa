import { useState } from 'react';
import { Gift, UserPlus, ArrowRight, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:5000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                setError('link sent');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/snow.png')] bg-christmas-red/10 flex items-center justify-center p-4">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-md w-full border-t-8 border-christmas-green">
                <div className="flex justify-center mb-4">
                    <div className="bg-christmas-red p-3 rounded-full shadow-lg">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-christmas font-bold text-center text-christmas-red mb-2">
                    Join Secret Santa
                </h1>
                <p className="text-center text-gray-500 mb-6">
                    Step 1: Create your account
                </p>

                {error === 'link sent' ? (
                    <div className="text-center space-y-4 animate-fade-in">
                        <div className="bg-green-100 p-4 rounded-full inline-block">
                            <Send className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-green-800">Verification Link Sent!</h2>
                        <p className="text-gray-600">
                            We've sent a confirmation link to <span className="font-bold text-gray-800">{formData.email}</span>.
                        </p>
                        <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800">
                            Please check your inbox (and spam folder) to verify your email and complete your profile.
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">College Email</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="you@cek.ac.in"
                                required
                                className="auth-input"
                                onChange={handleChange}
                                value={formData.email}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="auth-input"
                                onChange={handleChange}
                                value={formData.password}
                            />
                        </div>

                        {error && <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                        <button type="submit" disabled={loading} className="w-full bg-christmas-green hover:bg-green-800 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2">
                            {loading ? 'Sending...' : <>Next: Verify Email <ArrowRight className="w-5 h-5" /></>}
                        </button>

                        <div className="text-center text-sm text-gray-600 mt-4">
                            Already have an account? <Link to="/login" className="text-christmas-red font-bold hover:underline">Log In</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
