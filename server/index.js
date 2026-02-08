import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Brain from './services/brain.js';
import Voice from './services/voice.js';

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(process.cwd(), 'server/data/users.json');

// Ensure users file exists
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ pending: [], approved: [] }));
}

// 1. User registers interest (Clicks Payment Link)
// 1. User registers interest (Clicks Payment Link)
app.post('/api/users/register', (req, res) => {
    const { email } = req.body;
    console.log(`[REGISTER] Attempt for: ${email}`); // Add logging
    if (!email) return res.status(400).json({ error: "Email required" });

    try {
        let data = { pending: [], approved: [] };
        if (fs.existsSync(USERS_FILE)) {
            try {
                data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
            } catch (e) {
                console.error("Error reading users file, resetting:", e);
                // If file is corrupted, start fresh (or backup)
            }
        }

        // Check if already approved
        if (data.approved.includes(email)) {
            console.log(`[REGISTER] User ${email} already approved`);
            return res.json({ status: 'approved' });
        }

        // Add to pending if not present
        if (!data.pending.includes(email)) {
            console.log(`[REGISTER] Adding ${email} to pending`);
            data.pending.push(email);
            fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
        } else {
            console.log(`[REGISTER] User ${email} already pending`);
        }

        res.json({ status: 'pending', message: "En attente de validation admin." });
    } catch (e) {
        console.error("Registration Error", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 2. User checks status
app.get('/api/users/status', (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

    const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

    if (data.approved.includes(email)) {
        return res.json({ status: 'approved' });
    } else {
        return res.json({ status: 'pending' });
    }
});

// 3. Admin: Get all users
app.get('/api/admin/users', (req, res) => {
    const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    res.json(data);
});

// 4. Admin: Approve user
app.post('/api/admin/approve', (req, res) => {
    const { email } = req.body;
    const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

    // Move from pending to approved
    data.pending = data.pending.filter(e => e !== email);
    if (!data.approved.includes(email)) {
        data.approved.push(email);
    }

    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, list: data });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', services: { openai: !!process.env.OPENAI_API_KEY, elevenlabs: !!process.env.ELEVENLABS_API_KEY } });
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

console.log("Initializing TRUTH.AI Core Systems...");
console.log("- OpenAI Key Status:", process.env.OPENAI_API_KEY ? "LOADED" : "MISSING");
console.log("- ElevenLabs Key Status:", process.env.ELEVENLABS_API_KEY ? "LOADED" : "MISSING");
import { AGENTS } from './services/agents.js';

// Store session data: ws -> { conversationHistory, agentId }
const connections = new Map();

wss.on('connection', (ws) => {
    console.log('Client connected to Neural Interface');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'INIT_CALL') {
                const { config } = data;
                const agentId = config.agentId || 'emma';
                console.log(`[Session Started] Agent: ${agentId}, Target: ${config.targetName}, Loc: ${config.targetLocation}`);

                connections.set(ws, {
                    conversationHistory: [],
                    agentId: agentId,
                    config: config // Store full config
                });

                // Optional: Send initial greeting?
                // For now, no greeting to avoid auto-triggering. Wait for user.
            }

            if (data.type === 'USER_AUDIO_TRANSCRIPT') {
                const { text } = data;
                console.log(`Received: ${text}`);

                const session = connections.get(ws);
                if (!session) {
                    console.warn("No session found for this connection");
                    return;
                }

                // Add user message to history
                session.conversationHistory.push({ role: "user", content: text });

                // Generate AI Response with full config
                const aiResponseText = await Brain.generateResponse(text, session.conversationHistory, session.agentId, session.config);

                // Add AI message to history
                session.conversationHistory.push({ role: "assistant", content: aiResponseText });

                // Send Transcript back
                if (ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify({ type: 'TRANSCRIPT', sender: 'agent', text: aiResponseText }));

                    // Generate Audio with Agent's Voice ID
                    const agent = AGENTS[session.agentId] || AGENTS['emma'];
                    const audioBuffer = await Voice.maximizeVocalFidelity(aiResponseText, agent.voiceId);

                    if (audioBuffer) {
                        ws.send(JSON.stringify({
                            type: 'AUDIO',
                            audio: audioBuffer.toString('base64')
                        }));
                    }
                }
            }
        } catch (e) {
            console.error("Processing Error:", e);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        const session = connections.get(ws);
        if (session && session.conversationHistory.length > 2) {
            console.log(`[Session End] Analyzing call for ${session.agentId}...`);
            Brain.analyzeCall(session.conversationHistory, session.agentId);
        }
        connections.delete(ws);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`
   _________________________________________________
  |                                                 |
  |   TRUTH.AI SERVER ONLINE // PORT ${PORT}             |
  |   MODELS: GPT-4o (Reasoning) + ElevenLabs (TTS) |
  |_________________________________________________|
  `);
});
