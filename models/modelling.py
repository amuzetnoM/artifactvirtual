import argparse
import sys
import glob
import os
import torch
import torch.nn as nn
from torch.nn import functional as F
from datetime import datetime
import time

# ------------

torch.manual_seed(1337)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR = os.path.abspath(os.path.join(BASE_DIR, '../datasets'))

def find_all_txt_files(base_folder):
    pattern1 = os.path.join(base_folder, '*.txt')
    pattern2 = os.path.join(base_folder, '**', '*.txt')
    files = glob.glob(pattern1)
    files.extend(glob.glob(pattern2, recursive=True))
    return list(set(files))

# loading all .txt files
all_txt_files = find_all_txt_files(DATASETS_DIR)
if not all_txt_files:
    raise FileNotFoundError(f'No .txt files found in {DATASETS_DIR} or subfolders.')
text = ''
for file in all_txt_files:
    with open(file, 'r', encoding='utf-8') as f:
        text += f.read() + '\n'

# here are all the unique characters that occur in this text
chars = sorted(list(set(text)))
vocab_size = len(chars)
# create a mapping from characters to integers
stoi = { ch:i for i,ch in enumerate(chars) }
itos = { i:ch for i,ch in enumerate(chars) }
encode = lambda s: [stoi[c] for c in s] # encoder: take a string, output a list of integers
decode = lambda l: ''.join([itos[i] for i in l]) # decoder: take a list of integers, output a string

# Train and test splits
data = torch.tensor(encode(text), dtype=torch.long)
n = int(0.9*len(data)) # first 90% will be train, rest val
train_data = data[:n]
val_data = data[n:]

# data loading
def get_batch(split, args, train_data, val_data, device):
    # generate a small batch of data of inputs x and targets y
    data = train_data if split == 'train' else val_data
    if len(data) <= args.block_size:
        raise ValueError(f"[ERROR] Not enough data for block size {args.block_size}.")
    ix = torch.randint(len(data) - args.block_size, (args.batch_size,), device=device)
    x = torch.stack([data[i:i+args.block_size] for i in ix])
    y = torch.stack([data[i+1:i+args.block_size+1] for i in ix])
    x, y = x.to(device), y.to(device)
    return x, y

@torch.no_grad()
def estimate_loss(model, args, train_data, val_data, device):
    out = {}
    model.eval()
    for split in ['train', 'val']:
        losses = torch.zeros(args.eval_iters)
        for k in range(args.eval_iters):
            try:
                X, Y = get_batch(split, args, train_data, val_data, device)
                _, loss = model(X, Y)
                losses[k] = loss.item()
            except Exception as e:
                print(f"[WARNING] Skipping batch in {split}: {e}")
        out[split] = losses.mean()
    model.train()
    return out

def interactive_cli(defaults):
    print("\n=== Interactive Model Training Setup ===")
    settings = {}
    for key, val in defaults.items():
        user = input(f"{key.replace('_', ' ').capitalize()} [{val}]: ")
        if user.strip() == '':
            settings[key] = val
        else:
            try:
                settings[key] = type(val)(user)
            except Exception:
                print(f"[WARNING] Invalid value for {key}, using default {val}.")
                settings[key] = val
    print("\n[INFO] Final settings:")
    for k, v in settings.items():
        print(f"  {k}: {v}")
    confirm = input("Proceed with these settings? [Y/n]: ")
    if confirm.strip().lower() not in ('', 'y', 'yes'):
        print("[INFO] Aborted by user.")
        sys.exit(0)
    return settings

# Model classes
class Head(nn.Module):
    def __init__(self, n_embd, head_size, block_size, dropout):
        super().__init__()
        self.key = nn.Linear(n_embd, head_size, bias=False)
        self.query = nn.Linear(n_embd, head_size, bias=False)
        self.value = nn.Linear(n_embd, head_size, bias=False)
        self.register_buffer('tril', torch.tril(torch.ones(block_size, block_size)))
        self.dropout = nn.Dropout(dropout)
    def forward(self, x):
        B,T,C = x.shape
        k = self.key(x)
        q = self.query(x)
        wei = q @ k.transpose(-2,-1) * k.shape[-1]**-0.5
        wei = wei.masked_fill(self.tril[:T, :T] == 0, float('-inf'))
        wei = F.softmax(wei, dim=-1)
        wei = self.dropout(wei)
        v = self.value(x)
        out = wei @ v
        return out

