# Claude VS Code Extension by ChozhApps

A Visual Studio Code extension that integrates Claude AI directly into your editor. Get AI-powered coding help, explanations, documentation generation, and more — without leaving VS Code.

## 🚀 Features
🤖 Seamless integration with Claude AI

⌨️ Simple keyboard shortcuts for quick access

🔒 Secure API key storage

🧠 Supports multiple Claude models

💡 Context-aware responses based on your selected code

### 🛠 Installation
 * Download the .vsix file from the Releases page.
 * In VS Code, press Ctrl+Shift+P (or Cmd+Shift+P on Mac).
 * Type Install from VSIX and select the downloaded file.
 * Restart VS Code.

### ⚙️ Configuration
Before using the extension, you must add your Claude API key:

 * Get your API key from the Anthropic Console.
 * Open VS Code Settings (Ctrl+, or Cmd+, on Mac).
 * Search for Claude.
 * Enter your API key in the Claude VS Code: API Key field.

### Optional Settings:
claude-vscode.model: Choose which Claude model to use (default: claude-3-opus-20240229)

### 💡 Usage
 * Select text or code in your editor.
 * Trigger Claude with any of the following:
     *  * Press Ctrl+Shift+C (or Cmd+Shift+C on Mac)
     *  * Press Ctrl+Shift+P, type “Ask Claude”, and run the command
     *  * Right-click and select Ask Claude from the context menu
 * Claude's response will appear in the Claude Output channel.

### 🧪 Examples
Here are some practical ways to use Claude with your code:

1. 🔍 Code Explanation
Select a complex code block and ask Claude to explain it.

2. 🔧 Code Improvement
Highlight code you'd like optimized and request suggestions.

3. 📝 Documentation
Select a function or class and ask Claude to generate inline documentation.

4. 🐞 Bug Finding
Choose a piece of code and ask Claude to identify potential issues.

## 🦙 Ollama Local Model Support

### Using Ollama as a Provider

Ollama lets you run open-source LLMs (like Llama 3, Mistral, etc.) locally on your machine.  
**No API key is required.**

#### 1. Install Ollama

- Download and install Ollama from [https://ollama.com/download](https://ollama.com/download)
- Start Ollama (`ollama serve` runs automatically on most systems)

#### 2. Pull a Model

Open your terminal and run (example for Llama 3):

```bash
ollama pull llama3
```

#### 3. Configure the Extension

- In VS Code, open Settings (`Ctrl+,`)
- Set:
  - `ai-assistant.provider` to `"ollama"`
  - `ai-assistant.model` to the model you pulled (e.g., `"llama3"`)
- **No API key is needed for Ollama.**

Example settings:

```json
{
  "ai-assistant.provider": "ollama",
  "ai-assistant.model": "llama3",
  "ai-assistant.maxTokens": 2000,
  "ai-assistant.temperature": 0.1
}
```

#### 4. Usage

- Use all extension features as usual.
- The extension will connect to your local Ollama server at `http://localhost:11434`.

#### 5. Troubleshooting

- Make sure Ollama is running (`ollama serve`)
- Ensure the model name matches what you pulled
- No API key is required; if prompted, you can skip

---

**Tip:** Ollama runs entirely on your machine—no cloud required!

## 👨‍💻 Development
To build the extension locally:

bash
Copy
Edit
# Clone the repository
```bash
git clone https://github.com/AndroidManikandan5689/ai_code_assistance_by_chozhapps.git
```


### Installation Steps

```bash
cd ai_code_assistance_by_chozhapps
npm install
```

# Compile the extension
```bash
npm run compile
```

# Package it
```bash
npm install -g vsce
```
```bash
vsce package
```


# 🤝 Contributing
Contributions are welcome! Feel free to fork the project and submit a pull request.

# 📜 License
This project is licensed under the MIT License.

# 👨‍💻 Author
Manikandan K (AndroidMani), Founder of ChozhApps
📧 Contact: chozhanaaduapps@gmail.com

# 💬 Support
If you encounter any issues or have feature requests, open an issue on GitHub.