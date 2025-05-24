import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import argparse
import os
import torch
from torch.nn import functional as F
from datetime import datetime

# Try to import GPTLanguageModel dynamically
import importlib.util
modelling_path = os.path.join(os.path.dirname(__file__), '..', 'modelling.py')
spec = importlib.util.spec_from_file_location('modelling', modelling_path)
modelling = importlib.util.module_from_spec(spec)
spec.loader.exec_module(modelling)
GPTLanguageModel = getattr(modelling, 'GPTLanguageModel')

# ========== Model Evaluation CLI Tool ==========
# Usage: python evaluation/evaluate.py --model models/pretrained/model-*.pt --datasets-folder datasets/ready --metrics accuracy perplexity loss --batch-size 64 --block-size 256

def load_model(model_path, device):
    checkpoint = torch.load(model_path, map_location=device)
    config = checkpoint.get('config', {})
    vocab_size = len(checkpoint['stoi'])
    block_size = config.get('block_size', 256)
    n_embd = config.get('n_embd', 384)
    n_head = config.get('n_head', 6)
    n_layer = config.get('n_layer', 6)
    dropout = config.get('dropout', 0.2)
    model = GPTLanguageModel(vocab_size, block_size, n_embd, n_head, n_layer, dropout, device)
    model.load_state_dict(checkpoint['model'])
    model.to(device)
    model.eval()
    stoi = checkpoint['stoi']
    itos = checkpoint['itos']
    return model, stoi, itos, config

def load_eval_data(datasets_folder, stoi):
    import glob
    files = glob.glob(os.path.join(datasets_folder, '*.txt'))
    text = ''
    for file in files:
        with open(file, 'r', encoding='utf-8') as f:
            text += f.read() + '\n'
    if not text.strip():
        raise RuntimeError('No evaluation data found in ' + datasets_folder)
    encode = lambda s: [stoi[c] for c in s if c in stoi]
    data = torch.tensor(encode(text), dtype=torch.long)
    return data

def get_batches(data, block_size, batch_size, device):
    n = len(data)
    for i in range(0, n - block_size, batch_size):
        x = torch.stack([data[j:j+block_size] for j in range(i, min(i+batch_size, n-block_size))])
        y = torch.stack([data[j+1:j+block_size+1] for j in range(i, min(i+batch_size, n-block_size))])
        yield x.to(device), y.to(device)

def evaluate(model, data, block_size, batch_size, device, metrics):
    results = {m: [] for m in metrics}
    total, correct = 0, 0
    losses = []
    with torch.no_grad():
        for xb, yb in get_batches(data, block_size, batch_size, device):
            logits, loss = model(xb, yb)
            if 'loss' in metrics:
                losses.append(loss.item())
            if 'accuracy' in metrics:
                preds = torch.argmax(logits, dim=-1)
                # Flatten for accuracy calculation
                preds_flat = preds.view(-1)
                yb_flat = yb.view(-1)
                correct += (preds_flat == yb_flat).float().sum().item()
                total += yb_flat.numel()
    if 'loss' in metrics:
        results['loss'] = sum(losses) / len(losses) if losses else float('nan')
    if 'accuracy' in metrics:
        results['accuracy'] = correct / total if total > 0 else float('nan')
    if 'perplexity' in metrics:
        results['perplexity'] = torch.exp(torch.tensor(results['loss'])).item() if 'loss' in results else float('nan')
    return results

