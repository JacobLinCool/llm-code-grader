export interface RetryOptions {
    /**
     * Maximum number of retry attempts (default: 3)
     */
    maxRetries?: number;
    /**
     * Initial delay in milliseconds before first retry (default: 1000)
     */
    initialDelayMs?: number;
    /**
     * Exponential backoff multiplier (default: 2)
     */
    backoffMultiplier?: number;
    /**
     * Maximum delay in milliseconds between retries (default: 30000)
     */
    maxDelayMs?: number;
}

/**
 * Sleep for a given number of milliseconds
 */
export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
    const {
        maxRetries = 3,
        initialDelayMs = 1000,
        backoffMultiplier = 2,
        maxDelayMs = 30000,
    } = options;

    let lastError: Error | undefined;
    let delay = initialDelayMs;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            // If this was the last attempt, throw the error
            if (attempt === maxRetries) {
                break;
            }

            // Log retry attempt
            console.warn(
                `LLM call failed (attempt ${attempt + 1}/${maxRetries + 1}): ${lastError.message}. ` +
                    `Retrying in ${delay}ms...`,
            );

            // Wait before retrying
            await sleep(delay);

            // Exponential backoff with max delay cap
            delay = Math.min(delay * backoffMultiplier, maxDelayMs);
        }
    }

    // All retries exhausted
    throw new Error(`Failed after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`);
}
