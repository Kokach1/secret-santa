import { Gift, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChristmasHeader({ user }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="bg-christmas-red text-white p-4 shadow-lg sticky top-0 z-40">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Gift className="text-christmas-gold w-8 h-8" />
                    <h1 className="font-christmas text-2xl font-bold tracking-wider">Secret Santa CEK</h1>
                </div>

                <div className="flex items-center gap-4">
                    <span className="hidden md:inline font-medium">
                        Welcome, {user?.name || 'Guest'} 🎅
                    </span>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-red-800 rounded-full transition"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
