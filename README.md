# 🤖 GarapaAgent Assistant

> **Agente de IA Inteligente para VS Code com Capacidades Avançadas de Edição e Sistema de Roles**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/garapadev/garapaagentassistente/releases)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.102.0+-brightgreen.svg)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🚀 **O que é o GarapaAgent Assistant?**

Uma extensão revolucionária para VS Code que implementa um **agente de IA com capacidades reais de edição**, sistema de roles especializado e automação completa de desenvolvimento. Não é apenas um chat - é um **verdadeiro assistente de desenvolvimento**.

### ✨ **Principais Recursos**

🤖 **Modo Agente**: **CRIA, EDITA e EXECUTA** arquivos e comandos reais  
🎭 **Sistema de Roles**: Comportamentos especializados através de arquivos `.mdc`  
⚡ **Chat Participant**: Integração nativa `@gaa` no chat do VS Code  
⚙️ **Comando /setup**: Detecção automática de ambiente + configuração PM2  
🌐 **Interface Webview**: Chat customizado com UI moderna  
📊 **Especialização shadcn/ui + Recharts**: Frontend developer expert  
🔧 **Automação PM2**: Configuração automática de processos  
🛡️ **Regras de Segurança**: Anti-padrões para código limpo  

## 📥 **Instalação Rápida**

### **Método 1: Download da Release**
1. Baixe o [arquivo `.vsix` da última release](https://github.com/garapadev/garapaagentassistente/releases)
2. No VS Code: `Ctrl+Shift+P` → `Extensions: Install from VSIX...`
3. Selecione o arquivo baixado

### **Método 2: Linha de Comando**
```bash
# Após baixar o arquivo .vsix
code --install-extension garapaagentassitent-0.0.4.vsix
```

## 🎯 **Como Usar**

### **Comandos Principais**
```
@gaa /help          # Ver todos os comandos disponíveis
@gaa /agent on      # 🚀 ATIVAR modo agente (capacidades de edição)
@gaa /agent off     # Desativar modo agente
@gaa /init          # Criar pasta roles com templates
@gaa /setup         # Configurar ambiente de desenvolvimento
@gaa /role <nome>   # Ativar role específico
```

### **🤖 Capacidades do Modo Agente (NOVO!)**

Quando ativado com `/agent on`, o GarapaAgent pode:

#### **📁 Operações de Arquivo:**
```
@gaa criar um arquivo Button.tsx com componente React
@gaa editar o arquivo App.js para adicionar roteamento
@gaa ler o conteúdo do arquivo package.json
```

#### **💻 Implementação de Código:**
```
@gaa implementar autenticação JWT completa
@gaa criar um dashboard com gráficos usando Recharts
@gaa refatorar este componente para usar hooks
@gaa corrigir o bug de tipagem no arquivo user.ts
```

#### **⚡ Execução de Comandos:**
```
@gaa instalar dependências do projeto
@gaa executar npm run build
@gaa inicializar repositório git
```

### **Sistema de Roles**
```
roles/
├── frontend-developer.mdc    # Especialista shadcn/ui + Recharts
├── backend-architect.mdc     # Arquitetura de sistemas
├── crm-specialist.mdc        # Sistemas CRM
├── code-mentor.mdc          # Mentoria de código
└── develop.mdc              # Criado automaticamente pelo /setup
```

## 🛠️ **Comando /setup - Auto Configuração**

O comando `/setup` é uma das principais inovações da extensão:

### **O que faz:**
- 🔍 **Detecta automaticamente** o ambiente (OS, frameworks, dependências)
- ⚙️ **Configura PM2** para processos Node.js
- 📝 **Cria role personalizado** baseado no projeto
- 📋 **Exibe análise** do ambiente no chat

### **Demo do /setup:**
```
@gaa /setup
```
*Analisa o ambiente e exibe relatório diretamente no chat*

## 🎭 **Roles Especializados**

### **Frontend Developer**
- ✅ Especialista em **shadcn/ui** components
- 📊 Expert em **Recharts** para visualizações
- 🛡️ **Regras de segurança** contra duplicação de código
- 🎨 **Patterns de composição** otimizados

### **Backend Architect**
- 🏗️ Arquitetura de sistemas escaláveis
- 🔐 Segurança e autenticação
- 💾 Design de banco de dados

### **CRM Specialist**
- 👥 Gestão de clientes e leads
- 📈 Pipelines de vendas
- 🔄 Automação de processos

## 🔧 **Requisitos**

- **VS Code:** versão 1.102.0+
- **GitHub Copilot:** necessário para IA
- **Node.js:** para comandos de desenvolvimento (opcional)

## 📚 **Documentação Completa**

- [🤖 Capacidades de Agente](AGENT_CAPABILITIES.md) - **NOVO!** Guia completo do modo agente
- [📋 Guia de Instalação](INSTALLATION_GUIDE.md)
- [📦 Distribuição](DISTRIBUTION.md)
- [🎯 Setup Demo](SETUP_DEMO.md)
- [📝 Changelog](CHANGELOG.md)

## 🆘 **Suporte**

- 🐛 **Issues:** [GitHub Issues](https://github.com/garapadev/garapaagentassistente/issues)
- 💬 **Discussões:** Use `@gaa /help` na própria extensão
- 📖 **Docs:** Veja os arquivos `.md` inclusos

## 🔄 **Roadmap**

- [ ] **Marketplace do VS Code** (publisher oficial)
- [ ] **Mais roles especializados** (DevOps, Mobile, etc.)
- [ ] **API externa** para roles dinâmicos
- [ ] **Integração CI/CD** automática
- [ ] **Multi-linguagem** (EN, ES, etc.)

## 🏷️ **Versão Atual**

**v0.1.0** - Capacidades de Agente Implementadas! 🚀
- 🤖 **NOVO:** Modo agente com edição real de arquivos
- ⚡ **NOVO:** Execução de comandos no terminal
- 🛠️ **NOVO:** Implementação automática de código
- 📁 **NOVO:** Operações de arquivo (criar/editar/ler)
- 🔧 **NOVO:** Refatoração e correção de bugs
- 📦 Pacote otimizado (53.79 KB)
- ✅ Totalmente funcional e pronto para produção

## 🤝 **Contribuição**

Contribuições são bem-vindas! 

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 **Licença**

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ por [garapadev](https://github.com/garapadev)**

🌟 **Se gostou, deixe uma estrela!** ⭐
