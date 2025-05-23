import os
import platform
import subprocess
import re
from typing import Dict, Any, Optional
import difflib
try:
    import nltk
    from nltk.corpus import wordnet
except ImportError:
    nltk = None
    wordnet = None

class CommandParser:
    """
    Advanced, robust, and LLM-friendly parser and executor for Windows and Linux commands.
    - Dynamically builds command map from commands_reference.md
    - Uses advanced NLP and fuzzy matching
    - Supports non-interactive (LLM/tool) and interactive (human) modes
    - Provides clear error messages and argument prompts
    - Returns available commands if no match is found
    """
    def __init__(self):
        self.env = self.detect_environment()
        self.command_map = self.build_command_map()
        if nltk and wordnet:
            try:
                nltk.data.find('corpora/wordnet')
            except LookupError:
                nltk.download('wordnet')

    def detect_environment(self) -> str:
        sys = platform.system().lower()
        if 'windows' in sys:
            return 'windows'
        return 'linux'

    def build_command_map(self) -> Dict[str, Dict[str, str]]:
        command_map = {}
        cmd_file = os.path.join(os.path.dirname(__file__), 'commands_reference.md')
        with open(cmd_file, encoding='utf-8') as f:
            lines = f.readlines()
        current_os = None
        for line in lines:
            if line.strip().startswith('## Windows'):
                current_os = 'windows'
            elif line.strip().startswith('## Linux'):
                current_os = 'linux'
            elif line.strip().startswith('- '):
                match = re.match(r'- `([^`]+)` - (.+)', line.strip())
                if match and current_os:
                    cmd_template, desc = match.groups()
                    key = desc.lower()
                    if key not in command_map:
                        command_map[key] = {}
                    command_map[key][current_os] = cmd_template
        return command_map

    def nlp_match_objective(self, objective: str) -> Optional[str]:
        candidates = list(self.command_map.keys())
        tokens = re.findall(r'\w+', objective.lower())
        expanded = set(tokens)
        if wordnet:
            for token in tokens:
                for syn in wordnet.synsets(token):
                    for lemma in syn.lemma_names():
                        expanded.add(lemma.replace('_', ' '))
        best_score = 0
        best_key = None
        for cand in candidates:
            cand_tokens = set(re.findall(r'\w+', cand))
            score = len(expanded & cand_tokens)
            if score > best_score:
                best_score = score
                best_key = cand
        if not best_key or best_score == 0:
            match = difflib.get_close_matches(objective.lower(), candidates, n=1, cutoff=0.4)
            return match[0] if match else None
        return best_key

    def parse_objective(self, objective: str) -> Optional[str]:
        candidates = list(self.command_map.keys())
        obj_lower = objective.lower().strip()
        for cand in candidates:
            if obj_lower == cand:
                return cand
        return self.nlp_match_objective(objective)

    def build_command(self, objective: str, non_interactive: bool = False, **kwargs) -> Optional[str]:
        key = self.parse_objective(objective)
        print(f"[DEBUG] Objective: '{objective}' matched to key: '{key}' for env: '{self.env}'")
        if not key:
            available = list(self.command_map.keys())
            return f"[ERROR] No matching command found. Available commands: {available}"
        if self.env not in self.command_map.get(key, {}):
            return f"[ERROR] No command available for environment '{self.env}' and objective '{key}'."
        template = self.command_map[key][self.env]
        placeholders = re.findall(r'<([^>]+)>', template)
        for ph in placeholders:
            if ph not in kwargs:
                if non_interactive:
                    kwargs[ph] = f'<{ph}>'
                else:
                    example = ''
                    if ph == 'file':
                        example = ' (e.g., test.txt, report.docx)'
                    elif ph == 'folder':
                        example = ' (e.g., C:/Users/YourName/Documents)'
                    elif ph == 'program':
                        example = ' (e.g., notepad, calc, chrome)'
                    elif ph == 'source':
                        example = ' (e.g., file1.txt)'
                    elif ph == 'destination':
                        example = ' (e.g., file2.txt)'
                    elif ph == 'text':
                        example = ' (e.g., Hello World!)'
                    val = input(f"Please provide value for '{ph}'{example}: ").strip()
                    while not val:
                        print(f"[WARN] '{ph}' cannot be empty. Please enter a value{example}.")
                        val = input(f"Please provide value for '{ph}'{example}: ").strip()
                    kwargs[ph] = val
        fmt_template = re.sub(r'<([^>]+)>', r'{\1}', template)
        try:
            return fmt_template.format(**kwargs)
        except KeyError as e:
            return f"[ERROR] Missing argument: {e}"

    def execute_command(self, command: str) -> str:
        try:
            result = subprocess.run(command, shell=True, capture_output=True, text=True)
            return result.stdout + result.stderr
        except Exception as e:
            return str(e)

    def run(self, objective: str, non_interactive: bool = False, **kwargs) -> str:
        cmd = self.build_command(objective, non_interactive=non_interactive, **kwargs)
        if not cmd or cmd.startswith('[ERROR]'):
            return cmd
        output = self.execute_command(cmd)
        return output

# LLM/tool entry point

def run_objective(objective: str, non_interactive: bool = True) -> str:
    """
    Given a high-level objective, parse, prompt for arguments, execute, and return output as string.
    In non-interactive mode, uses placeholder values for missing arguments.
    """
    parser = CommandParser()
    return parser.run(objective, non_interactive=non_interactive)
