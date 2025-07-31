# 🛠️ GarapaAgent Assistant - Guia de Solução de Problemas

## 🔧 Problemas Comuns e Soluções

### 🚫 **Extensão não aparece no chat**

**Sintomas:**
- `@gaa` não funciona no chat
- Extensão não aparece na lista de participantes

**Soluções:**
1. **Verificar se GitHub Copilot está instalado:**
   ```
   Ctrl+Shift+P → "Extensions: Show Installed Extensions"
   Procure por "GitHub Copilot"
   ```

2. **Recarregar VS Code:**
   ```
   Ctrl+Shift+P → "Developer: Reload Window"
   ```

3. **Verificar se a extensão está ativa:**
   ```
   Ctrl+Shift+P → "Extensions: Show Installed Extensions"
   Procure por "GarapaAgent Assistant"
   Certifique-se de que está "Enabled"
   ```

### 🤖 **Modo agente não funciona**

**Sintomas:**
- `/agent on` não ativa capacidades
- Comandos de arquivo não funcionam
- Não consegue criar/editar arquivos

**Soluções:**
1. **Verificar status do agente:**
   ```
   @gaa /mode
   @gaa /status
   ```

2. **Reativar modo agente:**
   ```
   @gaa /agent off
   @gaa /agent on
   ```

3. **Verificar workspace:**
   - Certifique-se de que há uma pasta aberta no VS Code
   - Verifique permissões de escrita na pasta

4. **Verificar GitHub Copilot:**
   ```
   @gaa Como você está?
   # Se não responder, problema é com Copilot
   ```

### 📁 **Arquivos não são criados/editados**

**Sintomas:**
- Comandos de arquivo falham
- Mensagens de erro ao criar arquivos
- Arquivos não aparecem no explorer

**Soluções:**
1. **Verificar permissões:**
   - Execute VS Code como administrador (temporariamente)
   - Verifique se a pasta não é somente leitura

2. **Verificar workspace:**
   ```
   @gaa /status
   # Deve mostrar workspace ativo
   ```

3. **Testar manualmente:**
   - Tente criar um arquivo manualmente na pasta
   - Verifique se há espaço em disco

4. **Usar caminhos absolutos:**
   ```
   @gaa criar arquivo em C:\caminho\completo\teste.js
   ```

### ⚡ **Comandos não são executados**

**Sintomas:**
- `/agent on` não responde
- Terminal não abre
- Comandos ficam "pensando" infinitamente

**Soluções:**
1. **Verificar terminal:**
   ```
   Ctrl+Shift+P → "Terminal: Create New Terminal"
   # Certifique-se de que o terminal funciona
   ```

2. **Limpar cache:**
   ```
   Ctrl+Shift+P → "Developer: Reload Window"
   ```

3. **Verificar antivírus:**
   - Antivírus pode bloquear execução de comandos
   - Adicione VS Code às exceções

### 🌐 **Comando /setup não funciona**

**Sintomas:**
- `/setup` não responde
- Erro na detecção do ambiente
- Configuração PM2 falha

**Soluções:**
1. **Verificar workspace:**
   ```
   @gaa /status
   # Deve mostrar workspace ativo
   ```

2. **Verificar permissões:**
   - Certifique-se de que pode criar arquivos na pasta
   - Execute VS Code como administrador (se necessário)

3. **Testar manualmente:**
   - Tente criar um arquivo manualmente na pasta
   - Verifique se há espaço em disco

### 💬 **Chat não responde**

**Sintomas:**
- `@gaa` não responde nada
- Mensagens ficam "loading"
- Erro de modelo de linguagem

**Soluções:**
1. **Verificar Copilot:**
   ```
   Ctrl+Shift+P → "GitHub Copilot: Check Status"
   ```

2. **Fazer login novamente:**
   ```
   Ctrl+Shift+P → "GitHub Copilot: Sign Out"
   Ctrl+Shift+P → "GitHub Copilot: Sign In"
   ```

3. **Verificar quota:**
   - GitHub Copilot pode ter limite de uso
   - Aguarde alguns minutos e tente novamente

## 🗑️ **Desinstalação Completa**

Se nada funcionar, desinstale e reinstale:

### **1. Desinstalar extensão:**
```
Ctrl+Shift+X → Procurar "GarapaAgent" → Uninstall
```

### **2. Limpar arquivos residuais:**
```bash
# Remover pasta roles
rm -rf ./roles/

# Limpar configurações (opcional)
# Editar: %APPDATA%\Code\User\settings.json
# Remover linhas relacionadas ao GarapaAgent
```

### **3. Reinstalar:**
- Baixe a [última versão](https://github.com/garapadev/garapaagentassistente/releases)
- Instale via `Extensions: Install from VSIX...`

## 📋 **Diagnóstico Rápido**

Execute estes comandos para diagnóstico:

```
@gaa /status     # Status geral
@gaa /mode       # Status do modo agente  
@gaa /help       # Lista de comandos
@gaa /roles      # Roles disponíveis
```

**Se todos falharem:** problema é com GitHub Copilot ou conexão.

## 🆘 **Ainda com Problemas?**

1. **Verifique requisitos:**
   - VS Code 1.102.0+
   - GitHub Copilot ativo e funcionando
   - Workspace com pasta aberta

2. **Colete informações:**
   ```
   Ctrl+Shift+P → "Developer: Toggle Developer Tools"
   # Console pode mostrar erros
   ```

3. **Reporte no GitHub:**
   - [Criar issue](https://github.com/garapadev/garapaagentassistente/issues)
   - Inclua versão do VS Code, SO, e mensagens de erro

## 📞 **Suporte**

- **Issues:** https://github.com/garapadev/garapaagentassistente/issues
- **Discussões:** Use o próprio `@gaa /help` quando funcionar
- **Documentação:** [README.md](README.md)

---

**💡 Dica:** Na maioria dos casos, recarregar o VS Code resolve problemas temporários!
