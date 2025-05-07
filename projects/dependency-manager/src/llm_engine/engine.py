"""
LLM engine implementation for dependency manager.

This module provides integration with local language models for analyzing
dependencies and making recommendations for improvements. It uses efficient
caching to avoid redundant AI calls and conserve resources.
"""

import os
import json
import time
import hashlib
import sqlite3
import logging
import asyncio
from typing import Dict, List, Any, Optional, Tuple, Union

logger = logging.getLogger(__name__)

class LLMEngine:
    """
    Local Language Model engine for dependency analysis.
    
    This class provides AI-powered analysis of software dependencies
    using a locally running language model with efficient caching.
    
    Attributes:
        model_path: Path or identifier for the language model to use
        quantization: Quantization level for the model
        cache_db_path: Path to the cache database
        model: The loaded language model instance (lazy-loaded)
    """
    
    def __init__(
        self,
        model_path: str = "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        quantization: str = "q4_k_m",
        cache_db_path: Optional[str] = None
    ):
        """
        Initialize the LLM engine.
        
        Args:
            model_path: Path or identifier for the language model to use
            quantization: Quantization level for the model
            cache_db_path: Path to the cache database (defaults to data dir)
        """
        self.model_path = model_path
        self.quantization = quantization
        
        # Determine cache path
        if cache_db_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            cache_db_path = os.path.join(base_dir, "data", "llm_cache.db")
        
        self.cache_db_path = cache_db_path
        
        # The model will be loaded lazily when needed
        self.model = None
        
        # Initialize cache
        self._init_cache()
    
    def _init_cache(self):
        """Initialize the cache database."""
        os.makedirs(os.path.dirname(self.cache_db_path), exist_ok=True)
        
        conn = sqlite3.connect(self.cache_db_path)
        cursor = conn.cursor()
        
        # Create cache table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS llm_cache (
            query_hash TEXT PRIMARY KEY,
            query TEXT NOT NULL,
            response TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        )
        """)
        
        # Create index for faster lookups
        cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_query_hash ON llm_cache(query_hash)
        """)
        
        conn.commit()
        conn.close()
        
        logger.debug(f"LLM cache initialized at {self.cache_db_path}")
    
    async def _load_model(self):
        """Load the language model if not already loaded."""
        if self.model is not None:
            return
        
        logger.info(f"Loading language model {self.model_path} with {self.quantization} quantization")
        
        try:
            # We'll use a try-except block with imports inside to make the
            # dependency optional - this way the service can still run without
            # the LLM components if needed
            
            try:
                from transformers import AutoModelForCausalLM, AutoTokenizer
                import torch
            except ImportError:
                logger.error("Required packages not found: transformers, torch")
                logger.error("To use LLM features, install with: pip install transformers torch")
                return
            
            # Load tokenizer and model
            tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            
            # Determine the appropriate device
            device = "cuda" if torch.cuda.is_available() else "cpu"
            
            # Load model with quantization if specified
            if self.quantization and device == "cpu":
                try:
                    # Try to load with bitsandbytes quantization
                    model = AutoModelForCausalLM.from_pretrained(
                        self.model_path,
                        torch_dtype=torch.float16,
                        load_in_8bit=True if self.quantization == "8bit" else False,
                        load_in_4bit=True if self.quantization == "4bit" else False,
                        device_map="auto"
                    )
                except ImportError:
                    logger.warning("bitsandbytes not available, loading model without quantization")
                    model = AutoModelForCausalLM.from_pretrained(
                        self.model_path,
                        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
                        device_map="auto"
                    )
            else:
                # Load the model normally
                model = AutoModelForCausalLM.from_pretrained(
                    self.model_path,
                    torch_dtype=torch.float16 if device == "cuda" else torch.float32,
                    device_map="auto"
                )
            
            self.model = {
                "tokenizer": tokenizer,
                "model": model,
                "device": device
            }
            
            logger.info(f"Model loaded successfully on {device}")
            
        except Exception as e:
            logger.error(f"Error loading language model: {e}")
            logger.exception(e)
            raise
    
    async def _generate_text(self, prompt: str) -> str:
        """
        Generate text using the loaded model.
        
        Args:
            prompt: The prompt to send to the model
            
        Returns:
            Generated text response
        """
        if self.model is None:
            await self._load_model()
            
        if self.model is None:
            logger.error("Unable to generate text: model not loaded")
            return "ERROR: Model not available"
        
        try:
            # Extract model components
            tokenizer = self.model["tokenizer"]
            model = self.model["model"]
            
            # Generate text
            inputs = tokenizer(prompt, return_tensors="pt")
            inputs = {k: v.to(self.model["device"]) for k, v in inputs.items()}
            
            # Generate with a reasonable temperature for creative but focused results
            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_length=2048,  # Adjust based on needs
                    temperature=0.7,
                    top_p=0.9,
                    num_return_sequences=1
                )
            
            # Decode and return the generated text
            generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Remove the original prompt if it appears at the beginning
            if generated_text.startswith(prompt):
                generated_text = generated_text[len(prompt):].lstrip()
            
            return generated_text
            
        except Exception as e:
            logger.error(f"Error generating text: {e}")
            logger.exception(e)
            return f"ERROR: {str(e)}"
    
    def _hash_query(self, query: str) -> str:
        """
        Create a hash for a query string.
        
        Args:
            query: The query string to hash
            
        Returns:
            Hash string
        """
        return hashlib.sha256(query.encode('utf-8')).hexdigest()
    
    async def _get_cached_response(self, query: str) -> Optional[str]:
        """
        Get a cached response for a query.
        
        Args:
            query: The query string
            
        Returns:
            Cached response or None if not found
        """
        query_hash = self._hash_query(query)
        
        try:
            conn = sqlite3.connect(self.cache_db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT response FROM llm_cache WHERE query_hash = ?",
                (query_hash,)
            )
            
            row = cursor.fetchone()
            conn.close()
            
            if row:
                logger.debug("Cache hit")
                return row[0]
            
            logger.debug("Cache miss")
            return None
            
        except Exception as e:
            logger.error(f"Error accessing cache: {e}")
            return None
    
    async def _cache_response(self, query: str, response: str):
        """
        Cache a response for a query.
        
        Args:
            query: The query string
            response: The response to cache
        """
        query_hash = self._hash_query(query)
        
        try:
            conn = sqlite3.connect(self.cache_db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                """
                INSERT OR REPLACE INTO llm_cache 
                    (query_hash, query, response, timestamp) 
                VALUES (?, ?, ?, ?)
                """,
                (query_hash, query, response, int(time.time()))
            )
            
            conn.commit()
            conn.close()
            logger.debug("Response cached")
            
        except Exception as e:
            logger.error(f"Error caching response: {e}")
    
    async def query_with_cache(self, prompt: str) -> str:
        """
        Query the language model with caching.
        
        Args:
            prompt: The prompt to send to the model
            
        Returns:
            Generated text response
        """
        # Check cache first
        cached = await self._get_cached_response(prompt)
        if cached:
            return cached
        
        # Generate new response if not cached
        response = await self._generate_text(prompt)
        
        # Cache the response
        await self._cache_response(prompt, response)
        
        return response
    
    async def analyze_dependencies(
        self,
        dependencies: List[Dict[str, Any]],
        file_content: str,
        language: str
    ) -> Dict[str, Any]:
        """
        Analyze dependencies using the language model.
        
        Args:
            dependencies: List of dependencies with installation results
            file_content: Content of the dependency file (requirements.txt, package.json, etc.)
            language: Programming language ('python', 'javascript', 'rust', etc.)
            
        Returns:
            Dictionary with analysis results
        """
        # Build prompt based on language and dependencies
        if language == "python":
            prompt = self._build_python_prompt(dependencies, file_content)
        elif language == "javascript":
            prompt = self._build_javascript_prompt(dependencies, file_content)
        elif language == "rust":
            prompt = self._build_rust_prompt(dependencies, file_content)
        else:
            logger.warning(f"Unsupported language for dependency analysis: {language}")
            return {}
        
        # Query the model
        response = await self.query_with_cache(prompt)
        
        # Parse the response to extract structured information
        try:
            return self._parse_analysis_response(response, language)
        except Exception as e:
            logger.error(f"Error parsing analysis response: {e}")
            logger.exception(e)
            return {}
    
    def _build_python_prompt(self, dependencies: List[Dict[str, Any]], file_content: str) -> str:
        """
        Build a prompt for Python dependencies.
        
        Args:
            dependencies: List of dependencies with installation results
            file_content: Content of the requirements.txt file
            
        Returns:
            Prompt string
        """
        # Extract dependency names and versions
        dep_list = []
        for dep in dependencies:
            name = dep.get("name", "")
            version = dep.get("version", "")
            
            if version:
                dep_list.append(f"{name}=={version}")
            else:
                dep_list.append(name)
        
        # Build the prompt
        prompt = f"""
You are an expert on Python dependencies and package management.
Please analyze the following requirements.txt content and installed packages.
Based on this information, identify:

1. Any missing dependencies that should be added
2. Any outdated dependencies that should be updated
3. Any potential security issues in the dependencies
4. Any compatibility issues between packages

Requirements file content:
```
{file_content}
```

Installed packages:
{", ".join(dep_list)}

Format your response as JSON with the following structure:
```json
{{
  "missing_dependencies": [
    {{"name": "package_name", "reason": "explanation"}}
  ],
  "updates": [
    {{"name": "package_name", "current": "current_version", "recommended": "new_version", "reason": "explanation"}}
  ],
  "security_issues": [
    {{"name": "package_name", "description": "issue_description", "severity": "high/medium/low"}}
  ],
  "compatibility_issues": [
    {{"packages": ["package1", "package2"], "description": "issue_description"}}
  ]
}}
```

Your JSON response:
        """.strip()
        
        return prompt
    
    def _build_javascript_prompt(self, dependencies: List[Dict[str, Any]], file_content: str) -> str:
        """
        Build a prompt for JavaScript dependencies.
        
        Args:
            dependencies: List of dependencies with installation results
            file_content: Content of the package.json file
            
        Returns:
            Prompt string
        """
        # Extract dependency names and versions
        dep_list = []
        for dep in dependencies:
            name = dep.get("name", "")
            version = dep.get("version", "")
            is_dev = dep.get("dev", False)
            
            if version:
                dep_list.append(f"{name}@{version}" + (" (dev)" if is_dev else ""))
            else:
                dep_list.append(name + (" (dev)" if is_dev else ""))
        
        # Build the prompt
        prompt = f"""
You are an expert on JavaScript/Node.js dependencies and npm package management.
Please analyze the following package.json content and installed packages.
Based on this information, identify:

1. Any missing dependencies that should be added
2. Any outdated dependencies that should be updated
3. Any potential security issues in the dependencies
4. Any compatibility issues between packages

Package.json content:
```
{file_content}
```

Installed packages:
{", ".join(dep_list)}

Format your response as JSON with the following structure:
```json
{{
  "missing_dependencies": [
    {{"name": "package_name", "reason": "explanation", "dev": true/false}}
  ],
  "updates": [
    {{"name": "package_name", "current": "current_version", "recommended": "new_version", "reason": "explanation"}}
  ],
  "security_issues": [
    {{"name": "package_name", "description": "issue_description", "severity": "high/medium/low"}}
  ],
  "compatibility_issues": [
    {{"packages": ["package1", "package2"], "description": "issue_description"}}
  ]
}}
```

Your JSON response:
        """.strip()
        
        return prompt
    
    def _build_rust_prompt(self, dependencies: List[Dict[str, Any]], file_content: str) -> str:
        """
        Build a prompt for Rust dependencies.
        
        Args:
            dependencies: List of dependencies with installation results
            file_content: Content of the Cargo.toml file
            
        Returns:
            Prompt string
        """
        # Extract dependency names and versions
        dep_list = []
        for dep in dependencies:
            name = dep.get("name", "")
            version = dep.get("version", "")
            is_dev = dep.get("dev", False)
            
            if version:
                dep_list.append(f"{name} = {version}" + (" (dev)" if is_dev else ""))
            else:
                dep_list.append(name + (" (dev)" if is_dev else ""))
        
        # Build the prompt
        prompt = f"""
You are an expert on Rust dependencies and cargo package management.
Please analyze the following Cargo.toml content and installed crates.
Based on this information, identify:

1. Any missing dependencies that should be added
2. Any outdated dependencies that should be updated
3. Any potential security issues in the dependencies
4. Any compatibility issues between crates

Cargo.toml content:
```
{file_content}
```

Installed crates:
{", ".join(dep_list)}

Format your response as JSON with the following structure:
```json
{{
  "missing_dependencies": [
    {{"name": "crate_name", "reason": "explanation", "dev": true/false}}
  ],
  "updates": [
    {{"name": "crate_name", "current": "current_version", "recommended": "new_version", "reason": "explanation"}}
  ],
  "security_issues": [
    {{"name": "crate_name", "description": "issue_description", "severity": "high/medium/low"}}
  ],
  "compatibility_issues": [
    {{"crates": ["crate1", "crate2"], "description": "issue_description"}}
  ]
}}
```

Your JSON response:
        """.strip()
        
        return prompt
    
    def _parse_analysis_response(self, response: str, language: str) -> Dict[str, Any]:
        """
        Parse the response from the language model.
        
        Args:
            response: Text response from the LLM
            language: Programming language
            
        Returns:
            Dictionary with parsed analysis results
        """
        # Extract JSON from the response
        json_str = response
        
        # If response contains markdown-style JSON blocks, extract them
        if "```json" in response:
            start = response.find("```json") + 7
            end = response.find("```", start)
            if start > 6 and end > start:
                json_str = response[start:end].strip()
        elif "```" in response:
            start = response.find("```") + 3
            end = response.find("```", start)
            if start > 2 and end > start:
                json_str = response[start:end].strip()
        
        try:
            # Parse the JSON
            result = json.loads(json_str)
            return result
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from response: {json_str}")
            return {}