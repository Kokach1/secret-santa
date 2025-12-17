import { useState } from 'react';
import API_URL from '../config';
import { Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/admin/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Connection failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-christmas-gold">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-gray-100 rounded-full">
                        <Lock className="w-8 h-8 text-gray-700" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Portal</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
                        <input
                            type="text"
                            required
                            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-christmas-gold outline-none"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-christmas-gold outline-none"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {error && <div className="text-red-600 text-sm text-center">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-800 text-white py-2 rounded font-bold hover:bg-gray-900 transition flex justify-center items-center gap-2"
                    >
                        {loading ? 'Verifying...' : <>Login <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <a href="/login" className="text-gray-400 hover:text-gray-600">Back to Student Login</a>
                </div>
            </div>
        </div>
    );
}
