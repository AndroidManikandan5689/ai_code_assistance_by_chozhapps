import * as vscode from 'vscode';
import { AIProvider } from './aiProvider';
import { ChatProvider } from './chatProvider';

let aiProvider: AIProvider;
let chatProvider: ChatProvider;
let extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Code Assistant is now active!');

    // Store context globally
    extensionContext = context;

    // Initialize providers
    aiProvider = new AIProvider(context);
    chatProvider = new ChatProvider(context);

    // Register commands
    const commands = [
        vscode.commands.registerCommand('ai-assistant.explainCode', () => handleCodeAction('explain')),
        vscode.commands.registerCommand('ai-assistant.generateCode', () => handleCodeGeneration()),
        vscode.commands.registerCommand('ai-assistant.optimizeCode', () => handleCodeAction('optimize')),
        vscode.commands.registerCommand('ai-assistant.debugCode', () => handleCodeAction('debug')),
        vscode.commands.registerCommand('ai-assistant.addComments', () => handleCodeAction('comment')),
        vscode.commands.registerCommand('ai-assistant.refactorCode', () => handleCodeAction('refactor')),
        vscode.commands.registerCommand('ai-assistant.generateTests', () => handleCodeAction('test')),
        vscode.commands.registerCommand('ai-assistant.chatWithAI', () => chatProvider.openChat()),
        vscode.commands.registerCommand('ai-assistant.setApiKey', () => setApiKey())
    ];

    // Register chat provider
    vscode.window.registerWebviewViewProvider('ai-assistant.chatView', chatProvider);

    // Add all disposables to context
    context.subscriptions.push(...commands);

    // Set context for chat view
    vscode.commands.executeCommand('setContext', 'ai-assistant.chatEnabled', true);

    // Show welcome message
    showWelcomeMessage();
}

async function handleCodeAction(action: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText && action !== 'generate') {
        vscode.window.showErrorMessage('Please select code first');
        return;
    }

    const language = editor.document.languageId;
    
    try {
        const result = await aiProvider.processCode(selectedText, action, language);
        await showResult(result, action, editor, selection);
    } catch (error) {
        vscode.window.showErrorMessage(`AI Assistant Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

async function handleCodeGeneration() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    // Look for comments on current line or selection
    const selection = editor.selection;
    const currentLine = editor.document.lineAt(selection.active.line);
    const lineText = currentLine.text.trim();
    
    let prompt = '';
    
    if (selection.isEmpty) {
        // Check if current line has a comment
        if (lineText.includes('//') || lineText.includes('#') || lineText.includes('/*')) {
            prompt = lineText;
        } else {
            // Ask user for prompt
            const userPrompt = await vscode.window.showInputBox({
                prompt: 'Describe the code you want to generate',
                placeHolder: 'e.g., Create a function that sorts an array'
            });
            if (!userPrompt) return;
            prompt = userPrompt;
        }
    } else {
        prompt = editor.document.getText(selection);
    }

    const language = editor.document.languageId;

    try {
        const result = await aiProvider.generateCode(prompt, language);
        await showResult(result, 'generate', editor, selection);
    } catch (error) {
        vscode.window.showErrorMessage(`AI Assistant Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

async function showResult(result: string, action: string, editor: vscode.TextEditor, selection: vscode.Selection) {
    const config = vscode.workspace.getConfiguration('ai-assistant');
    
    // Show result in a new document for explanation, or replace/insert for code actions
    if (action === 'explain' || action === 'debug') {
        // Create new document with explanation
        const doc = await vscode.workspace.openTextDocument({
            content: result,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
    } else {
        // Show options for code modification
        const options = ['Replace Selection', 'Insert After Selection', 'Show in New Tab'];
        const choice = await vscode.window.showQuickPick(options, {
            placeHolder: 'How would you like to apply the AI suggestion?'
        });

        switch (choice) {
            case 'Replace Selection':
                await editor.edit(editBuilder => {
                    editBuilder.replace(selection, result);
                });
                break;
            case 'Insert After Selection':
                await editor.edit(editBuilder => {
                    const endPosition = selection.end;
                    editBuilder.insert(endPosition, '\n' + result);
                });
                break;
            case 'Show in New Tab':
                const language = editor.document.languageId;
                const doc = await vscode.workspace.openTextDocument({
                    content: result,
                    language: language
                });
                await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
                break;
        }
    }
}

async function setApiKey() {
    const config = vscode.workspace.getConfiguration('ai-assistant');
    const provider = config.get<string>('provider', 'anthropic');
    
    const apiKey = await vscode.window.showInputBox({
        prompt: `Enter your ${provider} API key`,
        password: true,
        placeHolder: 'sk-...'
    });

    if (apiKey) {
        await extensionContext.secrets.store(`${provider}-api-key`, apiKey);
        vscode.window.showInformationMessage(`${provider} API key saved successfully!`);
    }
}

function showWelcomeMessage() {
    const hasShownWelcome = vscode.workspace.getConfiguration('ai-assistant').get('hasShownWelcome', false);
    
    if (!hasShownWelcome) {
        vscode.window.showInformationMessage(
            'Welcome to AI Code Assistant! Set your API key to get started.',
            'Set API Key',
            'Don\'t show again'
        ).then(selection => {
            if (selection === 'Set API Key') {
                vscode.commands.executeCommand('ai-assistant.setApiKey');
            } else if (selection === 'Don\'t show again') {
                vscode.workspace.getConfiguration('ai-assistant').update('hasShownWelcome', true, vscode.ConfigurationTarget.Global);
            }
        });
    }
}

export function deactivate() {
    console.log('AI Code Assistant deactivated');
}