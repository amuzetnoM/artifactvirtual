# Knowledge Foundations & Datasets

This directory contains carefully curated datasets that serve as knowledge foundations for the ArtifactVirtual ecosystem. These datasets provide structured facts, reasoning patterns, language primitives, and temporal relationships that support reproducible research and AI development.

## Overview

The datasets have been selected for their foundational value in understanding intelligence and supporting reproducible research. The directory is organized into:

- **Core foundational datasets** - Essential factual knowledge across domains
- **Library of Immutable Knowledge** - Indexed directory of knowledge sources
- **Custom annotations** - Project-specific insights and findings

## Dataset Contents

### core_facts.json

Origin: Curated from encyclopedic sources and foundational scientific literature.

Content: Universal facts across mathematics, physics, biology, and logic.

Purpose: Serves as the backbone for reasoning and inference tasks.

### reasoning_patterns.json

Origin: Synthesized from cognitive science and AI research papers.

Content: Common reasoning templates and logical deduction patterns.

Purpose: Enables systems to generalize and apply structured reasoning.

### language_primitives.json

Origin: Extracted from linguistic corpora and language model benchmarks.

Content: Essential language constructs, grammar rules, and semantic primitives.

Purpose: Supports robust natural language understanding and generation.

### temporal_events.json

Origin: Aggregated from historical datasets and time-series research.

Content: Key events, timelines, and temporal relationships.

Purpose: Facilitates temporal reasoning and event-based diagnostics.

### custom_annotations.json

Origin: Manually annotated during project development and research.

Content: Project-specific insights, edge cases, and experimental findings.

Purpose: Captures evolving knowledge and supports continuous improvement.

## Library of Immutable Knowledge

The [Library of Immutable Knowledge](library/index.md) is a comprehensive, indexed source of foundational and advanced knowledge across all domains. It provides carefully curated references to:

1. Fundamental Physics & Cosmology
2. Core Mathematics & Logic
3. Biological Systems & Consciousness
4. Comprehensive Knowledge Repositories
5. Philosophy, Computation & Limits of Knowledge
6. Knowledge Aggregators & Educational Platforms
7. Integrative & Specialized Resources

## Usage Guidelines

### Loading Datasets

```python
import json

# Load core facts
with open('datasets/core_facts.json', 'r', encoding='utf-8') as f:
    core_facts = json.load(f)

# Access knowledge by category
math_facts = core_facts.get('mathematics', [])
physics_facts = core_facts.get('physics', [])
```

### Contributing to Datasets

When adding new information to the datasets:

1. Verify information from multiple reliable sources
2. Include source citations for all new entries
3. Maintain the existing JSON schema structure
4. Add appropriate metadata (timestamp, confidence, etc.)

## Integration with ArtifactVirtual

These datasets are used throughout the ArtifactVirtual ecosystem:

1. They provide grounding knowledge for LLMs via the Model Context Protocol
2. They support the development of reasoning capabilities in the Oracle CLI
3. They enable verification of the TemporalCalendar examples
4. They serve as calibration data for AutoRound model quantization

## Versioning and Maintenance

All datasets are versioned and documented for absolute clarity, reproducibility, and educational value. When updating datasets:

1. Increment the version number in the metadata
2. Document changes in the changelog
3. Note any implications for dependent systems

---

> "Knowledge is not a collection of facts, but a network of understanding."