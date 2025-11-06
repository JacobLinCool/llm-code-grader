# LLM Code Grader Web App

A modern SvelteKit application for uploading and processing code submissions for AI-powered grading.

## Features

- **Landing Page**: Introduction to the LLM Code Grader with feature highlights
- **Upload Page**: Upload ZIP files containing code submissions
- **Client-Side Processing**: ZIP files are processed entirely in the browser for privacy and speed
- **Stateless API**: Serverless function endpoint that receives parsed file contents
- **Modern UI**: Built with Flowbite-Svelte components and Tailwind CSS 4
- **Svelte 5 Runes**: Uses the latest Svelte 5 Runes API for reactive state management

## Tech Stack

- **Framework**: SvelteKit (Svelte 5 with Runes API)
- **Deployment**: Cloudflare Pages (via @sveltejs/adapter-cloudflare)
- **UI Components**: flowbite-svelte
- **Icons**: @lucide/svelte
- **Styling**: Tailwind CSS 4
- **Zip Processing**: jszip (client-side)
- **Package Manager**: pnpm

## Development

### Prerequisites

- Node.js 18+ 
- pnpm 10.18.0+

### Install Dependencies

From the repository root:

```bash
pnpm install
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

Receives parsed file contents from client-side ZIP processing.

**Request Body:**
```json
{
  "files": [
    {
      "path": "submission/main.py",
      "content": "# file contents..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Files received successfully",
  "summary": {
    "fileCount": 5,
    "totalSize": 12345,
    "files": [...]
  }
}
```

## Environment Variables

No environment variables are required for basic functionality. Add any API keys or configuration as needed for your specific grading implementation.

## Notes

- The application uses Svelte 5 Runes API (`$state`, `$props`, etc.)
- ZIP processing happens entirely in the browser - no files are uploaded directly
- The API endpoint is stateless and runs as a Cloudflare Pages Function
- Static assets are served from Cloudflare's global CDN
