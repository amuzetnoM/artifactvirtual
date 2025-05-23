# Please don't move this file.

import os
from pathlib import Path

def find_txt_files(target_folder):
    txt_files = []
    for root, dirs, files in os.walk(target_folder):
        for file in files:
            if file.lower().endswith('.txt'):
                txt_files.append(Path(root) / file)
    return txt_files

def clean_text(text):
    import re
    # Remove markdown headers, numbered/bulleted lists, and section titles
    text = re.sub(r'^\s*#+\s+', '', text, flags=re.MULTILINE)  # Markdown headers
    text = re.sub(r'^\s*={2,}\s*$', '', text, flags=re.MULTILINE)  # Underline headers
    text = re.sub(r'^\s*[-*_]{3,}\s*$', '', text, flags=re.MULTILINE)  # Horizontal rules
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)  # Numbered lists
    text = re.sub(r'^\s*[\-\*\+]\s+', '', text, flags=re.MULTILINE)  # Bulleted lists
    text = re.sub(r'^\s*[A-Z][a-z ]+:$', '', text, flags=re.MULTILINE)  # Section titles
    text = re.sub(r'`{3,}.*?`{3,}', '', text, flags=re.DOTALL)  # Code blocks
    text = re.sub(r'<[^>]+>', '', text)  # HTML tags
    text = re.sub(r'\[.*?\]\(.*?\)', '', text)  # Markdown links
    text = re.sub(r'\!\[.*?\]\(.*?\)', '', text)  # Markdown images
    # Remove table formatting (pipes, tabs, etc.)
    text = re.sub(r'\|', ' ', text)
    text = re.sub(r'\t', ' ', text)
    # Remove all-caps lines (often headers)
    text = re.sub(r'^([A-Z\s\&]+)$', '', text, flags=re.MULTILINE)
    # Remove repeated blank lines and trim whitespace
    text = re.sub(r'\n{2,}', '\n', text)
    text = '\n'.join(line.strip() for line in text.splitlines() if line.strip())
    # Optionally: join lines into paragraphs (remove most line breaks)
    text = re.sub(r'\n+', ' ', text)
    # Optionally: normalize unicode, remove non-ASCII
    # text = text.encode('ascii', errors='ignore').decode()
    # Lowercase (optional, comment out if not wanted)
    # text = text.lower()
    return text.strip()

def compile_txt_files(target_folder, output_file):
    txt_files = find_txt_files(target_folder)
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for txt_file in txt_files:
            outfile.write(f"\n--- FILE: {txt_file.relative_to(target_folder)} ---\n")
            with open(txt_file, 'r', encoding='utf-8', errors='ignore') as infile:
                raw = infile.read()
                cleaned = clean_text(raw)
                outfile.write(cleaned)
                outfile.write('\n')
    print(f"Compiled {len(txt_files)} .txt files into {output_file}")

if __name__ == '__main__':
    # Set the target folder and output file
    target_folder = Path(__file__).parent.parent / 'library'
    output_file = Path(__file__).parent / 'compiled_library.txt'
    compile_txt_files(target_folder, output_file)
