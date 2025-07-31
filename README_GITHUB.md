# 🤖 GarapaAgent Assistant

> **Agente de IA Inteligente para VS Code com Sistema de Roles Personalizáveis**

[![Version](https://img.shields.io/badge/version-0.0.4-blue.svg)](https://github.com/garapadev/garapaagentassistente/releases)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.102.0+-brightgreen.svg)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🚀 **O que é o GarapaAgent Assistant?**

Uma extensão poderosa para VS Code que implementa um **agente de IA personalizable** com sistema de roles especializado, integração nativa com GitHub Copilot e comandos inteligentes para automação de desenvolvimento.

### ✨ **Principais Recursos**

🎭 **Sistema de Roles**: Comportamentos especializados através de arquivos `.mdc`  
🤖 **Chat Participant**: Integração nativa `@gaa` no chat do VS Code  
⚙️ **Comando /setup**: Detecção automática de ambiente + preview browser  
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
@gaa /help        # Ver todos os comandos disponíveis
@gaa /init        # Criar pasta roles com templates
@gaa /setup       # Configurar ambiente de desenvolvimento
@gaa /status      # Verificar status atual
@gaa /role <nome> # Ativar role específico
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
- 📊 **Gera relatório HTML** com preview no browser integrado
- ⚙️ **Configura PM2** para processos Node.js
- 📝 **Cria role personalizado** baseado no projeto
- 🌐 **Abre preview browser** com resultado visual

### **Demo do /setup:**
```
@gaa /setup
```
![Setup Preview](test-setup-preview.html)

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

**v0.0.4** - Release inicial pública
- 🎉 Todas as funcionalidades principais implementadas
- 📦 Pacote otimizado (42.54 KB)
- ✅ Pronto para produção

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
