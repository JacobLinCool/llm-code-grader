# code-grader

CLI tool for LLM-based code grading using Google's Generative AI.

## Installation

```bash
pnpm install
pnpm build
```

## Usage

### Basic Usage

Grade a single submission:

```bash
code-grader --policy ./grading-policy --submissions ./submission1
```

### Multiple Submissions

Grade multiple submissions at once:

```bash
code-grader --policy ./grading-policy --submissions ./submission1 ./submission2 ./submission3
```

### Export to JSON

Save results to a JSON file:

```bash
code-grader --policy ./grading-policy --submissions ./submission1 ./submission2 --output results.json
```

### Export to JSONL

Save results to a JSONL file (one JSON object per line):

```bash
code-grader --policy ./grading-policy --submissions ./submission1 ./submission2 --output results.jsonl
```

### Output to stdout

Output JSON to stdout:

```bash
code-grader --policy ./grading-policy --submissions ./submission1 --json
```

Output CSV to stdout:

```bash
code-grader --policy ./grading-policy --submissions ./submission1 --csv
```

### Custom Model

Use a different model:

```bash
code-grader --policy ./grading-policy --submissions ./submission1 --model gemini-2.5-flash
```

### High Concurrency Grading

Grade with multiple concurrent requests:

```bash
code-grader --policy ./grading-policy --submissions ./submission1 ./submission2 --concurrency 5
```

### Multiple API Keys

Use multiple API keys for higher rate limits:

```bash
code-grader --policy ./grading-policy --submissions ./submission1 --api-key "key1,key2,key3"
```

## Options

- `-p, --policy <path>` - Path to the grading policy directory (required)
- `-s, --submissions <paths...>` - Paths to submission directories (required, can specify multiple)
- `-m, --model <name>` - Model name to use for grading (default: "gemini-2.5-pro")
- `-k, --api-key <key>` - Google AI API key (or set GEMINI_API_KEY env var, supports comma-separated multiple keys)
- `--base-url <url>` - Base URL for the Gemini API (or set GEMINI_API_BASE_URL env var)
- `-c, --concurrency <number>` - Number of submissions to grade concurrently (default: 1)
- `-o, --output <path>` - Output file path (supports .json, .csv, and .jsonl extensions)
- `--json` - Output results as JSON to stdout
- `--csv` - Output results as CSV to stdout

## Grading Policy Structure

The grading policy directory should contain:

- `README.md` - The grading rubric and instructions
- Optional attachment files (PDF, images, videos, audio) for additional context

## Submission Structure

Each submission directory should contain the code files to be graded.

## Environment Variables

- `GEMINI_API_KEY` - Your Google AI API key (can also be provided via `--api-key`, supports comma-separated multiple keys)
- `GEMINI_API_BASE_URL` - Base URL for the Gemini API (can also be provided via `--base-url`)

## Output Format

### JSON

```json
[
    {
        "submission": "submission1",
        "score": 85,
        "scoringDetails": "Detailed feedback...",
        "inputTokens": 1500,
        "outputTokens": 300,
        "totalTokens": 1800
    }
]
```

### CSV

```csv
submission,score,scoringDetails,inputTokens,outputTokens,totalTokens
submission1,85,"Detailed feedback...",1500,300,1800
```

### JSONL

```jsonl
{
    "submission": "submission1",
    "score": 85,
    "scoringDetails": "Detailed feedback...",
    "inputTokens": 1500,
    "outputTokens": 300,
    "totalTokens": 1800
}
```
