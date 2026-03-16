#!/bin/bash

echo "🚀 Instalando All-in-One para Mac..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "📥 Baixe de: https://nodejs.org/"
    exit 1
fi

# Verificar se Python3 está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado!"
    echo "📥 Baixe de: https://www.python.org/"
    echo "   Ou instale via Homebrew: brew install python3"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo "✅ Python3 encontrado: $(python3 --version)"
echo ""

# Instalar dependências Node.js
echo "📦 Instalando dependências Node.js..."
npm install

# Criar ambiente virtual Python
echo "🐍 Criando ambiente virtual Python..."
python3 -m venv .venv
source .venv/bin/activate

# Instalar dependências Python
echo "📦 Instalando dependências Python..."
pip install fontTools brotli

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "🎯 Para executar:"
echo "   source .venv/bin/activate"
echo "   npm start"
echo ""
echo "📚 Leia o README-MAC.md para mais detalhes!"