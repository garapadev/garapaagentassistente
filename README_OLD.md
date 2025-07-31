# GarapaAgent Assi### 🎯 Sistema ### 🎯 Recursos Avançados
- Análise automática do contexto do workspace
- Integração com arquivos abertos e seleções
- Comandos de seguimento inteligentes
- Histórico de conversas na sidebar
- **Carregamento automático de documentação online**

### 🌐 Documentação Inteligente
O GarapaAgent pode automaticamente carregar e usar documentação online em tempo real:

#### **Como Funciona:**
1. Adicione URLs na seção "Documentação de Referência" dos arquivos `.mdc`
2. O agente detecta e carrega automaticamente o conteúdo
3. Usa a documentação como contexto principal nas respostas
4. Mantém-se sempre atualizado com a documentação oficial

#### **Sites Suportados:**
- **Databases:** Supabase, MongoDB, Firebase
- **APIs:** Stripe, AWS, GitHub, Docker
- **Frontend:** React, Next.js, Tailwind CSS
- **Backend:** Express, Fastify, Prisma, TypeORM
- **Learning:** MDN, Microsoft Docs
- E muitos outros...

#### **Exemplo de Uso:**
```markdown
## Documentação de Referência
- https://docs.supabase.com/guides/database
- https://docs.stripe.com/api
```

Quando você ativar este role, o agente carregará automaticamente essa documentação e a usará para fornecer respostas mais precisas e atualizadas.les Personalizado
- **Comando `/init`** - Cria automaticamente a pasta `roles/` com arquivos `.mdc` padrão
- Arquivos `.mdc` na pasta `roles/` definem comportamentos específicos
- Comando `/rules` ou `/roles` para listar roles disponíveis
- Comando `/role [nome]` para ativar um role
- Comando `/clear` ou `/clear-role` para desativar role ativo
- Comando `/help` para mostrar ajuda completa
- Comando `/status` para ver status do sistema
- Roles incluem: Frontend Developer, Backend Architect, CRM Specialist, Code Mentor

Uma extensão do VS Code com funcionalidades de agente de IA inteligente, projetada para assistir desenvolvedores com sistema de roles personalizáveis e comportamentos adaptativos.

## Funcionalidades

### 🤖 Chat Participant
- Integração nativa com o sistema de chat do VS Code
- Acesso através do comando `@gaa` no chat
- Respostas contextualizadas baseadas no workspace atual
- Suporte para GitHub Copilot como backend de IA

### 💬 Interface de Chat Personalizada
- Webview dedicado com interface moderna
- Histórico de conversas persistente
- Indicadores de digitação e feedback visual
- Suporte para markdown nas respostas

### � Sistema de Roles Personalizado
- Arquivos `.mdc` na pasta `roles/` definem comportamentos específicos
- Comando `/roles` para listar roles disponíveis
- Comando `/role [nome]` para ativar um role
- Comando `/clear-role` para desativar role ativo
- Roles incluem: Frontend Developer, Backend Architect, CRM Specialist, Code Mentor

### �🎯 Recursos Avançados
- Análise automática do contexto do workspace
- Integração com arquivos abertos e seleções
- Comandos de seguimento inteligentes
- Histórico de conversas na sidebar

## Como Usar

### 1. Chat Participant (Recomendado)
1. Abra o painel de chat do VS Code (`Ctrl+Alt+I`)
2. Digite `@gaa` seguido da sua pergunta
3. **Primeiro uso - Inicialização:**
   - `@gaa /init` - Cria automaticamente a estrutura de roles
4. **Comandos principais:**
   - `@gaa /help` - Mostra ajuda completa com todos os comandos
   - `@gaa /rules` - Lista todos os roles disponíveis
   - `@gaa /role frontend-developer` - Ativa role específico
   - `@gaa /clear` - Desativa role atual
   - `@gaa /status` - Mostra status do sistema
5. Exemplo: `@gaa Como implementar autenticação JWT?`

### 2. Webview Personalizado
1. Use o comando `GarapaAgent: Open Chat` (`Ctrl+Shift+P`)
2. **Primeiro uso:** Digite `/init` para criar a estrutura de roles
3. Digite suas perguntas na interface dedicada
4. **Comandos especiais:**
   - `/init` - Cria automaticamente a pasta "roles/" com arquivos .mdc
   - `/help` - Mostra ajuda completa com todos os comandos
   - `/rules` ou `/roles` - Lista todos os roles disponíveis
   - `/role [nome]` - Ativa um role específico
   - `/clear` ou `/clear-role` - Desativa o role atual
   - `/status` - Mostra status atual do sistema
5. Visualize o histórico na sidebar do Explorer

### 3. Sistema de Roles

**Inicialização automática:**
Use `@gaa /init` ou `/init` para criar automaticamente a pasta `roles/` com os arquivos padrão.

**Criação manual:**
Crie arquivos `.mdc` na pasta `roles/` do seu workspace para definir comportamentos personalizados:

```markdown
# Meu Role Personalizado

## Identidade
Você é um especialista em...

## Comportamento
- Sempre faça X
- Considere Y
- Implemente Z

## Tecnologias Preferenciais
- Lista de tecnologias

## Documentação de Referência
- https://docs.supabase.com/
- https://docs.stripe.com/
- https://reactjs.org/docs/

## Estrutura de Resposta
1. Passo 1
2. Passo 2
3. Exemplo de código
```

**🌐 Carregamento Automático de Documentação:**
O agente pode automaticamente carregar e usar documentação online quando URLs são especificadas na seção "Documentação de Referência" dos arquivos .mdc. Suporta sites como:
- Supabase, Stripe, AWS, Firebase
- React, Next.js, Tailwind CSS
- Docker, Kubernetes, GitHub
- MDN, Prisma, TypeORM e muitos outros

## Comandos Disponíveis

- `garapaagentassitent.openChat` - Abre interface de chat personalizada
- `garapaagentassitent.clearChat` - Limpa histórico de conversas
- `garapaagentassitent.refreshChat` - Atualiza a visualização do chat

## Pré-requisitos

- VS Code versão 1.102.0 ou superior
- GitHub Copilot ativado (para funcionalidades de IA)
- Conexão com internet

## Instalação

1. Clone este repositório
2. Execute `npm install`
3. Pressione `F5` para executar em modo debug
4. Na nova janela do VS Code, teste os comandos

## Desenvolvimento

### Estrutura do Projeto
```
src/
├── extension.ts          # Ponto de entrada principal
├── chatParticipant.ts    # Implementação do chat participant
├── chatViewProvider.ts   # Provider para histórico na sidebar
└── webviewProvider.ts    # Interface de chat personalizada
```

### Scripts Disponíveis

- `npm run compile` - Compila TypeScript e executa linting
- `npm run watch` - Modo de desenvolvimento com hot reload
- `npm run test` - Executa testes
- `npm run package` - Gera build de produção

## Tecnologias Utilizadas

- **TypeScript** - Linguagem principal
- **VS Code Extension API** - APIs nativas do VS Code
- **Language Model API** - Integração com modelos de IA
- **Chat Participants API** - Sistema de chat nativo
- **Webview API** - Interface personalizada

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato

Para dúvidas ou sugestões, abra uma issue no repositório.