class MultiHeadAttention(nn.Module):
    def __init__(self, n_embd, num_heads, block_size, dropout):
        super().__init__()
        head_size = n_embd // num_heads
        self.heads = nn.ModuleList([Head(n_embd, head_size, block_size, dropout) for _ in range(num_heads)])
        self.proj = nn.Linear(head_size * num_heads, n_embd)
        self.dropout = nn.Dropout(dropout)
    def forward(self, x):
        out = torch.cat([h(x) for h in self.heads], dim=-1)
        out = self.dropout(self.proj(out))
        return out

class FeedFoward(nn.Module):
    def __init__(self, n_embd, dropout):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(n_embd, 4 * n_embd),
            nn.ReLU(),
            nn.Linear(4 * n_embd, n_embd),
            nn.Dropout(dropout),
        )
    def forward(self, x):
        return self.net(x)

class Block(nn.Module):
    def __init__(self, n_embd, n_head, block_size, dropout):
        super().__init__()
        self.sa = MultiHeadAttention(n_embd, n_head, block_size, dropout)
        self.ffwd = FeedFoward(n_embd, dropout)
        self.ln1 = nn.LayerNorm(n_embd)
        self.ln2 = nn.LayerNorm(n_embd)
    def forward(self, x):
        x = x + self.sa(self.ln1(x))
        x = x + self.ffwd(self.ln2(x))
        return x

class GPTLanguageModel(nn.Module):
    def __init__(self, vocab_size, block_size, n_embd, n_head, n_layer, dropout, device):
        super().__init__()
        self.token_embedding_table = nn.Embedding(vocab_size, n_embd)
        self.position_embedding_table = nn.Embedding(block_size, n_embd)
        self.blocks = nn.Sequential(*[Block(n_embd, n_head, block_size, dropout) for _ in range(n_layer)])
        self.ln_f = nn.LayerNorm(n_embd)
        self.lm_head = nn.Linear(n_embd, vocab_size)
        self.apply(self._init_weights)
        self.block_size = block_size
        self.device = device
    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
    def forward(self, idx, targets=None):
        B, T = idx.shape
        tok_emb = self.token_embedding_table(idx)
        pos_emb = self.position_embedding_table(torch.arange(T, device=idx.device))
        x = tok_emb + pos_emb
        x = self.blocks(x)
        x = self.ln_f(x)
        logits = self.lm_head(x)
        if targets is None:
            loss = None
        else:
            B, T, C = logits.shape
            logits = logits.view(B*T, C)
            targets = targets.view(B*T)
            loss = F.cross_entropy(logits, targets)
        return logits, loss
    def generate(self, idx, max_new_tokens):
        for _ in range(max_new_tokens):
            idx_cond = idx[:, -self.block_size:]
            logits, _ = self(idx_cond)
            logits = logits[:, -1, :]
            probs = F.softmax(logits, dim=-1)
            idx_next = torch.multinomial(probs, num_samples=1)
            idx = torch.cat((idx, idx_next), dim=1)
        return idx

