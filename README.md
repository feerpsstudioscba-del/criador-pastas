# All-in-One Creator
Aplicação Electron completa para criação de pastas, geração de HTML/ZIP, exportação de stills de GIF, criação de PDFs e **conversão universal de fontes**.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Mac-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Funcionalidades

### ⭐ Conversor de Fontes Universal (NOVO!)
- **Entrada**: Qualquer formato (.ttf, .otf, .woff, .woff2, .svg, .eot)
- **Saída**: Todos os 5 formatos necessários para Elementor:
  - WOFF (Web Open Font Format)
  - WOFF2 (Modern browsers)
  - TTF (Safari, Android, iOS)
  - SVG (Legacy iOS)
  - EOT (Internet Explorer)
- **Inteligente**: Converte apenas os formatos que faltam
- **Limpeza**: Remove arquivo original após conversão

### 📁 Criador de Pastas
- Criação automática de estruturas de pastas
- Sistema de presets personalizáveis
- Interface intuitiva

### 🌐 Gerador HTML/ZIP
- Geração automática de HTML para banners
- Criação de pacotes ZIP prontos
- Suporte a múltiplos formatos de mídia

### 🎬 Exportador GIF
- Extração de stills de vídeos GIF
- Processamento em lote
- Integração com ferramentas externas

### 📄 Criador de PDF
- Montagem automática de PDFs
- Mesclagem de relatórios
- Organização de conteúdo

## 🖥️ Screenshots

### Interface Principal
![Interface](https://via.placeholder.com/800x600/241f56/ffffff?text=All-in-One+Creator)

### Conversor de Fontes
![Font Converter](https://via.placeholder.com/800x600/f8aa2a/241f56?text=Font+Converter)

## 🤖 Builds Automatizados (GitHub Actions)

O projeto agora possui **builds automatizados** via GitHub Actions! 🎉

### Como Funciona
- **Push automático**: Todo push nas branches `main` ou `master` dispara builds
- **Multi-plataforma**: Builds simultâneos para Windows e Mac
- **Artefatos**: Downloads diretos dos executáveis prontos
- **Releases**: Builds automáticos em releases publicados

### Downloads Automáticos
1. Vá para a aba **"Actions"** no repositório GitHub
2. Clique no workflow mais recente
3. Na seção **"Artifacts"**, baixe:
   - `Font-Converter-Windows` → Executável Windows
   - `Font-Converter-Mac` → App Mac (.dmg)

### Para Releases
- Crie um **Release** no GitHub
- Os builds são feitos automaticamente
- Downloads ficam disponíveis na página do release

## 📦 Instalação

### Windows
1. Baixe o `allinone_novo.exe` da pasta `dist/`
2. Execute o instalador
3. Pronto! O aplicativo está instalado

### Mac
1. Use a pasta `AllInOneMAC/` preparada
2. Execute o script `install-mac.sh`
3. Ou siga o `README-MAC.md`

### Desenvolvimento
```bash
# Clonar repositório
git clone https://github.com/feerpsstudioscba-del/criador-pastas.git
cd criador-pastas

# Instalar dependências
npm install

# Ambiente Python
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou: .venv\Scripts\activate  # Windows

pip install fontTools brotli

# Executar
npm start
```

## 🛠️ Tecnologias

- **Electron**: Framework cross-platform
- **Node.js**: Runtime JavaScript
- **Python**: Conversão de fontes
- **fontTools**: Biblioteca de manipulação de fontes
- **HTML/CSS/JavaScript**: Interface

## 📋 Requisitos

- **Windows**: 10 ou superior
- **Mac**: 10.13 ou superior
- **Node.js**: 16.x ou superior
- **Python**: 3.8 ou superior
- **Memória**: 4GB RAM mínimo

## 🎯 Como Usar

### Conversor de Fontes
1. Abra a aba "Conversor de Fontes"
2. Selecione qualquer arquivo de fonte
3. Escolha a pasta de saída
4. Clique em "Converter Fonte"
5. Todos os 5 formatos serão gerados automaticamente

### Outras Funcionalidades
- **Criar Pastas**: Use presets ou crie estruturas customizadas
- **HTML/ZIP**: Configure URLs e gere pacotes
- **GIF Export**: Selecione vídeos e extraia stills
- **PDF Create**: Monte relatórios automaticamente

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Maycon Vinicius**
- Email: [seu-email@exemplo.com]
- LinkedIn: [seu-linkedin]
- Portfolio: [seu-portfolio]

## 🙏 Agradecimentos

- Comunidade Electron
- Biblioteca fontTools
- Todos os contribuidores

---

⭐ **Se este projeto te ajudou, dê uma estrela no GitHub!**</content>
<parameter name="filePath">x:\PRGs\JOIN\JOIN\README.md