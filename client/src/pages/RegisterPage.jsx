import { useState } from 'react';
import { Gift, UserPlus, ArrowRight, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: '',
        semester: '',
        mobile: ''
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
                // Instead of navigating, we show success message in place
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input name="name" placeholder="Full Name" required className="auth-input" onChange={handleChange} />
                    </div>
                    <div>
                        <input name="email" type="email" placeholder="College Email" required className="auth-input" onChange={handleChange} />
                    </div>
                    <div>
                        <input name="password" type="password" placeholder="Password" required className="auth-input" onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <select name="department" required className="auth-input bg-white" onChange={handleChange} defaultValue="">
                            <option value="" disabled>Select Dept</option>
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="CE">CE</option>
                            <option value="ME">ME</option>
                        </select>
                        <select name="semester" required className="auth-input bg-white" onChange={handleChange} defaultValue="">
                            <option value="" disabled>Select Sem</option>
                            <option value="S1">S1</option>
                            <option value="S2">S2</option>
                            <option value="S3">S3</option>
                            <option value="S4">S4</option>
                            <option value="S5">S5</option>
                            <option value="S6">S6</option>
                            <option value="S7">S7</option>
                            <option value="S8">S8</option>
                        </select>
                    </div>
                    <div>
                        <input name="mobile" placeholder="Mobile Number" required className="auth-input" onChange={handleChange} />
                    </div>

                    {error && <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                    <button type="submit" disabled={loading} className="w-full bg-christmas-green hover:bg-green-800 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2">
                        {loading ? 'Creating Account...' : <>Register <ArrowRight className="w-5 h-5" /></>}
                    </button>

                    <div className="text-center text-sm text-gray-600 mt-4">
                        Already have an account? <Link to="/login" className="text-christmas-red font-bold hover:underline">Log In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
