# GarapaCRM Chat Assistant

Uma extensão do VS Code com funcionalidades de chat estilo GitHub Copilot, projetada para assistir desenvolvedores na criação de sistemas CRM e desenvolvimento geral.

## Funcionalidades

### 🤖 Chat Participant
- Integração nativa com o sistema de chat do VS Code
- Acesso através do comando `@garapacrm` no chat
- Respostas contextualizadas baseadas no workspace atual
- Suporte para GitHub Copilot como backend de IA

### 💬 Interface de Chat Personalizada
- Webview dedicado com interface moderna
- Histórico de conversas persistente
- Indicadores de digitação e feedback visual
- Suporte para markdown nas respostas

### 🎯 Recursos Avançados
- Análise automática do contexto do workspace
- Integração com arquivos abertos e seleções
- Comandos de seguimento inteligentes
- Histórico de conversas na sidebar

## Como Usar

### 1. Chat Participant (Recomendado)
1. Abra o painel de chat do VS Code (`Ctrl+Alt+I`)
2. Digite `@garapacrm` seguido da sua pergunta
3. Exemplo: `@garapacrm Como implementar autenticação JWT?`

### 2. Webview Personalizado
1. Use o comando `GarapaCRM: Open Chat` (`Ctrl+Shift+P`)
2. Digite suas perguntas na interface dedicada
3. Visualize o histórico na sidebar do Explorer

## Comandos Disponíveis

- `garapacrm.openChat` - Abre interface de chat personalizada
- `garapacrm.clearChat` - Limpa histórico de conversas
- `garapacrm.refreshChat` - Atualiza a visualização do chat

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
