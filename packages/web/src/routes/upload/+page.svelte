<script lang="ts">
	import { Button, Heading, Alert, Spinner, Label, Fileupload, Textarea } from 'flowbite-svelte';
	import { Upload, CheckCircle, AlertCircle, ArrowLeft } from '@lucide/svelte';
	import JSZip from 'jszip';

	let files = $state<FileList | undefined>();
	let gradingPolicy = $state('');
	let processing = $state(false);
	let result = $state<{ 
		success: boolean; 
		message?: string;
		score?: number;
		scoringDetails?: string;
		usage?: {
			totalTokenCount: number;
			promptTokenCount: number;
			candidatesTokenCount: number;
		}
	} | null>(null);
	let processedFiles = $state<{ path: string; content: string }[]>([]);

	async function handleSubmit() {
		if (!files || files.length === 0) {
			result = { success: false, message: 'Please select a file' };
			return;
		}

		if (!gradingPolicy.trim()) {
			result = { success: false, message: 'Please provide a grading policy' };
			return;
		}

		const file = files[0];
		if (!file.name.endsWith('.zip')) {
			result = { success: false, message: 'Please select a ZIP file' };
			return;
		}

		processing = true;
		result = null;
		processedFiles = [];

		try {
			// Process ZIP file in browser
			const zip = new JSZip();
			const zipContent = await zip.loadAsync(file);

			const filePromises: Promise<void>[] = [];

			zipContent.forEach((relativePath, zipEntry) => {
				if (!zipEntry.dir) {
					const promise = zipEntry.async('text').then((content) => {
						processedFiles.push({ path: relativePath, content });
					});
					filePromises.push(promise);
				}
			});

			await Promise.all(filePromises);

			// Send to API with grading policy
			const response = await fetch('/api/grade', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ 
					files: processedFiles,
					gradingPolicy: gradingPolicy.trim()
				})
			});

			if (response.ok) {
				const data = await response.json();
				result = {
					success: true,
					score: data.score,
					scoringDetails: data.scoringDetails,
					usage: data.usage
				};
			} else {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `Server returned ${response.status}`);
			}
		} catch (error) {
			result = {
				success: false,
				message: `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`
			};
		} finally {
			processing = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
	<div class="container mx-auto px-4 py-16 max-w-3xl">
		<!-- Back Button -->
		<div class="mb-8">
			<Button href="/" color="light" class="gap-2">
				<ArrowLeft class="w-4 h-4" />
				Back to Home
			</Button>
		</div>

		<!-- Header -->
		<div class="text-center mb-8">
			<Heading tag="h1" class="mb-4 text-4xl font-extrabold text-gray-900 dark:text-white">
				Upload Submissions
			</Heading>
			<p class="text-lg text-gray-500 dark:text-gray-400">
				Select a ZIP file containing code submissions for grading
			</p>
		</div>

		<!-- Upload Form -->
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
				<div>
					<Label for="grading-policy" class="mb-2 text-lg font-semibold">
						Grading Policy
					</Label>
					<Textarea
						id="grading-policy"
						bind:value={gradingPolicy}
						placeholder="Enter the grading rubric and instructions here...&#10;&#10;Example:&#10;- Code quality: 30 points&#10;- Functionality: 40 points&#10;- Documentation: 20 points&#10;- Testing: 10 points"
						rows="6"
						disabled={processing}
						class="w-full"
					/>
					<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
						Provide the grading rubric and instructions for the AI to evaluate submissions
					</p>
				</div>

				<div>
					<Label for="file-upload" class="mb-2 text-lg font-semibold">
						Select ZIP File
					</Label>
					<Fileupload
						id="file-upload"
						bind:files
						accept=".zip"
						disabled={processing}
						class="w-full"
					/>
					<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
						Upload a ZIP file containing code submissions
					</p>
				</div>

				<Button
					type="submit"
					disabled={processing || !files || files.length === 0 || !gradingPolicy.trim()}
					size="lg"
					class="w-full gap-2"
				>
					{#if processing}
						<Spinner size="4" />
						Grading...
					{:else}
						<Upload class="w-5 h-5" />
						Grade Submission
					{/if}
				</Button>
			</form>

			<!-- Result Display -->
			{#if result}
				<div class="mt-6 space-y-4">
					{#if result.success && result.score !== undefined}
						<Alert color="green" class="flex items-start gap-3">
							<CheckCircle class="w-5 h-5 flex-shrink-0 mt-0.5" />
							<div class="flex-1">
								<div class="font-semibold text-lg mb-2">
									Score: {result.score}/100
								</div>
								{#if result.scoringDetails}
									<div class="text-sm whitespace-pre-wrap">
										{result.scoringDetails}
									</div>
								{/if}
								{#if result.usage}
									<div class="text-xs mt-3 pt-3 border-t border-green-200 dark:border-green-800">
										Tokens used: {result.usage.totalTokenCount} 
										(prompt: {result.usage.promptTokenCount}, response: {result.usage.candidatesTokenCount})
									</div>
								{/if}
							</div>
						</Alert>
					{:else if !result.success}
						<Alert color="red" class="flex items-center gap-2">
							<AlertCircle class="w-5 h-5 flex-shrink-0" />
							<span>{result.message}</span>
						</Alert>
					{/if}
				</div>
			{/if}

			<!-- Processing Info -->
			{#if processing && processedFiles.length > 0}
				<div class="mt-6">
					<p class="text-sm text-gray-600 dark:text-gray-400">
						Processed {processedFiles.length} files from ZIP...
					</p>
				</div>
			{/if}
		</div>

		<!-- Instructions -->
		<div class="mt-8 p-6 bg-blue-50 dark:bg-gray-700 rounded-lg">
			<Heading tag="h3" class="mb-4 text-xl font-bold">Instructions</Heading>
			<ul class="space-y-2 text-gray-700 dark:text-gray-300">
				<li>• Provide a detailed grading policy with rubric and evaluation criteria</li>
				<li>• Upload a ZIP file containing the code submission to grade</li>
				<li>• ZIP processing happens entirely in your browser for privacy</li>
				<li>• The AI will evaluate the code according to your grading policy</li>
				<li>• Results include a score (0-100) and detailed feedback</li>
			</ul>
		</div>
	</div>
</div>
