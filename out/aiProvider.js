"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIProvider = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
class AIProvider {
    constructor(context) {
        this.context = context;
    }
    async processCode(code, action, language) {
        const prompt = this.buildPrompt(code, action, language);
        return await this.callAI(prompt);
    }
    async generateCode(description, language) {
        const prompt = `Generate ${language} code for the following requirement:\n\n${description}\n\nProvide only the code without explanations, properly formatted and ready to use.`;
        return await this.callAI(prompt);
    }
    buildPrompt(code, action, language) {
        const prompts = {
            explain: `Explain this ${language} code in detail:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide a clear explanation of what this code does, how it works, and any important details.`,
            optimize: `Optimize this ${language} code for better performance and readability:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide the optimized code with improvements for performance, readability, and best practices.`,
            debug: `Analyze this ${language} code for potential bugs and issues:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nIdentify potential problems, bugs, edge cases, and suggest fixes. Explain what could go wrong and how to prevent it.`,
            comment: `Add comprehensive comments to this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nAdd clear, helpful comments explaining what each part does. Include function/method documentation where appropriate.`,
            refactor: `Refactor this ${language} code to improve its structure and maintainability:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nImprove the code structure, naming, separation of concerns, and overall maintainability while keeping the same functionality.`,
            test: `Generate comprehensive unit tests for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nCreate thorough unit tests that cover normal cases, edge cases, and error conditions. Use appropriate testing framework for ${language}.`
        };
        return prompts[action] || prompts.explain;
    }
    async callAI(prompt) {
        const config = vscode.workspace.getConfiguration('ai-assistant');
        const provider = config.get('provider', 'anthropic');
        if (provider === 'anthropic') {
            return await this.callClaude(prompt);
        }
        else if (provider === 'openai') {
            return await this.callOpenAI(prompt);
        }
        else if (provider === 'ollama') {
            return await this.callOllama(prompt);
        }
        else {
            throw new Error(`Unsupported AI provider: ${provider}`);
        }
    }
    async callClaude(prompt) {
        const config = vscode.workspace.getConfiguration('ai-assistant');
        const model = config.get('model', 'claude-3-sonnet-20240229');
        const maxTokens = config.get('maxTokens', 2000);
        const temperature = config.get('temperature', 0.1);
        const apiKey = await this.context.secrets.get('anthropic-api-key');
        if (!apiKey) {
            throw new Error('Anthropic API key not found. Please set it using the "AIMani: Set API Key" command.');
        }
        try {
            const response = await axios_1.default.post('https://api.anthropic.com/v1/messages', {
                model: model,
                max_tokens: maxTokens,
                temperature: temperature,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                }
            });
            return response.data.content[0].text;
        }
        catch (error) {
            if (error.response) {
                throw new Error(`API Error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
            }
            else if (error.request) {
                throw new Error('Network error: Unable to reach AI service');
            }
            else {
                throw new Error(`Request error: ${error.message}`);
            }
        }
    }
    async callOpenAI(prompt) {
        const config = vscode.workspace.getConfiguration('ai-assistant');
        const model = config.get('model', 'gpt-4');
        const maxTokens = config.get('maxTokens', 2000);
        const temperature = config.get('temperature', 0.1);
        const apiKey = await this.context.secrets.get('openai-api-key');
        if (!apiKey) {
            throw new Error('OpenAI API key not found. Please set it using the "AIMani: Set API Key" command.');
        }
        try {
            const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
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
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            if (error.response) {
                throw new Error(`API Error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
            }
            else if (error.request) {
                throw new Error('Network error: Unable to reach AI service');
            }
            else {
                throw new Error(`Request error: ${error.message}`);
            }
        }
    }
    async callOllama(prompt) {
        const config = vscode.workspace.getConfiguration('ai-assistant');
        const model = config.get('model', 'ollama-model');
        const maxTokens = config.get('maxTokens', 2000);
        const temperature = config.get('temperature', 0.1);
        try {
            const response = await axios_1.default.post('http://localhost:11434/v1/completions', {
                model: model,
                prompt: prompt,
                max_tokens: maxTokens,
                temperature: temperature
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data.choices[0].text;
        }
        catch (error) {
            if (error.response) {
                throw new Error(`API Error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
            }
            else if (error.request) {
                throw new Error('Network error: Unable to reach AI service');
            }
            else {
                throw new Error(`Request error: ${error.message}`);
            }
        }
    }
}
exports.AIProvider = AIProvider;
//# sourceMappingURL=aiProvider.js.map