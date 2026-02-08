
import fs from 'fs';
import path from 'path';

class VoiceService {
    constructor() {
        this.apiKey = process.env.ELEVENLABS_API_KEY;
        this.voiceIdFemale = process.env.ELEVENLABS_VOICE_ID_FEMALE || '21m00Tcm4TlvDq8ikWAM';
        this.voiceIdMale = process.env.ELEVENLABS_VOICE_ID_MALE || 'ErXwobaYiN019PkySvjV';
    }

    async maximizeVocalFidelity(text, voiceId) {
        try {
            // Use provided voiceId, or fallback to default female/male from env if not provided
            const targetVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID_FEMALE;

            console.log(`[VoiceService] Generating audio with voice: ${targetVoiceId}`);

            if (!this.apiKey || this.apiKey.startsWith('xi-...')) {
                console.warn("[VoiceService] No valid API Key. Returning null (Client will handle silence).");
                return null;
            }

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}/stream`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    model_id: "eleven_multilingual_v2", // Better for consistency than turbo
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                }),
            });

            if (!response.ok) {
                let errorDetails = response.statusText;
                try {
                    const errorJson = await response.json();
                    errorDetails = JSON.stringify(errorJson);
                } catch (e) {
                    try {
                        errorDetails = await response.text();
                    } catch (e2) { }
                }
                console.error(`[VoiceService] API responded with ${response.status}: ${errorDetails}`);
                throw new Error(`ElevenLabs API Error: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (error) {
            console.error("[VoiceService] GENERATION FAILED:", error);
            return null;
        }
    }
}

export default new VoiceService();
