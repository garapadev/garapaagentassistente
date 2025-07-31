import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

interface Role {
    name: string;
    content: string;
    filePath: string;
}

export class GarapaAgentChatParticipant {
    private roles: Role[] = [];
    private currentRole: Role | null = null;
    private agentMode: boolean = false; // New agent mode flag

    constructor() {
        this.loadRoles();
    }
    
    async handleChatRequest(
        request: vscode.ChatRequest,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        try {
            // Show thinking indicator
            stream.progress('Pensando...');

            // Get the user's message
            const userMessage = request.prompt;
            
            // Check for role selection commands
            if (userMessage.startsWith('/help')) {
                this.showHelp(stream);
                return;
            }
            
            if (userMessage.startsWith('/init')) {
                await this.initializeRoles(stream);
                return;
            }
            
            if (userMessage.startsWith('/setup')) {
                await this.handleSetupCommand(stream);
                return;
            }
            
            if (userMessage.startsWith('/agent on')) {
                this.agentMode = true;
                stream.markdown('🤖 **Modo Agente ATIVADO!**\n\nAgora posso executar ações como:\n- ✅ Criar e editar arquivos\n- ✅ Executar comandos\n- ✅ Implementar código\n- ✅ Refatorar projetos\n\nTente: *"criar um arquivo teste.js com uma função hello world"*');
                return;
            }
            
            if (userMessage.startsWith('/agent off')) {
                this.agentMode = false;
                stream.markdown('💬 **Modo Agente DESATIVADO**\n\nVoltei ao modo chat normal. Use `/agent on` para reativar.');
                return;
            }
            
            if (userMessage.startsWith('/mode') || userMessage.startsWith('/agent')) {
                const status = this.agentMode ? '🤖 ATIVO' : '💬 DESATIVO';
                stream.markdown(`**Modo Agente:** ${status}\n\n**Comandos:**\n- \`/agent on\` - Ativar modo agente\n- \`/agent off\` - Desativar modo agente\n\n**No modo agente posso:**\n- Criar/editar arquivos\n- Executar comandos\n- Implementar funcionalidades\n- Fazer refatorações`);
                return;
            }
            
            if (userMessage.startsWith('/role ')) {
                const roleName = userMessage.substring(6).trim();
                this.setRole(roleName, stream);
                return;
            }
            
            if (userMessage.startsWith('/rules') || userMessage.startsWith('/roles')) {
                this.listRoles(stream);
                return;
            }
            
            if (userMessage.startsWith('/clear-role') || userMessage.startsWith('/clear')) {
                this.clearRole(stream);
                return;
            }
            
            if (userMessage.startsWith('/status')) {
                this.showStatus(stream);
                return;
            }
            
            // Analyze the workspace context
            const workspaceInfo = await this.getWorkspaceContext();
            
            // Check if user is asking for file operations or code generation
            const isFileOperation = this.detectFileOperation(userMessage);
            const isCodeRequest = this.detectCodeRequest(userMessage);
            
            if (this.agentMode && (isFileOperation || isCodeRequest)) {
                await this.handleAgentRequest(userMessage, stream, workspaceInfo);
                return;
            }
            
            // Craft a prompt for the language model with role context
            const systemPrompt = await this.createSystemPrompt(workspaceInfo);
            const fullPrompt = `${systemPrompt}\n\nUsuário: ${userMessage}`;            // Try to get a language model
            const models = await vscode.lm.selectChatModels({ 
                vendor: 'copilot',
                family: 'gpt-4o'
            });

            if (models.length === 0) {
                stream.markdown('❌ Nenhum modelo de linguagem disponível. Verifique se o GitHub Copilot está ativo.');
                return;
            }

            const model = models[0];
            
            // Send request to the language model
            const messages: vscode.LanguageModelChatMessage[] = [
                vscode.LanguageModelChatMessage.User(userMessage)
            ];

            const response = await model.sendRequest(messages, {
                modelOptions: {
                    temperature: 0.7,
                    maxTokens: 1000
                }
            }, token);

            // Stream the response
            let responseText = '';
            for await (const fragment of response.text) {
                responseText += fragment;
                stream.markdown(fragment);
            }

            // Add some helpful suggestions
            if (userMessage.toLowerCase().includes('erro') || userMessage.toLowerCase().includes('problema')) {
                stream.button({
                    command: 'workbench.action.problems.focus',
                    title: '🔍 Ver Problemas'
                });
            }

            if (userMessage.toLowerCase().includes('arquivo') || userMessage.toLowerCase().includes('file')) {
                stream.button({
                    command: 'workbench.action.quickOpen',
                    title: '📁 Abrir Arquivo'
                });
            }

        } catch (error) {
            console.error('Erro no chat participant:', error);
            
            if (error instanceof vscode.LanguageModelError) {
                stream.markdown(`❌ Erro do modelo de linguagem: ${error.message}`);
                
                if (error.cause instanceof Error && error.cause.message.includes('off_topic')) {
                    stream.markdown('💡 Eu posso ajudar apenas com questões relacionadas ao desenvolvimento de software e CRM.');
                } else if (error.cause instanceof Error && error.cause.message.includes('consent')) {
                    stream.markdown('⚠️ Você precisa autorizar o uso do GitHub Copilot para continuar.');
                }
            } else {
                stream.markdown('❌ Ocorreu um erro inesperado. Tente novamente.');
            }
        }
    }

