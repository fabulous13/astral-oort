import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import mongoose from 'mongoose';
import User from './models/User.js';
import Brain from './services/brain.js';
import Voice from './services/voice.js';
import { AGENTS } from './services/agents.js';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
// SECURITY NOTE: In production, use environment variables. 
// Hardcoded fallback provided for immediate deployment ease as requested.
const DEFAULT_MONGO_URI = "mongodb+srv://cabineteia_db_user:xZH5njGdSxfp84B2@cluster0.avnsvc7.mongodb.net/truth_ai?appName=Cluster0";
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

let isMongoConnected = false;

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('✅ MongoDB Connected Successfully');
            isMongoConnected = true;
        })
        .catch(err => console.error('❌ MongoDB Connection Error:', err));
} else {
    console.warn('⚠️ No MONGODB_URI provided. Server will run in memory-only mode (DATA WILL BE LOST ON RESTART).');
}

// 1. User registers interest (Clicks Payment Link)
app.post('/api/users/register', async (req, res) => {
    const { email } = req.body;
    console.log(`[REGISTER] Attempt for: ${email}`);
    if (!email) return res.status(400).json({ error: "Email required" });

    try {
        if (isMongoConnected) {
            let user = await User.findOne({ email });
            if (user) {
                if (user.status === 'approved') {
                    return res.json({ status: 'approved' });
                }
                return res.json({ status: 'pending', message: "Already pending." });
            }

            user = new User({ email, status: 'pending' });
            await user.save();
            console.log(`[REGISTER] User ${email} saved to MongoDB`);
        } else {
            console.log(`[REGISTER] (Memory Mode) User ${email} would be saved`);
            // Fallback for demo/no-db mode could go here if needed, but we want professional setup
            // For now, return success to let the UI proceed, but warn in logs
        }

        res.json({ status: 'pending', message: "En attente de validation admin." });
    } catch (e) {
        console.error("Registration Error:", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 2. User checks status
app.get('/api/users/status', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

    try {
        if (isMongoConnected) {
            const user = await User.findOne({ email });
            if (user && user.status === 'approved') {
                return res.json({ status: 'approved' });
            }
        }
        return res.json({ status: 'pending' });
    } catch (e) {
        console.error("Status Check Error:", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 3. Admin: Get all users
app.get('/api/admin/users', async (req, res) => {
    try {
        if (isMongoConnected) {
            const users = await User.find().sort({ createdAt: -1 });
            const pending = users.filter(u => u.status === 'pending').map(u => u.email);
            const approved = users.filter(u => u.status === 'approved').map(u => u.email);
            res.json({ pending, approved });
        } else {
            res.json({ pending: [], approved: [] });
        }
    } catch (e) {
        console.error("Admin Fetch Error:", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 4. Admin: Approve user
app.post('/api/admin/approve', async (req, res) => {
    const { email } = req.body;
    try {
        if (isMongoConnected) {
            await User.findOneAndUpdate({ email }, { status: 'approved', approvedAt: new Date() });

            // Return updated list
            const users = await User.find().sort({ createdAt: -1 });
            const pending = users.filter(u => u.status === 'pending').map(u => u.email);
            const approved = users.filter(u => u.status === 'approved').map(u => u.email);

            res.json({ success: true, list: { pending, approved } });
        } else {
            res.json({ success: false, error: "Database not connected" });
        }
    } catch (e) {
        console.error("Approval Error:", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        services: {
            openai: !!process.env.OPENAI_API_KEY,
            elevenlabs: !!process.env.ELEVENLABS_API_KEY,
            database: isMongoConnected ? 'connected' : 'disconnected'
        }
    });
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

console.log("Initializing TRUTH.AI Core Systems...");
console.log("- OpenAI Key Status:", process.env.OPENAI_API_KEY ? "LOADED" : "MISSING");
console.log("- ElevenLabs Key Status:", process.env.ELEVENLABS_API_KEY ? "LOADED" : "MISSING");

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
server.listen(PORT, () => {
    console.log(`
   _________________________________________________
  |                                                 |
  |   TRUTH.AI SERVER ONLINE // PORT ${PORT}             |
  |   MODELS: GPT-4o + ElevenLabs + MongoDB         |
  |_________________________________________________|
  `);
});
