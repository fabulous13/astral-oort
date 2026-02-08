import React, { useEffect, useState } from 'react'
import '../styles/FinalReport.css'

interface FinalReportProps {
    transcript: { sender: 'agent' | 'target'; text: string }[]
    lieProbability: number
    onRestart: () => void
}

const FinalReport: React.FC<FinalReportProps> = ({ transcript, lieProbability, onRestart }) => {
    const [reveal, setReveal] = useState(false)

    useEffect(() => {
        setTimeout(() => setReveal(true), 500)
    }, [])

    const getVerdict = () => {
        if (lieProbability < 30) return { text: "FIDÈLE", color: "#10b981", desc: "Aucune déviation détectée." }
        if (lieProbability < 70) return { text: "AMBIGU", color: "#f59e0b", desc: "Signaux mixtes. Prudence recommandée." }
        return { text: "INFIDÈLE", color: "#ef4444", desc: "Risque critique. Comportement suspect confirmé." }
    }

    const verdict = getVerdict()

    return (
        <div className="report-container">
            <div className={`report-card ${reveal ? 'active' : ''}`}>
                <div className="report-header">
                    <h1>RAPPORT DE MISSION #2026-XQ</h1>
                    <span className="timestamp">{new Date().toLocaleString()}</span>
                </div>

                <div className="verdict-section">
                    <h2>VERDICT IA</h2>
                    <div className="verdict-badge" style={{ borderColor: verdict.color, color: verdict.color, boxShadow: `0 0 30px ${verdict.color}40` }}>
                        {verdict.text}
                    </div>
                    <p className="verdict-desc">{verdict.desc}</p>
                </div>

                <div className="metrics-grid">
                    <div className="metric">
                        <label>SCORE DE RISQUE</label>
                        <div className="score-circle">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="circle" strokeDasharray={`${lieProbability}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ stroke: verdict.color }} />
                            </svg>
                            <span className="percentage">{Math.round(lieProbability)}%</span>
                        </div>
                    </div>
                    <div className="metric">
                        <label>DURÉE DE L'APPEL</label>
                        <span className="value">02:45</span>
                    </div>
                    <div className="metric">
                        <label>INTÉRACTIONS</label>
                        <span className="value">{transcript.length} Échanges</span>
                    </div>
                </div>

                <div className="transcript-preview">
                    <h3>EXTRAIT DE PREUVE</h3>
                    <div className="chat-log">
                        {transcript.slice(-4).map((msg, i) => (
                            <p key={i} className={msg.sender}>
                                <strong>{msg.sender === 'agent' ? 'AGENT' : 'CIBLE'}:</strong> {msg.text}
                            </p>
                        ))}
                    </div>
                </div>

                <div className="action-buttons">
                    <button className="download-btn" onClick={() => window.print()}>TÉLÉCHARGER LE PDF (PREUVE)</button>
                    <button className="restart-btn" onClick={onRestart}>NOUVELLE MISSION</button>
                </div>
            </div>
        </div>
    )
}

export default FinalReport
