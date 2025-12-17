import { useState, useEffect } from 'react';
import API_URL from '../config';
import { Gift, Clock, CheckCircle, Bell } from 'lucide-react';
import ChristmasHeader from '../components/ChristmasHeader';
import SnowAnimation from '../components/SnowAnimation';

export default function StudentDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reveal, setReveal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [timeLeft, setTimeLeft] = useState('');

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/student/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setNotifications(await res.json());
        }
    };

    const fetchMe = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/student/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                // Combine user and santa_progress
                setUser(prev => ({ ...data.user, santa_progress: data.santa_progress, settings: data.settings }));
                // Calculate Countdown
                if (data.settings?.event_date) {
                    const diff = new Date(data.settings.event_date) - new Date();
                    if (diff > 0) {
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                        const minutes = Math.floor((diff / 1000 / 60) % 60);
                        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
                    } else {
                        setTimeLeft('The Event has Started! 🎄');
                    }
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchMe();
        fetchNotifications();
        const interval = setInterval(() => {
            fetchMe(true);
            fetchNotifications();
        }, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const updateProgress = async (stage) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/student/update-progress`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ stage, status: !user.progress[stage] })
            });
            const updatedUser = await res.json();
            setUser(prev => ({ ...updatedUser, santa_progress: prev.santa_progress, settings: prev.settings }));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading your presents... 🎁</div>;

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBA';

    return (
        <div className="min-h-screen bg-christmas-white pb-20">
            <SnowAnimation />
            <ChristmasHeader user={user} />

            <main className="max-w-4xl mx-auto p-6 space-y-8">

                {/* Countdown Timer */}
                {user.settings?.event_date && (
                    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-2xl shadow-lg text-center transform hover:scale-[1.02] transition">
                        <h2 className="text-xl font-christmas opacity-90 mb-1">Time until Exchange Event</h2>
                        <div className="text-4xl md:text-5xl font-bold tracking-wider">{timeLeft}</div>
                        <p className="text-sm mt-2 opacity-80">{formatDate(user.settings.event_date)}</p>
                    </div>
                )}

                {/* Notifications */}
                {notifications.length > 0 && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r shadow-sm space-y-3">
                        <h3 className="font-bold text-blue-800 flex items-center gap-2"><Bell className="w-4 h-4" /> Announcements</h3>
                        {notifications.map(n => (
                            <div key={n._id} className="bg-white p-3 rounded border border-blue-100 shadow-sm">
                                <p className="font-bold text-gray-800">{n.title}</p>
                                <p className="text-gray-600 text-sm">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Timeline */}
                <div className="flex justify-between items-center text-xs md:text-sm text-gray-500 bg-white p-4 rounded-xl shadow-sm overflow-x-auto">
                    {[
                        { label: 'Register', date: user.settings?.registration_deadline, done: true },
                        { label: 'Pairing', date: user.settings?.pairing_date, done: user.settings?.pairing_done },
                        { label: 'Gift Ready', date: user.settings?.gift_ready_deadline, done: user.santa_progress?.gift_ready },
                        { label: 'The Event', date: user.settings?.event_date, done: false }
                    ].map((step, i) => (
                        <div key={i} className={`flex flex-col items-center min-w-[80px] ${step.done ? 'text-green-600' : ''}`}>
                            <div className={`w-3 h-3 rounded-full mb-2 ${step.done ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="font-bold">{step.label}</span>
                            <span className="text-[10px]">{formatDate(step.date)}</span>
                        </div>
                    ))}
                </div>

                {/* Verification Status */}
                {!user.approved && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r shadow-sm">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Your account is currently <b>pending approval</b> by the Admin.
                                    You will be included in the pairing once approved.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pairing Result Card */}
                {user.paired_to && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-christmas-gold transform hover:scale-[1.01] transition duration-300">
                        <div className="bg-christmas-green p-6 text-center text-white">
                            <h2 className="text-3xl font-christmas font-bold">Your Secret Child Is...</h2>
                            <p className="opacity-80">You have been chosen to gift someone special!</p>
                        </div>

                        <div className="p-8 text-center">
                            {!reveal ? (
                                <button
                                    onClick={() => setReveal(true)}
                                    className="bg-christmas-red text-white py-4 px-8 rounded-full text-xl font-bold shadow-lg animate-pulse hover:bg-red-800 transition"
                                >
                                    Tap to Reveal 🎁
                                </button>
                            ) : (
                                <div className="animate-fade-in space-y-2">
                                    <div className="text-xl text-gray-500 font-medium">Ho Ho Ho! It's</div>
                                    <h3 className="text-4xl font-bold text-christmas-red">{user.paired_to.name}</h3>
                                    <div className="inline-block bg-gray-100 rounded-lg px-4 py-2 mt-4 text-left space-y-1">
                                        <p>📚 Dept/Sem: <b>{user.paired_to.department} - {user.paired_to.semester}</b></p>
                                        <p>📱 Mobile: <b>{user.paired_to.mobile || 'N/A'}</b></p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Progress Tracker */}
                {user.paired_to && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* My Progress */}
                        <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Clock className="text-christmas-red" /> Your Gift Status
                            </h3>
                            <div className="space-y-4">
                                {['gift_ready', 'gift_delivered'].map((stage, idx) => {
                                    const labels = {
                                        gift_ready: 'Gift Purchased 🛍️',
                                        gift_delivered: 'Gift Delivered 🚚',
                                    };
                                    const isActive = user.progress[stage];

                                    // Sequential Check
                                    const isDisabled = stage === 'gift_delivered' && !user.progress['gift_ready'];

                                    return (
                                        <button
                                            key={stage}
                                            onClick={() => !isDisabled && updateProgress(stage)}
                                            disabled={isDisabled}
                                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${isActive
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : isDisabled
                                                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                                                    : 'border-gray-200 text-gray-400 hover:border-gray-300'
                                                }`}
                                        >
                                            <span className="font-bold">{labels[stage]}</span>
                                            <CheckCircle className={`w-6 h-6 ${isActive ? 'fill-green-500 text-white' : ''}`} />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Santa's Progress */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-christmas-gold">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Gift className="text-christmas-gold" /> Incoming Gift Status
                            </h3>
                            {user.santa_progress ? (
                                <div className="space-y-6">
                                    <div className={`flex items-center gap-4 ${user.santa_progress.gift_ready ? 'text-green-600' : 'text-gray-300'}`}>
                                        <div className={`p-2 rounded-full ${user.santa_progress.gift_ready ? 'bg-green-100' : 'bg-gray-100'}`}>
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Santa has bought your gift! 🛍️</p>
                                            <p className="text-sm">{user.santa_progress.gift_ready ? 'Get excited!' : 'Not yet...'}</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-4 ${user.santa_progress.gift_delivered ? 'text-green-600' : 'text-gray-300'}`}>
                                        <div className={`p-2 rounded-full ${user.santa_progress.gift_delivered ? 'bg-green-100' : 'bg-gray-100'}`}>
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Santa has delivered your gift! 🚚</p>
                                            <p className="text-sm">{user.santa_progress.gift_delivered ? 'Check the collection point!' : 'Waiting...'}</p>
                                        </div>
                                    </div>

                                    {/* Mark Received */}
                                    {user.santa_progress.gift_delivered && (
                                        <button
                                            onClick={() => updateProgress('gift_received')}
                                            className={`w-full mt-4 p-3 rounded-lg font-bold border-2 transition ${user.progress.gift_received
                                                ? 'bg-christmas-green text-white border-christmas-green'
                                                : 'border-christmas-green text-christmas-green hover:bg-green-50'}`}
                                        >
                                            {user.progress.gift_received ? 'Received Confirmed! 🎁' : 'Confirm I Received It'}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-10">
                                    <p>Your Santa hasn't started yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Waiting State */}
                {!user.paired_to && user.approved && (
                    <div className="text-center py-20">
                        <Gift className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-400">Waiting for Pairing...</h2>
                        <p className="text-gray-500">The elves are still working on the list! Check back soon.</p>
                    </div>
                )}

            </main>
        </div>
    );
}
