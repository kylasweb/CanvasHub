import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { HfInference } from '@huggingface/inference';
import OpenAI from 'openai';
import { generateText, generateObject, streamText } from 'ai';

// Provider configurations
export interface AIProvider {
    id: string;
    name: string;
    type: 'free' | 'paid';
    models: string[];
    maxTokens?: number;
    rateLimit?: number;
}

export const AI_PROVIDERS: AIProvider[] = [
    {
        id: 'huggingface',
        name: 'Hugging Face',
        type: 'free',
        models: ['microsoft/DialoGPT-medium', 'google/flan-t5-base', 'facebook/blenderbot-400M-distill'],
        maxTokens: 1000,
        rateLimit: 1000
    },
    {
        id: 'together',
        name: 'Together AI',
        type: 'free',
        models: ['mistralai/Mistral-7B-Instruct-v0.1', 'meta-llama/Llama-2-7b-chat-hf'],
        maxTokens: 4096,
        rateLimit: 100
    },
    {
        id: 'openrouter',
        name: 'OpenRouter',
        type: 'free',
        models: ['microsoft/wizardlm-2-8x22b', 'anthropic/claude-3-haiku:beta'],
        maxTokens: 4096,
        rateLimit: 50
    },
    {
        id: 'groq',
        name: 'Groq',
        type: 'free',
        models: ['llama2-70b-4096', 'mixtral-8x7b-32768'],
        maxTokens: 4096,
        rateLimit: 30
    },
    {
        id: 'openai',
        name: 'OpenAI',
        type: 'paid',
        models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'],
        maxTokens: 4096,
        rateLimit: 10000
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        type: 'paid',
        models: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
        maxTokens: 4096,
        rateLimit: 1000
    },
    {
        id: 'google',
        name: 'Google',
        type: 'paid',
        models: ['gemini-pro', 'gemini-pro-vision'],
        maxTokens: 30720,
        rateLimit: 1000
    }
];

// AI Service class
export class AIService {
    private providers: Map<string, any> = new Map();

    constructor() {
        this.initializeProviders();
    }

    private initializeProviders() {
        // Hugging Face (Free)
        if (process.env.HUGGINGFACE_API_KEY) {
            this.providers.set('huggingface', new HfInference(process.env.HUGGINGFACE_API_KEY));
        }

        // Together AI (Free tier)
        if (process.env.TOGETHER_API_KEY) {
            this.providers.set('together', new OpenAI({
                apiKey: process.env.TOGETHER_API_KEY,
                baseURL: 'https://api.together.xyz/v1'
            }));
        }

        // OpenRouter (Free models)
        if (process.env.OPENROUTER_API_KEY) {
            this.providers.set('openrouter', new OpenAI({
                apiKey: process.env.OPENROUTER_API_KEY,
                baseURL: 'https://openrouter.ai/api/v1'
            }));
        }

        // Groq (Free tier)
        if (process.env.GROQ_API_KEY) {
            this.providers.set('groq', new OpenAI({
                apiKey: process.env.GROQ_API_KEY,
                baseURL: 'https://api.groq.com/openai/v1'
            }));
        }

        // OpenAI (Paid)
        if (process.env.OPENAI_API_KEY) {
            this.providers.set('openai', openai);
        }

        // Anthropic (Paid)
        if (process.env.ANTHROPIC_API_KEY) {
            this.providers.set('anthropic', anthropic);
        }

        // Google (Paid)
        if (process.env.GOOGLE_API_KEY) {
            this.providers.set('google', google);
        }
    }

    async generateText(
        prompt: string,
        options: {
            provider?: string;
            model?: string;
            maxTokens?: number;
            temperature?: number;
            stream?: boolean;
        } = {}
    ) {
        const { provider = 'huggingface', model, maxTokens = 1000, temperature = 0.7, stream = false } = options;

        const providerInstance = this.providers.get(provider);
        if (!providerInstance) {
            throw new Error(`AI provider '${provider}' not configured or API key missing`);
        }

        try {
            if (provider === 'huggingface') {
                const response = await providerInstance.textGeneration({
                    model: model || 'microsoft/DialoGPT-medium',
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: maxTokens,
                        temperature,
                        do_sample: true
                    }
                });
                return response.generated_text;
            }

            if (provider === 'together' || provider === 'openrouter' || provider === 'groq') {
                const messages = [{ role: 'user', content: prompt }];
                const response = await providerInstance.chat.completions.create({
                    model: model || this.getDefaultModel(provider),
                    messages,
                    max_tokens: maxTokens,
                    temperature
                });
                return response.choices[0].message.content;
            }

            // For paid providers using AI SDK
            const result = await generateText({
                model: this.getModelInstance(provider, model),
                prompt,
                temperature
            });

            return result.text;
        } catch (error) {
            console.error(`AI generation failed for provider ${provider}:`, error);
            throw new Error(`Failed to generate text with ${provider}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async generateObject<T>(
        prompt: string,
        schema: any,
        options: {
            provider?: string;
            model?: string;
            temperature?: number;
        } = {}
    ): Promise<T> {
        const { provider = 'openai', model, temperature = 0.3 } = options;

        const providerInstance = this.providers.get(provider);
        if (!providerInstance) {
            throw new Error(`AI provider '${provider}' not configured or API key missing`);
        }

        try {
            const result = await generateObject({
                model: this.getModelInstance(provider, model),
                prompt,
                schema,
                temperature
            });

            return result.object as T;
        } catch (error) {
            console.error(`AI object generation failed for provider ${provider}:`, error);
            throw new Error(`Failed to generate object with ${provider}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async *streamText(
        prompt: string,
        options: {
            provider?: string;
            model?: string;
            maxTokens?: number;
            temperature?: number;
        } = {}
    ) {
        const { provider = 'openai', model, maxTokens = 1000, temperature = 0.7 } = options;

        const providerInstance = this.providers.get(provider);
        if (!providerInstance) {
            throw new Error(`AI provider '${provider}' not configured or API key missing`);
        }

        try {
            const result = await streamText({
                model: this.getModelInstance(provider, model),
                prompt,
                temperature
            });

            for await (const delta of result.textStream) {
                yield delta;
            }
        } catch (error) {
            console.error(`AI streaming failed for provider ${provider}:`, error);
            throw new Error(`Failed to stream text with ${provider}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private getModelInstance(provider: string, model?: string) {
        const defaultModel = this.getDefaultModel(provider);
        const modelName = model || defaultModel;

        switch (provider) {
            case 'openai':
                return openai(modelName);
            case 'anthropic':
                return anthropic(modelName);
            case 'google':
                return google(modelName);
            default:
                throw new Error(`Provider ${provider} not supported for this operation`);
        }
    }

    private getDefaultModel(provider: string): string {
        const providerConfig = AI_PROVIDERS.find(p => p.id === provider);
        return providerConfig?.models[0] || 'gpt-3.5-turbo';
    }

    getAvailableProviders(): AIProvider[] {
        return AI_PROVIDERS.filter(provider => this.providers.has(provider.id));
    }

    isProviderAvailable(provider: string): boolean {
        return this.providers.has(provider);
    }
}

// Export singleton instance
export const aiService = new AIService();