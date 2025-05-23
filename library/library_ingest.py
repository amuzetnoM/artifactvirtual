# Please do not move this file.

import os
import shutil
from pathlib import Path
import csv
import json
try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None
try:
    import yaml
except ImportError:
    yaml = None

# Optional: install these if you want to support more formats
def ensure_dependencies():
    try:
        import docx, PyPDF2, markdown
    except ImportError:
        print("Some dependencies missing. Please install: python-docx, PyPDF2, markdown")

try:
    import docx
except ImportError:
    docx = None
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None
try:
    import markdown
except ImportError:
    markdown = None

def convert_to_txt(src_path, dst_path):
    ext = src_path.suffix.lower()
    try:
        if ext == '.txt':
            shutil.copy2(src_path, dst_path)
        elif ext in ['.md', '.markdown'] and markdown:
            with open(src_path, 'r', encoding='utf-8') as f:
                text = f.read()
            # Optionally strip markdown formatting
            plain = markdown.markdown(text)
            # Remove HTML tags
            import re
            plain = re.sub('<[^<]+?>', '', plain)
            with open(dst_path, 'w', encoding='utf-8') as f:
                f.write(plain)
        elif ext == '.pdf' and PyPDF2:
            with open(src_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                text = "\n".join(page.extract_text() or '' for page in reader.pages)
            with open(dst_path, 'w', encoding='utf-8') as f:
                f.write(text)
        elif ext in ['.docx'] and docx:
            doc = docx.Document(src_path)
            text = "\n".join([p.text for p in doc.paragraphs])
            with open(dst_path, 'w', encoding='utf-8') as f:
                f.write(text)
        elif ext in ['.csv', '.tsv']:
            delimiter = '\t' if ext == '.tsv' else ','
            with open(src_path, 'r', encoding='utf-8') as f:
                reader = csv.reader(f, delimiter=delimiter)
                lines = ['\t'.join(row) for row in reader]
            with open(dst_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(lines))
        elif ext == '.json':
            with open(src_path, 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)
                    def flatten_json(y, prefix=''):
                        out = []
                        if isinstance(y, dict):
                            for k, v in y.items():
                                out.extend(flatten_json(v, f"{prefix}{k}."))
                        elif isinstance(y, list):
                            for i, v in enumerate(y):
                                out.extend(flatten_json(v, f"{prefix}{i}."))
                        else:
                            out.append(f"{prefix[:-1]}: {y}")
                        return out
                    lines = flatten_json(data)
                    text = '\n'.join(lines)
                except Exception:
                    f.seek(0)
                    text = f.read()
            with open(dst_path, 'w', encoding='utf-8') as f:
                f.write(text)
        elif ext == '.html' and BeautifulSoup:
            with open(src_path, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f, 'html.parser')
                text = soup.get_text(separator='\n')
            with open(dst_path, 'w', encoding='utf-8') as f:
                f.write(text)
        elif ext in ['.yml', '.yaml'] and yaml:
            with open(src_path, 'r', encoding='utf-8') as f:
                try:
                    data = yaml.safe_load(f)
                    text = json.dumps(data, indent=2)
                except Exception:
                    f.seek(0)
                    text = f.read()
            with open(dst_path, 'w', encoding='utf-8') as f:
                f.write(text)
        elif ext == '.xml' and BeautifulSoup:
            with open(src_path, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f, 'xml')
                text = soup.get_text(separator='\n')
            with open(dst_path, 'w', encoding='utf-8') as f:
                f.write(text)
        else:
            # Fallback: copy as-is if text, skip otherwise
            print(f"[WARN] Unsupported file type: {src_path}")
    except Exception as e:
        print(f"[ERROR] Failed to convert {src_path}: {e}")

def process_folder(src_folder, dst_folder):
    for root, dirs, files in os.walk(src_folder):
        rel_root = os.path.relpath(root, src_folder)
        out_root = os.path.join(dst_folder, rel_root)
        os.makedirs(out_root, exist_ok=True)
        for file in files:
            src_path = Path(root) / file
            dst_path = Path(out_root) / (Path(file).stem + '.txt')
            convert_to_txt(src_path, dst_path)

def main():
    src_folder = Path(__file__).parent
    dst_folder = src_folder / 'converted_txt'
    os.makedirs(dst_folder, exist_ok=True)
    process_folder(src_folder, dst_folder)
    print(f"Conversion complete. All .txt files are in {dst_folder}")

if __name__ == '__main__':
    main()
