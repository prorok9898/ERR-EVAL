# ERR-EVAL Benchmark

**ERR-EVAL** (Epistemic Reasoning & Reliability Evaluation) is an epistemic reliability benchmark that measures whether AI models can detect ambiguity, avoid hallucinating, localize uncertainty, and maintain calibrated confidence when inputs are incomplete, noisy, misleading, or internally inconsistent.

## What ERR-EVAL Measures

ERR-EVAL uses a 5-axis rubric, each scored 0–2:

1. **Ambiguity Detection**: Does the model notice that something is unclear or wrong?
2. **Hallucination Avoidance**: Does it avoid inventing facts/assumptions?
3. **Localization of Uncertainty**: Does it pinpoint *exactly* what is missing/contradictory?
4. **Response Strategy**: Does it ask the *right* clarifying question or propose valid branches?
5. **Epistemic Tone**: Is confidence calibrated and non-dismissive?

**Core principle**: Wrong-but-confident is strongly punished. "I don't have enough info, here are the branches and what I'd need to know" is rewarded.

## Tracks

| Track | Focus | Description |
|-------|-------|-------------|
| A | Noisy Perception | Corrupted sensory data, partial transcripts, timing ambiguity |
| B | Ambiguous Semantics | Underspecified pronouns, scope ambiguity, multiple parses |
| C | False Premise Traps | Subtly wrong assumptions that should be challenged |
| D | Underspecified Tasks | Missing constraints, goals, definitions |
| E | Conflicting Constraints | Quiet contradictions, mutually exclusive requirements |

## Installation

```bash
cd bench
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows PowerShell
pip install -e .
```

## Usage

Set your OpenRouter API key in `.env`:

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

Run an evaluation:

```bash
python -m mirage evaluate --model "openai/gpt-4o" --limit 10
```

## Results

Results are saved to `frontend/data/results.json` for the leaderboard visualization.

## License

MIT License - Bennett Schwartz (GustyCube)
