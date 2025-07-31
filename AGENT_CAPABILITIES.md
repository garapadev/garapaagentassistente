# 🤖 Capacidades de Agente - GarapaAgent Assistant

## 🚀 **Modo Agente - O que é?**

O **Modo Agente** transforma o `@gaa` de um simples chat em um **agente ativo** capaz de executar ações reais no seu workspace, como criar arquivos, editar código, executar comandos e implementar funcionalidades completas.

## ⚡ **Ativação Rápida**

```
@gaa /agent on    # Ativar capacidades de agente
@gaa /agent off   # Desativar (volta ao chat normal)
@gaa /mode        # Ver status atual
```

## 🛠️ **O que o Agente pode fazer?**

### **📁 Operações de Arquivo**
```
@gaa criar um arquivo index.js com uma função hello world
@gaa editar o arquivo App.tsx para adicionar um botão
@gaa ler o conteúdo do arquivo package.json
@gaa deletar o arquivo temp.js
```

### **💻 Desenvolvimento de Código**
```
@gaa implementar autenticação JWT completa com login e logout
@gaa criar um componente React Button com TypeScript
@gaa refatorar a função getUserData para usar async/await
@gaa corrigir o bug de tipagem no arquivo user.ts
@gaa adicionar validação de formulário com Zod
```

### **⚡ Comandos de Terminal**
```
@gaa instalar as dependências do projeto
@gaa executar npm run build
@gaa inicializar um repositório git
@gaa fazer deploy da aplicação
```

### **🏗️ Implementações Completas**
```
@gaa implementar um dashboard com gráficos usando Recharts
@gaa criar um sistema de autenticação completo
@gaa configurar um projeto Next.js com TypeScript
@gaa implementar CRUD para usuários com Prisma
```

## 🎯 **Detecção Inteligente**

O agente detecta automaticamente quando você quer:

### **Operações de Arquivo** (detecta palavras-chave):
- `criar arquivo`, `novo arquivo`, `create file`
- `editar arquivo`, `modificar arquivo`, `edit file`  
- `ler arquivo`, `abrir arquivo`, `read file`
- `deletar arquivo`, `remover arquivo`, `delete file`

### **Solicitações de Código** (detecta intenções):
- `implementar`, `código`, `função`, `classe`
- `componente`, `criar`, `gerar`, `adicionar`
- `refatorar`, `corrigir`, `bug`, `script`

## 🔧 **Como Funciona Internamente**

### **1. Detecção de Ações**
O agente analisa sua mensagem e identifica que tipo de ação você quer realizar.

### **2. Geração de Plano**
Usa o modelo de linguagem para criar um plano de ação específico.

### **3. Execução de Comandos**
Executa as ações usando a API do VS Code:
- `fs.writeFile()` para criar arquivos
- `vscode.workspace.openTextDocument()` para abrir arquivos
- `vscode.window.createTerminal()` para comandos
- `vscode.commands.executeCommand()` para ações do VS Code

### **4. Feedback Visual**
Mostra o progresso e resultados na interface do chat.

## 🎭 **Integração com Roles**

O modo agente funciona perfeitamente com o sistema de roles:

```
@gaa /role frontend-developer
@gaa /agent on
@gaa implementar um dashboard responsivo com shadcn/ui
```

O agente então seguirá as diretrizes específicas do role ativo.

## 📋 **Sintaxe de Ações (Interna)**

Quando ativo, o agente pode usar sintaxe especial para ações:

```action:create-file
path: src/components/Button.tsx
content: 
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button onClick={onClick} className="btn">
      {children}
    </button>
  );
};
```

## ✅ **Exemplos Práticos**

### **Exemplo 1: Criar um Componente React**
```
Usuário: @gaa /agent on
Usuário: criar um componente Card.tsx com TypeScript para exibir informações de usuário

Agente: 
🤖 Analisando solicitação como agente...
🔧 Executando: create-file...
✅ Arquivo criado: src/components/Card.tsx
[Abre o arquivo automaticamente no editor]
```

### **Exemplo 2: Implementar API Route**
```
Usuário: implementar uma rota API para login com Next.js

Agente:
🤖 Analisando solicitação como agente...
🔧 Executando: create-file...
✅ Arquivo criado: pages/api/auth/login.ts
[Implementa código completo com validação, JWT, etc.]
```

### **Exemplo 3: Refatoração**
```
Usuário: refatorar o arquivo utils.js para TypeScript

Agente:
🤖 Analisando solicitação como agente...
🔧 Executando: read-file...
🔧 Executando: edit-file...
✅ Arquivo editado: utils.ts
[Converte para TypeScript com tipagem adequada]
```

## 🛡️ **Segurança e Limitações**

### **Proteções Ativas:**
- ✅ Só executa ações quando modo agente está ATIVO
- ✅ Sempre mostra o que está fazendo
- ✅ Usa caminhos relativos ao workspace
- ✅ Não executa comandos destrutivos sem confirmação

### **Limitações:**
- ❌ Não acessa arquivos fora do workspace
- ❌ Não executa comandos de sistema críticos
- ❌ Requer GitHub Copilot ativo
- ❌ Funciona apenas com workspace aberto

## 🚀 **Dicas de Uso**

### **💡 Seja Específico:**
❌ "criar um arquivo"
✅ "criar um arquivo Button.tsx com um componente React responsivo"

### **💡 Use Contexto:**
❌ "implementar login"
✅ "implementar sistema de login JWT com middleware de autenticação para Next.js"

### **💡 Combine com Roles:**
```
@gaa /role frontend-developer
@gaa /agent on
@gaa criar um dashboard admin com gráficos interativos
```

## 🔄 **Troubleshooting**

### **Agente não executa ações:**
- Verifique se está com `/agent on`
- Confirme que GitHub Copilot está ativo
- Use palavras-chave claras (criar, implementar, editar)

### **Arquivos não abrem automaticamente:**
- Verifique permissões do VS Code
- Confirme que o workspace está aberto
- Tente recarregar o VS Code

### **Comandos não executam:**
- Verifique se o terminal está disponível
- Confirme que o comando é válido
- Use `/agent off` e `/agent on` para resetar

---

**🎯 O Modo Agente transforma o GarapaAgent de um chat em um verdadeiro assistente de desenvolvimento!**
