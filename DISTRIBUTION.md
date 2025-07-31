# 📦 GarapaAgent Assistant - Distribuição e Instalação

## 🎯 Resumo Rápido

A extensão **GarapaAgent Assistant** foi empacotada com sucesso e está pronta para instalação:

- **Arquivo:** `garapaagentassitent-0.0.4.vsix` (42.54 KB)
- **Repositório:** https://github.com/garapadev/garapaagentassistente
- **Versão:** 0.0.4

## 🚀 Como Instalar em Outro VS Code

### **Método Simples (Interface)**
1. Copie o arquivo `garapaagentassitent-0.0.4.vsix`
2. Abra VS Code no computador de destino
3. Pressione `Ctrl+Shift+P`
4. Digite: `Extensions: Install from VSIX...`
5. Selecione o arquivo `.vsix`
6. Recarregue quando solicitado

### **Método por Comando**
```bash
code --install-extension garapaagentassitent-0.0.4.vsix
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

### **Chat Participant (@gaa)**
- Sistema de roles personalizáveis
- Comandos especializados
- Integração com GitHub Copilot

### **Comando /setup**
- Detecção automática do ambiente
- Preview browser com relatório visual
- Configuração PM2 automática

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

### **Preview browser não abre**
- Verifique permissões do VS Code
- Tente executar `@gaa /setup` novamente

## 📞 Suporte

- **GitHub:** https://github.com/garapadev/garapaagentassistente/issues
- **Documentação:** Ver arquivos `.md` na extensão

---

**A extensão está pronta para distribuição! 🎉**