def main():
    parser = argparse.ArgumentParser(
        description='Comprehensive ML CLI for training a GPT-style Transformer Language Model.'
    )
    parser.add_argument('--interactive', action='store_true', help='Launch interactive CLI before training')
    parser.add_argument('--datasets-folder', type=str, default='../datasets', help='Base folder for datasets (relative to this script)')
    parser.add_argument('--output', type=str, default=None, help='Output file for the trained model (default: finetuned/model-<timestamp>.pt)')
    parser.add_argument('--block-size', type=int, default=256, help='Context length for predictions')
    parser.add_argument('--batch-size', type=int, default=64, help='Batch size for training')
    parser.add_argument('--max-iters', type=int, default=5000, help='Max training iterations')
    parser.add_argument('--eval-interval', type=int, default=500, help='Interval for evaluation')
    parser.add_argument('--learning-rate', type=float, default=3e-4, help='Learning rate')
    parser.add_argument('--eval-iters', type=int, default=200, help='Evaluation iterations')
    parser.add_argument('--number-of-embeddings', type=int, default=384, help='Number of embeddings (embedding size)')
    parser.add_argument('--number-of-heads', type=int, default=6, help='Number of attention heads')
    parser.add_argument('--number-of-layers', type=int, default=6, help='Number of transformer layers')
    parser.add_argument('--dropout', type=float, default=0.2, help='Dropout rate')
    parser.add_argument('--generate', type=int, default=0, help='Generate N tokens after training')
    parser.add_argument('--progress', action='store_true', help='Show progress bar (requires tqdm)')
    parser.add_argument('--seed', type=int, default=1337, help='Random seed')
    parser.add_argument('--resume', type=str, default=None, help='Path to a checkpoint to resume training')
    parser.add_argument('--save-every', type=int, default=500, help='Save checkpoint every N iterations')
    parser.add_argument('--log-file', type=str, default=None, help='Log training output to a file')
    parser.add_argument('--device', type=str, default=None, help='Device to use (cpu/cuda/cuda:0, etc.)')
    parser.add_argument('--info', action='store_true', help='Show model/data info and exit')
    args = parser.parse_args()
    # Map user-friendly CLI args to internal names
    args.n_embd = args.number_of_embeddings
    args.n_head = args.number_of_heads
    args.n_layer = args.number_of_layers

    # Interactive CLI
    if args.interactive:
        # Show user-friendly prompts
        defaults = vars(args)
        # Remove internal names from interactive CLI
        for k in ['n_embd', 'n_head', 'n_layer']:
            if k in defaults:
                del defaults[k]
        settings = interactive_cli(defaults)
        # Map back to internal names
        settings['n_embd'] = settings['number_of_embeddings']
        settings['n_head'] = settings['number_of_heads']
        settings['n_layer'] = settings['number_of_layers']
        for k, v in settings.items():
            setattr(args, k, v)

    # Advanced logging
    reports_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../.reports'))
    if not os.path.exists(reports_dir):
        os.makedirs(reports_dir, exist_ok=True)
    log_path = args.log_file or os.path.join(reports_dir, f"trainlog_{datetime.now().strftime('%Y%m%d-%H%M%S')}.log")
    log_fh = open(log_path, 'a')
    class Tee:
        def __init__(self, *files):
            self.files = files
        def write(self, obj):
            for f in self.files:
                try:
                    if not f.closed:
                        f.write(obj)
                except Exception:
                    pass
        def flush(self):
            for f in self.files:
                try:
                    if not f.closed:
                        f.flush()
                except Exception:
                    pass
    sys.stdout = Tee(sys.stdout, log_fh)
    print(f"[LOG] Logging to {log_path}")

    # Set up output directory and file
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    # Always save to models/pretrained
    pretrained_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'pretrained'))
    if not os.path.exists(pretrained_dir):
        os.makedirs(pretrained_dir, exist_ok=True)
    if not args.output or args.output.lower() == 'none':
        output_file = os.path.join(pretrained_dir, f'model-{timestamp}.pt')
        print(f"[INFO] No output file specified, using default: {output_file}")
    else:
        # If user specifies a file, force it to be in pretrained/
        base = os.path.basename(args.output)
        output_file = os.path.join(pretrained_dir, base)
    output_dir = pretrained_dir

    # Device selection (add diagnostics)
    if args.device:
        if args.device.startswith('cuda') and not torch.cuda.is_available():
            print(f"[ERROR] CUDA requested but not available. Falling back to CPU.")
            device = 'cpu'
        else:
            device = args.device
    else:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"[INFO] Using device: {device}")

    # Find and load all .txt files
    base_dir = os.path.dirname(os.path.abspath(__file__))
    datasets_dir = os.path.abspath(os.path.join(base_dir, args.datasets_folder))
    all_txt_files = find_all_txt_files(datasets_dir)
    if not all_txt_files:
        print(f"[ERROR] No .txt files found in {datasets_dir} or subfolders.")
        sys.exit(1)
    print(f"[INFO] Found {len(all_txt_files)} .txt files for training.")
    text = ''
    for file in all_txt_files:
        try:
            with open(file, 'r', encoding='utf-8') as f:
                text += f.read() + '\n'
        except Exception as e:
            print(f"[WARNING] Could not read {file}: {e}")
    if not text.strip():
        print("[ERROR] All .txt files were empty or unreadable.")
        sys.exit(1)

    # Build vocab
    chars = sorted(list(set(text)))
    vocab_size = len(chars)
    if vocab_size < 2:
        print("[ERROR] Not enough unique characters in the dataset to train a model.")
        sys.exit(1)
    stoi = {ch: i for i, ch in enumerate(chars)}
    itos = {i: ch for i, ch in enumerate(chars)}
    encode = lambda s: [stoi[c] for c in s]
    decode = lambda l: ''.join([itos[i] for i in l])

    # Prepare data (move to device after device is set)
    data = torch.tensor(encode(text), dtype=torch.long).to(device)
    n = int(0.9 * len(data))
    train_data = data[:n]
    val_data = data[n:]
    torch.manual_seed(args.seed)

    if args.info:
        print(f"[INFO] Data size: {len(data)} tokens")
        print(f"[INFO] Vocab size: {vocab_size}")
        print(f"[INFO] Training tokens: {len(train_data)}")
        print(f"[INFO] Validation tokens: {len(val_data)}")
        print(f"[INFO] Model config: n_embd={args.n_embd}, n_head={args.n_head}, n_layer={args.n_layer}, block_size={args.block_size}")
        sys.exit(0)

    # Resume from checkpoint if provided
    model = GPTLanguageModel(vocab_size, args.block_size, args.n_embd, args.n_head, args.n_layer, args.dropout, device).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.learning_rate)
    start_iter = 0
    if args.resume:
        try:
            checkpoint = torch.load(args.resume, map_location=device)
            model.load_state_dict(checkpoint['model'])
            if 'optimizer' in checkpoint:
                optimizer.load_state_dict(checkpoint['optimizer'])
            start_iter = checkpoint.get('iter', 0)
            print(f"[INFO] Resumed from checkpoint {args.resume} at iteration {start_iter}")
        except Exception as e:
            print(f"[ERROR] Could not load checkpoint: {e}")
            sys.exit(1)

    print(f"[INFO] Starting training for {args.max_iters} iterations...")
    pbar = range(start_iter, args.max_iters)
    use_progress = False
    spinner = ['|', '/', '-', '\\']
    def show_spinner(i):
        print(f"\r[INFO] Training... {spinner[i % 4]} Iteration {i}", end='', flush=True)

    if args.progress:
        try:
            from tqdm import tqdm
            pbar = tqdm(pbar, initial=start_iter, total=args.max_iters)
            use_progress = True
        except ImportError:
            print("[WARNING] tqdm not installed, using spinner instead.")
    last_spinner_update = 0
    for iter in pbar:
        try:
            if not use_progress:
                # Update spinner every 0.2 seconds
                now = time.time()
                if now - last_spinner_update > 0.2 or iter == start_iter:
                    show_spinner(iter)
                    last_spinner_update = now
            if iter % args.eval_interval == 0 or iter == args.max_iters - 1:
                print()  # Newline for clarity
                losses = estimate_loss(model, args, train_data, val_data, device)
                print(f"step {iter}: train loss {losses['train']:.4f}, val loss {losses['val']:.4f}")
            xb, yb = get_batch('train', args, train_data, val_data, device)
            _, loss = model(xb, yb)
            optimizer.zero_grad(set_to_none=True)
            loss.backward()
            optimizer.step()
            if args.save_every and iter % args.save_every == 0 and iter > 0:
                checkpoint = {
                    'model': model.state_dict(),
                    'optimizer': optimizer.state_dict(),
                    'stoi': stoi,
                    'itos': itos,
                    'config': vars(args),
                    'iter': iter
                }
                ckpt_path = os.path.join(output_dir, f'ckpt_{iter}.pt')
                torch.save(checkpoint, ckpt_path)
                print(f"\n[INFO] Checkpoint saved: {ckpt_path}")
            if iter % 10 == 0:
                print(f"\nIteration {iter}/{args.max_iters} - Current loss: {loss.item():.4f}")
        except Exception as e:
            print(f"\n[ERROR] Training failed at iteration {iter}: {e}")
            break
    print("\n[INFO] Training complete.")
    torch.save({'model': model.state_dict(), 'stoi': stoi, 'itos': itos, 'config': vars(args)}, output_file)
    print(f"[INFO] Model saved to {output_file}")
    if args.generate > 0:
        context = torch.zeros((1, 1), dtype=torch.long, device=device)
        out = model.generate(context, max_new_tokens=args.generate)[0].tolist()
        print('Generated text:')
        print(decode(out))
    log_fh.close()

if __name__ == '__main__':
    main()