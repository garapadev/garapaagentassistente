import * as vscode from 'vscode';

interface ChatHistoryItem {
    id: string;
    label: string;
    timestamp: Date;
    type: 'question' | 'answer';
    content: string;
}

export class GarapaAgentChatViewProvider implements vscode.TreeDataProvider<ChatHistoryItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ChatHistoryItem | undefined | null | void> = new vscode.EventEmitter<ChatHistoryItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ChatHistoryItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private chatHistory: ChatHistoryItem[] = [];

    constructor(private context: vscode.ExtensionContext) {
        this.loadHistory();
    }

    getTreeItem(element: ChatHistoryItem): vscode.TreeItem {
        const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
        
        item.tooltip = `${element.content}\n\n${element.timestamp.toLocaleString()}`;
        item.description = element.timestamp.toLocaleTimeString();
        
        if (element.type === 'question') {
            item.iconPath = new vscode.ThemeIcon('person');
            item.contextValue = 'question';
        } else {
            item.iconPath = new vscode.ThemeIcon('robot');
            item.contextValue = 'answer';
        }

        return item;
    }

    getChildren(element?: ChatHistoryItem): Thenable<ChatHistoryItem[]> {
        if (!element) {
            return Promise.resolve(this.chatHistory.slice(-20)); // Show last 20 items
        }
        return Promise.resolve([]);
    }

    addChatItem(type: 'question' | 'answer', content: string, label?: string): void {
        const item: ChatHistoryItem = {
            id: Date.now().toString(),
            label: label || this.truncateText(content, 50),
            timestamp: new Date(),
            type,
            content
        };

        this.chatHistory.push(item);
        this.saveHistory();
        this.refresh();
    }

    clearHistory(): void {
        this.chatHistory = [];
        this.saveHistory();
        this.refresh();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    private truncateText(text: string, maxLength: number): string {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + '...';
    }

    private saveHistory(): void {
        this.context.globalState.update('garapaagentassitent.chatHistory', this.chatHistory);
    }

    private loadHistory(): void {
        const saved = this.context.globalState.get<ChatHistoryItem[]>('garapaagentassitent.chatHistory');
        if (saved) {
            this.chatHistory = saved.map(item => ({
                ...item,
                timestamp: new Date(item.timestamp)
            }));
        }
    }
}
