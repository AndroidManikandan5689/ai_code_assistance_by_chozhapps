import * as vscode from 'vscode';
import { AIProvider } from './aiProvider';

export class ChatProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'ai-assistant.chatView';
    private _view?: vscode.WebviewView;
    private aiProvider: AIProvider;
    private chatHistory: Array<{role: 'user' | 'assistant', content: string}> = [];

    constructor(private readonly context: vscode.ExtensionContext) {
        this.aiProvider = new AIProvider(context);
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this.context.extensionUri
            ]
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            async (data) => {
                switch (data.type) {
                    case 'sendMessage':
                        await this.handleUserMessage(data.message);
                        break;
                    case 'clearChat':
                        this.clearChat();
                        break;
                    case 'insertCode':
                        await this.insertCodeToEditor(data.code);
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    public async openChat() {
        if (this._view) {
            this._view.show?.(true);
        } else {
            // Open the chat view in the explorer
            await vscode.commands.executeCommand('workbench.view.explorer');
            await vscode.commands.executeCommand('ai-assistant.chatView.focus');
        }
    }

    private async handleUserMessage(message: string) {
        if (!this._view) return;

        // Add user message to history
        this.chatHistory.push({role: 'user', content: message});
        
        // Update UI to show user message and loading
        this._view.webview.postMessage({
            type: 'userMessage',
            message: message
        });

        this._view.webview.postMessage({
            type: 'assistantTyping',
            typing: true
        });

        try {
            // Get AI response
            const response = await this.aiProvider.processCode(message, 'explain', 'general');
            
            // Add assistant response to history
            this.chatHistory.push({role: 'assistant', content: response});

            // Send response to webview
            this._view.webview.postMessage({
                type: 'assistantMessage',
                message: response
            });
        } catch (error) {
            this._view.webview.postMessage({
                type: 'error',
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        } finally {
            this._view.webview.postMessage({
                type: 'assistantTyping',
                typing: false
            });
        }
    }

    private clearChat() {
        this.chatHistory = [];
        if (this._view) {
            this._view.webview.postMessage({
                type: 'clearMessages'
            });
        }
    }

    private async insertCodeToEditor(code: string) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            await editor.edit(editBuilder => {
                editBuilder.insert(selection.active, code);
            });
            vscode.window.showInformationMessage('Code inserted successfully!');
        } else {
            vscode.window.showErrorMessage('No active editor found');
        }
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Chat</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                    padding: 10px;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                
                .chat-container {
                    flex: 1;
                    overflow-y: auto;
                    margin-bottom: 10px;
                    padding: 10px;
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: 4px;
                }
                
                .message {
                    margin-bottom: 15px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    max-width: 90%;
                }
                
                .user-message {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    margin-left: auto;
                    text-align: right;
                }
                
                .assistant-message {
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    border-left: 3px solid var(--vscode-textLink-foreground);
                }
                
                .code-block {
                    background-color: var(--vscode-textCodeBlock-background);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: 4px;
                    padding: 8px;
                    margin: 8px 0;
                    font-family: var(--vscode-editor-font-family);
                    font-size: var(--vscode-editor-font-size);
                    overflow-x: auto;
                    position: relative;
                }
                
                .code-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                }
                
                .insert-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 4px 8px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 11px;
                }
                
                .insert-btn:hover {
                    background: var(--vscode-button-hoverBackground);
                }
                
                .input-container {
                    display: flex;
                    gap: 8px;
                }
                
                .message-input {
                    flex: 1;
                    padding: 8px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 4px;
                    font-family: var(--vscode-font-family);
                    resize: vertical;
                    min-height: 20px;
                }
                
                .send-btn, .clear-btn {
                    padding: 8px 16px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .send-btn:hover, .clear-btn:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .send-btn:disabled {
                    background-color: var(--vscode-button-secondaryBackground);
                    cursor: not-allowed;
                }
                
                .typing-indicator {
                    font-style: italic;
                    color: var(--vscode-descriptionForeground);
                    padding: 8px;
                }
                
                .error-message {
                    background-color: var(--vscode-inputValidation-errorBackground);
                    border: 1px solid var(--vscode-inputValidation-errorBorder);
                    color: var(--vscode-errorForeground);
                    padding: 8px;
                    border-radius: 4px;
                    margin: 8px 0;
                }
            </style>
        </head>
        <body>
            <div class="chat-container" id="chatContainer">
                <div class="assistant-message">
                    👋 Hello! I'm your AI coding assistant. Ask me anything about code, request explanations, or get help with programming tasks.
                </div>
            </div>
            
            <div class="input-container">
                <textarea 
                    class="message-input" 
                    id="messageInput" 
                    placeholder="Ask me about code..."
                    rows="2"
                ></textarea>
                <button class="send-btn" id="sendBtn">Send</button>
                <button class="clear-btn" id="clearBtn">Clear</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                const chatContainer = document.getElementById('chatContainer');
                const messageInput = document.getElementById('messageInput');
                const sendBtn = document.getElementById('sendBtn');
                const clearBtn = document.getElementById('clearBtn');

                // Send message function
                function sendMessage() {
                    const message = messageInput.value.trim();
                    if (message) {
                        vscode.postMessage({
                            type: 'sendMessage',
                            message: message
                        });
                        messageInput.value = '';
                        sendBtn.disabled = true;
                    }
                }

                // Event listeners
                sendBtn.addEventListener('click', sendMessage);
                clearBtn.addEventListener('click', () => {
                    vscode.postMessage({ type: 'clearChat' });
                });

                messageInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                });

                // Handle messages from extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.type) {
                        case 'userMessage':
                            addMessage(message.message, 'user');
                            break;
                        case 'assistantMessage':
                            addMessage(message.message, 'assistant');
                            sendBtn.disabled = false;
                            break;
                        case 'assistantTyping':
                            if (message.typing) {
                                showTyping();
                            } else {
                                hideTyping();
                            }
                            break;
                        case 'error':
                            showError(message.message);
                            sendBtn.disabled = false;
                            break;
                        case 'clearMessages':
                            clearMessages();
                            break;
                    }
                });

                function addMessage(text, sender) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = \`message \${sender}-message\`;
                    
                    if (sender === 'assistant') {
                        // Process code blocks
                        const processedText = processCodeBlocks(text);
                        messageDiv.innerHTML = processedText;
                    } else {
                        messageDiv.textContent = text;
                    }
                    
                    chatContainer.appendChild(messageDiv);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }

                function processCodeBlocks(text) {
                    // Simple code block detection and processing
                    const codeBlockRegex = /(\w+)?\n([\s\S]*?)/g;
                    const inlineCodeRegex = /([^]+)/g;
                    
                    let processedText = text;
                    // Process code blocks
                    processedText = processedText.replace(codeBlockRegex, (match, language, code) => {
                        const lang = language || 'text';
                        const trimmedCode = code.trim();
                        return \`
                            <div class="code-block">
                                <div class="code-header">
                                    <span>\${lang}</span>
                                    <button class="insert-btn" onclick="insertCode('\${escapeHtml(trimmedCode)}')">Insert</button>
                                </div>
                                <pre><code>\${escapeHtml(trimmedCode)}</code></pre>
                            </div>
                        \`;
                    });
                    
                    // Process inline code
                    processedText = processedText.replace(inlineCodeRegex, '<code>$1</code>');
                    
                    // Convert newlines to <br> for remaining text
                    processedText = processedText.replace(/\n/g, '<br>');
                    
                    return processedText;
                }

                function escapeHtml(text) {
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                }

                function insertCode(code) {
                    vscode.postMessage({
                        type: 'insertCode',
                        code: code
                    });
                }

                function showTyping() {
                    const typingDiv = document.createElement('div');
                    typingDiv.className = 'typing-indicator';
                    typingDiv.id = 'typing';
                    typingDiv.textContent = 'AI is thinking...';
                    chatContainer.appendChild(typingDiv);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }

                function hideTyping() {
                    const typingDiv = document.getElementById('typing');
                    if (typingDiv) {
                        typingDiv.remove();
                    }
                }

                function showError(errorMessage) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = \`Error: \${errorMessage}\`;
                    chatContainer.appendChild(errorDiv);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }

                function clearMessages() {
                    // Keep only the welcome message
                    const messages = chatContainer.querySelectorAll('.message:not(:first-child), .typing-indicator, .error-message');
                    messages.forEach(msg => msg.remove());
                }

                // Focus input on load
                messageInput.focus();
            </script>
        </body>
        </html>`;
    }
}