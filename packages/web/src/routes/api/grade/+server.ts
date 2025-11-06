import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { grade } from 'code-grader-core';
import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const body = await request.json();
		const { files, gradingPolicy } = body;

		if (!files || !Array.isArray(files)) {
			return json({ error: 'Invalid request: files array required' }, { status: 400 });
		}

		if (!gradingPolicy || typeof gradingPolicy !== 'string') {
			return json({ error: 'Invalid request: gradingPolicy string required' }, { status: 400 });
		}

		// Use API key from environment variable or Cloudflare binding
		const apiKey = platform?.env?.GEMINI_API_KEY || env.GEMINI_API_KEY;
		
		if (!apiKey) {
			return json(
				{ error: 'Server configuration error: GEMINI_API_KEY not configured' },
				{ status: 500 }
			);
		}

		// Convert files array to Record<string, string> format expected by grade function
		const submissionFiles: Record<string, string> = {};
		for (const file of files) {
			if (file.path && file.content) {
				submissionFiles[file.path] = file.content;
			}
		}

		// Initialize Google GenAI client
		const client = new GoogleGenAI({ apiKey });

		// Call the grade function from code-grader-core
		const result = await grade({
			gradingPolicy,
			attachments: [], // No attachments for web uploads
			submissionFiles,
			client,
			modelName: 'gemini-2.0-flash-exp', // Use fast model for web grading
			retry: {
				maxRetries: 3,
				initialDelayMs: 1000,
				maxDelayMs: 10000,
				backoffMultiplier: 2
			}
		});

		return json({
			success: true,
			score: result.score,
			scoringDetails: result.scoringDetails,
			usage: {
				totalTokenCount: result.usage.totalTokenCount,
				promptTokenCount: result.usage.promptTokenCount,
				candidatesTokenCount: result.usage.candidatesTokenCount
			}
		});
	} catch (error) {
		console.error('Error processing grade request:', error);
		return json(
			{ 
				error: 'Failed to process grading request',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
