import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import EventEmitter from 'events';

export class AudioPlayer extends EventEmitter {
    private platform: string;
    private currentProcess: ReturnType<typeof spawn> | null = null;
    private isPlaying: boolean = false;

    constructor() {
        super();
        this.platform = os.platform();
    }

    /**
     * Play audio file using platform-specific method
     * @param filePath Path to the audio file
     */
    playAudio(filePath: string): void {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Audio file not found: ${filePath}`);
        }

        switch (this.platform) {
            case 'win32':
                this.playOnWindows(filePath);
                break;
            case 'darwin':
                this.playOnMac(filePath);
                break;
            case 'linux':
                this.playOnLinux(filePath);
                break;
            default:
                throw new Error(`Unsupported platform: ${this.platform}`);
        }
    }

    /**
     * Play audio on Windows using PowerShell
     * @param filePath Path to the audio file
     */
    private playOnWindows(filePath: string): void {
        try {
            execSync(`powershell -c "(New-Object Media.SoundPlayer '${filePath}').PlaySync()"`, 
                { stdio: 'ignore' }
            );
        } catch (error) {
            console.error('Failed to play audio on Windows:', error);
        }
    }

    /**
     * Play audio on macOS using afplay
     * @param filePath Path to the audio file
     */
    private playOnMac(filePath: string): void {
        try {
            spawn('afplay', [filePath], { stdio: 'ignore' });
        } catch (error) {
            console.error('Failed to play audio on macOS:', error);
        }
    }

    /**
     * Play audio on Linux using aplay
     * @param filePath Path to the audio file
     */
    private playOnLinux(filePath: string): void {
        try {
            spawn('aplay', [filePath], { stdio: 'ignore' });
        } catch (error) {
            console.error('Failed to play audio on Linux:', error);
        }
    }

    /**
     * Stop all audio playback
     */
    stopAudio(): void {
        switch (this.platform) {
            case 'win32':
                try {
                    execSync('taskkill /F /IM wmplayer.exe', { stdio: 'ignore' });
                } catch {}
                break;
            case 'darwin':
                try {
                    execSync('killall afplay', { stdio: 'ignore' });
                } catch {}
                break;
            case 'linux':
                try {
                    execSync('killall aplay', { stdio: 'ignore' });
                } catch {}
                break;
        }
    }
}

export interface AudioConfig {
    filePath: string;
    volume?: number;
    fadeIn?: boolean;
    fadeOut?: boolean;
}

export const audioPlayer = new AudioPlayer();
