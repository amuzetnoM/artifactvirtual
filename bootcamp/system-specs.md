# System Specs: Cockpit Orchestrator Rig

## Overview
This document details the full hardware and software specifications of the system running the Cockpit Orchestrator, optimized for LLM inference (Llama-3 max) and advanced automation.

---

## Operating System
- **OS Name:** Microsoft Windows 11 Home (24H2)
- **OS Version:** 10.0.26100 (Build 26100)
- **OS Architecture:** 64-bit
- **System Manufacturer:** HP
- **System Model:** Victus by HP Gaming Laptop 15-fb1xxx
- **BIOS:** AMI F.08 (UEFI, 10/24/2024)

---

## CPU
- **Processor:** AMD Ryzen 5 7535HS with Radeon Graphics
- **Cores/Threads:** 6 cores / 12 threads
- **Base Clock:** ~3.3 GHz

---

## Memory
- **Total Physical Memory:** 16 GB (15.6 GB usable)
- **Virtual Memory:** 38 GB max

---

## Storage
- **Primary Drive:** WD PC SN810 SDCPNRY-512G-1006 (512GB NVMe SSD)
- **Additional Volumes:**
  - C: (Windows, NTFS, 159.95 GB free)
  - W: (warpdrive, ReFS, 1 TB free)
  - L: (linux_64, ReFS, 471 GB free)
  - Recovery Partition

---

## Graphics (GPU)
- **GPU 1:** AMD Radeon(TM) Graphics
  - **VRAM:** 512 MB
  - **Driver Version:** 32.0.11020.16 (6/13/2024)
  - **Resolution:** 1920x1080 @ 144Hz
- **GPU 2:** NVIDIA GeForce RTX 2050
  - **VRAM:** ~4 GB
  - **Driver Version:** 32.0.15.7602 (4/11/2025)

---

## Motherboard
- **Manufacturer:** HP
- **Product:** 8C30
- **Serial Number:** PSZJD048JIB518

---

## Network
- **Wi-Fi:** MediaTek MT7921 Wi-Fi 6 802.11ax PCIe Adapter
- **Ethernet:** Realtek Gaming GbE Family Controller
- **Bluetooth:** Yes

---

## Other Details
- **System Type:** x64-based PC (Mobile)
- **Virtualization:** Hypervisor Present (Hyper-V enabled)
- **Security:** Secure Boot, DMA Protection, UEFI, Hypervisor Enforced Code Integrity
- **Display:** 1920x1080 @ 144Hz
- **User:** ali.shakil@live.com

---

## LLM/AI Readiness
- **GPUs:**
  - NVIDIA RTX 2050 (CUDA, best for Llama-3 max, Ollama, LM Studio, etc.)
  - AMD Radeon (for display/secondary workloads)
- **RAM:** 16GB (sufficient for 8B/13B models, may be tight for 70B)
- **Storage:** Fast NVMe SSD, >1TB total available
- **OS:** Windows 11, PowerShell default shell

---

## Notes
- For Llama-3 max (70B), use the NVIDIA GPU for inference (CUDA support required).
- For best performance, close unnecessary applications to maximize available RAM and VRAM.
- System is suitable for advanced LLM inference, automation, and multi-modal workloads.

---

_Last updated: 2025-05-22_
