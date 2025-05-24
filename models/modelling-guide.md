# Raegen 
## Transformer Model 
> Training & Fine-Tuning Guide

## Overview
This guide explains how to use the `raegen.py` script for training and fine-tuning a transformer-based language model on your own data. The script is robust, supports multiple data sources, and provides a CLI for full control and progress monitoring.

---

## 1. Prepare Your Training Data
- Place your training text files as `train.txt` in the `datasets/ready/` directory.
- You can have multiple `train.txt` files in subfolders; use the `--all` flag to train on all of them.

---

## 2. Training from Scratch
Run the following command to train a new model:
```sh
python models/raegen.py --datasets-folder datasets --output models/finetuned/raegen_model.pt --progress
```

### Key CLI Options
- `--datasets-folder`: Base folder for datasets (default: `datasets`)
- `--block-size`: Context length for predictions (default: 256)
- `--batch-size`: Batch size for training (default: 64)
- `--max-iters`: Number of training iterations (default: 5000)
- `--eval-interval`: Evaluation interval (default: 500)
- `--learning-rate`: Learning rate (default: 3e-4)
- `--n-embd`, `--n-head`, `--n-layer`, `--dropout`: Model architecture hyperparameters
- `--output`: Output file for the trained model (default: `raegen_model.pt`)
- `--generate`: Generate N tokens after training
- `--all`: Use all `train.txt` files found in subfolders

---

## 3. Fine-Tuning an Existing Model
To fine-tune a previously trained model, simply point the `--output` to a new file and use the same CLI options. (For advanced users, you can modify the script to add a `--resume` option similar to the bigram model.)

---

## 4. Monitoring Progress
- The script prints progress every 10 iterations and at each evaluation interval.
- For large datasets or models, reduce `--batch-size`, `--block-size`, or `--max-iters` for faster experimentation.

---

## 5. Checkpoints & Model Saving
- The final model is saved to the file specified by `--output` (recommended: `models/finetuned/raegen_model.pt`).
- For checkpointing during training, you can add logic to save intermediate models (see the bigram model for an example).

---

## 6. Generating Text
After training, generate text with:
```sh
python models/raegen.py --datasets-folder datasets --output models/finetuned/raegen_model.pt --generate 200
```

---

## 7. Best Practices
- Always monitor training and validation loss.
- Use checkpoints to avoid losing progress.
- Adjust hyperparameters for your hardware and dataset size.
- For large models, use a GPU for best performance.

---

## 8. Building an LLM from Scratch: Step-by-Step
1. **Prepare Data:** Place your text in `datasets/ready/train.txt`.
2. **Train Model:** Use `raegen.py` or `bigram.py` with the CLI to train from scratch.
3. **Fine-Tune:** Resume training with new data as needed.
4. **Checkpoint:** Save models in `models/finetuned/` for versioning.
5. **Generate:** Use the `--generate` flag to sample text from your model.
6. **Experiment:** Adjust hyperparameters and data for best results.

---

## 9. Troubleshooting
- If you see "No train.txt files found", check your data path and file names.
- For out-of-memory errors, reduce batch size or model size.
- For slow training, try fewer iterations or a smaller model.

---

## 10. Extending Functionality
- Add a `--resume` option for checkpointed fine-tuning.
- Add more advanced progress bars with `tqdm`.
- Integrate with experiment tracking tools (e.g., Weights & Biases).

---

For more details, see the code in `models/raegen.py` and `models/bigram.py`.
