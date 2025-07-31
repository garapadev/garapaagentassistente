# Sistema de Roles - GarapaAgent Assistant

Este diretório contém arquivos de roles que definem comportamentos específicos para o assistente de IA.

## Como Funciona

1. **Arquivos .mdc**: Cada arquivo `.mdc` define um role específico
2. **Estrutura padronizada**: Identidade, comportamento, tecnologias, padrões
3. **Ativação**: Use `/role [nome]` no chat para ativar um role
4. **Listagem**: Use `/roles` para ver todos os roles disponíveis

## Roles Incluídos

### 🎨 frontend-developer.mdc
- **Foco**: React, TypeScript, Next.js
- **Especialidade**: Performance, acessibilidade, componentes
- **Uso**: `/role frontend-developer`

### 🏗️ backend-architect.mdc
- **Foco**: Node.js, APIs, microserviços
- **Especialidade**: Arquitetura, segurança, escalabilidade
- **Uso**: `/role backend-architect`

### 💼 crm-specialist.mdc
- **Foco**: Sistemas CRM, automação de vendas
- **Especialidade**: Pipeline, lead scoring, integrações
- **Uso**: `/role crm-specialist`

### 👨‍🏫 code-mentor.mdc
- **Foco**: Code review, melhores práticas
- **Especialidade**: Clean code, refatoração, mentoria
- **Uso**: `/role code-mentor`

## Criando Novos Roles

### Estrutura Recomendada

```markdown
# Nome do Role

## Identidade
Descreva quem é este role e sua especialidade principal.

## Comportamento
- Liste comportamentos específicos
- Diretrizes de como responder
- Prioridades e foco

## Tecnologias Preferenciais
- Liste tecnologias favoritas
- Frameworks e bibliotecas
- Ferramentas específicas

## Padrões de Código/Arquitetura
- Padrões que devem ser seguidos
- Convenções de nomenclatura
- Estruturas recomendadas

## Estrutura de Resposta
1. Como organizar as respostas
2. Que tipo de exemplos fornecer
3. Formato preferido de código

## Exemplo de Resposta
\`\`\`typescript
// Exemplo de código no estilo deste role
\`\`\`
```

### Dicas para Roles Efetivos

1. **Seja Específico**: Defina claramente o escopo e expertise
2. **Use Exemplos**: Inclua exemplos de código no estilo do role
3. **Defina Prioridades**: O que é mais importante para este role
4. **Inclua Contexto**: Quando usar este role vs outros
5. **Mantenha Consistência**: Use a mesma estrutura em todos os roles

### Comandos Úteis

- `/roles` - Lista todos os roles disponíveis
- `/role [nome]` - Ativa um role específico
- `/clear-role` - Remove o role ativo
- `@garapaagent /role [nome]` - Ativa role no chat participant

## Exemplos de Uso

### Desenvolvimento Frontend
```
/role frontend-developer
Como criar um componente React otimizado para uma lista de produtos?
```

### Arquitetura Backend
```
/role backend-architect
Preciso projetar uma API para um sistema de pedidos. Como estruturar?
```

### Especialista CRM
```
/role crm-specialist
Como implementar um sistema de lead scoring automatizado?
```

### Revisão de Código
```
/role code-mentor
*cola o código*
Pode revisar este código e sugerir melhorias?
```

## Compartilhamento

Você pode compartilhar roles com sua equipe copiando os arquivos `.mdc` entre workspaces. Considere criar um repositório de roles para sua organização!

---

💡 **Dica**: Experimente diferentes roles para diferentes tipos de tarefas e veja como o assistente adapta suas respostas!
