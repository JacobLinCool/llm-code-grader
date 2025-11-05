# llm-code-grader

LLM-based code grading system with CLI support. Grade multiple code submissions using Google's Generative AI.

## Packages

This monorepo contains two packages:

- **`code-grader-core`** - Core library for LLM-based code grading
- **`code-grader`** - CLI tool for batch grading with JSON/CSV/JSONL export

## Quick Start

### Installation

```bash
pnpm i -g code-grader
```

### CLI Usage

Grade multiple submissions:

```bash
code-grader --policy examples/grading-policy \
  --submissions examples/submission1 examples/submission2 \
  --output results.jsonl
```

Export to CSV:

```bash
code-grader --policy examples/grading-policy \
  --submissions examples/submission1 examples/submission2 \
  --output results.csv
```

### Programmatic Usage

```typescript
import { gradeFromFiles } from 'code-grader-core';
import { GoogleGenAI } from '@google/genai';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const result = await gradeFromFiles({
    gradingPolicyPath: './grading-policy',
    submissionPath: './submission',
    client,
    modelName: 'gemini-2.5-pro',
});

console.log(`Score: ${result.score}`);
console.log(`Details: ${result.scoringDetails}`);
console.log(`Tokens: ${result.usage.totalTokenCount}`);
```

## Structure

### Submission

Each submission is a directory containing one or more code files.

### Grading Policy

Grading policies is a directory with:

- `README.md` - The grading rubric and instructions
- Optional attachments (PDF, images, videos, audio) for additional context

## Environment Variables

Set your Gemini API key:

```bash
export GEMINI_API_KEY=your-api-key-here
```

## Features

- ✅ Grade multiple submissions in parallel
- ✅ Export results to JSON, CSV, or JSONL
- ✅ Support for multimodal grading (images, PDFs, videos, audio)
- ✅ Token usage tracking
- ✅ Structured output with scoring details
- ✅ API key pooling for high-throughput grading
- ✅ Configurable concurrency and retry logic
