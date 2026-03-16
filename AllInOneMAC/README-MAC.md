# All-in-One - Versão Mac
Aplicação Electron All-in-One para criação de pastas, geração de HTML/ZIP, exportação de stills de GIF e **conversão de fontes**.

## 🚀 Como usar no Mac

### 1. Instalar dependências
```bash
# Instalar Node.js (se não tiver)
# Baixar de: https://nodejs.org/

# Instalar Python 3 (se não tiver)
# Baixar de: https://www.python.org/

# No terminal, navegar até a pasta do projeto
cd AllInOneMAC

# Instalar dependências do Node.js
npm install

# Criar ambiente virtual Python
python3 -m venv .venv
source .venv/bin/activate

# Instalar dependências Python
pip install fontTools brotli
```

### 2. Executar o aplicativo
```bash
# Ainda com o ambiente virtual ativado
npm start
```

### 3. Compilar para .dmg (opcional)
```bash
# Para criar um instalador .dmg para Mac
npm run build
```

## 🎯 Funcionalidades

### Conversor de Fontes ⭐ (NOVO!)
- **Entrada**: Qualquer formato (.ttf, .otf, .woff, .woff2, .svg, .eot)
- **Saída**: Todos os 5 formatos necessários para Elementor
  - WOFF (Web Open Font Format)
  - WOFF2 (Modern browsers)
  - TTF (Safari, Android, iOS)
  - SVG (Legacy iOS)
  - EOT (Internet Explorer)
- **Inteligente**: Converte apenas os formatos que faltam
- **Limpeza**: Remove arquivo original após conversão

### Outras funcionalidades
- ✅ Criação automática de pastas
- ✅ Geração de HTML/ZIP para banners
- ✅ Exportação de stills de GIF
- ✅ Criação de PDFs
- ✅ Sistema de presets

## 📋 Requisitos do Sistema
- **macOS**: 10.13 ou superior
- **Node.js**: 16.x ou superior
- **Python**: 3.8 ou superior
- **Memória**: 4GB RAM mínimo

## 🐛 Problemas comuns no Mac

### Python não encontrado
```bash
# Verificar se Python está instalado
python3 --version

# Se não estiver, instalar via Homebrew
brew install python3
```

### Permissões
```bash
# Dar permissão de execução aos scripts
chmod +x scripts/*.py
chmod +x scripts/*.js
```

### Ambiente virtual
```bash
# Sempre ativar o ambiente virtual antes de usar
source .venv/bin/activate
```

## 📞 Suporte
Criado por Maycon Vinicius
Versão: 2.0.0

---
**Nota**: Esta versão foi preparada especificamente para Mac a partir do código Windows. Todas as funcionalidades são cross-platform!</content>
<parameter name="filePath">x:\PRGs\JOIN\JOIN\AllInOneMAC\README-MAC.md