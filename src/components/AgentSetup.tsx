import React, { useState } from 'react'
import '../styles/AgentSetup.css'
import { AGENTS } from '../config/agents'

interface AgentSetupProps {
    onStart: (config: { agentId: string }) => void
}

const AgentSetup: React.FC<AgentSetupProps> = ({ onStart }) => {
    const [selectedAgentId, setSelectedAgentId] = useState('emma')
    const [targetName, setTargetName] = useState('')
    const [targetLocation, setTargetLocation] = useState('')

    const handleStart = () => {
        onStart({ agentId: selectedAgentId, targetName, targetLocation } as any) // Cast any to avoid props mismatch for now
    }

    const agentsList = Object.entries(AGENTS).map(([id, agent]) => ({
        id,
        ...agent
    }));

    // Group by gender
    const femaleAgents = agentsList.filter(a => a.gender === 'female');
    const maleAgents = agentsList.filter(a => a.gender === 'male');

    return (
        <div className="setup-container">
            <h1 className="title-glitch" data-title="CHOIX DE L'AGENT">CHOIX DE L'AGENT</h1>

            <div className="agents-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>

                <section>
                    <h3 style={{ borderBottom: '1px solid #ff00ff', paddingBottom: '5px', color: '#ff00ff' }}>UNITÉS FÉMININES</h3>
                    <div className="agents-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px', marginTop: '10px' }}>
                        {femaleAgents.map((agent) => (
                            <div
                                key={agent.id}
                                className={`agent-card ${selectedAgentId === agent.id ? 'active' : ''}`}
                                onClick={() => setSelectedAgentId(agent.id)}
                                style={{
                                    border: selectedAgentId === agent.id ? '2px solid #ff00ff' : '1px solid #333',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    background: selectedAgentId === agent.id ? 'rgba(255, 0, 255, 0.1)' : 'rgba(0,0,0,0.5)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{agent.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#ff00ff', marginBottom: '5px' }}>{agent.style}</div>
                                <div style={{ fontSize: '0.7rem', color: '#aaa', lineHeight: '1.2' }}>{agent.description}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 style={{ borderBottom: '1px solid #00ffff', paddingBottom: '5px', color: '#00ffff' }}>UNITÉS MASCULINES</h3>
                    <div className="agents-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px', marginTop: '10px' }}>
                        {maleAgents.map((agent) => (
                            <div
                                key={agent.id}
                                className={`agent-card ${selectedAgentId === agent.id ? 'active' : ''}`}
                                onClick={() => setSelectedAgentId(agent.id)}
                                style={{
                                    border: selectedAgentId === agent.id ? '2px solid #00ffff' : '1px solid #333',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    background: selectedAgentId === agent.id ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0,0,0,0.5)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{agent.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#00ffff', marginBottom: '5px' }}>{agent.style}</div>
                                <div style={{ fontSize: '0.7rem', color: '#aaa', lineHeight: '1.2' }}>{agent.description}</div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <p style={{ marginBottom: '15px', color: '#aaa' }}>
                    Agent sélectionné : <strong style={{ color: '#fff' }}>{AGENTS[selectedAgentId].name}</strong>
                </p>

                <div className="target-info" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Prénom de la Cible (ex: Julien)"
                        value={targetName}
                        onChange={(e) => setTargetName(e.target.value)}
                        style={{ padding: '10px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '5px' }}
                    />
                    <input
                        type="text"
                        placeholder="Ville (ex: Paris)"
                        value={targetLocation}
                        onChange={(e) => setTargetLocation(e.target.value)}
                        style={{ padding: '10px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '5px' }}
                    />
                </div>

                <button className="execute-btn" onClick={handleStart}>
                    <span className="btn-text">LANCER MISSION</span>
                    <div className="btn-glitch"></div>
                </button>
            </div>
        </div>
    )
}

export default AgentSetup
