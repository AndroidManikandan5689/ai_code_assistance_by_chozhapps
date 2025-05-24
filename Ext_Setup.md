# AI Code Assistant VS Code Extension - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- VS Code
- TypeScript installed globally: `npm install -g typescript`
- VS Code Extension Manager: `npm install -g vsce`

### Installation Steps

1. **Create Extension Project**
```bash
mkdir ai-code-assistant
cd ai-code-assistant
```

2. **Initialize Project**
```bash
npm init -y
```

3. **Install Dependencies**
```bash
# Development dependencies
npm install -D @types/vscode @types/node typescript

# Runtime dependencies  
npm install axios
```

4. **Create Project Structure**
```
ai-code-assistant/
├── src/
│   ├── extension.ts
│   ├── aiProvider.ts
│   └── chatProvider.ts
├── package.json
├── tsconfig.json
└── README.md
```

5. **Copy Files**
- Copy the `package.json` content from the artifacts
- Copy all TypeScript files to the `src/` directory
- Copy `tsconfig.json` to root

6. **Compile Extension**
```bash
npm run compile
```

## 🔧 Configuration

### API Keys Setup
The extension supports both Anthropic Claude and OpenAI:

1. **For Anthropic Claude:**
   - Get API key from [Anthropic Console](https://console.anthropic.com/)
   - In VS Code: `Ctrl+Shift+P` → "AIMani: Set API Key"
   - Configure provider: Settings → AI Code Assistant → Provider: "anthropic"

2. **For OpenAI:**
   - Get API key from [OpenAI Platform](https://platform.openai.com/)
   - Set provider to "openai" in settings
   - Configure model (e.g., "gpt-4", "gpt-3.5-turbo")

### Settings Configuration
```json
{
  "ai-assistant.provider": "anthropic",
  "ai-assistant.model": "claude-3-sonnet-20240229",
  "ai-assistant.maxTokens": 2000,
  "ai-assistant.temperature": 0.1
}
```

## 🎯 Features

### Code Actions (Right-click menu)
- **Explain Code**: Get detailed explanations
- **Optimize Code**: Improve performance and readability
- **Debug Code**: Find potential bugs and issues
- **Add Comments**: Generate comprehensive comments
- **Refactor Code**: Improve code structure
- **Generate Tests**: Create unit tests

### Commands
- `Ctrl+Alt+E`: Explain selected code
- `Ctrl+Alt+G`: Generate code from comment/prompt
- `Ctrl+Alt+C`: Open AI chat panel

### Chat Interface
- Interactive AI chat in sidebar
- Code insertion from chat responses
- Persistent conversation history
- Markdown and code block support

## 🔨 Development

### Running in Development
1. Open project in VS Code
2. Press `F5` to launch Extension Development Host
3. Test extension in new VS Code window

### Building for Production
```bash
# Package extension
npm install -g @vscode/vsce=
or
npm install -g vsce

vsce package

# Install locally
code --install-extension ai-code-assistant-0.0.1.vsix
```

### Publishing
```bash
# Create publisher account
vsce create-publisher your-name

# Login
vsce login your-name

# Publish
vsce publish
```

## 🛠️ Customization

### Adding New AI Providers
1. Extend `AIProvider` class in `aiProvider.ts`
2. Add provider configuration in `package.json`
3. Implement API integration method

### Custom Prompts
Update prompts in `buildPrompt()` method in `aiProvider.ts`:

```typescript
private buildPrompt(code: string, action: string, language: string): string {
    const prompts = {
        yourAction: `Your custom prompt for ${language} code:\n\n${code}`,
        // ... other prompts
    };
    return prompts[action as keyof typeof prompts] || prompts.explain;
}
```

### UI Customization
Modify the HTML/CSS in `chatProvider.ts` `getHtmlForWebview()` method.

## 🔍 Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Ensure API key is set: Command Palette → "AIMani: Set API Key"
   - Check provider setting matches your API key type

2. **Network Errors**
   - Check internet connection
   - Verify API endpoints are accessible
   - Check if corporate firewall is blocking requests

3. **Compilation Errors**
   - Run `npm install` to ensure dependencies
   - Check TypeScript version compatibility
   - Verify `tsconfig.json` configuration

4. **Extension Not Loading**
   - Check VS Code version compatibility (≥1.74.0)
   - Verify `package.json` activation events
   - Check console for error messages

### Debug Mode
Enable debug logging by adding to settings:
```json
{
  "ai-assistant.debug": true
}
```

## 📝 Usage Examples

### Explain Code
1. Select code snippet
2. Right-click → "AI Assistant" → "Explain Selected Code"
3. View explanation in new tab

### Generate Code
1. Write comment: `// Create a function to sort array by name`
2. Press `Ctrl+Alt+G`
3. Choose insertion method

### Chat Usage
1. Open chat: `Ctrl+Alt+C`
2. Ask: "How do I implement a binary search?"
3. Click "Insert" on code blocks to add to editor

## 🚀 Advanced Features

### Batch Processing
Process multiple files by creating custom commands:

```typescript
vscode.commands.registerCommand('ai-assistant.processWorkspace', async () => {
    const files = await vscode.workspace.findFiles('**/*.{js,ts,py}');
    for (const file of files) {
        // Process each file
    }
});
```

### Custom Context Menu
Add more context menu items in `package.json`:

```json
"menus": {
  "editor/context": [
    {
      "command": "your-custom-command",
      "when": "editorLangId == python"
    }
  ]
}
```

## List of AI Models

Your extension supports three AI model providers:

1. Anthropic Claude
How to use:
Get your API key from Anthropic Console.
In VS Code, open Command Palette (Ctrl+Shift+P) → "AIMani: Set API Key" and enter your key.
In settings, set:
Use extension features as normal.
2. OpenAI (ChatGPT, GPT-4, etc.)
How to use:
Get your API key from OpenAI Platform.
In VS Code, open Command Palette (Ctrl+Shift+P) → "AIMani: Set API Key" and enter your key.
In settings, set:
Use extension features as normal.
3. Ollama (Local LLMs)
How to use:
Install Ollama and run it on your machine.
Pull a model, e.g.:
In VS Code settings, set:
No API key is needed for Ollama.
Use extension features as normal (requests go to your local Ollama server).
Summary Table:

Provider	API Key Needed	Example Model Name	Notes
Anthropic	Yes	claude-3-sonnet-20240229	Cloud, paid
OpenAI	Yes	gpt-4, gpt-3.5-turbo	Cloud, paid
Ollama	No	llama3, mistral, etc.	Local, free/open-source
To switch models:
Change the ai-assistant.provider and ai-assistant.model settings in your VS Code settings.

## 📋 Requirements

- VS Code ≥ 1.74.0
- Node.js ≥ 16.0.0
- Valid AI API key (Anthropic or OpenAI)
- Internet connection for API calls

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

This extension provides a solid foundation for AI-powered code assistance that you can extend and customize based on your specific needs!