def main():
    parser = argparse.ArgumentParser(description='Model Evaluation CLI Tool')
    parser.add_argument('--model', type=str, required=True, help='Path to .pt model file')
    parser.add_argument('--datasets-folder', type=str, required=True, help='Folder with evaluation .txt files')
    parser.add_argument('--metrics', type=str, nargs='+', default=['loss', 'accuracy', 'perplexity'], help='Metrics to evaluate (loss, accuracy, perplexity)')
    parser.add_argument('--batch-size', type=int, default=64, help='Batch size for evaluation')
    parser.add_argument('--block-size', type=int, default=256, help='Block size (context length)')
    parser.add_argument('--device', type=str, default=None, help='Device to use (cpu/cuda)')
    parser.add_argument('--info', action='store_true', help='Show model info and exit')
    parser.add_argument('--do-infer', action='store_true', help='Run inference/generate text')
    parser.add_argument('--prompt', type=str, default='', help='Prompt text for inference')
    parser.add_argument('--gen-tokens', type=int, default=100, help='Number of tokens to generate')
    args = parser.parse_args()

    device = args.device or ('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"[INFO] Using device: {device}")
    print(f"[INFO] Loading model from {args.model}")
    model, stoi, itos, config = load_model(args.model, device)
    if args.info:
        print("[INFO] Model config:")
        for k, v in config.items():
            print(f"  {k}: {v}")
        print(f"[INFO] Vocab size: {len(stoi)}")
        return
    print(f"[INFO] Loading evaluation data from {args.datasets_folder}")
    data = load_eval_data(args.datasets_folder, stoi)
    print(f"[INFO] Evaluating on {len(data)} tokens...")
    results = evaluate(model, data, args.block_size, args.batch_size, device, args.metrics)
    print("\n=== Evaluation Results ===")
    for k, v in results.items():
        print(f"{k.capitalize()}: {v:.4f}")
    print("=========================")
    # Save report
    report_dir = os.path.join(os.path.dirname(__file__))
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    report_path = os.path.join(report_dir, f"eval_report_{timestamp}.md")
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(f"# Model Evaluation Report\n\n")
        f.write(f"**Model:** `{args.model}`\n\n")
        f.write(f"**Evaluation Data:** `{args.datasets_folder}`\n\n")
        f.write(f"**Batch Size:** {args.batch_size}\n\n")
        f.write(f"**Block Size:** {args.block_size}\n\n")
        f.write(f"**Device:** {device}\n\n")
        f.write(f"| Metric      | Value   |\n|-------------|---------|\n")
        for k, v in results.items():
            f.write(f"| {k.capitalize():<11} | {v:.4f}  |\n")
        f.write("\n---\n")
        if getattr(args, 'do_infer', False):
            f.write(f"\n**Prompt:** `{args.prompt if args.prompt else '[random]'}`\n\n")
            f.write(f"**Generated Text:**\n\n")
            if args.prompt:
                idx = torch.tensor([[stoi.get(c, 0) for c in args.prompt]], dtype=torch.long, device=device)
            else:
                idx = torch.zeros((1, 1), dtype=torch.long, device=device)
            out = model.generate(idx, max_new_tokens=args.gen_tokens)[0].tolist()
            decode = lambda l: ''.join([itos[i] for i in l])
            f.write('```\n' + decode(out) + '\n```\n')
    print(f"[INFO] Evaluation report saved to {report_path}")
    # Inference/generation (console)
    if getattr(args, 'do_infer', False):
        print("\n[INFO] Running inference/generation...")
        if args.prompt:
            idx = torch.tensor([[stoi.get(c, 0) for c in args.prompt]], dtype=torch.long, device=device)
        else:
            idx = torch.zeros((1, 1), dtype=torch.long, device=device)
        out = model.generate(idx, max_new_tokens=args.gen_tokens)[0].tolist()
        decode = lambda l: ''.join([itos[i] for i in l])
        print("\nGenerated text:")
        print(decode(out))

def interactive_wizard():
    import glob
    import sys
    print("\nModel Evaluation Wizard")
    print("======================")
    # Model selection
    model_files = glob.glob(os.path.join('models', 'pretrained', '*.pt'))
    if not model_files:
        print("[ERROR] No .pt model files found in models/pretrained/")
        sys.exit(1)
    print("Select a model to evaluate:")
    for idx, f in enumerate(model_files):
        print(f"  [{idx+1}] {f}")
    while True:
        try:
            model_idx = int(input(f"Enter model number [1-{len(model_files)}]: ")) - 1
            if 0 <= model_idx < len(model_files):
                model_path = model_files[model_idx]
                break
        except Exception:
            pass
        print("Invalid selection. Try again.")
    # Dataset folder selection
    default_folder = os.path.join('models', 'evaluation')
    print(f"\nEvaluation data folder (default: {default_folder}): ", end='')
    folder = input().strip() or default_folder
    if not os.path.isdir(folder):
        print(f"[ERROR] Folder not found: {folder}")
        sys.exit(1)
    # Metrics selection
    all_metrics = ['loss', 'accuracy', 'perplexity']
    print("\nSelect metrics to evaluate (comma separated, default: all):")
    print("  Options: loss, accuracy, perplexity")
    metrics_in = input("Metrics: ").strip()
    if not metrics_in:
        metrics = all_metrics
    else:
        metrics = [m.strip() for m in metrics_in.split(',') if m.strip() in all_metrics]
        if not metrics:
            metrics = all_metrics
    # Batch size
    batch_size = input("\nBatch size [64]: ").strip()
    batch_size = int(batch_size) if batch_size.isdigit() else 64
    # Block size
    block_size = input("Block size/context length [256]: ").strip()
    block_size = int(block_size) if block_size.isdigit() else 256
    # Device
    device = input("Device (cpu/cuda) [auto]: ").strip()
    device = device or ("cuda" if torch.cuda.is_available() else "cpu")
    # Info only
    info = input("Show model info only? (y/N): ").strip().lower() in ('y', 'yes')
    # Inference option
    do_infer = input("Do you want to run inference/generate text? (y/N): ").strip().lower() in ('y', 'yes')
    prompt = ""
    gen_tokens = 100
    if do_infer:
        prompt = input("Enter prompt text (leave blank for random): ").strip()
        gen_tokens_in = input("How many tokens to generate? [100]: ").strip()
        gen_tokens = int(gen_tokens_in) if gen_tokens_in.isdigit() else 100
    # Confirm
    print("\nSummary:")
    print(f"  Model: {model_path}")
    print(f"  Data folder: {folder}")
    print(f"  Metrics: {', '.join(metrics)}")
    print(f"  Batch size: {batch_size}")
    print(f"  Block size: {block_size}")
    print(f"  Device: {device}")
    print(f"  Info only: {info}")
    print(f"  Inference: {do_infer}")
    if do_infer:
        print(f"  Prompt: {prompt if prompt else '[random]'}")
        print(f"  Generate tokens: {gen_tokens}")
    confirm = input("Proceed? (Y/n): ").strip().lower()
    if confirm not in ('', 'y', 'yes'):
        print("[INFO] Aborted by user.")
        sys.exit(0)
    # Call main with these args
    class Args:
        pass
    args = Args()
    args.model = model_path
    args.datasets_folder = folder
    args.metrics = metrics
    args.batch_size = batch_size
    args.block_size = block_size
    args.device = device
    args.info = info
    args.do_infer = do_infer
    args.prompt = prompt
    args.gen_tokens = gen_tokens
    return args

if __name__ == '__main__':
    import sys
    if len(sys.argv) == 1:
        args = interactive_wizard()
        main_args = [
            '--model', args.model,
            '--datasets-folder', args.datasets_folder,
            '--batch-size', str(args.batch_size),
            '--block-size', str(args.block_size),
            '--device', args.device
        ]
        if args.info:
            main_args.append('--info')
        if args.metrics:
            main_args.extend(['--metrics'] + args.metrics)
        if args.do_infer:
            main_args.append('--do-infer')
            if args.prompt:
                main_args.extend(['--prompt', args.prompt])
            main_args.extend(['--gen-tokens', str(args.gen_tokens)])
        sys.argv = [sys.argv[0]] + main_args
    main()
