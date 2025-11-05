import {
    Type,
    type Content,
    type GenerateContentResponseUsageMetadata,
    type GoogleGenAI,
} from '@google/genai';
import { withRetry, type RetryOptions } from './retry';

export interface GradeOptions {
    gradingPolicy: string;
    attachments: Array<{
        fileName: string;
        mimeType: string;
        data: string | Buffer;
    }>;
    submissionFiles: Record<string, string>;
    client: Pick<GoogleGenAI, 'models'>;
    modelName: string;
    /**
     * Retry configuration for LLM API calls
     */
    retry?: RetryOptions;
}

export interface GradeResult {
    score: number;
    scoringDetails: string;
    usage: GenerateContentResponseUsageMetadata;
}

export async function grade(opt: GradeOptions): Promise<GradeResult> {
    const { gradingPolicy, attachments, submissionFiles, client, modelName, retry } = opt;

    const contents: Content[] = [];

    // Add attachment files
    for (const attachment of attachments) {
        contents.push({
            role: 'user',
            parts: [
                {
                    text: `Attachment: ${attachment.fileName}`,
                },
                {
                    inlineData: {
                        mimeType: attachment.mimeType,
                        data: Buffer.isBuffer(attachment.data)
                            ? attachment.data.toString('base64')
                            : attachment.data,
                    },
                },
            ],
        });
    }

    // Add grading policy prompt
    contents.push({
        role: 'user',
        parts: [
            {
                text: `\n\n---\nBelow is the grading policy for the code submission:\n\n${gradingPolicy}\n\n---\n`,
            },
        ],
    });

    // Add submission files to contents
    const submissionText = Object.entries(submissionFiles)
        .map(([fileName, content]) => `## File: ${fileName}\n\n\`\`\`\n${content}\n\`\`\``)
        .join('\n\n');

    contents.push({
        role: 'user',
        parts: [
            {
                text: `# Submission Code\n\n${submissionText}\n\nPlease grade this submission according to the grading policy provided above.`,
            },
        ],
    });

    // Execute LLM call with retry logic
    const result = await withRetry(async () => {
        const response = await client.models.generateContent({
            model: modelName,
            contents,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        scoringDetails: { type: Type.STRING },
                    },
                    required: ['score', 'scoringDetails'],
                },
            },
        });

        if (!response.text) {
            throw new Error('Failed to generate grading result');
        }

        if (!response.usageMetadata) {
            throw new Error('Missing usage metadata in grading result');
        }

        return response;
    }, retry);

    // At this point, text and usageMetadata are guaranteed to exist due to validation in withRetry
    const gradingResult = JSON.parse(result.text!) as Omit<GradeResult, 'usage'>;

    return {
        ...gradingResult,
        usage: result.usageMetadata!,
    };
}
