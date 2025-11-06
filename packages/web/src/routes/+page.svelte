<script lang="ts">
	import { Button, Heading } from 'flowbite-svelte';
	import { Upload, CheckCircle, Zap } from '@lucide/svelte';
</script>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
	<div class="container mx-auto px-4 py-16">
		<!-- Hero Section -->
		<div class="text-center mb-16">
			<Heading tag="h1" class="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
				LLM Code Grader
			</Heading>
			<p class="mb-8 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl sm:px-16 xl:px-48">
				Automated code grading powered by AI. Upload your submissions and get instant feedback with detailed scoring.
			</p>
			<div class="flex justify-center gap-4">
				<Button href="/upload" size="xl" class="gap-2">
					<Upload class="w-5 h-5" />
					Upload Submissions
				</Button>
			</div>
		</div>

		<!-- Features Section -->
		<div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
			<div class="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
				<div class="flex justify-center mb-4">
					<Upload class="w-12 h-12 text-primary-600 dark:text-primary-400" />
				</div>
				<Heading tag="h3" class="mb-2 text-xl font-bold">Easy Upload</Heading>
				<p class="text-gray-500 dark:text-gray-400">
					Simply upload your code submissions as a ZIP file and let the AI do the rest.
				</p>
			</div>

			<div class="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
				<div class="flex justify-center mb-4">
					<Zap class="w-12 h-12 text-primary-600 dark:text-primary-400" />
				</div>
				<Heading tag="h3" class="mb-2 text-xl font-bold">Fast Processing</Heading>
				<p class="text-gray-500 dark:text-gray-400">
					Client-side ZIP processing ensures fast, secure, and private handling of your files.
				</p>
			</div>

			<div class="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
				<div class="flex justify-center mb-4">
					<CheckCircle class="w-12 h-12 text-primary-600 dark:text-primary-400" />
				</div>
				<Heading tag="h3" class="mb-2 text-xl font-bold">AI-Powered Grading</Heading>
				<p class="text-gray-500 dark:text-gray-400">
					Get comprehensive feedback with detailed scoring powered by advanced language models.
				</p>
			</div>
		</div>

		<!-- Info Section -->
		<div class="mt-16 max-w-3xl mx-auto text-center">
			<Heading tag="h2" class="mb-4 text-3xl font-bold">How It Works</Heading>
			<div class="text-left space-y-4 text-gray-700 dark:text-gray-300">
				<div class="flex gap-4">
					<span class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-600 text-white font-bold">1</span>
					<p><strong>Upload:</strong> Select a ZIP file containing your code submissions.</p>
				</div>
				<div class="flex gap-4">
					<span class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-600 text-white font-bold">2</span>
					<p><strong>Process:</strong> The ZIP is processed in your browser for privacy and speed.</p>
				</div>
				<div class="flex gap-4">
					<span class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-600 text-white font-bold">3</span>
					<p><strong>Grade:</strong> Our AI analyzes your code and provides detailed feedback.</p>
				</div>
			</div>
		</div>
	</div>
</div>
