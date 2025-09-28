// Simple in-memory rate limiter
// For production, consider using Redis-based rate limiting

interface RateLimitOptions {
    windowMs: number;
    max: number;
}

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimit {
    private options: RateLimitOptions;
    private store: Map<string, RateLimitEntry> = new Map();

    constructor(options: RateLimitOptions) {
        this.options = options;

        // Clean up expired entries every minute
        setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.store.entries()) {
                if (now > entry.resetTime) {
                    this.store.delete(key);
                }
            }
        }, 60000);
    }

    async check(key: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
        const now = Date.now();
        const entry = this.store.get(key);

        if (!entry || now > entry.resetTime) {
            // First request or expired window
            this.store.set(key, {
                count: 1,
                resetTime: now + this.options.windowMs,
            });
            return {
                allowed: true,
                remaining: this.options.max - 1,
                resetTime: now + this.options.windowMs,
            };
        }

        if (entry.count >= this.options.max) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: entry.resetTime,
            };
        }

        entry.count++;
        return {
            allowed: true,
            remaining: this.options.max - entry.count,
            resetTime: entry.resetTime,
        };
    }
}

export { RateLimit };