import React, { useEffect, useState } from 'react'
import '../styles/AdminDashboard.css'

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState({ pending: [], approved: [] });
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            // If VITE_API_URL is not set (production same-origin), use relative path or empty string
            // But here we need cross-origin if frontend is on Vercel and backend on Render 
            // The provided VITE_API_URL should be working. 
            // Let's add logging to debug what URL is being used.
            const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/^ws/, 'http') : 'http://localhost:3000';
            console.log("Fetching users from:", apiUrl); // Debug log

            const res = await fetch(`${apiUrl}/api/admin/users`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();

            // Safety check for array existence
            if (!data.pending) data.pending = [];
            if (!data.approved) data.approved = [];

            setUsers(data);
        } catch (e) {
            console.error("Fetch Users Error:", e);
            // alert("Erreur de chargement des utilisateurs. Vérifiez la console.");
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const approveUser = async (email: string) => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/^ws/, 'http') : 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/admin/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            // Re-fetch users after approval to get valid state
            fetchUsers();

        } catch (e) {
            alert('Error approving user');
        }
        setLoading(false);
    }

    return (
        <div className="admin-container">
            <h1 style={{ color: '#ff0000', borderBottom: '2px solid red', paddingBottom: '10px' }}>PANNEAU ADMIN // VALIDATION</h1>

            <button onClick={fetchUsers} className="refresh-btn">RAFRAÎCHIR LISTE</button>

            <div className="admin-section">
                <h2 style={{ color: '#ffaa00' }}>EN ATTENTE ({users.pending.length})</h2>
                {users.pending.length === 0 ? <p>Aucun utilisateur en attente.</p> : (
                    <ul className="user-list">
                        {users.pending.map((email: string) => (
                            <li key={email} className="user-item pending">
                                <span>{email}</span>
                                <button onClick={() => approveUser(email)} disabled={loading} className="approve-btn">
                                    VALIDER ACCÈS
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="admin-section">
                <h2 style={{ color: '#00ff00' }}>APPROUVÉS ({users.approved.length})</h2>
                <ul className="user-list">
                    {users.approved.map((email: string) => (
                        <li key={email} className="user-item approved">
                            <span>{email}</span>
                            <span style={{ color: '#00ff00', fontWeight: 'bold' }}>ACTIVE</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default AdminDashboard
