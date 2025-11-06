import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { files } = body;

		if (!files || !Array.isArray(files)) {
			return json({ error: 'Invalid request: files array required' }, { status: 400 });
		}

		// This is a stateless API endpoint
		// In a real implementation, this would:
		// 1. Validate the files
		// 2. Process them with the grading logic
		// 3. Return grading results
		
		// For now, we'll just acknowledge receipt and return a summary
		const fileCount = files.length;
		const totalSize = files.reduce((acc: number, file: { content: string }) => 
			acc + file.content.length, 0
		);

		return json({
			success: true,
			message: 'Files received successfully',
			summary: {
				fileCount,
				totalSize,
				files: files.map((f: { path: string; content: string }) => ({
					path: f.path,
					size: f.content.length
				}))
			}
		});
	} catch (error) {
		console.error('Error processing grade request:', error);
		return json(
			{ 
				error: 'Failed to process request',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
