# 📦 GarapaAgent Assistant - Distribuição e Instalação

## 🎯 Resumo Rápido

A extensão **GarapaAgent Assistant** foi empacotada com sucesso e está pronta para instalação:

- **Arquivo:** `garapaagentassitent-0.1.1.vsix` (56.26 KB)
- **Repositório:** https://github.com/garapadev/garapaagentassistente
- **Versão:** 0.1.1 (modo agente melhorado!)

## 🚀 Como Instalar em Outro VS Code

### **Método Simples (Interface)**
1. Copie o arquivo `garapaagentassitent-0.1.1.vsix`
2. Abra VS Code no computador de destino
3. Pressione `Ctrl+Shift+P`
4. Digite: `Extensions: Install from VSIX...`
5. Selecione o arquivo `.vsix`
6. Recarregue quando solicitado

### **Método por Comando**
```bash
code --install-extension garapaagentassitent-0.1.1.vsix
```

### **Método Arrastar e Soltar**
1. Abra VS Code
2. Vá na aba Extensions (`Ctrl+Shift+X`)
3. Arraste o arquivo `.vsix` para a janela
4. Confirme a instalação

## ✅ Verificar Instalação

Após instalar, teste com:
```
@gaa /help
```

Se aparecer o menu de ajuda, a instalação foi bem-sucedida!

## 📋 Comandos Principais

- `@gaa /agent on` - **🚀 ATIVAR modo agente** (criar/editar arquivos)
- `@gaa /agent off` - Desativar modo agente
- `@gaa /setup` - Configurar ambiente de desenvolvimento
- `@gaa /init` - Criar pasta roles
- `@gaa /role frontend-developer` - Ativar especialista frontend
- `@gaa /help` - Ver todos os comandos

## 🔄 Para Criar Novas Versões

1. **Atualizar versão** no `package.json`
2. **Compilar:** `npm run package`
3. **Empacotar:** `vsce package`
4. **Publicar:** Execute `scripts/publish.bat` (Windows) ou `scripts/publish.sh` (Unix)

## 📚 Recursos da Extensão

### **🤖 Modo Agente (NOVO!)**
- ✅ Criar e editar arquivos reais
- ✅ Executar comandos no terminal
- ✅ Implementar código automaticamente
- ✅ Refatorar e corrigir bugs

### **Chat Participant (@gaa)**
- Sistema de roles personalizáveis
- Comandos especializados
- Integração com GitHub Copilot

### **Comando /setup**
- Detecção automática do ambiente
- Configuração PM2 automática
- Análise de dependências do projeto

### **Roles Especializados**
- `frontend-developer` - shadcn/ui + Recharts
- `backend-architect` - Arquitetura
- `crm-specialist` - Sistemas CRM
- `code-mentor` - Mentoria
- `develop` - Desenvolvimento (criado automaticamente)

## 🆘 Solução de Problemas

### **Extensão não aparece no chat**
- Verifique se GitHub Copilot está instalado
- Recarregue o VS Code (`Ctrl+Shift+P` → "Reload Window")

### **Comandos não funcionam**
- Digite `@gaa /status` para verificar o estado
- Use `@gaa /help` para ver comandos disponíveis

### **Modo agente não funciona**
- Certifique-se de ativar com `@gaa /agent on`
- Verifique se GitHub Copilot está funcionando
- Tente `@gaa /mode` para verificar o status

### **Arquivos não são criados**
- Verifique permissões da pasta do workspace
- Certifique-se de que há um workspace aberto
- Use `@gaa /status` para diagnóstico

### **🗑️ Como Desinstalar**
Ver seção [Como Desinstalar a Extensão](#️-como-desinstalar-a-extensão) abaixo

## �️ Como Desinstalar a Extensão

### **Método 1: Interface do VS Code (Recomendado)**
1. Abra VS Code
2. Vá na aba **Extensions** (`Ctrl+Shift+X`)
3. Procure por **"GarapaAgent Assistant"** ou **"garapaagentassitent"**
4. Clique no **ícone de engrenagem** ⚙️ ao lado da extensão
5. Selecione **"Uninstall"**
6. Confirme a desinstalação
7. **Recarregue** o VS Code quando solicitado

### **Método 2: Linha de Comando**
```bash
# Listar extensões instaladas para encontrar o ID exato
code --list-extensions

# Desinstalar usando o ID da extensão
code --uninstall-extension garapadev.garapaagentassitent
```

### **Método 3: Command Palette**
1. Pressione `Ctrl+Shift+P`
2. Digite: **"Extensions: Show Installed Extensions"**
3. Encontre **"GarapaAgent Assistant"**
4. Clique no ícone de engrenagem ⚙️
5. Selecione **"Uninstall"**

### **🧹 Limpeza Completa (Opcional)**

Para remover completamente todos os vestígios:

#### **1. Desinstalar a Extensão** (métodos acima)

#### **2. Limpar Arquivos Residuais:**
```bash
# Remover pasta roles (se criada)
rm -rf ./roles/

# Limpar configurações do VS Code (opcional)
# Vai para: %APPDATA%\Code\User\settings.json
# Remove qualquer configuração relacionada ao GarapaAgent
```

#### **3. Verificar Desinstalação:**
```bash
# Verificar se a extensão foi removida
code --list-extensions | grep garapaagentassitent
# (não deve retornar nada)
```

### **⚠️ Antes de Desinstalar**

**Considere fazer backup de:**
- Pasta `roles/` (se você personalizou os arquivos .mdc)
- Configurações específicas do projeto

### **🔄 Reinstalação**

Se quiser reinstalar posteriormente:
1. Baixe a [última versão do GitHub](https://github.com/garapadev/garapaagentassistente/releases)
2. Siga as [instruções de instalação](#-como-instalar-em-outro-vs-code)

## �📞 Suporte

- **GitHub:** https://github.com/garapadev/garapaagentassistente/issues
- **Documentação:** Ver arquivos `.md` na extensão

---

**A extensão está pronta para distribuição! 🎉**
