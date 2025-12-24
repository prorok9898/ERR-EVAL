# ERR-EVAL Benchmark

Epistemic Reasoning & Reliability Evaluation Benchmark for AI Models.

## Installation

```bash
cd bench
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows PowerShell
pip install -e .
```

## Usage

```bash
python -m mirage evaluate --model "openai/gpt-4o" --limit 5
```

## Environment

Create a `.env` file with your OpenRouter API key:
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```