    async provideFollowups(
        result: vscode.ChatResult,
        context: vscode.ChatContext,
        token: vscode.CancellationToken
    ): Promise<vscode.ChatFollowup[]> {
        const followups: vscode.ChatFollowup[] = [];

        // Role-specific followups
        if (this.currentRole) {
            followups.push({
                prompt: '/clear-role',
                label: '🔄 Desativar role',
                command: 'garapacrm.clearRole'
            });
        } else {
            followups.push({
                prompt: '/roles',
                label: '🎭 Ver roles disponíveis',
                command: 'garapacrm.listRoles'
            });
        }

        // Suggest common follow-up questions
        followups.push(
            {
                prompt: 'Como posso melhorar este código?',
                label: '💡 Melhorar código',
                command: 'garapacrm.improveCode'
            },
            {
                prompt: 'Explicar este erro em detalhes',
                label: '🔍 Explicar erro',
                command: 'garapacrm.explainError'
            },
            {
                prompt: 'Mostrar exemplos similares',
                label: '📚 Ver exemplos',
                command: 'garapacrm.showExamples'
            }
        );

        // Add role-specific suggestions based on current role
        if (this.currentRole) {
            const roleName = this.currentRole.name.toLowerCase();
            
            if (roleName.includes('frontend')) {
                followups.push({
                    prompt: 'Como melhorar a performance deste componente?',
                    label: '⚡ Otimizar performance',
                    command: 'garapacrm.optimizePerformance'
                });
            }
            
            if (roleName.includes('backend')) {
                followups.push({
                    prompt: 'Como tornar esta API mais segura?',
                    label: '🔒 Melhorar segurança',
                    command: 'garapacrm.improveSecurity'
                });
            }
            
            if (roleName.includes('crm')) {
                followups.push({
                    prompt: 'Como automatizar este processo de vendas?',
                    label: '🤖 Automatizar vendas',
                    command: 'garapacrm.automateProcess'
                });
            }
        }

        return followups;
    }

