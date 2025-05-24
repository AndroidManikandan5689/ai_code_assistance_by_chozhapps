# Claude VS Code Extension by ChozhApps

A Visual Studio Code extension that integrates Claude AI directly into your editor. Get AI-powered coding help, explanations, documentation generation, and more — without leaving VS Code.

🚀 Features
🤖 Seamless integration with Claude AI

⌨️ Simple keyboard shortcuts for quick access

🔒 Secure API key storage

🧠 Supports multiple Claude models

💡 Context-aware responses based on your selected code

🛠 Installation
Download the .vsix file from the Releases page.

In VS Code, press Ctrl+Shift+P (or Cmd+Shift+P on Mac).

Type Install from VSIX and select the downloaded file.

Restart VS Code.

⚙️ Configuration
Before using the extension, you must add your Claude API key:

Get your API key from the Anthropic Console.

Open VS Code Settings (Ctrl+, or Cmd+, on Mac).

Search for Claude.

Enter your API key in the Claude VS Code: API Key field.

Optional Settings:
claude-vscode.model: Choose which Claude model to use (default: claude-3-opus-20240229)

💡 Usage
Select text or code in your editor.

Trigger Claude with any of the following:

Press Ctrl+Shift+C (or Cmd+Shift+C on Mac)

Press Ctrl+Shift+P, type “Ask Claude”, and run the command

Right-click and select Ask Claude from the context menu

Claude's response will appear in the Claude Output channel.

🧪 Examples
Here are some practical ways to use Claude with your code:

🔍 Code Explanation
Select a complex code block and ask Claude to explain it.

🔧 Code Improvement
Highlight code you'd like optimized and request suggestions.

📝 Documentation
Select a function or class and ask Claude to generate inline documentation.

🐞 Bug Finding
Choose a piece of code and ask Claude to identify potential issues.

👨‍💻 Development
To build the extension locally:

bash
Copy
Edit
# Clone the repository
git clone https://github.com/AndroidManikandan5689/ai_code_assistance_by_chozhapps.git

# Install dependencies
cd ai_code_assistance_by_chozhapps
npm install

# Compile the extension
npm run compile

# Package it
npm install -g vsce
vsce package
🤝 Contributing
Contributions are welcome! Feel free to fork the project and submit a pull request.

📜 License
This project is licensed under the MIT License.

👨‍💻 Author
Manikandan (AndroidMani), Founder of ChozhApps
📧 Contact: chozhanaaduapps@gmail.com

💬 Support
If you encounter any issues or have feature requests, open an issue on GitHub.