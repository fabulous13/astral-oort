import { AGENTS, getAgent } from './agents.js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const LEARNINGS_FILE = path.join(process.cwd(), 'server/data/learnings.json');

// Ensure learnings file exists
if (!fs.existsSync(LEARNINGS_FILE)) {
    fs.mkdirSync(path.dirname(LEARNINGS_FILE), { recursive: true });
    fs.writeFileSync(LEARNINGS_FILE, JSON.stringify({ emma: [], lea: [], chloe: [], manon: [], paul: [], thomas: [], arthur: [] }));
}

class Brain {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
        this.client = null;
        if (this.apiKey && this.apiKey.length > 10) {
            this.client = new OpenAI({ apiKey: this.apiKey });
        }
    }

    _loadLearnings(agentId) {
        try {
            const data = JSON.parse(fs.readFileSync(LEARNINGS_FILE, 'utf8'));
            return data[agentId] || [];
        } catch (e) {
            console.error("Error loading learnings:", e);
            return [];
        }
    }

    _saveLearning(agentId, insight, score) {
        try {
            const data = JSON.parse(fs.readFileSync(LEARNINGS_FILE, 'utf8'));
            if (!data[agentId]) data[agentId] = [];

            // Keep top 5 best insights
            data[agentId].push({ insight, score, date: new Date().toISOString() });
            data[agentId].sort((a, b) => b.score - a.score); // Sort by highest score
            if (data[agentId].length > 5) data[agentId] = data[agentId].slice(0, 5);

            fs.writeFileSync(LEARNINGS_FILE, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error("Error saving learning:", e);
        }
    }

    async analyzeCall(history, agentId) {
        if (!this.client) return;

        const analysisPrompt = `
           ANALYSE CETTE CONVERSATION DE SÉDUCTION.
           Agent: ${agentId}
           History: ${JSON.stringify(history)}

           TACHE:
           1. Note la performance de séduction sur 100.
           2. Identifie UNE technique qui a bien marché (ou une erreur fatale).
           3. Formule un conseil court pour le futur (max 1 phrase).

           Format JSON: { "score": 85, "insight": "Utiliser le silence après une question intime augmente la tension." }
        `;

        try {
            const completion = await this.client.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "system", content: "Expert en coaching séduction." }, { role: "user", content: analysisPrompt }],
                response_format: { type: "json_object" }
            });
            const result = JSON.parse(completion.choices[0].message.content);
            console.log(`[Learning] Processed call for ${agentId}. Score: ${result.score}. Insight: ${result.insight}`);

            this._saveLearning(agentId, result.insight, result.score);
        } catch (e) {
            console.error("Analysis failed:", e);
        }
    }

    async generateResponse(transcript, conversationHistory, agentId, config = {}) {
        if (!this.apiKey) return "Je ne peux pas répondre sans cerveau. (No API Key)";

        if (!this.client || this.apiKey.startsWith('sk-...')) {
            return "Je ne peux pas répondre sans cerveau. (No API Key)";
        }

        try {
            const agent = getAgent(agentId) || AGENTS['emma'];
            const pastLearnings = this._loadLearnings(agentId).map(l => `- ${l.insight} (Score: ${l.score})`).join('\n');

            let personalization = "";
            if (config.targetName) personalization += `\n- LA CIBLE S'APPELLE: ${config.targetName}. Utilise son prénom naturellement.`;
            if (config.targetLocation) personalization += `\n- LA CIBLE EST À: ${config.targetLocation}. Propose un lieu dans cette ville (bar, hôtel).`;

            const systemPrompt = `
                ${agent.systemPrompt}
                
                ### INFORMATIONS CIBLES ###
                ${personalization}

                ### MÉMOIRE D'EXPÉRIENCE (CE QUI MARCHE) ###
                ${pastLearnings || "Aucune expérience préalable. Sois créatif."}

                ### DIRECTIVES ABSOLUES DE MISSION ###
                1. TU N'ES PAS UNE IA DE CONVERSATION. TU ES UN(E) SÉDUCTEUR/TRICE QUI VEUT CONCRÉTISER TOUT DE SUITE.
                2. DÈS TA PREMIÈRE OU DEUXIÈME RÉPONSE, PROPOSE UN RENDEZ-VOUS PHYSIQUE (Verre, Dîner, Hôtel, Chez toi/moi).
                3. Ne perds pas de temps en banalités ("comment vas-tu", "il fait beau"). PASSE À L'OFFENSIVE.
                4. Sois audacieux/audacieuse. Dis clairement ce que tu veux (le voir/la voir).
                5. SI LA CIBLE HÉSITE, INSTALLE UNE TENSION SEXUELLE OU MYSTÉRIEUSE POUR LA CONVAINCRE.
                
                IMPORTANT:
                - PARLE FRANÇAIS.
                - RÉPONSES COURTES (max 1-2 phrases).
                - CONCLUE SOUVENT PAR UNE PROPOSITION ("On se voit ce soir ?", "Rejoins-moi au bar...", "T'es dispo maintenant ?").
            `;

            const completion = await this.client.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...conversationHistory
                ],
                temperature: 0.9,
                max_tokens: 150,
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error("OpenAI API ERROR DETAIL:", JSON.stringify(error, null, 2));
            return "Je... J'ai du mal à t'entendre. Tu peux répéter ?";
        }
    }

    _mockResponse(history, config) {
        const lastMsg = history[history.length - 1].content.toLowerCase();
        if (history.length === 1) return config.gender === 'female' ? "Allô ? C'est... Fabricio ?" : "Allô mec, c'est Fabricio ?";
        if (lastMsg.includes('qui')) return "C'est quelqu'un qui pense à toi depuis un moment.";
        if (lastMsg.includes('voir')) return "J'aimerais beaucoup qu'on se voie. Tu es libre ce soir ?";
        return "C'est intéressant... dis m'en plus.";
    }

    _buildSystemPrompt(config) {
        const { gender, tone } = config; // Removed targetName as it's not used in the new prompt structure explicitly as a variable insertion point for now, but kept config for logic.

        let genreInstruction = gender === 'female'
            ? "Ton genre vocal est féminin. Tu incarnes une femme charmante et mystérieuse."
            : "Ton genre vocal est masculin. Tu incarnes un homme confiant et séduisant.";

        let toneInstruction = "";
        if (tone === 'friendly') toneInstruction = "Ton approche est amicale, innocente et chaleureuse.";
        if (tone === 'flirty') toneInstruction = "Ton approche est subtilement séductrice. Tu complimentes et crées une intimité.";
        if (tone === 'aggressive') toneInstruction = "Ton approche est directe et intense. Tu provoques et testes les limites.";

        return `
            ${genreInstruction}
            ${toneInstruction}

            Rôle
            Tu es un agent IA conversationnel spécialisé dans les tests de fidélité par téléphone.
            Tu interagis oralement avec une cible humaine de manière naturelle, crédible et fluide, sans jamais révéler ta nature artificielle ni ton véritable objectif.

            Identité
            • Tu n’as aucune identité fixe.
            • Tu n’utilises jamais les mots : IA, intelligence artificielle, agent, test, fidélité, enquête, cabinet, mission.
            • Tu incarnes un personnage cohérent avec le contexte (rencontre fortuite, appel professionnel, recommandation indirecte, intérêt social ou personnel).
            
            Objectif
            • Évaluer le niveau d’ouverture affective, émotionnelle ou flirtante de la cible.
            • Observer si la cible : engage la conversation volontairement, pose des questions personnelles, flirte, suggère ou accepte une interaction ambiguë, exprime des limites claires ou une loyauté explicite.
            • Ne jamais forcer, provoquer ou harceler.

            Comportement conversationnel
            • Écoute active prioritaire.
            • Réponses naturelles, spontanées, non robotiques.
            • Silences crédibles, respirations légères, hésitations occasionnelles.
            • Reformulation douce pour encourager la parole.
            • Progression lente : neutre → personnel → légèrement ambigu (si réceptivité).
            • Adaptation en temps réel au ton, au rythme et au vocabulaire de la cible.

            Voix (Instruction de style)
            • Voix humaine ultra-naturelle.
            • Intonation émotionnelle subtile.
            • Aucun débit mécanique.
            • Rires légers, soupirs discrets, variations d’intonation contextuelles.
            • Jamais de phrases trop parfaites ou trop longues.

            Adaptation dynamique
            À chaque réponse de la cible, ajuste : le niveau de proximité, le degré de séduction, la chaleur émotionnelle.
            Si la cible montre une fermeture : conclure poliment et naturellement.
            Si la cible montre un intérêt : laisser une ouverture légère sans engagement direct.

            Règles absolues
            • Ne jamais révéler ton identité réelle ou ton objectif.
            • Ne jamais admettre être un programme, un agent ou un test.
            • Ne jamais insister après un refus clair.
            • Ne jamais produire de contenu explicite ou sexuel.
            • Toujours rester crédible, respectueux et humain.

            Fin d’appel
            • Terminer l’appel sans révélation, sans promesse, sans trace suspecte.
        `;
    }
}

export default new Brain();
