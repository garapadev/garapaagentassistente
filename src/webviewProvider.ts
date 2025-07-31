import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';

interface Role {
    name: string;
    content: string;
    filePath: string;
}

export class GarapaAgentChatWebviewProvider {
    private panel: vscode.WebviewPanel | undefined;
    private chatHistory: Array<{role: 'user' | 'assistant', content: string, timestamp: Date}> = [];
    private roles: Role[] = [];
    private currentRole: Role | null = null;

    constructor(private context: vscode.ExtensionContext) {
        this.loadRoles();
    }

    public createOrShowWebview(): void {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'garapaAgentChatWebview',
            'GarapaAgent Assistant',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'media')
                ]
            }
        );

        this.panel.iconPath = {
            light: vscode.Uri.joinPath(this.context.extensionUri, 'media', 'icon-light.svg'),
            dark: vscode.Uri.joinPath(this.context.extensionUri, 'media', 'icon-dark.svg')
        };

        this.panel.webview.html = this.getWebviewContent();
        
        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'sendMessage':
                        await this.handleUserMessage(message.text);
                        break;
                    case 'clearChat':
                        this.clearChat();
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }

    private async handleUserMessage(userMessage: string): Promise<void> {
        if (!this.panel) {
            return;
        }

        // Check for role commands
        if (userMessage.startsWith('/help')) {
            this.showHelp();
            return;
        }
        
        if (userMessage.startsWith('/init')) {
            await this.initializeRoles();
            return;
        }
        
        if (userMessage.startsWith('/role ')) {
            const roleName = userMessage.substring(6).trim();
            this.setRole(roleName);
            return;
        }
        
        if (userMessage.startsWith('/rules') || userMessage.startsWith('/roles')) {
            this.listRoles();
            return;
        }
        
        if (userMessage.startsWith('/clear-role') || userMessage.startsWith('/clear')) {
            this.clearRole();
            return;
        }
        
        if (userMessage.startsWith('/status')) {
            this.showStatus();
            return;
        }

        // Add user message to history
        this.chatHistory.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });

        // Update UI with user message
        this.panel.webview.postMessage({
            command: 'addMessage',
            message: {
                role: 'user',
                content: userMessage,
                timestamp: new Date().toISOString()
            }
        });

        // Show typing indicator
        this.panel.webview.postMessage({
            command: 'showTyping'
        });

        try {
            // Get language model response
            const models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
            
            if (models.length === 0) {
                throw new Error('Nenhum modelo de linguagem disponível');
            }

            const model = models[0];
            
            // Create system prompt with role context
            const systemPrompt = await this.createSystemPrompt();
            const messages: vscode.LanguageModelChatMessage[] = [
                vscode.LanguageModelChatMessage.User(`${systemPrompt}\n\nUsuário: ${userMessage}`)
            ];

            const response = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);

            let responseText = '';
            for await (const fragment of response.text) {
                responseText += fragment;
            }

            // Add assistant response to history
            this.chatHistory.push({
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            });

            // Update UI with assistant response
            this.panel.webview.postMessage({
                command: 'addMessage',
                message: {
                    role: 'assistant',
                    content: responseText,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
            
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            
            this.panel.webview.postMessage({
                command: 'addMessage',
                message: {
                    role: 'assistant',
                    content: `❌ Erro: ${errorMessage}`,
                    timestamp: new Date().toISOString()
                }
            });
        } finally {
            // Hide typing indicator
            this.panel.webview.postMessage({
                command: 'hideTyping'
            });
        }
    }

    private clearChat(): void {
        this.chatHistory = [];
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'clearMessages'
            });
        }
    }

    private getWebviewContent(): string {
        const roleSection = this.currentRole ? 
            `<div class="current-role">
                <span class="role-indicator">🎭 ${this.currentRole.name}</span>
                <button class="role-clear-btn" onclick="clearCurrentRole()">×</button>
            </div>` : '';

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GarapaCRM Chat</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            padding: 10px 20px;
            background-color: var(--vscode-titleBar-activeBackground);
            border-bottom: 1px solid var(--vscode-panel-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }

        .header-actions {
            display: flex;
            gap: 8px;
        }

        .clear-button, .roles-button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }

        .clear-button:hover, .roles-button:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .current-role {
            background: var(--vscode-inputValidation-infoBorder);
            color: var(--vscode-input-foreground);
            padding: 8px 12px;
            margin: 0 20px;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
        }

        .role-clear-btn {
            background: none;
            border: none;
            color: var(--vscode-input-foreground);
            cursor: pointer;
            padding: 0;
            margin-left: 8px;
            font-size: 16px;
            opacity: 0.7;
        }

        .role-clear-btn:hover {
            opacity: 1;
        }

        .chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .message {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 12px;
            line-height: 1.5;
            white-space: pre-wrap;
        }

        .message.user {
            background-color: var(--vscode-inputValidation-infoBorder);
            color: var(--vscode-editor-foreground);
            align-self: flex-end;
            margin-left: auto;
        }

        .message.assistant {
            background-color: var(--vscode-editor-inlayHint-background);
            color: var(--vscode-editor-foreground);
            align-self: flex-start;
            border: 1px solid var(--vscode-panel-border);
        }

        .timestamp {
            font-size: 11px;
            opacity: 0.6;
            margin-top: 5px;
        }

        .typing-indicator {
            display: none;
            padding: 12px 16px;
            background-color: var(--vscode-editor-inlayHint-background);
            border-radius: 12px;
            max-width: 80px;
            align-self: flex-start;
            border: 1px solid var(--vscode-panel-border);
        }

        .typing-dots {
            display: flex;
            gap: 4px;
        }

        .typing-dots span {
            width: 6px;
            height: 6px;
            background-color: var(--vscode-foreground);
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
            0%, 80%, 100% { opacity: 0.3; }
            40% { opacity: 1; }
        }

        .input-container {
            padding: 20px;
            border-top: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-editor-background);
        }

        .input-row {
            display: flex;
            gap: 10px;
        }

        .message-input {
            flex: 1;
            padding: 12px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-family: var(--vscode-font-family);
            resize: vertical;
            min-height: 20px;
            max-height: 150px;
        }

        .message-input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }

        .send-button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
        }

        .send-button:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .send-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .welcome-message {
            text-align: center;
            padding: 40px 20px;
            opacity: 0.7;
        }

        .welcome-message h2 {
            margin-bottom: 10px;
            color: var(--vscode-foreground);
        }

        .welcome-message p {
            margin: 5px 0;
            color: var(--vscode-descriptionForeground);
        }

        .command-hint {
            background: var(--vscode-editor-inlayHint-background);
            border: 1px solid var(--vscode-panel-border);
            padding: 8px 12px;
            margin: 10px 20px;
            border-radius: 4px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 GarapaAgent Assistant</h1>
        <div class="header-actions">
            <button class="roles-button" onclick="listRoles()">Roles</button>
            <button class="clear-button" onclick="clearChat()">Limpar Chat</button>
        </div>
    </div>

    ${roleSection}

    <div class="command-hint">
        💡 <strong>Comandos:</strong> /roles (listar) | /role [nome] (ativar) | /clear-role (desativar)
    </div>

    <div class="chat-container" id="chatContainer">
        <div class="welcome-message">
            <h2>Bem-vindo ao GarapaAgent Assistant!</h2>
            <p>Seu assistente de IA inteligente com sistema de roles personalizáveis.</p>
            <p><strong>Comandos disponíveis:</strong></p>
            <ul>
                <li><code>/init</code> - Cria automaticamente a pasta "roles/" com arquivos .mdc</li>
                <li><code>/help</code> - Mostra ajuda completa</li>
                <li><code>/rules</code> - Lista roles disponíveis</li>
                <li><code>/role [nome]</code> - Ativa um role específico</li>
                <li><code>/clear</code> - Desativa role atual</li>
                <li><code>/status</code> - Mostra status do sistema</li>
            </ul>
            <p><em>💡 Primeira vez? Use <code>/init</code> para começar!</em></p>
            <p><em>🚀 Acesso rápido: <code>@gaa</code> no Chat do VS Code!</em></p>
            <p>Digite sua pergunta abaixo para começar.</p>
        </div>

        <div class="typing-indicator" id="typingIndicator">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </div>

    <div class="input-container">
        <div class="input-row">
            <textarea 
                class="message-input" 
                id="messageInput" 
                placeholder="Digite sua pergunta ou comando (/roles, /role [nome])..."
                rows="1"
            ></textarea>
            <button class="send-button" id="sendButton" onclick="sendMessage()">Enviar</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chatContainer');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const typingIndicator = document.getElementById('typingIndicator');

        let isWelcomeVisible = true;

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'addMessage':
                    addMessage(message.message);
                    break;
                case 'showTyping':
                    showTypingIndicator();
                    break;
                case 'hideTyping':
                    hideTypingIndicator();
                    break;
                case 'clearMessages':
                    clearMessages();
                    break;
                case 'updateRole':
                    updateRoleDisplay(message.role);
                    break;
            }
        });

        function addMessage(message) {
            if (isWelcomeVisible) {
                clearWelcomeMessage();
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${message.role}\`;
            
            const timestamp = new Date(message.timestamp).toLocaleTimeString();
            messageDiv.innerHTML = \`
                \${message.content}
                <div class="timestamp">\${timestamp}</div>
            \`;

            chatContainer.appendChild(messageDiv);
            scrollToBottom();
        }

        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;

            vscode.postMessage({
                command: 'sendMessage',
                text: text
            });

            messageInput.value = '';
            messageInput.style.height = 'auto';
            sendButton.disabled = false;
        }

        function clearChat() {
            vscode.postMessage({
                command: 'clearChat'
            });
        }

        function listRoles() {
            messageInput.value = '/roles';
            sendMessage();
        }

        function clearCurrentRole() {
            messageInput.value = '/clear-role';
            sendMessage();
        }

        function clearMessages() {
            chatContainer.innerHTML = \`
                <div class="welcome-message">
                    <h2>Chat limpo!</h2>
                    <p>Digite uma nova pergunta para começar.</p>
                </div>
            \`;
            isWelcomeVisible = true;
        }

        function clearWelcomeMessage() {
            const welcomeMsg = chatContainer.querySelector('.welcome-message');
            if (welcomeMsg) {
                welcomeMsg.remove();
                isWelcomeVisible = false;
            }
        }

        function showTypingIndicator() {
            typingIndicator.style.display = 'block';
            scrollToBottom();
        }

        function hideTypingIndicator() {
            typingIndicator.style.display = 'none';
        }

        function scrollToBottom() {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function updateRoleDisplay(role) {
            location.reload(); // Simple way to update the role display
        }

        // Auto-resize textarea
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 150) + 'px';
        });

        // Send on Enter (Shift+Enter for new line)
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Focus input on load
        messageInput.focus();
    </script>
</body>
</html>`;
    }

    private async loadRoles(): Promise<void> {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                return;
            }

            const rolesPath = path.join(workspaceFolders[0].uri.fsPath, 'roles');
            
            if (!fsSync.existsSync(rolesPath)) {
                return;
            }

            const files = fsSync.readdirSync(rolesPath);
            this.roles = [];

            for (const file of files) {
                if (file.endsWith('.mdc')) {
                    const filePath = path.join(rolesPath, file);
                    const content = fsSync.readFileSync(filePath, 'utf8');
                    const name = path.basename(file, '.mdc');
                    
                    this.roles.push({
                        name,
                        content,
                        filePath
                    });
                }
            }

            console.log(`Webview loaded ${this.roles.length} roles:`, this.roles.map(r => r.name));
        } catch (error) {
            console.error('Error loading roles in webview:', error);
        }
    }

    private setRole(roleName: string): void {
        const role = this.roles.find(r => 
            r.name.toLowerCase().includes(roleName.toLowerCase()) ||
            roleName.toLowerCase().includes(r.name.toLowerCase())
        );

        if (role) {
            this.currentRole = role;
            this.sendRoleMessage(`✅ **Role ativado:** ${role.name}\n\nAgora estou seguindo as diretrizes do role "${role.name}". Como posso ajudar?`);
            
            // Update UI
            if (this.panel) {
                this.panel.webview.postMessage({
                    command: 'updateRole',
                    role: role.name
                });
            }
        } else {
            this.sendRoleMessage(`❌ **Role não encontrado:** "${roleName}"\n\n${this.getRolesList()}`);
        }
    }

    private listRoles(): void {
        if (this.roles.length === 0) {
            this.sendRoleMessage('📂 **Nenhum role encontrado**\n\nCrie arquivos `.mdc` na pasta `roles/` do seu workspace.');
            return;
        }

        let message = '📋 **Roles Disponíveis:**\n\n';
        message += this.getRolesList();
        message += '\n💡 **Como usar:** Digite `/role [nome]` para ativar um role';
        
        if (this.currentRole) {
            message += `\n\n🎯 **Role atual:** ${this.currentRole.name}`;
        }

        this.sendRoleMessage(message);
    }

    private clearRole(): void {
        if (this.currentRole) {
            const previousRole = this.currentRole.name;
            this.currentRole = null;
            this.sendRoleMessage(`✅ **Role removido:** ${previousRole}\n\nAgora estou usando o comportamento padrão do GarapaAgent Assistant.`);
            
            // Update UI
            if (this.panel) {
                this.panel.webview.postMessage({
                    command: 'updateRole',
                    role: null
                });
            }
        } else {
            this.sendRoleMessage('ℹ️ **Nenhum role ativo** para remover.');
        }
    }

    private getRolesList(): string {
        return this.roles.map(role => {
            const isActive = this.currentRole?.name === role.name;
            const status = isActive ? '🟢 **ATIVO**' : '⚪';
            const title = this.extractRoleTitle(role.content);
            return `${status} \`/role ${role.name}\` - ${title}`;
        }).join('\n');
    }

    private extractRoleTitle(content: string): string {
        const lines = content.split('\n');
        const titleLine = lines.find(line => line.startsWith('# '));
        return titleLine ? titleLine.substring(2).trim() : 'Role personalizado';
    }

    private async initializeRoles(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            this.sendRoleMessage('❌ **Erro:** Nenhum workspace aberto. Abra uma pasta para criar a estrutura de roles.');
            return;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const rolesPath = path.join(workspaceRoot, 'roles');

        try {
            // Create roles directory if it doesn't exist
            await fs.mkdir(rolesPath, { recursive: true });

            // Define default role templates (same as chat participant)
            const defaultRoles = [
                {
                    name: 'frontend-developer.mdc',
                    content: `# Frontend Developer

## Identidade
Você é um especialista em desenvolvimento Frontend com foco em experiência do usuário, performance e acessibilidade.

## Comportamento
- Sempre considere a experiência do usuário (UX/UI)
- Priorize performance e otimização
- Implemente práticas de acessibilidade (a11y)
- Use componentes reutilizáveis
- Foque em código limpo e manutenível
- Considere responsividade em todos os dispositivos

## Tecnologias Preferenciais
- React/Next.js
- TypeScript
- Tailwind CSS
- Styled Components
- React Hook Form
- React Query/TanStack Query
- Vite/Webpack
- Jest/Testing Library

## Documentação de Referência
- https://reactjs.org/docs/getting-started.html
- https://nextjs.org/docs
- https://tailwindcss.com/docs

## Estrutura de Resposta
1. Análise do problema/requisito
2. Sugestão de abordagem técnica
3. Exemplo de código com boas práticas
4. Considerações de performance e acessibilidade
5. Testes sugeridos
`
                },
                {
                    name: 'backend-architect.mdc',
                    content: `# Backend Architect

## Identidade
Você é um arquiteto de sistemas backend especializado em APIs escaláveis, microsserviços e infraestrutura robusta.

## Comportamento
- Projete sistemas escaláveis e resilientes
- Priorize segurança em todas as camadas
- Implemente padrões de arquitetura sólidos
- Considere performance e cache strategies
- Foque em observabilidade e monitoramento
- Use princípios SOLID e Clean Architecture

## Tecnologias Preferenciais
- Node.js/Express/Fastify
- TypeScript
- PostgreSQL/MongoDB
- Redis
- Docker/Kubernetes
- AWS/Azure/GCP
- GraphQL/REST APIs
- Prisma/TypeORM

## Documentação de Referência
- https://docs.aws.amazon.com/
- https://docs.docker.com/
- https://docs.prisma.io/

## Estrutura de Resposta
1. Análise dos requisitos de sistema
2. Proposta de arquitetura
3. Implementação com código exemplo
4. Considerações de segurança e performance
5. Estratégias de deploy e monitoramento
`
                },
                {
                    name: 'crm-specialist.mdc',
                    content: `# CRM Specialist

## Identidade
Você é um especialista em sistemas CRM, automação de vendas e gestão de relacionamento com clientes.

## Comportamento
- Foque em fluxos de vendas eficientes
- Implemente automações inteligentes
- Considere integração com ferramentas de marketing
- Priorize experiência do cliente
- Use métricas e analytics para otimização
- Projete pipelines de vendas escaláveis

## Tecnologias Preferenciais
- Salesforce APIs
- HubSpot Integration
- Pipedrive APIs
- Zapier/Make.com
- Email Marketing APIs
- Analytics/BI tools
- Webhook implementations
- Database optimization

## Documentação de Referência
- https://docs.stripe.com/
- https://docs.supabase.com/
- https://developer.mozilla.org/en-US/docs/Web/API

## Estrutura de Resposta
1. Análise do processo de negócio
2. Identificação de oportunidades de automação
3. Implementação técnica
4. Métricas e KPIs sugeridos
5. Integração com outras ferramentas
`
                },
                {
                    name: 'code-mentor.mdc',
                    content: `# Code Mentor

## Identidade
Você é um mentor de programação focado em ensinar boas práticas, clean code e desenvolvimento profissional.

## Comportamento
- Explique conceitos de forma didática
- Ensine o "porquê" além do "como"
- Mostre múltiplas abordagens quando relevante
- Incentive boas práticas desde o início
- Foque em código legível e manutenível
- Promova aprendizado contínuo

## Tecnologias Preferenciais
- Princípios SOLID
- Design Patterns
- Clean Code/Clean Architecture
- TDD/BDD
- Git best practices
- Code Review practices
- Refactoring techniques
- Multiple programming languages

## Documentação de Referência
- https://developer.mozilla.org/en-US/docs/Web
- https://docs.github.com/en

## Estrutura de Resposta
1. Explicação do conceito fundamental
2. Exemplo prático passo a passo
3. Boas práticas relacionadas
4. Possíveis armadilhas e como evitá-las
5. Exercícios ou próximos passos
`
                }
            ];

            let createdFiles = 0;
            let existingFiles = 0;

            // Create each role file
            for (const role of defaultRoles) {
                const filePath = path.join(rolesPath, role.name);
                
                try {
                    // Check if file already exists
                    await fs.access(filePath);
                    existingFiles++;
                } catch {
                    // File doesn't exist, create it
                    await fs.writeFile(filePath, role.content, 'utf8');
                    createdFiles++;
                }
            }

            // Create README.md for roles directory
            const readmePath = path.join(rolesPath, 'README.md');
            const readmeContent = `# Roles do GarapaAgent Assistant

Esta pasta contém os arquivos de configuração de roles para o GarapaAgent Assistant.

## Roles Disponíveis

- **frontend-developer.mdc** - Especialista em desenvolvimento Frontend
- **backend-architect.mdc** - Arquiteto de sistemas Backend  
- **crm-specialist.mdc** - Especialista em sistemas CRM
- **code-mentor.mdc** - Mentor de programação e boas práticas

## Como Criar um Role Personalizado

1. Crie um arquivo \`.mdc\` nesta pasta
2. Use a seguinte estrutura:

\`\`\`markdown
# Nome do Role

## Identidade
Descrição de quem é o assistente neste role

## Comportamento
- Lista de comportamentos esperados
- Diretrizes específicas
- Foco principal

## Tecnologias Preferenciais
- Lista das tecnologias principais
- Ferramentas recomendadas

## Estrutura de Resposta
1. Como organizar as respostas
2. Sequência lógica
3. Elementos obrigatórios
\`\`\`

## Como Usar

1. **Via Chat Participant:** \`@gaa /role [nome-do-role]\`
2. **Via Webview:** \`/role [nome-do-role]\`
3. **Listar roles:** \`@gaa /rules\` ou \`/rules\`
4. **Status atual:** \`@gaa /status\` ou \`/status\`

Após ativar um role, todas as respostas do assistente seguirão as diretrizes definidas no arquivo correspondente.
`;

            try {
                await fs.access(readmePath);
                // README already exists, don't overwrite
            } catch {
                await fs.writeFile(readmePath, readmeContent, 'utf8');
                createdFiles++;
            }

            // Show success message
            let message = `# ✅ Inicialização de Roles Concluída!\n\n`;
            message += `📁 **Pasta criada:** \`${rolesPath}\`\n\n`;
            
            if (createdFiles > 0) {
                message += `🆕 **Arquivos criados:** ${createdFiles}\n`;
            }
            
            if (existingFiles > 0) {
                message += `📄 **Arquivos existentes:** ${existingFiles} (não foram sobrescritos)\n`;
            }

            message += `\n## 🎭 Roles Disponíveis Agora:\n`;
            message += `- \`frontend-developer\` - Especialista em Frontend\n`;
            message += `- \`backend-architect\` - Arquiteto de Backend\n`;
            message += `- \`crm-specialist\` - Especialista em CRM\n`;
            message += `- \`code-mentor\` - Mentor de programação\n\n`;
            
            message += `## 🚀 Próximos Passos:\n`;
            message += `1. Use \`/rules\` para ver todos os roles\n`;
            message += `2. Ative um role: \`/role frontend-developer\`\n`;
            message += `3. Faça uma pergunta para testar!\n`;
            message += `4. Personalize os arquivos .mdc conforme necessário\n\n`;
            
            message += `💡 **Dica:** Você pode editar os arquivos .mdc para personalizar completamente o comportamento de cada role.`;

            this.sendRoleMessage(message);

            // Reload roles after creation
            this.loadRoles();

        } catch (error) {
            this.sendRoleMessage(`❌ **Erro ao criar estrutura de roles:**\n\n\`\`\`\n${error}\n\`\`\``);
        }
    }

    private sendRoleMessage(content: string): void {
        if (!this.panel) {
            return;
        }

        this.panel.webview.postMessage({
            command: 'addMessage',
            message: {
                role: 'assistant',
                content: content,
                timestamp: new Date().toISOString()
            }
        });
    }

    private async createSystemPrompt(): Promise<string> {
        let basePrompt = `Você é o GarapaAgent Assistant, um assistente de IA inteligente especializado em desenvolvimento de software com sistema de roles personalizáveis.`;

        // Add role-specific instructions if a role is selected
        if (this.currentRole) {
            basePrompt += `

ROLE ATIVO: ${this.currentRole.name}
${this.currentRole.content}`;

            // Check for documentation URLs in the role content
            const docUrls = this.extractUrlsFromContent(this.currentRole.content);
            if (docUrls.length > 0) {
                basePrompt += `

DOCUMENTAÇÃO CARREGADA:`;
                
                for (const url of docUrls) {
                    try {
                        const docContent = await this.fetchDocumentation(url);
                        if (docContent) {
                            basePrompt += `

--- DOCUMENTAÇÃO DE ${url} ---
${docContent.substring(0, 3000)}...
--- FIM DA DOCUMENTAÇÃO ---`;
                        }
                    } catch (error) {
                        basePrompt += `

ERRO: Não foi possível carregar documentação de ${url}`;
                    }
                }
            }

            basePrompt += `

IMPORTANTE: Siga estritamente as diretrizes do role acima. Use o comportamento, tecnologias e estrutura de resposta definidos no role. Se documentação foi carregada, use-a como referência principal.`;
        }

        basePrompt += `

INSTRUÇÕES GERAIS:
- Responda em português brasileiro
- Seja prestativo e específico
- Forneça exemplos de código quando relevante
- Sugira melhores práticas
- Se não souber algo, seja honesto
- Foque em soluções práticas para desenvolvimento

ESPECIALIDADES BASE:
- TypeScript/JavaScript
- React/Next.js
- Node.js
- Banco de dados
- APIs REST
- Sistemas CRM/ERP/SAAS
- VS Code extensions
- Arquitetura de software
- DevOps e Cloud`;

        return basePrompt;
    }

    private showHelp(): void {
        const helpMessage = `# 🤖 GarapaAgent Assistant - Comandos Disponíveis

## 📋 Comandos Principais

### **Inicialização**
- \`/init\` - Cria a pasta "roles/" com arquivos .mdc padrão

### **Role Management**
- \`/rules\` ou \`/roles\` - Lista todos os roles disponíveis
- \`/role [nome]\` - Ativa um role específico
- \`/clear\` ou \`/clear-role\` - Desativa o role atual

### **Sistema**
- \`/help\` - Mostra esta ajuda
- \`/status\` - Mostra status atual do assistente

## 🎭 Roles Disponíveis (após /init)
- **frontend-developer** - Especialista em desenvolvimento Frontend
- **backend-architect** - Arquiteto de sistemas Backend
- **crm-specialist** - Especialista em sistemas CRM
- **code-mentor** - Mentor de programação e boas práticas

## 💡 Como Usar

### Primeiro uso:
\`\`\`
/init
\`\`\`

### Exemplo Básico:
\`\`\`
Como implementar autenticação JWT?
\`\`\`

### Com Role Específico:
\`\`\`
/role frontend-developer
Como criar um componente React responsivo?
\`\`\`

### Listar Roles:
\`\`\`
/rules
\`\`\`

## 🚀 Dicas
- Use \`/init\` para criar automaticamente a estrutura de roles
- Use roles específicos para respostas mais direcionadas
- O assistente analisa automaticamente seu workspace atual
- Comandos começam com \`/\` seguido do nome do comando
- Use \`@gaa\` no chat do VS Code para acesso rápido

---
*Para mais informações, visite a documentação do projeto.*`;

        this.sendRoleMessage(helpMessage);
    }

    private showStatus(): void {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const activeEditor = vscode.window.activeTextEditor;
        
        let statusInfo = `# 📊 Status do GarapaAgent Assistant\n\n`;
        
        // Role Status
        statusInfo += `## 🎭 Role Atual\n`;
        if (this.currentRole) {
            statusInfo += `✅ **Ativo:** ${this.currentRole.name}\n`;
            statusInfo += `📝 **Descrição:** ${this.extractRoleTitle(this.currentRole.content)}\n\n`;
        } else {
            statusInfo += `❌ **Nenhum role ativo**\n`;
            statusInfo += `💡 Use \`/role [nome]\` para ativar um role\n\n`;
        }
        
        // Workspace Status
        statusInfo += `## 📁 Workspace\n`;
        if (workspaceFolders && workspaceFolders.length > 0) {
            statusInfo += `✅ **Ativo:** ${workspaceFolders[0].name}\n`;
            statusInfo += `📂 **Caminho:** ${workspaceFolders[0].uri.fsPath}\n\n`;
        } else {
            statusInfo += `❌ **Nenhum workspace aberto**\n\n`;
        }
        
        // Active File Status
        statusInfo += `## 📄 Arquivo Atual\n`;
        if (activeEditor) {
            const document = activeEditor.document;
            statusInfo += `✅ **Arquivo:** ${document.fileName.split('\\').pop()}\n`;
            statusInfo += `🔤 **Linguagem:** ${document.languageId}\n`;
            
            const selection = activeEditor.selection;
            if (!selection.isEmpty) {
                statusInfo += `📋 **Texto selecionado:** ${selection.end.line - selection.start.line + 1} linhas\n`;
            }
            statusInfo += `\n`;
        } else {
            statusInfo += `❌ **Nenhum arquivo aberto**\n\n`;
        }
        
        // Available Commands
        statusInfo += `## 🛠️ Comandos Rápidos\n`;
        statusInfo += `- \`/help\` - Mostrar ajuda completa\n`;
        statusInfo += `- \`/rules\` - Listar roles disponíveis\n`;
        statusInfo += `- \`/role [nome]\` - Ativar role específico\n`;
        statusInfo += `- \`/clear\` - Desativar role atual\n`;
        
        this.sendRoleMessage(statusInfo);
    }

    private extractUrlsFromContent(content: string): string[] {
        // Regex para encontrar URLs nos documentos .mdc
        const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
        const urls = content.match(urlRegex) || [];
        
        // Filtra apenas URLs de documentação conhecidas
        const docUrls = urls.filter(url => {
            const validDomains = [
                'docs.supabase.com',
                'supabase.com/docs',
                'docs.stripe.com',
                'stripe.com/docs',
                'firebase.google.com/docs',
                'docs.mongodb.com',
                'docs.aws.amazon.com',
                'docs.microsoft.com',
                'developer.mozilla.org',
                'docs.github.com',
                'docs.gitlab.com',
                'docs.docker.com',
                'kubernetes.io/docs',
                'docs.npmjs.com',
                'reactjs.org/docs',
                'nextjs.org/docs',
                'docs.nestjs.com',
                'docs.prisma.io',
                'typeorm.io/docs',
                'docs.fastify.io',
                'expressjs.com/docs',
                'tailwindcss.com/docs'
            ];
            
            return validDomains.some(domain => url.includes(domain));
        });
        
        return docUrls;
    }

    private async fetchDocumentation(url: string): Promise<string | null> {
        try {
            // Use VS Code's built-in fetch or Node.js fetch
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'GarapaAgent Assistant VS Code Extension'
                }
            });
            
            if (!response.ok) {
                console.warn(`Failed to fetch ${url}: ${response.status}`);
                return null;
            }
            
            const html = await response.text();
            
            // Extrai o conteúdo principal do HTML (remove tags, mantém texto)
            const textContent = this.extractTextFromHtml(html);
            
            // Limita o tamanho para não sobrecarregar o prompt
            return textContent.substring(0, 5000);
            
        } catch (error) {
            console.warn(`Error fetching documentation from ${url}:`, error);
            return null;
        }
    }

    private extractTextFromHtml(html: string): string {
        // Remove scripts e styles
        let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        
        // Remove tags HTML mas mantém quebras de linha importantes
        text = text.replace(/<\/?(h[1-6]|p|div|section|article)[^>]*>/gi, '\n');
        text = text.replace(/<\/?(li|dd)[^>]*>/gi, '\n- ');
        text = text.replace(/<\/?(ul|ol|dl)[^>]*>/gi, '\n');
        text = text.replace(/<[^>]*>/g, '');
        
        // Limpa espaços excessivos e quebras de linha
        text = text.replace(/\n\s*\n/g, '\n');
        text = text.replace(/[ \t]+/g, ' ');
        text = text.trim();
        
        return text;
    }
}
