import { useState, useEffect } from 'react';
import { Users, Shuffle, Bell, Calendar } from 'lucide-react';
import ChristmasHeader from '../components/ChristmasHeader';

export default function AdminDashboard() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, approved: 0 });

    const fetchStudents = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/admin/students', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Note: The /admin/students endpoint returns simple list. 
        // We will stick to client-side filtering or use the separate /admin/pairs if needed, 
        // but for simplicity in this view, let's update GET /students in backend to Populate too.
        const data = await res.json();
        if (res.ok && data.students) {
            setStudents(data.students);
            setStats({
                total: data.students.length,
                approved: data.students.filter(s => s.approved).length
            });
        } else {
            console.error("Failed to fetch students or invalid format", data);
            // Don't set students to null/undefined if it fails, keep previous state or empty
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const deleteStudent = async (id) => {
        if (!window.confirm('Are you sure you want to remove this student? This cannot be undone.')) return;

        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/admin/student/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            fetchStudents();
        } else {
            alert('Failed to delete student');
        }
    };

    const triggerPairing = async () => {
        if (!window.confirm('Are you sure? This will SHUFFLE and RE-ASSIGN all Santas. Previous pairings will be overwritten.')) return;

        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/admin/pair-students', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        alert(data.message);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <ChristmasHeader user={{ name: 'Admin', role: 'admin' }} />

            <main className="max-w-6xl mx-auto p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 font-medium mb-2">Total Students</h3>
                        <div className="text-4xl font-bold text-gray-800">{stats.total}</div>
                        <div className="text-sm text-green-600 mt-2">{stats.approved} Approved</div>
                    </div>

                    {/* Actions Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2 flex items-center gap-4">
                        <button
                            onClick={triggerPairing}
                            className="flex items-center gap-2 bg-christmas-gold text-yellow-900 font-bold px-6 py-3 rounded-lg hover:bg-yellow-400 transition"
                        >
                            <Shuffle className="w-5 h-5" /> Trigger Random Pairing
                        </button>

                    </div>
                </div>

                {/* Student List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Users className="text-christmas-red" /> Registered Students
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 uppercase">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Dept / Sem</th>
                                    <th className="p-4">Mobile</th>
                                    <th className="p-4">Password</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {Array.isArray(students) && students.map(student => (
                                    <tr key={student._id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{student.name || 'No Name'}</td>
                                        <td className="p-4 text-gray-500">{student.email}</td>
                                        <td className="p-4 text-gray-600">{student.department || '-'} / {student.semester || '-'}</td>
                                        <td className="p-4 text-gray-600">{student.mobile || '-'}</td>
                                        <td className="p-4 text-gray-600 cursor-pointer select-all" title="Click to select">
                                            {student.password_plain || <span className="text-gray-300 italic">Hidden</span>}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => deleteStudent(student._id)}
                                                className="text-red-600 hover:text-red-800 font-bold text-xs bg-red-50 px-3 py-1 rounded-full border border-red-100"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {students.length === 0 && (
                            <div className="p-10 text-center text-gray-400">No students registered yet.</div>
                        )}
                    </div>
                </div>


                {/* Pairs List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            🎁 Pairing List
                        </h2>
                    </div>
                    <div className="overflow-x-auto p-6">
                        {students.some(s => s.paired_to) ? (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600 uppercase">
                                    <tr>
                                        <th className="p-4">Santa (Giver)</th>
                                        <th className="p-4">Child (Receiver)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.filter(s => s.paired_to).map(s => (
                                        <tr key={s._id} className="hover:bg-gray-50">
                                            <td className="p-4 font-bold text-red-600">{s.name} <span className="text-gray-400 font-normal">({s.department})</span></td>
                                            <td className="p-4 font-bold text-green-600">➜ {s.paired_to?.name || 'Unknown'} <span className="text-gray-400 font-normal">({s.paired_to?.department})</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-400">No pairings generated yet.</p>
                        )}
                    </div>
                </div>

            </main >
        </div >
    );
}
