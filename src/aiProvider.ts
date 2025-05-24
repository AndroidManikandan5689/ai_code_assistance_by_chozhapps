import * as vscode from 'vscode';
import axios from 'axios';

export interface AIResponse {
    content: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export class AIProvider {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    async processCode(code: string, action: string, language: string): Promise<string> {
        const prompt = this.buildPrompt(code, action, language);
        return await this.callAI(prompt);
    }

    async generateCode(description: string, language: string): Promise<string> {
        const prompt = `Generate ${language} code for the following requirement:\n\n${description}\n\nProvide only the code without explanations, properly formatted and ready to use.`;
        return await this.callAI(prompt);
    }

    private buildPrompt(code: string, action: string, language: string): string {
        const prompts = {
            explain: `Explain this ${language} code in detail:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide a clear explanation of what this code does, how it works, and any important details.`,

            optimize: `Optimize this ${language} code for better performance and readability:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide the optimized code with improvements for performance, readability, and best practices.`,

            debug: `Analyze this ${language} code for potential bugs and issues:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nIdentify potential problems, bugs, edge cases, and suggest fixes. Explain what could go wrong and how to prevent it.`,

            comment: `Add comprehensive comments to this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nAdd clear, helpful comments explaining what each part does. Include function/method documentation where appropriate.`,

            refactor: `Refactor this ${language} code to improve its structure and maintainability:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nImprove the code structure, naming, separation of concerns, and overall maintainability while keeping the same functionality.`,

            test: `Generate comprehensive unit tests for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nCreate thorough unit tests that cover normal cases, edge cases, and error conditions. Use appropriate testing framework for ${language}.`
        };

        return prompts[action as keyof typeof prompts] || prompts.explain;
    }

    private async callAI(prompt: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('ai-assistant');
        const provider = config.get<string>('provider', 'anthropic');
        
        if (provider === 'anthropic') {
            return await this.callClaude(prompt);
        } else if (provider === 'openai') {
            return await this.callOpenAI(prompt);
        } else if (provider === 'ollama') {
            return await this.callOllama(prompt);
        } else {
            throw new Error(`Unsupported AI provider: ${provider}`);
        }
    }

    private async callClaude(prompt: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('ai-assistant');
        const model = config.get<string>('model', 'claude-3-sonnet-20240229');
        const maxTokens = config.get<number>('maxTokens', 2000);
        const temperature = config.get<number>('temperature', 0.1);

        const apiKey = await this.context.secrets.get('anthropic-api-key');
        if (!apiKey) {
            throw new Error('Anthropic API key not found. Please set it using the "AIMani: Set API Key" command.');
        }

        try {
            const response = await axios.post(
                'https://api.anthropic.com/v1/messages',
                {
                    model: model,
                    max_tokens: maxTokens,
                    temperature: temperature,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01'
                    }
                }
            );

            return response.data.content[0].text;
        } catch (error: any) {
            if (error.response) {
                throw new Error(`API Error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
            } else if (error.request) {
                throw new Error('Network error: Unable to reach AI service');
            } else {
                throw new Error(`Request error: ${error.message}`);
            }
        }
    }

    private async callOpenAI(prompt: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('ai-assistant');
        const model = config.get<string>('model', 'gpt-4');
        const maxTokens = config.get<number>('maxTokens', 2000);
        const temperature = config.get<number>('temperature', 0.1);

        const apiKey = await this.context.secrets.get('openai-api-key');
        if (!apiKey) {
            throw new Error('OpenAI API key not found. Please set it using the "AIMani: Set API Key" command.');
        }

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: model,
                    max_tokens: maxTokens,
                    temperature: temperature,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful coding assistant. Provide clear, accurate, and helpful responses about code.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error: any) {
            if (error.response) {
                throw new Error(`API Error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
            } else if (error.request) {
                throw new Error('Network error: Unable to reach AI service');
            } else {
                throw new Error(`Request error: ${error.message}`);
            }
        }
    }

    private async callOllama(prompt: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('ai-assistant');
        const model = config.get<string>('model', 'ollama-model');
        const maxTokens = config.get<number>('maxTokens', 2000);
        const temperature = config.get<number>('temperature', 0.1);

        try {
            const response = await axios.post(
                'http://localhost:11434/v1/completions',
                {
                    model: model,
                    prompt: prompt,
                    max_tokens: maxTokens,
                    temperature: temperature
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0].text;
        } catch (error: any) {
            if (error.response) {
                throw new Error(`API Error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
            } else if (error.request) {
                throw new Error('Network error: Unable to reach AI service');
            } else {
                throw new Error(`Request error: ${error.message}`);
            }
        }
    }
}