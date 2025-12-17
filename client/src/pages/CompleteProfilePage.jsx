import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SnowAnimation from '../components/SnowAnimation';
import API_URL from '../config';
import { UserCheck, ArrowRight } from 'lucide-react';

export default function CompleteProfilePage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        semester: '',
        mobile: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Ensure user is logged in (from verify step) but incomplete
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) navigate('/login');
        if (user && user.detailsCompleted) navigate('/student/dashboard');
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/auth/complete-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                // Update local user
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/student/dashboard');
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-christmas-white flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-t-8 border-christmas-green">
                <div className="flex justify-center mb-6">
                    <div className="bg-christmas-red p-4 rounded-full shadow-lg">
                        <UserCheck className="w-10 h-10 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-christmas font-bold text-center text-gray-800 mb-2">
                    Complete Your Profile 🎄
                </h1>
                <p className="text-center text-gray-500 mb-6">
                    One last step! Tell us who you are so we can pair you.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input name="name" placeholder="Full Name" required className="auth-input" onChange={handleChange} />
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

                    {error && <div className="text-red-600 text-sm text-center">{error}</div>}

                    <button type="submit" disabled={loading} className="w-full bg-christmas-gold hover:bg-yellow-500 text-yellow-900 font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2">
                        {loading ? 'Saving...' : <>Finish & Join <ArrowRight className="w-5 h-5" /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}
