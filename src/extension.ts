// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';

// Chat participant and webview provider
import { GarapaAgentChatParticipant } from './chatParticipant';
import { GarapaAgentChatViewProvider } from './chatViewProvider';
import { GarapaAgentChatWebviewProvider } from './webviewProvider';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('GarapaAgent Assistant is now activating...');

    // Create chat participant
    const chatParticipant = new GarapaAgentChatParticipant();
    
    // Create chat view provider
    const chatViewProvider = new GarapaAgentChatViewProvider(context);
    
    // Create webview provider for custom chat interface
    const webviewProvider = new GarapaAgentChatWebviewProvider(context);

    // Register chat participant
    const participant = vscode.chat.createChatParticipant(
        'garapaagentassitent.assistant',
        chatParticipant.handleChatRequest.bind(chatParticipant)
    );
    
    participant.iconPath = new vscode.ThemeIcon('robot');
    participant.followupProvider = {
        provideFollowups: chatParticipant.provideFollowups.bind(chatParticipant)
    };
    
    // Set agent-specific properties
    (participant as any).fullName = 'GarapaAgent Assistant';
    (participant as any).isSticky = true;
    (participant as any).supportsSlashCommands = true;

    // Register tree view
    vscode.window.createTreeView('garapaagentassitent.chatView', {
        treeDataProvider: chatViewProvider,
        showCollapseAll: true
    });

    // Register commands
    const openChatCommand = vscode.commands.registerCommand('garapaagentassitent.openChat', () => {
        webviewProvider.createOrShowWebview();
    });

    const clearChatCommand = vscode.commands.registerCommand('garapaagentassitent.clearChat', () => {
        chatViewProvider.clearHistory();
        vscode.window.showInformationMessage('Chat history cleared!');
    });

    const refreshChatCommand = vscode.commands.registerCommand('garapaagentassitent.refreshChat', () => {
        chatViewProvider.refresh();
    });

    // Add to subscriptions
    context.subscriptions.push(
        participant,
        openChatCommand,
        clearChatCommand,
        refreshChatCommand
    );

    console.log('GarapaAgent Assistant activated successfully!');
}

// This method is called when your extension is deactivated
export function deactivate() {
    console.log('GarapaAgent Assistant deactivated');
}
