import React, { useState } from 'react'
import '../styles/LandingPage.css'

interface LandingPageProps {
    onEnter: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
    const [loading, setLoading] = useState(false)

    const handlePurchase = (plan: string) => {
        setLoading(true)
        // Simulation of payment process
        setTimeout(() => {
            setLoading(false)
            onEnter()
        }, 2000)
    }

    return (
        <div className="landing-container">
            <div className="hero-section">
                <h1 className="hero-title glitch" data-text="VERITE AI">VERITE AI</h1>
                <p className="hero-subtitle">LA VÉRITÉ A UN PRIX // L'IA LA RÉVÈLE</p>
            </div>

            <div className="pricing-grid single-plan">
                <div className="pricing-card premium" style={{ transform: 'scale(1.1)', border: '2px solid #8b5cf6' }}>
                    <div className="badge">OFFRE UNIQUE</div>
                    <h2>PACK INVESTIGATION</h2>
                    <div className="price">24.99€</div>
                    <ul className="features">
                        <li>3 Appels de Test (Scénarios Variés)</li>
                        <li>Analyse Psychologique Complète</li>
                        <li>Rapport de Preuve (PDF + Audio)</li>
                        <li>Voix Ultra-Réaliste (V2.5)</li>
                        <li>Priorité Réseau Maximale</li>
                    </ul>
                    <button className="buy-btn premium-btn" onClick={() => handlePurchase('premium')}>
                        {loading ? 'INITIALISATION...' : 'DÉBLOQUER L\'ACCÈS'}
                    </button>
                    <p style={{ marginTop: '15px', fontSize: '0.8rem', color: '#a1a1aa' }}>*Satisfait ou remboursé sous conditions</p>
                </div>
            </div>

            <div className="trust-badges">
                <span>🔒 PAIEMENT SÉCURISÉ PAR STRIPE</span>
                <span>⚡️ RÉSULTATS GARANTIS</span>
                <span>🕶️ 100% ANONYME</span>
            </div>
        </div>
    )
}

export default LandingPage
