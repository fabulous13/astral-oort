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
                    const res = await fetch(`http://localhost:3000/api/users/status?email=${email}`);
                    const data = await res.json();
                    if (data.status === 'approved') {
                        clearInterval(interval);
                        onSuccess();
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 5000); // Check every 5 seconds
        }
        return () => clearInterval(interval);
    }, [waitingForValidation, email, onSuccess]);

    const handlePayment = async () => {
        if (!email.includes('@')) {
            alert("Email invalide. Il doit être IDENTIQUE à votre compte.")
            return;
        }

        setLoading(true);

        try {
            // Register Pending
            await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            // Open Revolut
            window.open('https://checkout.revolut.com/pay/6aa31853-c220-408d-a760-e5976595b087', '_blank');

            setWaitingForValidation(true);
            setLoading(false);
        } catch (e) {
            console.error(e);
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
                <button className="execute-btn" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
                    <span className="btn-text">RAFRAÎCHIR LE STATUT</span>
                </button>
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
