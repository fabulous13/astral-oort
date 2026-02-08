import React, { useEffect, useState } from 'react'
import '../styles/AdminDashboard.css'

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState({ pending: [], approved: [] });
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/admin/users');
            const data = await res.json();
            setUsers(data);
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const approveUser = async (email: string) => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/admin/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.list); // Update list from server
            }
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
