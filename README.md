# 🎬 JOIN - All-in-One Creative Studio

> Uma aplicação desktop poderosa e intuitiva para profissionais criativos. Crie pastas, organize projetos, exporte GIFs, gere PDFs e converta fontes — tudo em um só lugar.

![Windows](https://img.shields.io/badge/Windows-Compatible-0078D4?style=flat-square&logo=windows)
![macOS](https://img.shields.io/badge/macOS-Compatible-000000?style=flat-square&logo=apple)
![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=flat-square&logo=node.js)
![Electron](https://img.shields.io/badge/Electron-30.x-47848F?style=flat-square&logo=electron)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## ✨ Funcionalidades

### 📁 **Criador de Pastas**
Crie estruturas de diretórios complexas com facilidade usando uma interface intuitiva. Salve seus layouts como presets para reutilizar rapidamente em futuros projetos.

- ✅ Interface baseada em abas
- ✅ Sistema de presets personalizados
- ✅ Suporte a pastas aninhadas
- ✅ Criação em lote

### 🎬 **Gerador de HTML para GIFs**
Converta GIFs em páginas HTML interativas com rastreamento de cliques. Perfeito para campanhas digitais e análise de engajamento.

- ✅ Interface responsiva
- ✅ Rastreamento de cliques personalizado
- ✅ Redimensionamento automático de imagens
- ✅ Compactação em ZIP

### 🎞️ **Exportador de GIFs**
Extraia frames individuais de GIFs em alta qualidade. Modo automático ou manual para máximo controle.

- ✅ Extração de todos os frames
- ✅ Modo automático inteligente
- ✅ Suporte recursivo de pastas
- ✅ Geração de PDFs individuais
- ✅ Fusão automática em PDF único

### 📄 **Criador de PDFs**
Transforme coleções de imagens em documentos PDF profissionais e organizados.

- ✅ Criação de PDFs individuais
- ✅ Fusão em documento único
- ✅ Suporte a múltiplos formatos de imagem
- ✅ Processamento em lote

### 🔤 **Conversor Universal de Fontes**
Converta fontes entre múltiplos formatos com suporte completo para web e desktop.

- ✅ Suporte para TTF, OTF, WOFF, WOFF2, SVG, EOT
- ✅ Conversão bidirecional
- ✅ Otimização para web
- ✅ Interface simples e intuitiva

## 🚀 Quick Start

### Pré-requisitos
- **Windows 10+** ou **macOS 13+**
- Nenhuma instalação adicional necessária (tudo incluído)

### Download e Instalação

#### Windows
1. Acesse a [página de Releases](https://github.com/feerpsstudioscba-del/criador-pastas/releases)
2. Baixe `All-in-One.exe`
3. Execute o arquivo e pronto! ✅

#### macOS
1. Acesse a [página de Releases](https://github.com/feerpsstudioscba-del/criador-pastas/releases)
2. Baixe o arquivo `.dmg`
3. Abra o arquivo e arraste JOIN para Applications
4. Pronto! 🎉

## 💻 Desenvolvimento Local

### Requisitos
- **Node.js 24+** → [Download](https://nodejs.org)
- **npm** (incluído com Node.js)
- **Git** → [Download](https://git-scm.com)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/feerpsstudioscba-del/criador-pastas.git
cd criador-pastas

# Instale as dependências
npm install --legacy-peer-deps

# Inicie o aplicativo em modo desenvolvimento
npm start
```

### Build

```bash
# Build para Windows (portable)
npm run build

# Build para macOS (DMG)
npm run build:mac

# Build para Windows (installer NSIS)
npm run build:install
```

Os arquivos compilados estarão em `dist/`

## 📁 Estrutura do Projeto

```
criador-pastas/
├── main.js                 # Processo principal Electron
├── renderer.js             # Lógica frontend
├── index.html             # Interface do usuário
├── package.json           # Dependências e configuração
├── scripts/
│   └── convert-font.py    # Script de conversão de fontes
├── resources/
│   └── gif-export/        # Recursos de exportação
├── build/
│   └── installer.nsh      # Script de instalação Windows
└── .github/workflows/
    └── build.yml          # GitHub Actions CI/CD
```

## 🛠️ Tecnologias Utilizadas

- **[Electron](https://www.electronjs.org/)** - Framework para aplicações desktop
- **[electron-builder](https://www.electron.build/)** - Empacotador de aplicações
- **[Node.js](https://nodejs.org/)** - Runtime JavaScript
- **[Python](https://www.python.org/)** - Scripts de processamento
- **[fontTools](https://github.com/fonttools/fonttools)** - Manipulação de fontes
- **[Archiver](https://www.archiverjs.com/)** - Compressão de arquivos

## 📦 Dependências Principais

| Pacote | Versão | Propósito |
|--------|--------|----------|
| electron | ^30.0.0 | Framework desktop |
| electron-builder | ^26.0.12 | Build e empacotamento |
| archiver | ^7.0.1 | Compressão ZIP |

## 🤝 Contribuindo

Adoramos contribuições! Se você encontrou um bug ou tem ideias de melhorias:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

### Reportar Bugs
Use a seção [Issues](https://github.com/feerpsstudioscba-del/criador-pastas/issues) para relatar problemas de forma detalhada.

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🎯 Roadmap Futuro

- [ ] Suporte a plugins personalizados
- [ ] Temas customizáveis
- [ ] Sincronização em nuvem
- [ ] Integração com Adobe Creative Suite
- [ ] Suporte a Linux
- [ ] API REST para automação

## 💬 Suporte e Feedback

- 📧 **Email**: contato@feerpsstudios.com
- 🐦 **Twitter**: [@feerpsstudios](https://twitter.com/feerpsstudios)
- 💻 **GitHub Issues**: [Abra uma issue](https://github.com/feerpsstudioscba-del/criador-pastas/issues)

## 🙏 Agradecimentos

Agradecemos a todos os contribuidores e usuários que ajudam a tornar este projeto melhor!

---

<div align="center">

**[↑ Voltar ao topo](#-join---all-in-one-creative-studio)**

Feito com ❤️ por [Feerps Studios](https://feerpsstudios.com)

</div>
