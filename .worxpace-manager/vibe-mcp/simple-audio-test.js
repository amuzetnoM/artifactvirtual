import fs from 'fs';
import path from 'path';

// Simple script to test audio playback with an existing file
async function testSimpleAudio() {
    try {
        // Import the audioPlayer module
        const { audioPlayer } = await import('./build/playback.js');
        
        // Check if music directory exists and has files
        const musicDir = 'q:\\artifactvirtual\\.worxpace-manager\\vibe-mcp\\music';
        if (!fs.existsSync(musicDir)) {
            console.log('Music directory does not exist. Creating it...');
            fs.mkdirSync(musicDir, { recursive: true });
        }
        
        // List files in the music directory
        const files = fs.readdirSync(musicDir);
        console.log('Files in music directory:', files);
        
        if (files.length === 0) {
            console.log('No audio files found in music directory.');
            return;
        }
        
        // Use the first MP3 file found in the music directory
        const mp3Files = files.filter(file => file.endsWith('.mp3'));
        if (mp3Files.length === 0) {
            console.log('No MP3 files found in music directory.');
            return;
        }
        
        const audioFile = path.join(musicDir, mp3Files[0]);
        console.log(`Using audio file: ${audioFile}`);
        
        // Try different URL formats
        // Format 1: Regular path
        console.log('Trying to play with regular path...');
        try {
            await audioPlayer.play(audioFile, true);
            console.log('Playback started with regular path');
        } catch (error) {
            console.log('Error with regular path:', error.message);
        }
        
        // Format 2: file:// URL with proper formatting
        try {
            // Format for file:// URL on Windows
            const fileUrl = new URL(`file://${audioFile.replace(/\\/g, '/')}`);
            console.log(`Trying to play with URL: ${fileUrl}`);
            await audioPlayer.play(fileUrl.href, true);
            console.log('Playback started with URL');
        } catch (error) {
            console.log('Error with URL:', error.message);
        }
        
        console.log('Test complete. Check if you heard any audio.');
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testSimpleAudio();