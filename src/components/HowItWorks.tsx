import React from 'react'
import '../styles/HowItWorks.css'

interface HowItWorksProps {
    onContinue: () => void
}

const HowItWorks: React.FC<HowItWorksProps> = ({ onContinue }) => {
    return (
        <div className="hiw-container">
            <h1 className="hiw-title">COMMENT FONCTIONNE L'APPLICATION</h1>

            <div className="hiw-content">
                <section className="hiw-step">
                    <h2>ÉTAPE 1 : CRÉATION DE COMPTE</h2>
                    <p>• Création de compte <strong>OBLIGATOIRE</strong>.</p>
                    <p>• Nécessite email + mot de passe.</p>
                    <p className="warning">⚠️ L'email doit être STRICTEMENT IDENTIQUE à celui du paiement pour activer l'accès.</p>
                </section>

                <section className="hiw-step">
                    <h2>ÉTAPE 2 : ACCÈS DIRECT</h2>
                    <p>• <strong>AUCUN TÉLÉCHARGEMENT</strong> store nécessaire.</p>
                    <p>• Fonctionne via lien sécurisé.</p>
                    <p>• Ajoutez simplement à l'écran d'accueil pour l'utiliser comme une app.</p>
                </section>

                <section className="hiw-step">
                    <h2>ÉTAPE 3 : CHOIX DU PERSONNAGE</h2>
                    <p>• Sélectionnez un agent (Homme/Femme).</p>
                    <p>• Chaque agent a une voix et un style unique.</p>
                </section>

                <section className="hiw-step">
                    <h2>ÉTAPE 4 : ACTIVATION</h2>
                    <p>• L'agent s'active après sélection.</p>
                    <p>• <strong>IL N'ÉCOUTE JAMAIS AUTOMATIQUEMENT.</strong></p>
                    <p>• VOUS déclenchez l'écoute.</p>
                </section>

                <section className="hiw-step highlight">
                    <h2>ÉTAPE 5 : UTILISATION RÉELLE (IMPORTANT)</h2>
                    <p>1. Appelez la cible avec un <strong>SECOND TÉLÉPHONE</strong>.</p>
                    <p>2. Mettez ce téléphone en <strong>HAUT-PARLEUR</strong> près de celui-ci.</p>
                    <p>3. À chaque phrase de la cible, APPUYEZ sur <strong>"ÉCOUTER"</strong>.</p>
                    <p>4. L'IA analyse et répond vocalement.</p>
                    <p><em>Sans action sur le bouton, l'agent ne répondra pas.</em></p>
                </section>

                <section className="hiw-step">
                    <h2>ÉTAPE 6 : PAIEMENT & ACTIVATION</h2>
                    <p>• Accès au paiement après cette page.</p>
                    <p>• Activation sous <strong>10 MINUTES MAX</strong> après validation.</p>
                    <p>• Limite : <strong>3 APPELS MAX</strong>.</p>
                    <p>• Les appels sont décomptés dès le lancement.</p>
                </section>

                <div className="hiw-clarity-box">
                    <h3>⚠️ INFORMATION CRUCIALE</h3>
                    <ul>
                        <li>Accès non immédiat (délai 10 min).</li>
                        <li>Service limité à 3 appels.</li>
                        <li>Bouton "ÉCOUTER" indispensable à chaque échange.</li>
                        <li>Intervention manuelle requise (PAS d'automatisme magique).</li>
                    </ul>
                </div>
            </div>

            <button className="execute-btn" onClick={onContinue} style={{ marginTop: '30px', width: '100%' }}>
                <span className="btn-text">CONTINUER VERS LE PAIEMENT</span>
                <div className="btn-glitch"></div>
            </button>
        </div>
    )
}

export default HowItWorks
