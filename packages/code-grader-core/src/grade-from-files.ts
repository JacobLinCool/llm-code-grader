import type { GoogleGenAI } from '@google/genai';
import fs from 'node:fs/promises';
import { grade, type GradeOptions, type GradeResult } from './grade';
import type { RetryOptions } from './retry';

export interface GradeFromFilesOptions {
    gradingPolicyPath: string;
    submissionPath: string;
    client: Pick<GoogleGenAI, 'models'>;
    modelName: string;
    /**
     * Retry configuration for LLM API calls
     */
    retry?: RetryOptions;
}

export async function loadGradingPolicy(gradingPolicyPath: string): Promise<{
    gradingPolicy: string;
    attachments: GradeOptions['attachments'];
}> {
    // Load grading policy (README.md from gradingPolicyPath)
    const readmePath = `${gradingPolicyPath}/README.md`;
    let gradingPolicy = '';
    try {
        gradingPolicy = await fs.readFile(readmePath, 'utf-8');
    } catch (error) {
        throw new Error(`Failed to read grading policy from ${readmePath}: ${error}`);
    }

    // Load attachment files (PDF/image/video/audio) from gradingPolicyPath
    const policyFiles = await fs.readdir(gradingPolicyPath);
    const attachmentMimeTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.mpeg': 'video/mpeg',
        '.mov': 'video/mov',
        '.avi': 'video/avi',
        '.mp3': 'audio/mp3',
        '.wav': 'audio/wav',
    };

    const attachments: GradeOptions['attachments'] = [];
    for (const fileName of policyFiles) {
        if (fileName === 'README.md') continue;

        const filePath = `${gradingPolicyPath}/${fileName}`;
        const fileStat = await fs.stat(filePath);

        if (fileStat.isFile()) {
            const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
            const mimeType = attachmentMimeTypes[ext];

            if (mimeType) {
                const fileData = await fs.readFile(filePath);
                attachments.push({
                    fileName,
                    mimeType,
                    data: fileData,
                });
            }
        }
    }

    return { gradingPolicy, attachments };
}

export async function loadSubmissionFiles(submissionPath: string): Promise<Record<string, string>> {
    // Load submission code files
    const submissionFileNames = await fs.readdir(submissionPath);
    const submissionFiles: Record<string, string> = {};

    for (const fileName of submissionFileNames) {
        const filePath = `${submissionPath}/${fileName}`;
        const fileStat = await fs.stat(filePath);
        if (fileStat.isFile()) {
            const content = await fs.readFile(filePath, 'utf-8');
            submissionFiles[fileName] = content;
        }
    }

    return submissionFiles;
}

export async function gradeFromFiles(opt: GradeFromFilesOptions): Promise<GradeResult> {
    const { gradingPolicyPath, submissionPath, client, modelName, retry } = opt;

    // Load grading policy and attachments
    const { gradingPolicy, attachments } = await loadGradingPolicy(gradingPolicyPath);

    // Load submission files
    const submissionFiles = await loadSubmissionFiles(submissionPath);

    // Call grade with the prepared data
    return grade({
        gradingPolicy,
        attachments,
        submissionFiles,
        client,
        modelName,
        retry,
    });
}
