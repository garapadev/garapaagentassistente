#!/bin/bash

# 🚀 Script de Publicação - GarapaAgent Assistant
# Este script automatiza o processo de publicação da extensão

echo "🚀 GarapaAgent Assistant - Script de Publicação"
echo "=============================================="

# Verificar se o arquivo .vsix existe
if [ ! -f "garapaagentassitent-0.0.4.vsix" ]; then
    echo "❌ Arquivo .vsix não encontrado. Execute 'vsce package' primeiro."
    exit 1
fi

echo "✅ Arquivo .vsix encontrado: garapaagentassitent-0.0.4.vsix"

# Verificar se estamos em um repositório git
if [ ! -d ".git" ]; then
    echo "❌ Não é um repositório git. Inicialize com 'git init' primeiro."
    exit 1
fi

echo "📁 Preparando arquivos para commit..."

# Adicionar arquivos importantes (excluindo .vsix que será anexado na release)
git add package.json
git add README.md
git add INSTALLATION_GUIDE.md
git add SETUP_DEMO.md
git add src/
git add roles/
git add media/
git add .github/

echo "📝 Fazendo commit das alterações..."
git commit -m "🚀 Release v0.0.4: GarapaAgent Assistant

✨ Novos recursos:
- Sistema de chat participant @gaa
- Comando /setup com preview browser
- Roles personalizáveis (.mdc)
- Especialização shadcn/ui + Recharts
- Configuração automática PM2
- Interface webview customizada

📦 Arquivo de instalação: garapaagentassitent-0.0.4.vsix"

echo "🏷️ Criando tag da versão..."
git tag -a v0.0.4 -m "GarapaAgent Assistant v0.0.4"

echo "⬆️ Fazendo push para o repositório..."
git push origin main
git push origin v0.0.4

echo ""
echo "🎉 Publicação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse: https://github.com/garapadev/garapaagentassistente"
echo "2. Vá em 'Releases' → 'Create a new release'"
echo "3. Selecione a tag 'v0.0.4'"
echo "4. Anexe o arquivo 'garapaagentassitent-0.0.4.vsix'"
echo "5. Publique a release"
echo ""
echo "📥 Para instalar em outros VS Code:"
echo "   Ctrl+Shift+P → 'Extensions: Install from VSIX...'"
echo ""
