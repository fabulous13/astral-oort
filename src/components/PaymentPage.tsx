import React, { useState } from 'react'
import '../styles/PaymentPage.css'

interface PaymentPageProps {
    onSuccess: () => void
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [waitingForValidation, setWaitingForValidation] = useState(false)

    // Polling for validation
    React.useEffect(() => {
        let interval: any;
        if (waitingForValidation && email) {
            interval = setInterval(async () => {
                try {
                    const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/^ws/, 'http') : 'http://localhost:3000';
                    const res = await fetch(`${apiUrl}/api/users/status?email=${email}`);
                    const data = await res.json();
                    if (data.status === 'approved') {
                        clearInterval(interval);
                        localStorage.removeItem('truth_ai_pending_email');
                        onSuccess();
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 5000); // Check every 5 seconds
        }
        return () => clearInterval(interval);
    }, [waitingForValidation, email, onSuccess]);

    // Check for pending payment on load
    React.useEffect(() => {
        const pendingEmail = localStorage.getItem('truth_ai_pending_email');
        if (pendingEmail) {
            setEmail(pendingEmail);
            setWaitingForValidation(true);
        }
    }, []);

    const handlePayment = async () => {
        if (!email.includes('@')) {
            alert("Email invalide. Il doit être IDENTIQUE à votre compte.")
            return;
        }

        // 1. Open window IMMEDIATELY to bypass popup blockers
        const paymentWindow = window.open('', '_blank');

        setLoading(true);

        try {
            // Register Pending
            const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/^ws/, 'http') : 'http://localhost:3000';
            await fetch(`${apiUrl}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            // Persist state so it survives reloads/returns
            localStorage.setItem('truth_ai_pending_email', email);

            // 2. Redirect the already opened window
            if (paymentWindow) {
                paymentWindow.location.href = 'https://checkout.revolut.com/payment-link/f5974937-07d3-437a-b006-fe4e8ccef313';
            } else {
                // Should not happen if opened synchronously, unless strict settings
                alert("Fenêtre de paiement bloquée. Utilisez le lien manuel.");
            }

            setWaitingForValidation(true);
            setLoading(false);
        } catch (e) {
            console.error(e);
            if (paymentWindow) paymentWindow.close(); // Close if error
            setLoading(false);
        }
    }

    if (waitingForValidation) {
        return (
            <div className="payment-container" style={{ textAlign: 'center' }}>
                <h1 style={{ color: '#ffaa00' }}>EN ATTENTE DE VALIDATION</h1>
                <div className="spinner"></div>
                <p style={{ marginTop: '20px' }}>Nous vérifions votre paiement pour l'email :</p>
                <p style={{ color: '#00ffff', fontWeight: 'bold' }}>{email}</p>
                <p style={{ marginTop: '30px', color: '#666', fontSize: '0.9rem' }}>
                    L'activation est manuelle et peut prendre jusqu'à 10 minutes.
                    Laissez cette page ouverte ou revenez plus tard.
                </p>

                <div style={{ margin: '20px 0', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.8rem', marginBottom: '5px' }}>Le paiement ne s'est pas ouvert ?</p>
                    <a href="https://checkout.revolut.com/payment-link/f5974937-07d3-437a-b006-fe4e8ccef313" target="_blank" rel="noreferrer" style={{ color: '#00ffff' }}>
                        CLIQUEZ ICI POUR PAYER
                    </a>
                </div>

                <button className="execute-btn" onClick={() => window.location.reload()}>
                    <span className="btn-text">RAFRAÎCHIR LE STATUT</span>
                </button>

                <div style={{ marginTop: '20px' }}>
                    <button
                        onClick={() => {
                            localStorage.removeItem('truth_ai_pending_email');
                            setWaitingForValidation(false);
                            setEmail('');
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#666',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                        }}
                    >
                        Annuler / Changer d'email
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="payment-container">
            <h1 style={{ color: '#00ffff', textAlign: 'center', marginBottom: '20px' }}>PAIEMENT SÉCURISÉ</h1>

            <div className="order-summary">
                <h3>PACK DÉCOUVERTE // 3 APPELS</h3>
                <div className="price">29.99 €</div>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px', fontSize: '0.9rem', color: '#aaa' }}>
                    <li>✓ Lien Sécurisé REVOLUT</li>
                    <li>✓ Activation sous 10 minutes</li>
                    <li>✓ 3 Missions complètes</li>
                </ul>
            </div>

            <div className="payment-form">
                <div className="form-group">
                    <label>EMAIL DU COMPTE (OBLIGATOIRE)</label>
                    <input
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="payment-input"
                    />
                    <small style={{ color: '#ffaa00', display: 'block', marginTop: '5px' }}>
                        ⚠️ Saisissez votre email AVANT de cliquer sur payer.
                    </small>
                </div>

                <button
                    className="execute-btn payment-btn"
                    onClick={handlePayment}
                    disabled={loading}
                    style={{ marginTop: '30px', width: '100%', opacity: loading ? 0.7 : 1 }}
                >
                    <span className="btn-text">{loading ? "OUVERTURE REVOLUT..." : "PAYER 29.99€ (REVOLUT)"}</span>
                    {!loading && <div className="btn-glitch"></div>}
                </button>

                <div style={{ textAlign: 'center', marginTop: '15px', color: '#666', fontSize: '0.8rem' }}>
                    <p>🔒 Paiement externe sécurisé par Revolut</p>
                    <p>Une nouvelle fenêtre va s'ouvrir.</p>
                </div>
            </div>
        </div>
    )
}

export default PaymentPage
