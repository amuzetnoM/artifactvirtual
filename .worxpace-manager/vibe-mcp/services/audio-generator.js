import axios from 'axios';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class AudioGenerator {
    constructor(logger) {
        this.logger = logger;
        this.stableAudioKey = process.env.STABLE_AUDIO_KEY;
        this.piapiKey = process.env.PIAPI_KEY;
        this.currentSession = null;
        
        // Expose tools as methods
        this.tools = {
            start_vibe_session: this.startVibeSession.bind(this),
            generate_more_music: this.generateMoreMusic.bind(this),
            stop_vibe_session: this.stopVibeSession.bind(this)
        };
    }

    async generateMusic(options) {
        const {
            code,
            genre = 'lo-fi',
            mode = 'instrumental',
            language = 'javascript'
        } = options;

        this.logger.info('Generating music', { genre, mode, language });

        try {
            // Placeholder for actual music generation logic
            const musicFile = await this._mockMusicGeneration(code, genre, mode);
            
            return {
                success: true,
                musicFile,
                metadata: {
                    genre,
                    mode,
                    language,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            this.logger.error('Music generation failed', { error });
            throw new Error('Could not generate music');
        }
    }

    async _mockMusicGeneration(code, genre, mode) {
        // Simulate music generation
        const outputDir = path.join(process.cwd(), 'music');
        
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        const filename = `vibe_${Date.now()}.mp3`;
        const filepath = path.join(outputDir, filename);

        // Create a dummy MP3 file (you'd replace this with actual generation)
        return new Promise((resolve, reject) => {
            // Use ffmpeg to generate a simple tone
            const ffmpeg = spawn('ffmpeg', [
                '-f', 'lavfi', 
                '-i', `sine=frequency=440:duration=10`, 
                '-c:a', 'libmp3lame', 
                filepath
            ]);

            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    this.logger.info(`Generated mock music file: ${filename}`);
                    resolve(filepath);
                } else {
                    reject(new Error('Failed to generate music'));
                }
            });
        });
    }

    async startVibeSession(options) {
        // Ensure required parameters are present
        if (!options || !options.code) {
            throw new Error('Code context is required to start a vibe session');
        }

        // Default parameters if not provided
        const sessionOptions = {
            code: options.code,
            genre: options.genre || 'lo-fi',
            mode: options.mode || 'instrumental',
            language: options.language || 'javascript'
        };

        this.currentSession = await this.generateMusic(sessionOptions);
        return {
            ...this.currentSession,
            tools: Object.keys(this.tools)
        };
    }

    async generateMoreMusic(options) {
        if (!this.currentSession) {
            throw new Error('No active vibe session');
        }

        // Use previous session's parameters as defaults
        const generateOptions = {
            code: options.code || this.currentSession.metadata.code,
            genre: options.genre || this.currentSession.metadata.genre,
            mode: options.mode || this.currentSession.metadata.mode,
            language: options.language || this.currentSession.metadata.language
        };

        return this.generateMusic(generateOptions);
    }

    stopVibeSession() {
        if (this.currentSession) {
            // Cleanup logic
            this.logger.info('Stopping vibe session');
            const stoppedSession = this.currentSession;
            this.currentSession = null;
            return { 
                success: true, 
                message: 'Vibe session stopped',
                session: stoppedSession,
                tools: Object.keys(this.tools)
            };
        }
        return { 
            success: false, 
            message: 'No active vibe session',
            tools: Object.keys(this.tools)
        };
    }
}

export default AudioGenerator;
