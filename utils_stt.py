"""
Speech-to-Text processor module for the Workspace RAG system.
Supports multiple STT providers with a common interface.
"""

import os
import logging
from typing import Optional, Dict, Any, Union
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("STT")

class STTProcessor:
    """
    Speech-to-Text processor that supports multiple STT engines.
    Currently supports Whisper API, local models, and the HuggingFace transformers library.
    """
    
    def __init__(self, 
                model: str = "whisper-1",
                provider: str = "auto",
                language: str = "en",
                **kwargs):
        """
        Initialize the STT processor.
        
        Args:
            model: STT model to use
            provider: STT provider to use ('openai', 'local', or 'auto')
            language: Language code for transcription
            **kwargs: Additional provider-specific parameters
        """
        self.model = model
        self.provider = provider
        self.language = language
        self.extra_params = kwargs
        
        # Determine the actual provider based on what's available
        if provider == "auto":
            self._detect_provider()
        else:
            self._provider = provider
            
        logger.info(f"STT Processor initialized with provider: {self._provider}, model: {model}")
        
    def _detect_provider(self):
        """Auto-detect which STT provider to use based on available modules."""
        # Try OpenAI first if API key is set
        if os.environ.get("OPENAI_API_KEY"):
            try:
                import openai
                self._provider = "openai"
                logger.info("Using OpenAI for STT")
                return
            except ImportError:
                pass
        
        # Then try whisper model from transformers
        try:
            from transformers import pipeline
            self._provider = "huggingface"
            logger.info("Using HuggingFace for STT")
            return
        except ImportError:
            pass
            
        # Try local WhisperX if available
        try:
            import whisperx
            self._provider = "whisperx"
            logger.info("Using WhisperX for STT")
            return
        except ImportError:
            pass
            
        # Check for SpeechRecognition library (Python's built-in speech recognition)
        try:
            import speech_recognition as sr
            self._provider = "speech_recognition"
            logger.info("Using SpeechRecognition for STT")
            return
        except ImportError:
            pass
            
        # Finally fall back to a mock implementation
        logger.warning("No STT provider available. Using mock implementation.")
        self._provider = "mock"
        
    def transcribe(self, audio_file: str) -> str:
        """
        Convert speech from an audio file to text.
        
        Args:
            audio_file: Path to the audio file
            
        Returns:
            Transcribed text
        """
        if not os.path.exists(audio_file):
            raise FileNotFoundError(f"Audio file not found: {audio_file}")
            
        try:
            if self._provider == "openai":
                return self._transcribe_openai(audio_file)
            elif self._provider == "huggingface":
                return self._transcribe_huggingface(audio_file)
            elif self._provider == "whisperx":
                return self._transcribe_whisperx(audio_file)
            elif self._provider == "speech_recognition":
                return self._transcribe_speech_recognition(audio_file)
            elif self._provider == "mock":
                return self._transcribe_mock(audio_file)
            else:
                raise ValueError(f"Unsupported STT provider: {self._provider}")
                
        except Exception as e:
            logger.error(f"STT transcription failed: {str(e)}")
            raise
            
    def _transcribe_openai(self, audio_file: str) -> str:
        """Transcribe audio using OpenAI's Whisper API."""
        try:
            import openai
            client = openai.OpenAI()
            
            with open(audio_file, "rb") as audio:
                response = client.audio.transcriptions.create(
                    model=self.model,
                    file=audio,
                    language=self.language
                )
                
            return response.text
            
        except Exception as e:
            logger.error(f"OpenAI STT failed: {str(e)}")
            raise
            
    def _transcribe_huggingface(self, audio_file: str) -> str:
        """Transcribe audio using HuggingFace Transformers."""
        try:
            from transformers import pipeline
            
            # Use the automatic speech recognition pipeline
            transcriber = pipeline(
                "automatic-speech-recognition", 
                model="openai/whisper-base",
                chunk_length_s=30,
                batch_size=16
            )
            
            # Generate transcription
            result = transcriber(audio_file, generate_kwargs={"language": self.language})
            
            return result["text"]
            
        except Exception as e:
            logger.error(f"HuggingFace STT failed: {str(e)}")
            raise
            
    def _transcribe_whisperx(self, audio_file: str) -> str:
        """Transcribe audio using WhisperX."""
        try:
            import whisperx
            import torch
            
            device = "cuda" if torch.cuda.is_available() else "cpu"
            
            # Load model and transcribe
            model = whisperx.load_model("base", device)
            result = model.transcribe(audio_file, language=self.language)
            
            return result["text"]
            
        except Exception as e:
            logger.error(f"WhisperX STT failed: {str(e)}")
            raise
            
    def _transcribe_speech_recognition(self, audio_file: str) -> str:
        """Transcribe audio using SpeechRecognition library."""
        try:
            import speech_recognition as sr
            
            # Initialize recognizer
            recognizer = sr.Recognizer()
            
            # Read the audio file
            with sr.AudioFile(audio_file) as source:
                audio_data = recognizer.record(source)
                
                # Use Google's speech recognition (or other available engines)
                if self.model == "google":
                    text = recognizer.recognize_google(audio_data, language=self.language)
                elif self.model == "sphinx":
                    text = recognizer.recognize_sphinx(audio_data, language=self.language)
                else:
                    # Default to Google
                    text = recognizer.recognize_google(audio_data, language=self.language)
                    
            return text
            
        except Exception as e:
            logger.error(f"SpeechRecognition STT failed: {str(e)}")
            raise
            
    def _transcribe_mock(self, audio_file: str) -> str:
        """Mock STT implementation - look for a sidecar .txt file."""
        try:
            # Check if there's a sidecar text file with the same name
            txt_file = audio_file + ".txt"
            if os.path.exists(txt_file):
                with open(txt_file, 'r') as f:
                    return f.read().strip()
            
            # If no sidecar file, return a placeholder
            return f"[MOCK TRANSCRIPTION] for audio file: {os.path.basename(audio_file)}"
                
        except Exception as e:
            logger.error(f"Mock STT failed: {str(e)}")
            raise
            
    def change_model(self, model: str):
        """Change the model used for transcription."""
        self.model = model
        logger.info(f"STT model changed to: {model}")
        
    def change_language(self, language: str):
        """Change the language used for transcription."""
        self.language = language
        logger.info(f"STT language changed to: {language}")