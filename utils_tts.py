"""
Text-to-Speech processor module for the Workspace RAG system.
Supports multiple TTS providers with a common interface.
"""

import os
import logging
from typing import Optional, Dict, Any, Union
from pathlib import Path
import uuid

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TTS")

class TTSProcessor:
    """
    Text-to-Speech processor that supports multiple TTS engines.
    Currently supports OpenAI TTS API and local models through various frameworks.
    """
    
    def __init__(self, 
                model: str = "tts-1", 
                voice: str = "alloy",
                output_dir: str = "./audio_output",
                provider: str = "auto",
                **kwargs):
        """
        Initialize the TTS processor.
        
        Args:
            model: TTS model to use
            voice: Voice to use for synthesis
            output_dir: Directory to save audio files
            provider: TTS provider to use ('openai', 'local', or 'auto')
            **kwargs: Additional provider-specific parameters
        """
        self.model = model
        self.voice = voice
        self.output_dir = output_dir
        self.provider = provider
        self.extra_params = kwargs
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Determine the actual provider based on what's available
        if provider == "auto":
            self._detect_provider()
        else:
            self._provider = provider
            
        logger.info(f"TTS Processor initialized with provider: {self._provider}, model: {model}, voice: {voice}")
        
    def _detect_provider(self):
        """Auto-detect which TTS provider to use based on available modules."""
        # Try OpenAI first if API key is set
        if os.environ.get("OPENAI_API_KEY"):
            try:
                import openai
                self._provider = "openai"
                logger.info("Using OpenAI for TTS")
                return
            except ImportError:
                pass
        
        # Then try local TorchAudio/HuggingFace TTS
        try:
            import torch
            import torchaudio
            self._provider = "torch"
            logger.info("Using TorchAudio for TTS")
            return
        except ImportError:
            pass
            
        # Try HuggingFace TTS directly
        try:
            from transformers import pipeline
            self._provider = "huggingface"
            logger.info("Using HuggingFace for TTS")
            return
        except ImportError:
            pass
            
        # Finally fall back to a mock implementation
        logger.warning("No TTS provider available. Using mock implementation.")
        self._provider = "mock"
        
    def synthesize(self, text: str, output_file: Optional[str] = None) -> str:
        """
        Convert text to speech and save to an audio file.
        
        Args:
            text: The text to convert to speech
            output_file: Optional output file path, if not provided a random filename is generated
            
        Returns:
            Path to the generated audio file
        """
        if not output_file:
            output_file = os.path.join(self.output_dir, f"tts_{uuid.uuid4()}.mp3")
            
        # Create any necessary parent directories
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        try:
            if self._provider == "openai":
                self._synthesize_openai(text, output_file)
            elif self._provider == "torch":
                self._synthesize_torch(text, output_file)
            elif self._provider == "huggingface":
                self._synthesize_huggingface(text, output_file)
            elif self._provider == "mock":
                self._synthesize_mock(text, output_file)
            else:
                raise ValueError(f"Unsupported TTS provider: {self._provider}")
                
            logger.info(f"Synthesized text to {output_file}")
            return output_file
            
        except Exception as e:
            logger.error(f"TTS synthesis failed: {str(e)}")
            raise
            
    def _synthesize_openai(self, text: str, output_file: str):
        """Synthesize speech using OpenAI's TTS API."""
        try:
            import openai
            client = openai.OpenAI()
            
            response = client.audio.speech.create(
                model=self.model,
                voice=self.voice,
                input=text
            )
            
            response.stream_to_file(output_file)
            
        except Exception as e:
            logger.error(f"OpenAI TTS failed: {str(e)}")
            raise
            
    def _synthesize_torch(self, text: str, output_file: str):
        """Synthesize speech using TorchAudio."""
        try:
            import torch
            import torchaudio
            from torchaudio.pipelines import TACOTRON2_WAVERNN_PHONE_LJSPEECH
            
            # Use default TTS model
            device = "cuda" if torch.cuda.is_available() else "cpu"
            bundle = TACOTRON2_WAVERNN_PHONE_LJSPEECH
            model = bundle.get_model().to(device)
            
            # Process text and generate audio
            with torch.no_grad():
                processed_text = bundle.get_text_processor()(text)
                waveform, sample_rate = model(processed_text)
            
            # Save as audio file
            torchaudio.save(output_file, waveform, sample_rate)
            
        except Exception as e:
            logger.error(f"TorchAudio TTS failed: {str(e)}")
            raise
            
    def _synthesize_huggingface(self, text: str, output_file: str):
        """Synthesize speech using HuggingFace Transformers."""
        try:
            from transformers import pipeline
            import soundfile as sf
            
            # Use the TTS pipeline
            synthesizer = pipeline("text-to-speech", model="facebook/mms-tts-eng")
            
            # Generate speech and save to file
            speech = synthesizer(text, forward_params={"vocoder_kwargs": {"fine_tuning": True}})
            sf.write(output_file, speech["audio"], samplerate=speech["sampling_rate"])
            
        except Exception as e:
            logger.error(f"HuggingFace TTS failed: {str(e)}")
            raise
            
    def _synthesize_mock(self, text: str, output_file: str):
        """Mock TTS implementation that just writes the text to a file."""
        try:
            # Just create an empty audio file and write the text to a sidecar txt file
            with open(output_file, 'w') as f:
                f.write("MOCK_AUDIO_FILE")
                
            with open(f"{output_file}.txt", 'w') as f:
                f.write(text)
                
        except Exception as e:
            logger.error(f"Mock TTS failed: {str(e)}")
            raise
            
    def change_voice(self, voice: str):
        """Change the voice used for synthesis."""
        self.voice = voice
        logger.info(f"TTS voice changed to: {voice}")
        
    def change_model(self, model: str):
        """Change the model used for synthesis."""
        self.model = model
        logger.info(f"TTS model changed to: {model}")