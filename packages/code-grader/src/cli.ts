#!/usr/bin/env node
import { GoogleGenAI } from '@google/genai';
import { CodeGrader, loadGradingPolicy, loadSubmissionFiles } from 'code-grader-core';
import { program } from 'commander';
import fs from 'node:fs/promises';
import path from 'node:path';
import pLimit from 'p-limit';
import { GoogleGenAIPool } from './genai-pool';
import { OutputHandler, type GradingRecord } from './output';

program
    .name('code-grader')
    .description('CLI tool for LLM-based code grading')
    .version('0.0.0')
    .requiredOption('-p, --policy <path>', 'Path to the grading policy directory')
    .requiredOption(
        '-s, --submissions <paths...>',
        'Paths to submission directories (can specify multiple)',
    )
    .option('-m, --model <name>', 'Model name to use for grading', 'gemini-2.5-pro')
    .option('-k, --api-key <key>', 'Google AI API key (or set GEMINI_API_KEY env var)')
    .option('--base-url <url>', 'Base URL for the Gemini API (or set GEMINI_API_BASE_URL env var)')
    .option('-c, --concurrency <number>', 'Number of submissions to grade concurrently', '1')
    .option('-o, --output <path>', 'Output file path (supports .json, .csv, and .jsonl extensions)')
    .option('--json', 'Output results as JSON to stdout')
    .option('--csv', 'Output results as CSV to stdout')
    .action(async (options) => {
        try {
            // Get API key
            const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
            if (!apiKey) {
                console.error(
                    'Error: Google AI API key is required. Provide via --api-key or GEMINI_API_KEY env var.',
                );
                process.exit(1);
            }

            // Get base URL
            const baseUrl = options.baseUrl || process.env.GEMINI_API_BASE_URL;

            // Initialize client(s)
            const client = new GoogleGenAIPool(GoogleGenAI);
            const keys = apiKey
                .split(',')
                .map((key: string) => key.trim())
                .sort(() => Math.random() - 0.5);
            for (const key of keys) {
                client.add({
                    apiKey: key,
                    httpOptions: { baseUrl },
                });
            }

            // Validate policy path
            const policyPath = path.resolve(options.policy);
            try {
                await fs.access(policyPath);
            } catch {
                console.error(`Error: Grading policy directory not found: ${policyPath}`);
                process.exit(1);
            }

            // Validate submission paths
            const submissionPaths: string[] = [];
            for (const submissionPath of options.submissions) {
                const resolvedPath = path.resolve(submissionPath);
                try {
                    await fs.access(resolvedPath);
                    submissionPaths.push(resolvedPath);
                } catch {
                    console.error(`Error: Submission directory not found: ${resolvedPath}`);
                    process.exit(1);
                }
            }

            // Parse concurrency option
            const concurrency = parseInt(options.concurrency, 10);
            if (isNaN(concurrency) || concurrency < 1) {
                console.error('Error: Concurrency must be a positive integer');
                process.exit(1);
            }

            // Determine output format and path
            let outputFormat: 'json' | 'csv' | 'jsonl' | 'summary' = 'summary';
            let outputPath: string | undefined;
            if (options.output) {
                outputPath = path.resolve(options.output);
                const ext = path.extname(outputPath).toLowerCase();
                if (ext === '.json') {
                    outputFormat = 'json';
                } else if (ext === '.csv') {
                    outputFormat = 'csv';
                } else if (ext === '.jsonl') {
                    outputFormat = 'jsonl';
                } else {
                    console.error('Error: Output file must have .json, .csv, or .jsonl extension');
                    process.exit(1);
                }
            } else if (options.json) {
                outputFormat = 'json';
            } else if (options.csv) {
                outputFormat = 'csv';
            }

            console.log(
                `Grading ${submissionPaths.length} submission(s) using ${options.model} (concurrency: ${concurrency})...\n`,
            );

            // Load grading policy and attachments
            const { gradingPolicy, attachments } = await loadGradingPolicy(policyPath);

            // Create CodeGrader instance
            const grader = new CodeGrader({ gradingPolicy, attachments });

            // Create output handler
            const outputHandler = new OutputHandler(outputFormat, outputPath);

            // Grade all submissions with concurrency control
            const gradeSubmission = async (
                submissionPath: string,
                outputHandler: OutputHandler,
            ): Promise<void> => {
                const submissionName = path.basename(submissionPath);
                console.log(`[${new Date().toISOString()}] Grading: ${submissionName}...`);

                try {
                    const submissionFiles = await loadSubmissionFiles(submissionPath);
                    const result = await grader.grade({
                        submissionFiles,
                        client,
                        modelName: options.model,
                    });

                    const record: GradingRecord = {
                        submission: submissionName,
                        score: result.score,
                        scoringDetails: result.scoringDetails,
                        inputTokens: result.usage.promptTokenCount || 0,
                        outputTokens: result.usage.candidatesTokenCount || 0,
                        totalTokens: result.usage.totalTokenCount || 0,
                    };

                    console.log(
                        `[${new Date().toISOString()}] ${submissionName} - Score: ${result.score}, Tokens: ${record.totalTokens} (in: ${record.inputTokens}, out: ${record.outputTokens})`,
                    );

                    outputHandler.addResult(record);
                } catch (error) {
                    console.error(
                        `[${new Date().toISOString()}] ${submissionName} - Failed: ${error}`,
                    );
                }
            };

            // Process submissions with concurrency limit
            const limit = pLimit(concurrency);
            const promises = submissionPaths.map((submissionPath) =>
                limit(() => gradeSubmission(submissionPath, outputHandler)),
            );
            await Promise.all(promises);

            // Finalize output
            await outputHandler.finalize();
        } catch (error) {
            console.error(`Error: ${error}`);
            process.exit(1);
        }
    });

program.parse();
