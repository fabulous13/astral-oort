import React, { useState } from 'react'
import AgentSetup from './components/AgentSetup'
import LiveMonitor from './components/LiveMonitor'
import LandingPage from './components/LandingPage'
import './App.css'

import HowItWorks from './components/HowItWorks'
import PaymentPage from './components/PaymentPage'
import AdminDashboard from './components/AdminDashboard'

function App() {
    const [view, setView] = useState('landing') // 'landing' | 'howitworks' | 'payment' | 'setup' | 'monitor' | 'report' | 'admin'
    const [agentConfig, setAgentConfig] = useState({ agentId: 'emma' })

    const startAnalysis = (config: any) => {
        setAgentConfig(config)
        setView('monitor')
    }

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('admin') === 'true') {
            setView('admin');
        }
    }, []);

    const isLanding = view === 'landing';

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: isLanding ? 'center' : 'flex-start',
            boxSizing: 'border-box'
        }}>
            {view === 'admin' && <AdminDashboard />}

            {view === 'landing' && (
                <div style={{ textAlign: 'center' }}>
                    <h1 className="title-glitch" data-title="TRUTH.AI">TRUTH.AI</h1>
                    <p style={{ marginTop: '20px', fontSize: '1.2rem', color: '#ff00ff' }}>
                        L'IA DE DÉTECTION DE FIDÉLITÉ
                    </p>
                    <button
                        className="execute-btn"
                        onClick={() => setView('howitworks')}
                        style={{ marginTop: '40px' }}
                    >
                        <span className="btn-text">INITIALISER SYSTÈME</span>
                        <div className="btn-glitch"></div>
                    </button>
                    <p style={{ marginTop: '15px', fontSize: '0.8rem', color: '#666', maxWidth: '300px', margin: '15px auto' }}>
                        En cliquant, vous acceptez les conditions d'utilisation et certifiez être majeur.
                    </p>
                </div>
            )}

            {view === 'howitworks' && (
                <HowItWorks onContinue={() => setView('payment')} />
            )}

            {view === 'payment' && (
                <PaymentPage onSuccess={() => setView('setup')} />
            )}

            {view === 'setup' && (
                <AgentSetup onStart={startAnalysis} />
            )}

            {view === 'monitor' && <LiveMonitor config={agentConfig} />}


            {view !== 'landing' && (
                <footer className="footer">
                    <p>TERMINAL SÉCURISÉ // v2026.4.1</p>
                </footer>
            )}
        </div>
    )
}

export default App
