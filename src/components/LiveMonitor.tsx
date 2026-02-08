import React, { useEffect, useState, useRef } from 'react'
import '../styles/LiveMonitor.css'
import FinalReport from './FinalReport'

interface LiveMonitorProps {
    config: { agentId: string; targetName?: string; targetLocation?: string }
}

const LiveMonitor: React.FC<LiveMonitorProps> = ({ config }) => {
    const [messages, setMessages] = useState<{ sender: 'agent' | 'target'; text: string }[]>([])
    const [lieProbability, setLieProbability] = useState(0)
    const [status, setStatus] = useState('PRÊT À DÉMARRER')
    const [isListening, setIsListening] = useState(false)
    const [isCallActive, setIsCallActive] = useState(false)
    const [showReport, setShowReport] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)

    // Refs
    const ws = useRef<WebSocket | null>(null)
    const recognitionRef = useRef<any>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const currentTranscript = useRef('')
    const isPlayingRef = useRef(false)
    const audioWatchdog = useRef<NodeJS.Timeout | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null);

    // Unlock Audio Context on user interaction (Mobile/Chrome Policy)
    const unlockAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        // Play silent buffer to unlock
        const buffer = audioContextRef.current.createBuffer(1, 1, 22050);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.start(0);
    };

    const startCall = () => {
        unlockAudio(); // Critical for iOS/Chrome Autoplay
        setIsCallActive(true);
        setStatus('CONNEXION AU RÉSEAU...');

        ws.current = new WebSocket(import.meta.env.VITE_API_URL || 'ws://localhost:3000');

        ws.current.onopen = () => {
            setStatus('LIAISON ÉTABLIE');
            ws.current?.send(JSON.stringify({
                type: 'INIT_CALL',
                config: config
            }));
        };

        ws.current.onmessage = handleServerMessage;
        ws.current.onclose = () => {
            if (isCallActive) setStatus('CONNEXION PERDUE');
        };
    };

    const endCall = () => {
        setIsCallActive(false);
        stopListening();
        stopAudioPlayback();
        ws.current?.close();
        setStatus('MISSION TERMINÉE');
        setTimeout(() => setShowReport(true), 1500);
    };

    const handleStartRecording = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();

        if (isPlayingRef.current) {
            stopAudioPlayback();
            setStatus('AUDIO STOPPÉ (Mode écoute)');
            return;
        }
        if (isProcessing) return;
        if (isListening) return;

        setStatus('INITIALISATION MICRO...');
        startListening();

        window.addEventListener('mouseup', handleGlobalRelease);
        window.addEventListener('touchend', handleGlobalRelease);
    };

    const handleGlobalRelease = () => {
        window.removeEventListener('mouseup', handleGlobalRelease);
        window.removeEventListener('touchend', handleGlobalRelease);
        stopListening();
    };

    const startListening = () => {
        if (!recognitionRef.current) {
            setStatus("ERREUR: MICRO NON SUPPORTÉ");
            return;
        }
        try {
            currentTranscript.current = ''; // Reset transcript
            recognitionRef.current.start();
            setIsListening(true);
            setStatus('MICRO : ENREGISTREMENT...');
        } catch (e: any) {
            console.error(e);
            setStatus(`ERREUR MICRO: ${e.message || 'Inconnu'}`);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) { }
        }
        setIsListening(false);
        // Do NOT send here. Let onend handle sending.
    };

    const stopAudioPlayback = () => {
        if (audioRef.current) {
            try {
                // If it's an HTMLAudioElement (legacy or other parts), pause it
                if ((audioRef.current as any).pause) (audioRef.current as any).pause();
                // If it's a BufferSource (Web Audio), stop it
                if ((audioRef.current as any).stop) (audioRef.current as any).stop();
            } catch (e) {
                // Ignore errors if already stopped
            }
            audioRef.current = null;
        }
        if (audioWatchdog.current) clearTimeout(audioWatchdog.current);

        isPlayingRef.current = false;
        setIsPlaying(false);

        if (isCallActive && !isProcessing && !isListening) setStatus('MICRO : PRÊT (cliquez pour parler)');
    };

    const handleServerMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);

        if (data.type === 'TRANSCRIPT') {
            const newMessage = { sender: data.sender, text: data.text } as { sender: 'agent' | 'target'; text: string };
            setMessages(prev => {
                const updated = [...prev, newMessage];
                setLieProbability(Math.min(95, Math.floor(updated.length * 5 + Math.random() * 10)));
                return updated;
            });
            if (data.sender === 'agent') {
                setStatus('EN ATTENTE...');
                setIsProcessing(false);
            }
        }

        if (data.type === 'AUDIO') {
            stopAudioPlayback();

            setStatus('AGENT PARLE... (Cliquez pour couper)');
            isPlayingRef.current = true;
            setIsPlaying(true);

            try {
                // Convert Base64 to ArrayBuffer
                const binaryString = window.atob(data.audio);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                // Decode and Play via Web Audio API (Robust)
                if (!audioContextRef.current) unlockAudio();

                audioContextRef.current?.decodeAudioData(bytes.buffer, (buffer) => {
                    if (!isPlayingRef.current) return; // Stopped while decoding

                    const source = audioContextRef.current!.createBufferSource();
                    source.buffer = buffer;
                    source.connect(audioContextRef.current!.destination);
                    source.start(0);

                    // Track specific source to stop it later if needed
                    (source as any).onended = () => stopAudioPlayback();

                    // We can't easily use "audioRef" for this, so we rely on context state
                    // or just let it play. To stop, we'd need to keep a ref to 'source'.
                    // For now, let's just use a simple robust play.

                    // Store source to stop it
                    (audioRef as any).current = source;

                }, (e) => {
                    console.error("Decode error", e);
                    setStatus("ERREUR DÉCODAGE AUDIO");
                    stopAudioPlayback();
                });

            } catch (e: any) {
                console.error("Audio handling error:", e);
                setStatus(`ERREUR AUDIO: ${e.message}`);
                stopAudioPlayback();
            }
        }
    };

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'fr-FR';

            recognition.onresult = (event: any) => {
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        currentTranscript.current += event.results[i][0].transcript + ' ';
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }
                if (interim || currentTranscript.current) {
                    setStatus(`ENTENDU: ${(currentTranscript.current + interim).substring(0, 20)}...`);
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech Error:", event.error);
                if (event.error === 'not-allowed') {
                    setStatus("ERREUR: PERMISSION MICRO REFUSÉE");
                    setIsListening(false);
                } else if (event.error !== 'no-speech') {
                    // unexpected error -> try to recover transcript?
                }
            };

            recognition.onend = () => {
                setIsListening(false);

                // CRITICAL FIX: Analyze accumulated transcript and send if present
                const textToSend = currentTranscript.current.trim();

                if (textToSend) {
                    console.log("Sending captured text:", textToSend);
                    sendUserResponse(textToSend);
                    currentTranscript.current = ''; // Reset immediately to prevent double send
                } else {
                    // If empty, maybe just silence or cancelled.
                    if (isCallActive && !isPlayingRef.current && !isProcessing) {
                        setStatus('MICRO : PRÊT (Rien entendu)');
                    }
                }
            };

            recognitionRef.current = recognition;
        } else {
            setStatus("NAVIGATEUR INCOMPATIBLE");
        }
    }, [isCallActive]);

    const sendUserResponse = (text: string) => {
        setStatus('ENVOI EN COURS...');
        setIsProcessing(true);
        setMessages(prev => [...prev, { sender: 'target', text }]);

        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'USER_AUDIO_TRANSCRIPT',
                text: text
            }));
            setStatus('ANALYSE NEURONALE...');
        } else {
            setStatus('ERREUR: DÉCONNECTÉ');
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        return () => {
            stopAudioPlayback();
            ws.current?.close();
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }
            window.removeEventListener('mouseup', handleGlobalRelease);
            window.removeEventListener('touchend', handleGlobalRelease);
        };
    }, []);

    if (showReport) {
        return <FinalReport transcript={messages} lieProbability={lieProbability} onRestart={() => window.location.reload()} />
    }

    return (
        <div className="monitor-container">
            <div className="header-status">
                <span className="live-badge" style={{ color: isCallActive ? '#10b981' : '#a1a1aa' }}>
                    ● {status}
                </span>
                <span className="target-info">MODE MANUEL (Push-to-Talk)</span>
                {isCallActive && (
                    <button onClick={endCall} style={{
                        background: '#ef4444',
                        border: 'none', color: 'white', padding: '5px 15px',
                        borderRadius: '5px', cursor: 'pointer', marginLeft: 'auto'
                    }}>RACCROCHER</button>
                )}
            </div>

            <div className="visualization-area">
                <div className={`audio-wave ${isListening ? 'listening' : ''}`}>
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="wave-bar" style={{
                            animationDelay: `${i * 0.1}s`,
                            backgroundColor: isListening ? '#ef4444' : (isPlaying ? '#10b981' : undefined)
                        }}></div>
                    ))}
                </div>

                <div className="lie-meter">
                    <label>SCORE DE RISQUE</label>
                    <div className="meter-bar-container">
                        <div className="meter-fill" style={{ width: `${lieProbability}%`, backgroundColor: lieProbability > 50 ? '#ef4444' : '#10b981' }}></div>
                    </div>
                    <span className="risk-value">{Math.round(lieProbability)}%</span>
                </div>

                <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>

                    {!isCallActive ? (
                        <button
                            onClick={startCall}
                            style={{
                                width: '200px',
                                height: '60px',
                                borderRadius: '30px',
                                background: 'linear-gradient(45deg, #10b981, #059669)',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            LANCER L'APPEL
                        </button>
                    ) : (
                        <button
                            onMouseDown={handleStartRecording}
                            onTouchStart={handleStartRecording}
                            disabled={isProcessing && !isPlaying} // Allow interrupting audio
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: isPlaying ? '#10b981' : (isProcessing ? '#52525b' : (isListening ? '#ef4444' : 'rgba(139, 92, 246, 0.2)')),
                                border: isPlaying ? '4px solid #10b981' : (isProcessing ? '2px solid #52525b' : (isListening ? '4px solid #ef4444' : '2px solid #8b5cf6')),
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: isPlaying ? '0 0 20px #10b981' : (isListening ? '0 0 30px #ef4444' : '0 0 15px rgba(139, 92, 246, 0.3)'),
                                transition: 'all 0.1s ease',
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                touchAction: 'none'
                            }}
                        >
                            {isListening ? 'ENREGISTREMENT...' : (isPlaying ? 'ARRÊTER AUDIO' : (isProcessing ? 'ANALYSE...' : 'MAINTENIR POUR PARLER'))}
                        </button>
                    )}

                    {isCallActive && (
                        <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '10px' }}>
                            {isPlaying ? '(Cliquez pour couper la parole)' : '(Maintenez pour parler)'}
                        </p>
                    )}

                </div>
            </div>

            <div className="transcript-box">
                {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.sender}`}>
                        <span className="sender-label">{msg.sender === 'agent' ? 'AGENT IA' : 'VOUS'}</span>
                        <p>{msg.text}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LiveMonitor
