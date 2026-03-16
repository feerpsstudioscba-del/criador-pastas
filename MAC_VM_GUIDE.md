# 🍎 Guia Completo: Compilar JOIN para macOS em Máquina Virtual

Este guia te ajuda a criar uma máquina virtual macOS e compilar o `.dmg` do JOIN localmente.

---

## 📋 Índice

1. [Requisitos](#requisitos)
2. [Criar Máquina Virtual](#criar-máquina-virtual)
3. [Instalar Dependências](#instalar-dependências)
4. [Clonar Repositório](#clonar-repositório)
5. [Compilar o DMG](#compilar-o-dmg)
6. [Troubleshooting](#troubleshooting)

---

## ⚙️ Requisitos

### Software de Virtualização (escolha um):

#### Para sua configuração (i7 8ª + 32GB), recomendo:

1. **✅ VirtualBox** (Gratuito) - **RECOMENDADO**
   - Perfeito para sua máquina
   - Suporta bem Intel i7 8ª
   - Download: https://www.virtualbox.org/
   - **MELHOR CUSTO-BENEFÍCIO**

2. **✅ VMware Workstation Pro** (Pago - ~$249)
   - Mais rápido que VirtualBox
   - Excelente suporte a i7 8ª geração
   - Se quiser máxima performance

3. ❌ **Parallels** - Apenas em Mac
4. ❌ **UTM** - Melhor em Mac M1/M2

---

### macOS 13 Ventura (✅ RECOMENDADO PARA VOCÊ)

**Sua configuração:**
- Intel i7 8ª geração
- 32 GB RAM
- SSD dedicado 60GB

✅ **Perfeito match!** Você terá:
- ⚡ Build muito rápido (~5-8 minutos)
- 🎯 Zero problemas de compatibilidade
- 💾 RAM de sobra (recomendado 16GB, você tem 32GB)
- 📦 Suporte total a Node.js 24

**Intel i7 8ª + 32GB + SSD = Excelente Performance** 

---

### Alternativa: macOS 14 Sonoma

Se Ventura não estiver disponível, Sonoma também funciona bem:
- Ligeiramente mais novo
- Mesma performance
- Mesma compatibilidade

**Evitar:**
- ❌ Big Sur (11) - Muito antigo
- ❌ Sequoia (15) - Pode ser pesado para i7 8ª geração

### Requisitos da VM:
- **Processador:** 4 cores (mínimo)
- **RAM:** 8 GB (16 GB recomendado)
- **Disco:** 60 GB SSD (mínimo 50 GB)
- **Internet:** Conexão estável

---

## 🎯 Configuração Específica Para Você

### Sua Hardware:
```
Intel i7 8ª geração
32 GB RAM
NVIDIA GTX 1050 Ti
SSD dedicado 60GB
```

### Recomendação de Alocação para a VM:

| Recurso | Alocação | Motivo |
|---------|----------|--------|
| **vCPU** | 6-8 cores | 8 cores do i7, deixe 2-4 para Windows |
| **RAM** | 16-20 GB | Você tem 32GB, pode alocar bastante |
| **Disco** | 60 GB SSD | Exatamente o que você tem disponível |
| **VRAM** | Automático | VM não usa VRAM dedicada |

✅ **Com essa configuração:**
- Build do .dmg: **5-8 minutos**
- Compilação fluida: **Sim**
- Sem travamentos: **Garantido**

**Dica:** Deixe pelo menos 2GB de RAM livre no Windows para o sistema não ficar lento

---

## 🎛️ Configuração Específica do VirtualBox (Para Você)

### Passo a Passo no VirtualBox:

1. **Clique em "Nova"**
2. **Abra "Advanced Options"**
3. **Configure exatamente assim:**

```
Nome da VM: macOS-BUILD-JOIN
Tipo: macOS
Versão: macOS 13 (ou 14 Sonoma)
Memória Base: 18432 MB (18GB)
Processadores: 6 CPUs
Vídeo: 128 MB (máximo disponível)
Disco Rígido: VDI, Dinâmico, 60 GB
Armazenamento: Seu SSD dedicado
```

✅ **Resultado esperado:**
```
🚦 Windows: ~14GB RAM (sobra para você trabalhar)
🍎 macOS VM: 18GB RAM (muito generoso)
⚙️ 6 cores para VM (2 cores para Windows)
💾 60GB SSD exclusivo
```

---

## 🖥️ Criar Máquina Virtual

### Passo 1: Download do macOS

Se você tiver Mac físico, pode gerar a ISO:
```bash
# Abrir App Store, buscar "macOS Ventura" ou "Sonoma"
# Copiar o arquivo .app de /Applications para gerar ISO
# Ou usar ferramenta como SuperDuper ou MonoLingual
```

**Alternativa:** Procure no YouTube: `"Como criar VM macOS no Windows"` (seu software de escolha)

### Passo 2: Criar VM (Exemplo com VirtualBox)

1. **Abra VirtualBox**
2. **Clique em "Nova"**
3. Configure:
   - **Nome:** `macOS-BUILD`
   - **Tipo:** `macOS`
   - **Versão:** `macOS 13 (Ventura)` ou superior
   - **RAM:** `8192 MB` (ou 16 GB se tiver)
   - **Disco:** `60 GB` dinamicamente alocado
4. **Inicie a VM e selecione a ISO do macOS**
5. **Siga o instalador do macOS**

### Passo 3: Após Instalar o macOS

```bash
# Abra Terminal na VM

# Aceitar Xcode License
sudo xcode-select --install

# Ou instale Xcode completo (maior, mas seguro):
xcode-select --install

# Aguarde a instalação completar (~15-30 min)
```

---

## 📦 Instalar Dependências

Na VM macOS, no Terminal:

### 1. Instalar Homebrew (gerenciador de pacotes)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Instalar Node.js 24 LTS

```bash
# Via Homebrew
brew install node@24

# Ou direto do site
# Visite https://nodejs.org
# Download macOS Installer x64 or ARM64 (depende do seu Mac)
# Instale normalmente
```

### 3. Verificar instalação

```bash
node --version      # Deve mostrar v24.x.x
npm --version       # Deve mostrar versão do npm
git --version       # Git já vem no macOS
```

---

## 📂 Clonar Repositório

Na VM macOS, Terminal:

```bash
# Vá para diretório de trabalho
cd ~/Desktop

# Clone o repositório
git clone https://github.com/feerpsstudioscba-del/criador-pastas.git

# Entre na pasta
cd criador-pastas

# Verifique se está na branch master
git status
```

---

## 🔨 Compilar o DMG

### Passo 1: Instalar dependências do projeto

```bash
npm install --legacy-peer-deps
```

Aguarde (**pode levar 2-3 minutos**)

### Passo 2: Compilar para macOS

```bash
npm run build:mac
```

Aguarde (**pode levar 5-10 minutos**)

### Passo 3: Verificar resultado

```bash
# Listar arquivos gerados
ls -lh dist/

# Você deve ver algo como:
# JOIN-*.dmg (o arquivo instalável)
```

### Passo 4: Copiar o DMG para seu Windows

```bash
# Opções:

# A) Via rede (Samba/SMB) - mais fácil
#    Ative compartilhamento na VM
#    Acesse \\ip-da-vm\compartilhado no Windows

# B) Via USB
#    Copie dist/*.dmg para USB e leia no Windows

# C) Via cloud (Dropbox, Google Drive, OneDrive)
#    Faça upload do DMG na VM

# D) Via Terminal SSH (se configurado)
scp user@vm-ip:~/criador-pastas/dist/*.dmg ~/Downloads/
```

---

## 🧪 Testar o DMG na VM

Antes de enviar para Windows, teste localmente:

```bash
# Abrir o DMG
open dist/*.dmg

# Ou via Finder
# Duplo clique em dist/*.dmg

# Arraste JOIN para Applications
# Tente abrir: Applications > JOIN
```

---

## 🐛 Troubleshooting

### ❌ "npm: command not found"
```bash
# Node.js não foi instalado corretamente
# Reinstale via Homebrew ou site oficial
brew install node@24
```

### ❌ "Permission denied" em scripts
```bash
# Dê permissão de execução
chmod +x scripts/*.js
```

### ❌ "Erro ao compilar electron-builder"
```bash
# Limpe cache e tente novamente
rm -rf node_modules
rm package-lock.json
npm install --legacy-peer-deps
npm run build:mac
```

### ❌ "Xcode license not accepted"
```bash
# Aceite a licença do Xcode
sudo xcode-select --install
# Ou
sudo xcode-select --accept-license
```

### ❌ "Arquivo muito grande" (>2GB)
```bash
# Isso é normal, o electron é pesado
# Verifique espaço em disco: df -h
# Precisará de ~60GB livres
```

---

## ⚡ Performance Esperada Com Sua Configuração

### i7 8ª Gen + 32GB RAM + SSD Dedicado

| Etapa | Tempo Esperado | Notas |
|-------|---|---|
| **Criar VM** | 5-10 min | Rápido |
| **Instalar macOS** | 20-30 min | Normal |
| **Xcode CLI Tools** | 10-15 min | Depende da internet |
| **npm install** | 2-3 min | Com 18GB RAM é rápido |
| **npm run build:mac** | **5-8 min** | ⚡ Muito rápido! |
| **TOTAL INICIAL** | ~1.5-2 horas | Apenas 1ª vez |
| **Builds subsequentes** | **10-15 min** | Build + novo .dmg |

### ✅ Seu Setup é EXCELENTE para isso!

```
i7 8ª geração = VT-x habilitado ✓
32 GB RAM = 18GB para VM, 14GB para Windows ✓
SSD 60GB = Espaço e velocidade ✓
NVIDIA 1050 Ti = Bônus (não influencia no build)
```

**Resultado:** Você terá a experiência **melhor possível** com VirtualBox! 🚀

---

## 📊 Comparação de Performance

| Software | Velocidade | Compatibilidade | Custo |
|----------|-----------|-----------------|-------|
| **Parallels** | ⚡⚡⚡ Mais rápido | Perfeita | $ (Caro) |
| **VMware Fusion** | ⚡⚡⚡ Rápido | Boa | $ (Médio) |
| **UTM** | ⚡⚡ Bom | Boa | Grátis |
| **VirtualBox** | ⚡⚡ Mais lento | Boa | Grátis |

---

## 💡 Dicas Importantes

✅ **Snapshots:** Crie snapshot antes de compilar (volta rápido se der erro)
✅ **RAM:** Quanto mais RAM, mais rápido o build
✅ **SSD:** Disco SSD é essencial (HDD é muito lento)
✅ **Compartilhado:** Configure pasta compartilhada entre VM e Windows
✅ **Backup:** Faça backup do DMG após compilar
✅ **Versão:** Use sempre Node.js **24.x LTS**

---

## 🎯 Próximas Etapas

Após compilar o DMG com sucesso:

1. ✅ Copie o arquivo para Windows
2. ✅ Teste em Mac real (se tiver acesso)
3. ✅ Faça upload em GitHub Releases
4. ✅ Distribua aos usuários

---

## 📞 Suporte

Se der problema:

1. **Verificar logs:**
   ```bash
   npm run build:mac 2>&1 | tee build.log
   cat build.log
   ```

2. **Consultar documentação:**
   - [electron-builder docs](https://www.electron.build/)
   - [Electron docs](https://www.electronjs.org/docs)
   - [Node.js docs](https://nodejs.org/docs)

3. **Pesquisar no GitHub Issues:**
   - https://github.com/feerpsstudioscba-del/criador-pastas/issues

---

## 🎉 Resultado Final

Após compilar com sucesso, você terá:

```
dist/
├── JOIN-30.0.0.dmg          ← Arquivo instalável para macOS
├── JOIN-30.0.0-arm64.dmg    ← Versão ARM64 (Mac M1/M2/M3)
├── builder-debug.yml        ← Log da compilação
└── mac/
    └── JOIN.app             ← Aplicação não comprimida
```

Pronto para distribuir! 🚀

---

<div align="center">

**Boa sorte com a VM! 🍎**

Qualquer dúvida, é só chamar!

</div>