    private async createSystemPrompt(workspaceInfo: any): Promise<string> {
        let basePrompt = `Você é o GarapaAgent Assistant, um assistente de IA inteligente especializado em desenvolvimento de software com sistema de roles personalizáveis.

CONTEXTO DO WORKSPACE:
${workspaceInfo}`;

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

COMANDOS DISPONÍVEIS:
- /role [nome] - Ativa um role específico
- /roles - Lista todos os roles disponíveis
- /clear-role - Remove o role ativo

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

            console.log(`Loaded ${this.roles.length} roles:`, this.roles.map(r => r.name));
        } catch (error) {
            console.error('Error loading roles:', error);
        }
    }

    private setRole(roleName: string, stream: vscode.ChatResponseStream): void {
        const role = this.roles.find(r => 
            r.name.toLowerCase().includes(roleName.toLowerCase()) ||
            roleName.toLowerCase().includes(r.name.toLowerCase())
        );

        if (role) {
            this.currentRole = role;
            stream.markdown(`✅ **Role ativado:** ${role.name}\n\n`);
            stream.markdown(`Agora estou seguindo as diretrizes do role "${role.name}". Como posso ajudar?`);
            
            // Add helpful buttons
            stream.button({
                command: 'workbench.action.openSettings',
                title: '⚙️ Ver Role Ativo'
            });
        } else {
            stream.markdown(`❌ **Role não encontrado:** "${roleName}"\n\n`);
            this.listRoles(stream);
        }
    }

    private listRoles(stream: vscode.ChatResponseStream): void {
        if (this.roles.length === 0) {
            stream.markdown('📂 **Nenhum role encontrado**\n\nCrie arquivos `.mdc` na pasta `roles/` do seu workspace.');
            return;
        }

        stream.markdown('📋 **Roles Disponíveis:**\n\n');
        
        this.roles.forEach(role => {
            const isActive = this.currentRole?.name === role.name;
            const status = isActive ? '🟢 **ATIVO**' : '⚪';
            stream.markdown(`${status} \`/role ${role.name}\` - ${this.extractRoleTitle(role.content)}\n`);
        });

        stream.markdown('\n💡 **Como usar:** Digite `/role [nome]` para ativar um role');
        
        if (this.currentRole) {
            stream.markdown(`\n🎯 **Role atual:** ${this.currentRole.name}`);
        }
    }

    private clearRole(stream: vscode.ChatResponseStream): void {
        if (this.currentRole) {
            const previousRole = this.currentRole.name;
            this.currentRole = null;
            stream.markdown(`✅ **Role removido:** ${previousRole}\n\nAgora estou usando o comportamento padrão do GarapaAgent Assistant.`);
        } else {
            stream.markdown('ℹ️ **Nenhum role ativo** para remover.');
        }
    }

    private extractRoleTitle(content: string): string {
        const lines = content.split('\n');
        const titleLine = lines.find(line => line.startsWith('# '));
        return titleLine ? titleLine.substring(2).trim() : 'Role personalizado';
    }

    private async getWorkspaceContext(): Promise<string> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return 'Nenhum workspace aberto.';
        }

        let context = `Workspace: ${workspaceFolders[0].name}\n`;
        
        // Get active editor info
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const document = activeEditor.document;
            context += `Arquivo ativo: ${document.fileName}\n`;
            context += `Linguagem: ${document.languageId}\n`;
            
            // Get selected text if any
            const selection = activeEditor.selection;
            if (!selection.isEmpty) {
                const selectedText = document.getText(selection);
                context += `Texto selecionado:\n${selectedText}\n`;
            }
        }

        // Get recently opened files
        const recentFiles = await vscode.workspace.findFiles('**/*.{ts,js,tsx,jsx,json}', '**/node_modules/**', 5);
        if (recentFiles.length > 0) {
            context += `Arquivos recentes: ${recentFiles.map(f => f.fsPath.split('/').pop()).join(', ')}\n`;
        }

        return context;
    }

    private showHelp(stream: vscode.ChatResponseStream): void {
        stream.markdown(`# 🤖 GarapaAgent Assistant - Comandos Disponíveis

## 📋 Comandos Principais

### **Inicialização**
- \`/init\` - Cria a pasta "roles/" com arquivos .mdc padrão
- \`/setup\` - Configura ambiente de desenvolvimento (PM2, dependências, etc.)

### **Modo Agente 🚀**
- \`/agent on\` - **ATIVAR capacidades de agente** (criar/editar arquivos, executar comandos)
- \`/agent off\` - Desativar modo agente (volta ao chat normal)
- \`/mode\` ou \`/agent\` - Ver status do modo agente

### **Role Management**
- \`/rules\` ou \`/roles\` - Lista todos os roles disponíveis
- \`/role [nome]\` - Ativa um role específico
- \`/clear\` ou \`/clear-role\` - Desativa o role atual

### **Sistema**
- \`/help\` - Mostra esta ajuda
- \`/status\` - Mostra status atual do assistente

## 🤖 Capacidades do Modo Agente

Quando ativado com \`/agent on\`, posso:
- ✅ **Criar arquivos** - "criar um arquivo index.js com código inicial"
- ✅ **Editar código** - "adicionar uma função de login no arquivo auth.js"
- ✅ **Executar comandos** - "instalar dependências npm"
- ✅ **Implementar features** - "implementar autenticação JWT completa"
- ✅ **Refatorar código** - "refatorar este componente para usar hooks"
- ✅ **Corrigir bugs** - "corrigir erro de tipagem no arquivo user.ts"

## 🎭 Roles Disponíveis (após /init)
- **frontend-developer** - Especialista em desenvolvimento Frontend (shadcn/ui + Recharts)
- **backend-architect** - Arquiteto de sistemas Backend
- **crm-specialist** - Especialista em sistemas CRM
- **code-mentor** - Mentor de programação e boas práticas
- **develop** - Assistente de configuração e desenvolvimento (criado com /setup)

## 💡 Como Usar

### Primeiro uso:
\`\`\`
@gaa /init
@gaa /agent on
@gaa /setup
\`\`\`

### Exemplo com Agente:
\`\`\`
@gaa /agent on
@gaa criar um componente Button.tsx com TypeScript
\`\`\`

### Com Role Específico:
\`\`\`
@gaa /role frontend-developer
@gaa /agent on
@gaa implementar um dashboard com gráficos usando Recharts
\`\`\`
\`\`\`

### Configuração de Ambiente:
\`\`\`
@gaa /setup
@gaa /role develop
@gaa Configure PM2 para meu projeto Next.js
\`\`\`

### Listar Roles:
\`\`\`
@gaa /rules
\`\`\`

## 🚀 Dicas
- Use \`/init\` para criar automaticamente a estrutura de roles
- Use \`/setup\` para configurar seu ambiente de desenvolvimento
- Use roles específicos para respostas mais direcionadas
- O assistente analisa automaticamente seu workspace atual
- O comando \`/setup\` detecta automaticamente seu SO e tipo de projeto
- Comandos começam com \`/\` seguido do nome do comando
- Digite \`@gaa\` no chat para começar uma conversa

---
*Para mais informações, visite a documentação do projeto.*`);
    }

    private showStatus(stream: vscode.ChatResponseStream): void {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const activeEditor = vscode.window.activeTextEditor;
        
        let statusInfo = `# 📊 Status do GarapaAgent Assistant\n\n`;
        
        // Agent Mode Status
        statusInfo += `## 🤖 Modo Agente\n`;
        if (this.agentMode) {
            statusInfo += `✅ **ATIVO** - Posso criar/editar arquivos e executar comandos\n`;
            statusInfo += `💡 Tente: *"criar um arquivo teste.js"* ou *"implementar uma função de login"*\n\n`;
        } else {
            statusInfo += `❌ **INATIVO** - Modo chat apenas\n`;
            statusInfo += `💡 Use \`/agent on\` para ativar capacidades de agente\n\n`;
        }
        
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
        
        stream.markdown(statusInfo);
    }

    private async initializeRoles(stream: vscode.ChatResponseStream): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            stream.markdown('❌ **Erro:** Nenhum workspace aberto. Abra uma pasta para criar a estrutura de roles.');
            return;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const rolesPath = path.join(workspaceRoot, 'roles');

        try {
            // Create roles directory if it doesn't exist
            await fs.mkdir(rolesPath, { recursive: true });

            // Define default role templates
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
            message += `1. Use \`@gaa /rules\` para ver todos os roles\n`;
            message += `2. Ative um role: \`@gaa /role frontend-developer\`\n`;
            message += `3. Faça uma pergunta para testar!\n`;
            message += `4. Personalize os arquivos .mdc conforme necessário\n\n`;
            
            message += `💡 **Dica:** Você pode editar os arquivos .mdc para personalizar completamente o comportamento de cada role.`;

            stream.markdown(message);

        } catch (error) {
            stream.markdown(`❌ **Erro ao criar estrutura de roles:**\n\n\`\`\`\n${error}\n\`\`\``);
        }
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

    private async handleSetupCommand(stream: vscode.ChatResponseStream): Promise<void> {
        stream.markdown('# 🚀 GarapaAgent - Configuração do Ambiente de Desenvolvimento\n\n');
        
        // Detecta o sistema operacional
        const os = this.detectOperatingSystem();
        stream.markdown(`**Sistema Operacional Detectado:** ${os}\n\n`);
        
        // Verifica estrutura do projeto
        const projectInfo = await this.analyzeProjectStructure();
        stream.markdown('## 📁 Análise do Projeto\n\n');
        stream.markdown(`**Tipo de Projeto:** ${projectInfo.type}\n`);
        stream.markdown(`**Framework Detectado:** ${projectInfo.framework}\n`);
        stream.markdown(`**Gerenciador de Pacotes:** ${projectInfo.packageManager}\n\n`);
        
        // Verifica dependências instaladas
        const dependencies = await this.checkDependencies();
        stream.markdown('## 📦 Status das Dependências\n\n');
        
        for (const dep of dependencies) {
            const status = dep.installed ? '✅' : '❌';
            stream.markdown(`${status} **${dep.name}**: ${dep.version || 'Não instalado'}\n`);
        }
        
        stream.markdown('\n## ⚙️ Configuração PM2\n\n');
        
        // Verifica se PM2 está instalado
        const pm2Status = await this.checkPM2Installation();
        if (pm2Status.installed) {
            stream.markdown('✅ **PM2 já está instalado**\n\n');
        } else {
            stream.markdown('❌ **PM2 não encontrado**\n\n');
            stream.markdown('**Comando para instalar PM2:**\n');
            stream.markdown('```bash\nnpm install -g pm2\n```\n\n');
        }
        
        // Cria arquivo develop.mdc
        await this.createDevelopmentRules(os, projectInfo);
        stream.markdown('✅ **Arquivo `develop.mdc` criado com regras específicas para seu ambiente**\n\n');
        
        // Sugere configuração do PM2
        await this.suggestPM2Configuration(stream, projectInfo);
        
        // Perguntas para configuração
        stream.markdown('## 🤔 Configuração Personalizada\n\n');
        stream.markdown('Para uma configuração mais detalhada, responda:\n\n');
        stream.markdown('1. **Tipo de aplicação** (frontend, backend, fullstack)?\n');
        stream.markdown('2. **Banco de dados** que você usará?\n');
        stream.markdown('3. **Serviços externos** (APIs, cloud services)?\n');
        stream.markdown('4. **Ferramentas de desenvolvimento** específicas?\n\n');
        
        stream.markdown('💡 **Próximos passos:**\n');
        stream.markdown('- Use `@gaa /role develop` para ativar o assistente de desenvolvimento\n');
        stream.markdown('- Execute os comandos sugeridos para instalar dependências\n');
        stream.markdown('- Configure o PM2 para desenvolvimento contínuo\n\n');
        
        stream.markdown('✅ **Configuração do ambiente concluída!**\n');
    }

    private detectOperatingSystem(): string {
        const platform = process.platform;
        switch (platform) {
            case 'win32':
                return '🪟 Windows';
            case 'darwin':
                return '🍎 macOS';
            case 'linux':
                return '🐧 Linux';
            default:
                return `❓ ${platform}`;
        }
    }

    private async analyzeProjectStructure(): Promise<{type: string, framework: string, packageManager: string}> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return { type: 'Desconhecido', framework: 'Nenhum', packageManager: 'Nenhum' };
        }
        
        const rootPath = workspaceFolders[0].uri.fsPath;
        
        try {
            // Verifica package.json
            const packageJsonPath = path.join(rootPath, 'package.json');
            if (fsSync.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fsSync.readFileSync(packageJsonPath, 'utf8'));
                
                // Detecta framework
                let framework = 'Node.js';
                if (packageJson.dependencies?.next || packageJson.devDependencies?.next) {
                    framework = 'Next.js';
                } else if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
                    framework = 'React';
                } else if (packageJson.dependencies?.vue || packageJson.devDependencies?.vue) {
                    framework = 'Vue.js';
                } else if (packageJson.dependencies?.angular || packageJson.devDependencies?.angular) {
                    framework = 'Angular';
                } else if (packageJson.dependencies?.nestjs || packageJson.devDependencies?.nestjs) {
                    framework = 'NestJS';
                } else if (packageJson.dependencies?.express || packageJson.devDependencies?.express) {
                    framework = 'Express.js';
                }
                
                // Detecta tipo
                let type = 'Backend';
                if (packageJson.dependencies?.react || packageJson.dependencies?.vue || packageJson.dependencies?.angular) {
                    type = packageJson.dependencies?.express || packageJson.dependencies?.nestjs ? 'Fullstack' : 'Frontend';
                }
                
                // Detecta gerenciador de pacotes
                let packageManager = 'npm';
                if (fsSync.existsSync(path.join(rootPath, 'yarn.lock'))) {
                    packageManager = 'yarn';
                } else if (fsSync.existsSync(path.join(rootPath, 'pnpm-lock.yaml'))) {
                    packageManager = 'pnpm';
                }
                
                return { type, framework, packageManager };
            }
            
            // Verifica outros indicadores
            if (fsSync.existsSync(path.join(rootPath, 'requirements.txt')) || fsSync.existsSync(path.join(rootPath, 'pyproject.toml'))) {
                return { type: 'Backend', framework: 'Python', packageManager: 'pip' };
            }
            
            if (fsSync.existsSync(path.join(rootPath, 'Cargo.toml'))) {
                return { type: 'Backend', framework: 'Rust', packageManager: 'cargo' };
            }
            
            if (fsSync.existsSync(path.join(rootPath, 'go.mod'))) {
                return { type: 'Backend', framework: 'Go', packageManager: 'go mod' };
            }
            
        } catch (error) {
            console.warn('Error analyzing project structure:', error);
        }
        
        return { type: 'Desconhecido', framework: 'Nenhum', packageManager: 'Nenhum' };
    }

    private async checkDependencies(): Promise<Array<{name: string, installed: boolean, version?: string}>> {
        const dependencies = [
            { name: 'Node.js', command: 'node --version' },
            { name: 'npm', command: 'npm --version' },
            { name: 'Git', command: 'git --version' },
            { name: 'TypeScript', command: 'tsc --version' },
            { name: 'PM2', command: 'pm2 --version' }
        ];
        
        const results = [];
        
        for (const dep of dependencies) {
            try {
                const { exec } = require('child_process');
                const version = await new Promise<string>((resolve, reject) => {
                    exec(dep.command, (error: any, stdout: string) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(stdout.trim());
                        }
                    });
                });
                
                results.push({
                    name: dep.name,
                    installed: true,
                    version: version
                });
            } catch (error) {
                results.push({
                    name: dep.name,
                    installed: false
                });
            }
        }
        
        return results;
    }

    private async checkPM2Installation(): Promise<{installed: boolean, version?: string}> {
        try {
            const { exec } = require('child_process');
            const version = await new Promise<string>((resolve, reject) => {
                exec('pm2 --version', (error: any, stdout: string) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(stdout.trim());
                    }
                });
            });
            
            return { installed: true, version };
        } catch (error) {
            return { installed: false };
        }
    }

    private async createDevelopmentRules(os: string, projectInfo: any): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;
        
        const rolesPath = path.join(workspaceFolders[0].uri.fsPath, 'roles');
        const developPath = path.join(rolesPath, 'develop.mdc');
        
        // Cria pasta roles se não existir
        if (!fsSync.existsSync(rolesPath)) {
            fsSync.mkdirSync(rolesPath, { recursive: true });
        }
        
        const developContent = this.generateDevelopmentRules(os, projectInfo);
        fsSync.writeFileSync(developPath, developContent, 'utf8');
    }

    private generateDevelopmentRules(os: string, projectInfo: any): string {
        const platform = process.platform;
        const isWindows = platform === 'win32';
        const shellCommands = isWindows ? 'PowerShell/CMD' : 'Bash/Zsh';
        const packageInstall = projectInfo.packageManager === 'yarn' ? 'yarn add' : 
                              projectInfo.packageManager === 'pnpm' ? 'pnpm add' : 'npm install';
        
        return `# Assistente de Desenvolvimento - ${os}

## Identidade
Você é um assistente especializado em configuração e desenvolvimento para ambiente ${os}, focado em automação com PM2 e otimização do workflow de desenvolvimento.

## Ambiente Detectado
- **Sistema Operacional:** ${os}
- **Tipo de Projeto:** ${projectInfo.type}
- **Framework:** ${projectInfo.framework}
- **Gerenciador de Pacotes:** ${projectInfo.packageManager}
- **Shell:** ${shellCommands}

## Comportamento
- Configure ambientes de desenvolvimento otimizados para ${platform}
- Use PM2 para gerenciamento de processos em desenvolvimento
- Implemente hot-reload e watch modes
- Configure scripts de desenvolvimento automatizados
- Otimize performance para desenvolvimento local
- Configure debugging para VS Code
- Implemente logging estruturado para desenvolvimento

## Comandos Específicos do Sistema

### ${isWindows ? 'Windows' : 'Unix/Linux/macOS'}
\`\`\`${isWindows ? 'powershell' : 'bash'}
# Instalação de dependências
${packageInstall} <package>

# PM2 - Gerenciamento de processos
pm2 start ecosystem.config.js --watch
pm2 restart all
pm2 logs
pm2 monit

# Scripts de desenvolvimento
${projectInfo.packageManager} run dev
${projectInfo.packageManager} run build
${projectInfo.packageManager} run test:watch

${isWindows ? `# Windows específico
# Configurar permissões PowerShell (se necessário)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Gerenciamento de serviços Windows
net start <service>
net stop <service>` : `# Unix específico
# Gerenciamento de permissões
chmod +x scripts/*.sh

# Variáveis de ambiente
export NODE_ENV=development
export DEBUG=app:*

# Processos em background
nohup npm run dev &`}
\`\`\`

## Configuração PM2

### Arquivo ecosystem.config.js
\`\`\`javascript
module.exports = {
  apps: [{
    name: '${projectInfo.framework.toLowerCase()}-dev',
    script: '${projectInfo.framework === 'Next.js' ? 'npm' : projectInfo.framework === 'React' ? 'npm' : 'dist/index.js'}',
    ${projectInfo.framework === 'Next.js' || projectInfo.framework === 'React' ? `args: 'run dev',` : ''}
    watch: true,
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G',
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
\`\`\`

## Scripts de Desenvolvimento Recomendados

### package.json scripts
\`\`\`json
{
  "scripts": {
    "dev": "pm2-runtime start ecosystem.config.js --env development",
    "dev:watch": "pm2 start ecosystem.config.js --watch",
    "dev:stop": "pm2 stop all",
    "dev:restart": "pm2 restart all",
    "dev:logs": "pm2 logs",
    "dev:monit": "pm2 monit",
    "build": "${projectInfo.framework === 'Next.js' ? 'next build' : projectInfo.framework === 'React' ? 'react-scripts build' : 'tsc'}",
    "test:watch": "${projectInfo.packageManager} test -- --watch",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit"
  }
}
\`\`\`

## Estrutura de Desenvolvimento

### Organização de pastas recomendada
\`\`\`
project/
├── src/                 # Código fonte
├── tests/              # Testes
├── logs/               # Logs do PM2
├── scripts/            # Scripts de automação
├── .vscode/            # Configurações VS Code
├── ecosystem.config.js # Configuração PM2
└── docker-compose.yml  # Desenvolvimento com containers
\`\`\`

## Debugging e Monitoramento

### VS Code Launch Configuration (.vscode/launch.json)
\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug ${projectInfo.framework}",
      "type": "node",
      "request": "launch",
      "program": "\${workspaceFolder}/dist/index.js",
      "env": {
        "NODE_ENV": "development"
      },
      "sourceMaps": true,
      "outFiles": ["\${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
\`\`\`

## Otimizações de Performance

### Para ${os}
- Configure SSD para node_modules (${isWindows ? 'usar junctions se necessário' : 'usar links simbólicos'})
- ${isWindows ? 'Desabilite Windows Defender para pasta node_modules' : 'Configure inotify limits para watching'}
- Use cache do ${projectInfo.packageManager} adequadamente
- Configure variáveis de ambiente para desenvolvimento

## Comandos de Solução de Problemas

\`\`\`${isWindows ? 'powershell' : 'bash'}
# Limpar cache
${projectInfo.packageManager === 'npm' ? 'npm cache clean --force' : projectInfo.packageManager + ' cache clean'}

# Reinstalar dependências
${isWindows ? 'Remove-Item node_modules -Recurse -Force' : 'rm -rf node_modules'}
${packageInstall}

# Reset PM2
pm2 kill
pm2 start ecosystem.config.js

# Verificar portas em uso
${isWindows ? 'netstat -ano | findstr :3000' : 'lsof -i :3000'}
\`\`\`

## Automatização de Tarefas

### Pre-commit hooks (usando husky)
\`\`\`json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  },
  "lint-staged": {
    "*.{js,ts,tsx}": ["eslint --fix", "git add"],
    "*.{js,ts,tsx,json,md}": ["prettier --write", "git add"]
  }
}
\`\`\`

## Estrutura de Resposta
1. **Análise do Problema**: Identifique questões específicas do ${os}
2. **Solução PM2**: Configure processos adequadamente
3. **Scripts Automáticos**: Forneça comandos prontos para uso
4. **Debugging**: Configure ferramentas de debug
5. **Performance**: Otimize para desenvolvimento local
6. **Documentação**: Explique configurações específicas do sistema
`;
    }

    private async suggestPM2Configuration(stream: vscode.ChatResponseStream, projectInfo: any): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;
        
        const rootPath = workspaceFolders[0].uri.fsPath;
        const ecosystemPath = path.join(rootPath, 'ecosystem.config.js');
        
        if (!fsSync.existsSync(ecosystemPath)) {
            stream.markdown('## 📝 Configuração Sugerida do PM2\n\n');
            stream.markdown('**Arquivo `ecosystem.config.js` será criado:**\n\n');
            
            const ecosystemConfig = this.generateEcosystemConfig(projectInfo);
            
            stream.markdown('```javascript\n' + ecosystemConfig + '\n```\n\n');
            
            // Cria o arquivo
            fsSync.writeFileSync(ecosystemPath, ecosystemConfig, 'utf8');
            stream.markdown('✅ **Arquivo `ecosystem.config.js` criado**\n\n');
        } else {
            stream.markdown('✅ **Arquivo `ecosystem.config.js` já existe**\n\n');
        }
    }

    private generateEcosystemConfig(projectInfo: any): string {
        const appName = projectInfo.framework.toLowerCase().replace('.', '') + '-dev';
        const isReactOrNext = projectInfo.framework === 'React' || projectInfo.framework === 'Next.js';
        
        return `module.exports = {
  apps: [{
    name: '${appName}',
    script: ${isReactOrNext ? "'npm'" : "'dist/index.js'"},
    ${isReactOrNext ? "args: 'run dev'," : ''}
    watch: true,
    ignore_watch: ['node_modules', 'logs', '.git'],
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G',
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    watch_options: {
      followSymlinks: false,
      usePolling: true,
      interval: 1000
    }
  }]
};`;
    }

    // === AGENT CAPABILITIES ===
    
    private detectFileOperation(message: string): boolean {
        const fileKeywords = [
            'criar arquivo', 'create file', 'novo arquivo', 'new file',
            'editar arquivo', 'edit file', 'modificar arquivo', 'modify file',
            'deletar arquivo', 'delete file', 'remover arquivo', 'remove file',
            'ler arquivo', 'read file', 'abrir arquivo', 'open file',
            'escrever no arquivo', 'write to file', 'salvar arquivo', 'save file'
        ];
        
        return fileKeywords.some(keyword => 
            message.toLowerCase().includes(keyword.toLowerCase())
        );
    }
    
    private detectCodeRequest(message: string): boolean {
        const codeKeywords = [
            'implementar', 'implement', 'código', 'code', 'função', 'function',
            'classe', 'class', 'componente', 'component', 'criar', 'create',
            'gerar', 'generate', 'adicionar', 'add', 'fazer', 'make',
            'desenvolver', 'develop', 'construir', 'build', 'script',
            'refatorar', 'refactor', 'corrigir', 'fix', 'bug'
        ];
        
        return codeKeywords.some(keyword => 
            message.toLowerCase().includes(keyword.toLowerCase())
        );
    }
    
    private async handleAgentRequest(
        userMessage: string, 
        stream: vscode.ChatResponseStream, 
        workspaceInfo: any
    ): Promise<void> {
        try {
            stream.progress('🤖 Analisando solicitação como agente...');
            
            // Get enhanced language model for agent capabilities
            const models = await vscode.lm.selectChatModels({ 
                vendor: 'copilot',
                family: 'gpt-4o'
            });

            if (models.length === 0) {
                stream.markdown('❌ Modelo de linguagem não disponível para capacidades de agente.');
                return;
            }

            const model = models[0];
            
            // Create agent system prompt
            const agentPrompt = await this.createAgentSystemPrompt(workspaceInfo);
            const fullPrompt = `${agentPrompt}\n\nUsuário: ${userMessage}`;

            // Send request with agent context
            const messages: vscode.LanguageModelChatMessage[] = [
                vscode.LanguageModelChatMessage.User(fullPrompt)
            ];

            const response = await model.sendRequest(messages, {
                modelOptions: {
                    temperature: 0.3, // Lower temperature for more precise agent actions
                    maxTokens: 2000
                }
            });

            // Parse and execute agent response
            let responseText = '';
            for await (const fragment of response.text) {
                responseText += fragment;
            }
            
            // Try to extract and execute actions from the response
            await this.executeAgentActions(responseText, stream);
            
            // Also show the reasoning
            stream.markdown('\n**🤖 Resposta do Agente:**\n');
            stream.markdown(responseText);
            
        } catch (error) {
            console.error('Erro nas capacidades de agente:', error);
            stream.markdown('❌ Erro ao executar capacidades de agente. Tentando resposta padrão...');
            
            // Fallback to regular chat
            await this.handleRegularChat(userMessage, stream);
        }
    }
    
    private async createAgentSystemPrompt(workspaceInfo: any): Promise<string> {
        const roleContext = this.currentRole ? 
            `\n### ROLE ATIVO:\n${this.currentRole.content}\n` : '';
        
        return `Você é o GarapaAgent Assistant, um agente de IA inteligente com capacidades avançadas de edição de código e arquivos.

### CAPACIDADES DO AGENTE:
- ✅ Criar, editar, ler e deletar arquivos
- ✅ Executar comandos no terminal
- ✅ Analisar e modificar código
- ✅ Implementar funcionalidades completas
- ✅ Refatorar e corrigir bugs
- ✅ Gerenciar estrutura de projetos

### INSTRUÇÕES IMPORTANTES:
1. Quando identificar uma solicitação de arquivo ou código, EXECUTE as ações necessárias
2. Para operações de arquivo, use sempre caminhos absolutos baseados no workspace
3. Antes de modificar código, analise o contexto existente
4. Mantenha consistência com padrões do projeto
5. Sempre explique suas ações ao usuário

### WORKSPACE ATUAL:
${JSON.stringify(workspaceInfo, null, 2)}

${roleContext}

### FORMATO DE RESPOSTA:
Para executar ações, use a sintaxe:
\`\`\`action:type
parâmetros da ação
\`\`\`

Tipos de ação disponíveis:
- action:create-file (criar arquivo)
- action:edit-file (editar arquivo) 
- action:read-file (ler arquivo)
- action:run-command (executar comando)
- action:search-code (buscar código)

Seja preciso e sempre explique o que está fazendo.`;
    }
    
    private async executeAgentActions(responseText: string, stream: vscode.ChatResponseStream): Promise<void> {
        // Extract action blocks from response
        const actionRegex = /```action:(\w+)\n([\s\S]*?)```/g;
        let match;
        
        while ((match = actionRegex.exec(responseText)) !== null) {
            const actionType = match[1];
            const actionParams = match[2].trim();
            
            try {
                stream.progress(`🔧 Executando: ${actionType}...`);
                
                switch (actionType) {
                    case 'create-file':
                        await this.executeCreateFile(actionParams, stream);
                        break;
                    case 'edit-file':
                        await this.executeEditFile(actionParams, stream);
                        break;
                    case 'read-file':
                        await this.executeReadFile(actionParams, stream);
                        break;
                    case 'run-command':
                        await this.executeRunCommand(actionParams, stream);
                        break;
                    case 'search-code':
                        await this.executeSearchCode(actionParams, stream);
                        break;
                    default:
                        stream.markdown(`⚠️ Ação desconhecida: ${actionType}`);
                }
            } catch (error) {
                stream.markdown(`❌ Erro executando ${actionType}: ${error}`);
            }
        }
    }
    
    private async executeCreateFile(params: string, stream: vscode.ChatResponseStream): Promise<void> {
        const lines = params.split('\n');
        const filePath = lines[0].replace('path: ', '').trim();
        const content = lines.slice(1).join('\n').replace(/^content:\s*/, '');
        
        if (!vscode.workspace.workspaceFolders) {
            stream.markdown('❌ Nenhum workspace aberto');
            return;
        }
        
        const fullPath = path.isAbsolute(filePath) ? 
            filePath : 
            path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, filePath);
        
        try {
            // Create directory if needed
            const dir = path.dirname(fullPath);
            await fs.mkdir(dir, { recursive: true });
            
            // Write file
            await fs.writeFile(fullPath, content, 'utf8');
            
            stream.markdown(`✅ Arquivo criado: \`${filePath}\``);
            
            // Open file in editor
            const document = await vscode.workspace.openTextDocument(fullPath);
            await vscode.window.showTextDocument(document);
            
        } catch (error) {
            stream.markdown(`❌ Erro criando arquivo: ${error}`);
        }
    }
    
    private async executeEditFile(params: string, stream: vscode.ChatResponseStream): Promise<void> {
        const lines = params.split('\n');
        const filePath = lines[0].replace('path: ', '').trim();
        const searchText = lines.find(l => l.startsWith('search: '))?.replace('search: ', '') || '';
        const replaceText = lines.slice(lines.findIndex(l => l.startsWith('replace:')) + 1).join('\n');
        
        if (!vscode.workspace.workspaceFolders) {
            stream.markdown('❌ Nenhum workspace aberto');
            return;
        }
        
        const fullPath = path.isAbsolute(filePath) ? 
            filePath : 
            path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, filePath);
        
        try {
            // Read current content
            const content = await fs.readFile(fullPath, 'utf8');
            
            // Replace content
            const newContent = searchText ? 
                content.replace(searchText, replaceText) : 
                replaceText;
            
            // Write back
            await fs.writeFile(fullPath, newContent, 'utf8');
            
            stream.markdown(`✅ Arquivo editado: \`${filePath}\``);
            
            // Open file in editor
            const document = await vscode.workspace.openTextDocument(fullPath);
            await vscode.window.showTextDocument(document);
            
        } catch (error) {
            stream.markdown(`❌ Erro editando arquivo: ${error}`);
        }
    }
    
    private async executeReadFile(params: string, stream: vscode.ChatResponseStream): Promise<void> {
        const filePath = params.replace('path: ', '').trim();
        
        if (!vscode.workspace.workspaceFolders) {
            stream.markdown('❌ Nenhum workspace aberto');
            return;
        }
        
        const fullPath = path.isAbsolute(filePath) ? 
            filePath : 
            path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, filePath);
        
        try {
            const content = await fs.readFile(fullPath, 'utf8');
            
            stream.markdown(`📄 **Conteúdo de \`${filePath}\`:**\n\`\`\`\n${content}\n\`\`\``);
            
        } catch (error) {
            stream.markdown(`❌ Erro lendo arquivo: ${error}`);
        }
    }
    
    private async executeRunCommand(params: string, stream: vscode.ChatResponseStream): Promise<void> {
        const command = params.replace('command: ', '').trim();
        
        try {
            const terminal = vscode.window.createTerminal('GarapaAgent');
            terminal.show();
            terminal.sendText(command);
            
            stream.markdown(`⚡ Comando executado no terminal: \`${command}\``);
            
        } catch (error) {
            stream.markdown(`❌ Erro executando comando: ${error}`);
        }
    }
    
    private async executeSearchCode(params: string, stream: vscode.ChatResponseStream): Promise<void> {
        const query = params.replace('query: ', '').trim();
        
        try {
            // Use VS Code's search API
            await vscode.commands.executeCommand('workbench.action.findInFiles', {
                query: query,
                triggerSearch: true
            });
            
            stream.markdown(`🔍 Busca iniciada por: \`${query}\``);
            
        } catch (error) {
            stream.markdown(`❌ Erro na busca: ${error}`);
        }
    }
    
    private async handleRegularChat(userMessage: string, stream: vscode.ChatResponseStream): Promise<void> {
        // Fallback to regular chat functionality
        const models = await vscode.lm.selectChatModels({ 
            vendor: 'copilot',
            family: 'gpt-4o'
        });

        if (models.length === 0) {
            stream.markdown('❌ Nenhum modelo de linguagem disponível.');
            return;
        }

        const model = models[0];
        
        const messages: vscode.LanguageModelChatMessage[] = [
            vscode.LanguageModelChatMessage.User(userMessage)
        ];

        const response = await model.sendRequest(messages, {
            modelOptions: {
                temperature: 0.7,
                maxTokens: 1000
            }
        });

        for await (const fragment of response.text) {
            stream.markdown(fragment);
        }
    }
}
