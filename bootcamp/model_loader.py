try:
    from ollama import Client as OllamaClient
except ImportError:
    OllamaClient = None

class ModelLoader:
    def __init__(self):
        self.models = {}
        if OllamaClient:
            try:
                self.ollama_client = OllamaClient()
            except Exception:
                self.ollama_client = None
        else:
            self.ollama_client = None

    def load_model(self, name, model_type="llm", **kwargs):
        if model_type == "llm" and self.ollama_client:
            try:
                self.models[name] = self.ollama_client.model(name)
            except Exception as e:
                self.models[name] = f"Ollama error: {e}"
        else:
            self.models[name] = f"Loaded {model_type} model: {name}"
        return self.models[name]

    def get_model(self, name):
        return self.models.get(name)
