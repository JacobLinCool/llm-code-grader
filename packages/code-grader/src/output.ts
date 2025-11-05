import { createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';

export interface GradingRecord {
    submission: string;
    score: number;
    scoringDetails: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}

export type OutputFormat = 'json' | 'csv' | 'jsonl' | 'summary';

export class OutputHandler {
    private stream?: ReturnType<typeof createWriteStream>;
    private results: GradingRecord[] = [];
    private isStreaming: boolean;

    constructor(
        private format: OutputFormat,
        private outputPath?: string,
    ) {
        this.isStreaming = format === 'jsonl' || (format === 'summary' && !outputPath);
        if (format === 'jsonl' && outputPath) {
            this.stream = createWriteStream(outputPath);
        }
    }

    addResult(record: GradingRecord): void {
        if (this.stream) {
            // Streaming to file for jsonl
            this.stream.write(JSON.stringify(record) + '\n');
        } else if (this.isStreaming) {
            // Streaming to stdout for summary
            console.log(`\n${record.submission}:`);
            console.log(`  Score: ${record.score}`);
            console.log(`  Details: ${record.scoringDetails}`);
            console.log(`  Tokens: ${record.totalTokens}`);
        } else {
            // Collect for later output
            this.results.push(record);
        }
    }

    async finalize(): Promise<void> {
        if (this.stream) {
            this.stream.end();
            await new Promise<void>((resolve, reject) => {
                this.stream!.on('finish', resolve);
                this.stream!.on('error', reject);
            });
            console.log(`Results saved to ${this.outputPath}`);
        } else if (this.outputPath) {
            // Write collected results to file
            if (this.format === 'json') {
                await fs.writeFile(this.outputPath, JSON.stringify(this.results, null, 2), 'utf-8');
            } else if (this.format === 'csv') {
                const csv = this.convertToCSV(this.results);
                await fs.writeFile(this.outputPath, csv, 'utf-8');
            }
            console.log(`Results saved to ${this.outputPath}`);
        } else if (!this.isStreaming) {
            // Output collected results to stdout
            if (this.format === 'json') {
                console.log(JSON.stringify(this.results, null, 2));
            } else if (this.format === 'csv') {
                console.log(this.convertToCSV(this.results));
            } else {
                // summary - already streamed
                console.log('\n=== Grading Summary ===');
            }
        }
    }

    private convertToCSV(records: GradingRecord[]): string {
        const headers = [
            'submission',
            'score',
            'scoringDetails',
            'inputTokens',
            'outputTokens',
            'totalTokens',
        ];
        const rows = records.map((record) => [
            this.escapeCSV(record.submission),
            record.score.toString(),
            this.escapeCSV(record.scoringDetails),
            record.inputTokens.toString(),
            record.outputTokens.toString(),
            record.totalTokens.toString(),
        ]);

        return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    }

    private escapeCSV(value: string): string {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
}
