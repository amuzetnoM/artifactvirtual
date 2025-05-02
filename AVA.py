# Use a pipeline as a high-level helper
from transformers import pipeline

pipe = pipeline("text-generation", model="JetBrains/Mellum-4b-sft-python")


# Load model directly
from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = AutoTokenizer.from_pretrained("JetBrains/Mellum-4b-sft-python")
model = AutoModelForCausalLM.from_pretrained("JetBrains/Mellum-4b-sft-python")

from transformers import GenerationConfig
import torch