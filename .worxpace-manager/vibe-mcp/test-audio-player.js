import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Generate a test audio file using ffmpeg
function generateTestAudio(outputPath) {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
            '-f', 'lavfi', 
            '-i', 'sine=frequency=440:duration=10', 
            '-c:a', 'libmp3lame', 
            outputPath
        ]);

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                console.log(`Generated test audio: ${outputPath}`);
                resolve(outputPath);
            } else {
                reject(new Error('Failed to generate audio'));
            }
        });

        ffmpeg.stderr.on('data', (data) => {
            console.error(`FFmpeg stderr: ${data}`);
        });
    });
}

// Main function to test audio player
async function testAudioPlayer() {
    const { audioPlayer } = await import('./src/audio-player.js');

    // Set up event listeners
    audioPlayer.on('playbackStart', (config) => {
        console.log('🎵 Playback started:', config);
    });

    audioPlayer.on('playbackEnd', () => {
        console.log('🏁 Playback finished');
    });

    audioPlayer.on('playbackError', (error) => {
        console.error('❌ Playback error:', error);
    });

    try {
        // Generate a test audio file
        const musicDir = path.join(process.cwd(), 'music');
        const audioFilePath = path.join(musicDir, `test_audio_${Date.now()}.mp3`);
        
        await generateTestAudio(audioFilePath);

        // Play the audio
        await audioPlayer.play({
            filePath: audioFilePath,
            volume: 0.5,
            fadeIn: true
        });

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testAudioPlayer();
