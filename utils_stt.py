"""
Speech-to-Text processor module for the Workspace RAG system.
Supports multiple STT providers with a common interface.
Prioritizes open-source, locally-run solutions for sovereignty.
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
    Prioritizes open-source solutions like Whisper, HuggingFace models, and local STT libraries.
    """
    
    def __init__(self, 
                model: str = "openai/whisper-base",  # Note: This is the HF model name, not using OpenAI API
                provider: str = "auto",
                language: str = "en",
                **kwargs):
        """
        Initialize the STT processor.
        
        Args:
            model: STT model to use
            provider: STT provider to use ('huggingface', 'whisperx', 'speech_recognition', 'local', or 'auto')
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
        # Try whisper model from transformers first (HuggingFace)
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
            
        # Try Faster Whisper
        try:
            from faster_whisper import WhisperModel
            self._provider = "faster_whisper"
            logger.info("Using Faster Whisper for STT")
            return
        except ImportError:
            pass
            
        # Check for SpeechRecognition library
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
            if self._provider == "huggingface":
                return self._transcribe_huggingface(audio_file)
            elif self._provider == "whisperx":
                return self._transcribe_whisperx(audio_file)
            elif self._provider == "faster_whisper":
                return self._transcribe_faster_whisper(audio_file)
            elif self._provider == "speech_recognition":
                return self._transcribe_speech_recognition(audio_file)
            elif self._provider == "mock":
                return self._transcribe_mock(audio_file)
            else:
                raise ValueError(f"Unsupported STT provider: {self._provider}")
                
        except Exception as e:
            logger.error(f"STT transcription failed: {str(e)}")
            raise
            
    def _transcribe_huggingface(self, audio_file: str) -> str:
        """Transcribe audio using HuggingFace Transformers."""
        try:
            from transformers import pipeline
            
            # Use the automatic speech recognition pipeline
            transcriber = pipeline(
                "automatic-speech-recognition", 
                model=self.model,
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
            
    def _transcribe_faster_whisper(self, audio_file: str) -> str:
        """Transcribe audio using Faster Whisper."""
        try:
            from faster_whisper import WhisperModel
            
            # Use appropriate device
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"
            compute_type = "float16" if device == "cuda" else "int8"
            
            # Load model
            model_size = "base"  # Can be tiny, base, small, medium, large
            model = WhisperModel(model_size, device=device, compute_type=compute_type)
            
            # Transcribe
            segments, info = model.transcribe(
                audio_file,
                language=self.language,
                vad_filter=True
            )
            
            # Combine segments
            transcript = " ".join([segment.text for segment in segments])
            
            return transcript
            
        except Exception as e:
            logger.error(f"Faster Whisper STT failed: {str(e)}")
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