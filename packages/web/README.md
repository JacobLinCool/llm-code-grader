# LLM Code Grader Web App

A modern SvelteKit application for uploading and processing code submissions for AI-powered grading using Google's Gemini API.

## Features

- **Landing Page**: Introduction to the LLM Code Grader with feature highlights
- **Upload Page**: Upload ZIP files containing code submissions with custom grading policies
- **Client-Side Processing**: ZIP files are processed entirely in the browser for privacy and speed
- **AI-Powered Grading**: Uses the `code-grader-core` package to grade submissions with Google Gemini
- **Stateless API**: Serverless function endpoint powered by Cloudflare Pages Functions
- **Modern UI**: Built with Flowbite-Svelte components and Tailwind CSS 4
- **Svelte 5 Runes**: Uses the latest Svelte 5 Runes API for reactive state management

## Tech Stack

- **Framework**: SvelteKit (Svelte 5 with Runes API)
- **Deployment**: Cloudflare Pages (via @sveltejs/adapter-cloudflare)
- **Grading Engine**: code-grader-core (workspace package)
- **AI Provider**: Google Gemini (via @google/genai)
- **UI Components**: flowbite-svelte
- **Icons**: @lucide/svelte
- **Styling**: Tailwind CSS 4
- **Zip Processing**: jszip (client-side)
- **Package Manager**: pnpm

## Development

### Prerequisites

- Node.js 18+ 
- pnpm 10.18.0+
- Google Gemini API key (get from https://aistudio.google.com/apikey)

### Setup

1. Install dependencies from the repository root:

```bash
pnpm install
```

2. Create a `.env` file in `packages/web/`:

```bash
cd packages/web
cp .env.example .env
```

3. Add your Gemini API key to `.env`:

```
GEMINI_API_KEY=your-actual-api-key-here
```

### Run Development Server

```bash
cd packages/web
pnpm dev
```

The application will be available at http://localhost:5173

### Build for Production

```bash
pnpm build
```

This will generate a production build in `.svelte-kit/cloudflare/` ready for deployment.

### Preview Production Build

```bash
pnpm preview
```

## Deployment to Cloudflare Pages

### Option 1: Via Cloudflare Dashboard

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Go to the Cloudflare Pages dashboard
3. Create a new project and connect your repository
4. Set build settings:
   - **Build command**: `cd packages/web && pnpm build`
   - **Build output directory**: `packages/web/.svelte-kit/cloudflare`
   - **Root directory**: `/` (or leave empty)
5. Deploy!

### Option 2: Via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy from the packages/web directory
cd packages/web
wrangler pages deploy .svelte-kit/cloudflare --project-name=llm-code-grader
```

## Project Structure

```
packages/web/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte          # Root layout with CSS imports
│   │   ├── +page.svelte            # Landing/introduction page
│   │   ├── upload/
│   │   │   └── +page.svelte        # Upload page with ZIP processing
│   │   └── api/
│   │       └── grade/
│   │           └── +server.ts      # Stateless API endpoint
│   ├── lib/                        # Shared components and utilities
│   ├── app.css                     # Global styles with Tailwind
│   └── app.html                    # HTML template
├── static/                         # Static assets
├── svelte.config.js                # SvelteKit configuration
├── vite.config.ts                  # Vite configuration
└── package.json                    # Dependencies and scripts
```

## API Endpoint

### POST /api/grade

Grades code submissions using the `code-grader-core` package and Google Gemini.

**Request Body:**
```json
{
  "gradingPolicy": "Grade according to: Code quality (40%), Functionality (40%), Documentation (20%)",
  "files": [
    {
      "path": "submission/main.py",
      "content": "def hello():\n    print('Hello World')"
    }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "score": 85,
  "scoringDetails": "Code Quality: 34/40 - Clean code with good structure...",
  "usage": {
    "totalTokenCount": 1250,
    "promptTokenCount": 850,
    "candidatesTokenCount": 400
  }
}
```

**Response (Error):**
```json
{
  "error": "Failed to process grading request",
  "message": "Error details..."
}
```

## Environment Variables

### Required

- `GEMINI_API_KEY`: Your Google Gemini API key (get from https://aistudio.google.com/apikey)

### Cloudflare Pages Deployment

When deploying to Cloudflare Pages, set the `GEMINI_API_KEY` as an environment variable in the Cloudflare dashboard:

1. Go to your Pages project settings
2. Navigate to "Settings" > "Environment variables"
3. Add `GEMINI_API_KEY` with your API key value
4. Redeploy your application

## Notes

- The application uses Svelte 5 Runes API (`$state`, `$props`, etc.)
- ZIP processing happens entirely in the browser - no files are uploaded directly
- The API endpoint is stateless and runs as a Cloudflare Pages Function
- Static assets are served from Cloudflare's global CDN
