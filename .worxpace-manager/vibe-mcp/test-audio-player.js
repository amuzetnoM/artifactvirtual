import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Generate a test audio file using ffmpeg
function generateTestAudio(outputPath) {
    // Use the absolute path to the FFmpeg binary
    const ffmpegPath = 'q:\\artifactvirtual\\.worxpace-manager\\vibe-mcp\\ffmpeg\\bin\\ffmpeg.exe';
    
    return new Promise((resolve, reject) => {
        // Check if ffmpeg exists at the expected path
        if (!fs.existsSync(ffmpegPath)) {
            console.error(`FFmpeg not found at: ${ffmpegPath}`);
            reject(new Error('FFmpeg binary not found'));
            return;
        }
        
        console.log(`Using FFmpeg binary: ${ffmpegPath}`);
        
        const ffmpeg = spawn(ffmpegPath, [
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
    // Import the audioPlayer from the compiled build directory instead of src
    const { audioPlayer } = await import('./build/playback.js');

    try {
        // Ensure music directory exists in the vibe-mcp project
        const musicDir = 'q:\\artifactvirtual\\.worxpace-manager\\vibe-mcp\\music';
        if (!fs.existsSync(musicDir)) {
            fs.mkdirSync(musicDir, { recursive: true });
        }

        // Generate a test audio file
        const audioFilePath = path.join(musicDir, `test_audio_${Date.now()}.mp3`);
        
        console.log(`Generating test audio file at: ${audioFilePath}`);
        await generateTestAudio(audioFilePath);
        
        // Format the URL correctly for Windows
        // Windows paths need special handling for file:// URLs
        const fileUrl = `file:///${audioFilePath.replace(/\\/g, '/').replace(/:/g, '%3A')}`;
        
        console.log(`Playing audio file: ${fileUrl}`);
        // Play the audio with the audioPlayer from playback.js
        await audioPlayer.play(fileUrl, true);
        
        console.log('Audio playback started. Press Ctrl+C to stop.');

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testAudioPlayer();
