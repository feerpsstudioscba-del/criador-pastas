const { ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

const choosePathBtn = document.getElementById("choosePath");
const folderPathInput = document.getElementById("folderPath");
const folderList = document.getElementById("folderList");
const createBtn = document.getElementById("createFolders");
const status = document.getElementById("status");
const tabs = document.querySelectorAll("[data-tab]");
const panes = document.querySelectorAll("[data-pane]");
const presetSelect = document.getElementById("presetSelect");
const applyPresetBtn = document.getElementById("applyPreset");
const presetListContainer = document.getElementById("presetList");
const presetNameInput = document.getElementById("presetName");
const presetItemsInput = document.getElementById("presetItems");
const savePresetBtn = document.getElementById("savePreset");
const cancelPresetEditBtn = document.getElementById("cancelPresetEdit");

// Gerador HTML elements
const geradorUrl = document.getElementById("geradorUrl");
const gifsPathInput = document.getElementById("gifsPath");
const browseGifsBtn = document.getElementById("browseGifs");
const outputPathInput = document.getElementById("outputPath");
const browseOutputBtn = document.getElementById("browseOutput");
const generateHtmlsBtn = document.getElementById("generateHtmls");
const geradorStatus = document.getElementById("geradorStatus");
const geradorMetrics = document.getElementById("geradorMetrics");

// GIF Export elements
const gifInputPath = document.getElementById("gifInputPath");
const browseGifInputBtn = document.getElementById("browseGifInput");
const gifOutputPath = document.getElementById("gifOutputPath");
const browseGifOutputBtn = document.getElementById("browseGifOutput");
const gifRecursive = document.getElementById("gifRecursive");
const gifCreateSubfolders = document.getElementById("gifCreateSubfolders");
const gifVideoMode = document.getElementById("gifVideoMode");
const gifGeneratePdf = document.getElementById("gifGeneratePdf");
const gifMergePdfName = document.getElementById("gifMergePdfName");
const processGifExportBtn = document.getElementById("processGifExport");
const openGifOutputBtn = document.getElementById("openGifOutput");
const gifExporterLog = document.getElementById("gifExporterLog");
const gifExporterStatus = document.getElementById("gifExporterStatus");

// PDF Create elements
const pdfInputPath = document.getElementById("pdfInputPath");
const browsePdfInputBtn = document.getElementById("browsePdfInput");
const pdfOutputPath = document.getElementById("pdfOutputPath");
const browsePdfOutputBtn = document.getElementById("browsePdfOutput");
const pdfMergeName = document.getElementById("pdfMergeName");
const processPdfCreateBtn = document.getElementById("processPdfCreate");
const openPdfOutputBtn = document.getElementById("openPdfOutput");
const pdfCreatorLog = document.getElementById("pdfCreatorLog");
const pdfCreatorStatus = document.getElementById("pdfCreatorStatus");

// Font Converter elements
const fontInput = document.getElementById("fontInput");
const fontOutputPath = document.getElementById("fontOutputPath");
const browseFontOutputBtn = document.getElementById("browseFontOutput");
const convertFontBtn = document.getElementById("convertFont");
const openFontOutputBtn = document.getElementById("openFontOutput");
const fontConverterLog = document.getElementById("fontConverterLog");
const fontConverterStatus = document.getElementById("fontConverterStatus");

let presets = [];
let editingPresetId = null;

const normalizePath = (line) =>
  line
    .replace(/\\+/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .trim();

const parseFolderLines = (rawText) => {
  const lines = rawText.replace(/\t/g, "  ").split("\n");
  const stack = [];
  const result = [];

  for (const rawLine of lines) {
    const rightTrimmed = rawLine.replace(/\s+$/g, "");
    if (!rightTrimmed.trim()) continue;

    const indent = rightTrimmed.match(/^ */)[0].length;
    const content = normalizePath(rightTrimmed);
    if (!content) continue;

    const parts = content.split("/").filter(Boolean);
    const hasSlash = parts.length > 1;

    if (hasSlash) {
      const pathStr = parts.join("/");
      result.push(pathStr);
      stack.length = 0;
      parts.forEach((part, idx) => stack.push({ name: part, indent: indent + idx }));
      continue;
    }

    while (stack.length && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const baseParts = stack.map((s) => s.name);
    const fullPath = [...baseParts, parts[0]].join("/");
    result.push(fullPath);
    stack.push({ name: parts[0], indent });
  }

  return Array.from(new Set(result));
};

const sanitizePresetLines = (text) =>
  text
    .replace(/\t/g, "  ")
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .filter((line) => line.trim() !== "");

const setStatus = (message, isError = false) => {
  status.textContent = message;
  status.style.color = isError ? "#d7263d" : "#241f56";
};

const setGeradorStatus = (message, isError = false) => {
  geradorStatus.textContent = message;
  geradorStatus.style.color = isError ? "#d7263d" : "#241f56";
};

const setGifExporterStatus = (message, isError = false) => {
  gifExporterStatus.textContent = message;
  gifExporterStatus.style.color = isError ? "#d7263d" : "#241f56";
};

const setGifExporterLog = (text) => {
  gifExporterLog.value = text;
  gifExporterLog.scrollTop = gifExporterLog.scrollHeight;
};

const setPdfCreatorStatus = (message, isError = false) => {
  pdfCreatorStatus.textContent = message;
  pdfCreatorStatus.style.color = isError ? "#d7263d" : "#241f56";
};

const setPdfCreatorLog = (text) => {
  pdfCreatorLog.value = text;
  pdfCreatorLog.scrollTop = pdfCreatorLog.scrollHeight;
};

const syncGifPdfControls = () => {
  const enabled = Boolean(gifGeneratePdf.checked);
  gifMergePdfName.disabled = !enabled;
  if (!enabled) {
    gifMergePdfName.style.opacity = "0.7";
  } else {
    gifMergePdfName.style.opacity = "1";
  }
};

choosePathBtn.addEventListener("click", async () => {
  const path = await ipcRenderer.invoke("choose-folder");
  if (path) {
    folderPathInput.value = path;
    setStatus("");
  }
});

const preventDefaults = (event) => {
  event.preventDefault();
};

["dragenter", "dragover"].forEach((eventName) => {
  folderPathInput.addEventListener(eventName, (event) => {
    preventDefaults(event);
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
    folderPathInput.classList.add("dragging");
  });
});

["dragleave", "drop", "dragend"].forEach((eventName) => {
  folderPathInput.addEventListener(eventName, (event) => {
    preventDefaults(event);
    folderPathInput.classList.remove("dragging");
  });
});

["dragover", "drop"].forEach((eventName) => {
  window.addEventListener(eventName, preventDefaults);
});

folderPathInput.addEventListener("drop", (event) => {
  event.preventDefault();
  const files = Array.from(event.dataTransfer.files || []);
  const dir = files.find((file) => {
    try {
      return fs.statSync(file.path).isDirectory();
    } catch {
      return false;
    }
  });

  if (dir) {
    folderPathInput.value = dir.path;
    setStatus("");
  } else {
    setStatus("Solte uma pasta para definir o destino.", true);
  }
});

const attachDirDrop = (inputEl, onErrorStatus) => {
  ["dragenter", "dragover"].forEach((eventName) => {
    inputEl.addEventListener(eventName, (event) => {
      preventDefaults(event);
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
      inputEl.classList.add("dragging");
    });
  });

  ["dragleave", "drop", "dragend"].forEach((eventName) => {
    inputEl.addEventListener(eventName, (event) => {
      preventDefaults(event);
      inputEl.classList.remove("dragging");
    });
  });

  inputEl.addEventListener("drop", (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files || []);
    const dir = files.find((file) => {
      try {
        return fs.statSync(file.path).isDirectory();
      } catch {
        return false;
      }
    });

    if (dir) {
      inputEl.value = dir.path;
      onErrorStatus("");
    } else {
      onErrorStatus("Solte uma pasta valida.");
    }
  });
};

attachDirDrop(gifsPathInput, (msg) => setGeradorStatus(msg, Boolean(msg)));
attachDirDrop(outputPathInput, (msg) => setGeradorStatus(msg, Boolean(msg)));
attachDirDrop(gifInputPath, (msg) => setGifExporterStatus(msg, Boolean(msg)));
attachDirDrop(gifOutputPath, (msg) => setGifExporterStatus(msg, Boolean(msg)));
attachDirDrop(pdfInputPath, (msg) => setPdfCreatorStatus(msg, Boolean(msg)));
attachDirDrop(pdfOutputPath, (msg) => setPdfCreatorStatus(msg, Boolean(msg)));

browseGifsBtn.addEventListener("click", async () => {
  const p = await ipcRenderer.invoke("choose-folder");
  if (p) gifsPathInput.value = p;
});

browseOutputBtn.addEventListener("click", async () => {
  const p = await ipcRenderer.invoke("choose-folder");
  if (p) outputPathInput.value = p;
});

browseGifInputBtn.addEventListener("click", async () => {
  const p = await ipcRenderer.invoke("choose-folder");
  if (p) gifInputPath.value = p;
});

browseGifOutputBtn.addEventListener("click", async () => {
  const p = await ipcRenderer.invoke("choose-folder");
  if (p) gifOutputPath.value = p;
});

browsePdfInputBtn.addEventListener("click", async () => {
  const p = await ipcRenderer.invoke("choose-folder");
  if (p) pdfInputPath.value = p;
});

browsePdfOutputBtn.addEventListener("click", async () => {
  const p = await ipcRenderer.invoke("choose-folder");
  if (p) pdfOutputPath.value = p;
});

gifGeneratePdf.addEventListener("change", syncGifPdfControls);

generateHtmlsBtn.addEventListener("click", async () => {
  const gifsDir = gifsPathInput.value.trim();
  const clickUrl = geradorUrl.value.trim();
  let outputDir = outputPathInput.value.trim();
  const metrics = geradorMetrics.value.trim();

  if (!gifsDir) {
    setGeradorStatus("Selecione a pasta dos arquivos.", true);
    return;
  }

  if (!clickUrl) {
    setGeradorStatus("Informe a URL de clique.", true);
    return;
  }

  setGeradorStatus("Processando...");

  try {
    const res = await ipcRenderer.invoke("gerador:generate", { gifsDir, clickUrl, outputDir, metrics });
    if (!res || !res.success) {
      setGeradorStatus(`Erro: ${res?.message || "Falha desconhecida."}`, true);
    } else {
      setGeradorStatus(`Concluido. Gerados ${res.htmlCount} HTML(s) e ${res.zipCount} ZIP(s). Pasta: ${res.outputDir}`);
    }
  } catch (err) {
    setGeradorStatus(`Erro: ${err && err.message ? err.message : String(err)}`, true);
  }
});

processGifExportBtn.addEventListener("click", async () => {
  const inputDir = gifInputPath.value.trim();
  const outputDir = gifOutputPath.value.trim();
  const recursive = Boolean(gifRecursive.checked);
  const createSubfolders = Boolean(gifCreateSubfolders.checked);
  const exportMode = gifVideoMode.checked ? "all" : "auto";
  const generatePdf = Boolean(gifGeneratePdf.checked);
  const mergeFilename = gifMergePdfName.value.trim();

  if (!inputDir) {
    setGifExporterStatus("Selecione a pasta raiz dos GIFs.", true);
    return;
  }

  if (!outputDir) {
    setGifExporterStatus("Selecione a pasta de saida.", true);
    return;
  }

  setGifExporterStatus("Processando GIFs...");
  setGifExporterLog("Iniciando processamento...\n");
  processGifExportBtn.disabled = true;
  openGifOutputBtn.disabled = true;

  try {
    const res = await ipcRenderer.invoke("gif-exporter:process", {
      inputDir,
      outputDir,
      recursive,
      createSubfolders,
      exportMode,
      generatePdf,
      mergeFilename,
    });

    if (!res || !res.success) {
      setGifExporterStatus(`Erro: ${res?.message || "Falha no processamento."}`, true);
      if (res?.stderr || res?.stdout) {
        setGifExporterLog([res.stderr || "", res.stdout || ""].filter(Boolean).join("\n"));
      }
      return;
    }

    const summary = res.summary || {};
    const lines = [
      `Entrada: ${summary.inputDir || inputDir}`,
      `Saida: ${summary.outputDir || outputDir}`,
      `GIFs encontrados: ${summary.totalGifs ?? 0}`,
      `Modo de exportacao: ${exportMode === "all" ? "todos os frames (video)" : "automatico"}`,
      `Sucesso: ${summary.succeeded ?? 0}`,
      `Falhas: ${summary.failed ?? 0}`,
      `PNGs exportados: ${summary.exportedCount ?? 0}`,
      `Tempo: ${typeof summary.elapsedSeconds === "number" ? summary.elapsedSeconds.toFixed(2) : "0.00"}s`,
      "",
    ];

    const pdfInfo = res.pdf || {};
    if (generatePdf) {
      lines.push(`PDFs individuais: ${pdfInfo.count ?? 0}`);
      if (pdfInfo.mergedReport) {
        lines.push(`PDF mesclado: ${pdfInfo.mergedReport}`);
      }
      if (pdfInfo.error) {
        lines.push(`[AVISO PDF] ${pdfInfo.error}`);
      }
      lines.push("");
    }

    const results = Array.isArray(summary.results) ? summary.results : [];
    if (results.length === 0) {
      lines.push("Nenhum GIF processado.");
    } else {
      for (const item of results) {
        const gifName = item?.gifPath ? path.basename(item.gifPath) : "(sem nome)";
        if (item?.success) {
          const frameCount = Array.isArray(item.exportedFrames) ? item.exportedFrames.length : 0;
          lines.push(
            `[OK] ${gifName} -> ${frameCount} PNG(s), maior duracao: ${item.maxDurationMs ?? 0}ms`
          );
        } else {
          lines.push(`[ERRO] ${gifName} -> ${item?.error || "falha desconhecida"}`);
        }
      }
    }

    setGifExporterLog(lines.join("\n"));
    if (generatePdf) {
      setGifExporterStatus(
        `Concluido. ${summary.exportedCount ?? 0} PNG(s), ${pdfInfo.count ?? 0} PDF(s) e mesclagem ${pdfInfo.mergedReport ? "ok" : "sem arquivo"} em ${summary.totalGifs ?? 0} GIF(s).`
      );
    } else {
      setGifExporterStatus(
        `Concluido. ${summary.exportedCount ?? 0} PNG(s) exportado(s) em ${summary.totalGifs ?? 0} GIF(s).`
      );
    }
  } catch (err) {
    setGifExporterStatus(`Erro: ${err && err.message ? err.message : String(err)}`, true);
  } finally {
    processGifExportBtn.disabled = false;
    openGifOutputBtn.disabled = false;
  }
});

openGifOutputBtn.addEventListener("click", async () => {
  const outputDir = gifOutputPath.value.trim();
  if (!outputDir) {
    setGifExporterStatus("Selecione a pasta de saida para abrir.", true);
    return;
  }

  try {
    const res = await ipcRenderer.invoke("open-folder", outputDir);
    if (!res || !res.success) {
      setGifExporterStatus(`Erro: ${res?.message || "Nao foi possivel abrir a pasta."}`, true);
      return;
    }
    setGifExporterStatus("Pasta de saida aberta.");
  } catch (err) {
    setGifExporterStatus(`Erro: ${err && err.message ? err.message : String(err)}`, true);
  }
});

processPdfCreateBtn.addEventListener("click", async () => {
  const inputDir = pdfInputPath.value.trim();
  const outputDir = pdfOutputPath.value.trim();
  const mergeFilename = pdfMergeName.value.trim();

  if (!inputDir) {
    setPdfCreatorStatus("Selecione a pasta de entrada com PNGs.", true);
    return;
  }

  if (!outputDir) {
    setPdfCreatorStatus("Selecione a pasta de saida dos PDFs.", true);
    return;
  }

  setPdfCreatorStatus("Criando PDFs...");
  setPdfCreatorLog("Iniciando criacao de PDFs...\n");
  processPdfCreateBtn.disabled = true;
  openPdfOutputBtn.disabled = true;

  try {
    const res = await ipcRenderer.invoke("gif-exporter:create-pdf", {
      inputDir,
      outputDir,
      mergeFilename,
    });

    if (!res || !res.success) {
      setPdfCreatorStatus(`Erro: ${res?.message || "Falha ao criar PDFs."}`, true);
      if (res?.stderr || res?.stdout) {
        setPdfCreatorLog([res.stderr || "", res.stdout || ""].filter(Boolean).join("\n"));
      }
      return;
    }

    const summary = res.summary || {};
    const pdfInfo = res.pdf || {};
    const lines = [
      `Entrada: ${summary.inputDir || inputDir}`,
      `Saida: ${summary.outputDir || outputDir}`,
      `Pastas com PNG detectadas: ${summary.totalGifs ?? 0}`,
      `Sucesso: ${summary.succeeded ?? 0}`,
      `Falhas: ${summary.failed ?? 0}`,
      `PNGs considerados: ${summary.exportedCount ?? 0}`,
      `PDFs individuais: ${pdfInfo.count ?? 0}`,
      `Tempo: ${typeof summary.elapsedSeconds === "number" ? summary.elapsedSeconds.toFixed(2) : "0.00"}s`,
      "",
    ];

    if (pdfInfo.mergedReport) {
      lines.push(`PDF geral: ${pdfInfo.mergedReport}`);
    }
    if (pdfInfo.error) {
      lines.push(`[AVISO PDF] ${pdfInfo.error}`);
    }

    setPdfCreatorLog(lines.join("\n"));
    setPdfCreatorStatus(
      `Concluido. ${pdfInfo.count ?? 0} PDF(s) individual(is) gerado(s)${pdfInfo.mergedReport ? " e PDF geral criado." : "."}`
    );
  } catch (err) {
    setPdfCreatorStatus(`Erro: ${err && err.message ? err.message : String(err)}`, true);
  } finally {
    processPdfCreateBtn.disabled = false;
    openPdfOutputBtn.disabled = false;
  }
});

openPdfOutputBtn.addEventListener("click", async () => {
  const outputDir = pdfOutputPath.value.trim();
  if (!outputDir) {
    setPdfCreatorStatus("Selecione a pasta de saida para abrir.", true);
    return;
  }

  try {
    const res = await ipcRenderer.invoke("open-folder", outputDir);
    if (!res || !res.success) {
      setPdfCreatorStatus(`Erro: ${res?.message || "Nao foi possivel abrir a pasta."}`, true);
      return;
    }
    setPdfCreatorStatus("Pasta de saida aberta.");
  } catch (err) {
    setPdfCreatorStatus(`Erro: ${err && err.message ? err.message : String(err)}`, true);
  }
});

syncGifPdfControls();

createBtn.addEventListener("click", () => {
  const path = folderPathInput.value.trim();
  const folders = parseFolderLines(folderList.value);

  if (!path) {
    setStatus("Escolha um destino para criar as pastas.", true);
    return;
  }

  if (folders.length === 0) {
    setStatus("Informe ao menos um nome de pasta.", true);
    return;
  }

  ipcRenderer.send("create-folders", { path, folders });
  setStatus("Criando pastas...");
});

ipcRenderer.on("folders-created", (_event, successCount) => {
  const plural = successCount === 1 ? "pasta criada" : "pastas criadas";
  setStatus(`Pronto. ${successCount} ${plural} com sucesso!`);
});

const switchTab = (target) => {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === target));
  panes.forEach((pane) => pane.classList.toggle("active", pane.dataset.pane === target));
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

const renderPresetSelect = () => {
  presetSelect.innerHTML = '<option value="">Selecione um preset</option>';
  presets.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.id;
    option.textContent = preset.nome;
    presetSelect.appendChild(option);
  });
};

const renderPresetList = () => {
  if (presets.length === 0) {
    presetListContainer.innerHTML = '<div style="color:#5f5f6f;font-size:13px;">Nenhum preset salvo ainda.</div>';
    return;
  }

  presetListContainer.innerHTML = presets
    .map(
      (preset) => `
      <div class="preset-card">
        <header>
          <div>
            <div class="preset-name">${preset.nome}</div>
            <div class="preset-meta">${(preset.itens || []).length} pastas</div>
          </div>
          <div class="preset-actions-row" style="margin:0;">
            <button class="ghost" data-action="use" data-id="${preset.id}">Usar</button>
            <button class="ghost" data-action="edit" data-id="${preset.id}">Editar</button>
            <button class="ghost" data-action="duplicate" data-id="${preset.id}">Duplicar</button>
            <button class="ghost" data-action="delete" data-id="${preset.id}">Excluir</button>
          </div>
        </header>
        <div class="preset-items">${(preset.itens || []).join("\\n")}</div>
      </div>
    `
    )
    .join("");
};

const resetPresetForm = () => {
  editingPresetId = null;
  presetNameInput.value = "";
  presetItemsInput.value = "";
  savePresetBtn.textContent = "Salvar preset";
  cancelPresetEditBtn.hidden = true;
};

const loadPresets = async () => {
  presets = await ipcRenderer.invoke("presets:list");
  renderPresetSelect();
  renderPresetList();
};

applyPresetBtn.addEventListener("click", () => {
  const id = presetSelect.value;
  if (!id) return;
  const preset = presets.find((p) => p.id === id);
  if (preset) {
    folderList.value = (preset.itens || []).join("\n");
    switchTab("create");
    setStatus("Preset aplicado. Verifique a lista antes de criar.");
  }
});

savePresetBtn.addEventListener("click", async () => {
  const nome = presetNameInput.value.trim();
  const itens = sanitizePresetLines(presetItemsInput.value);

  if (!nome) {
    setStatus("Dê um nome para o preset.", true);
    return;
  }

  if (itens.length === 0) {
    setStatus("Inclua pelo menos uma pasta no preset.", true);
    return;
  }

  await ipcRenderer.invoke("presets:save", { id: editingPresetId, nome, itens });
  await loadPresets();
  resetPresetForm();
  setStatus("Preset salvo.");
});

cancelPresetEditBtn.addEventListener("click", () => {
  resetPresetForm();
  setStatus("");
});

presetListContainer.addEventListener("click", async (event) => {
  const action = event.target.dataset.action;
  const id = event.target.dataset.id;
  if (!action || !id) return;

  if (action === "use") {
    const preset = presets.find((p) => p.id === id);
    if (preset) {
      folderList.value = (preset.itens || []).join("\n");
      switchTab("create");
      setStatus("Preset aplicado. Verifique a lista antes de criar.");
    }
    return;
  }

  if (action === "edit") {
    const preset = presets.find((p) => p.id === id);
    if (preset) {
      editingPresetId = preset.id;
      presetNameInput.value = preset.nome;
      presetItemsInput.value = (preset.itens || []).join("\n");
      savePresetBtn.textContent = "Atualizar preset";
      cancelPresetEditBtn.hidden = false;
      setStatus("Editando preset.");
      switchTab("presets");
    }
    return;
  }

  if (action === "duplicate") {
    const preset = presets.find((p) => p.id === id);
    if (preset) {
      editingPresetId = null;
      presetNameInput.value = `${preset.nome} (copia)`;
      presetItemsInput.value = (preset.itens || []).join("\n");
      savePresetBtn.textContent = "Salvar preset";
      cancelPresetEditBtn.hidden = false;
      switchTab("presets");
      setStatus("Preset duplicado para edicao. Ajuste o nome se quiser.");
    }
    return;
  }

  if (action === "delete") {
    const confirmDelete = confirm("Deseja excluir este preset?");
    if (!confirmDelete) return;
    await ipcRenderer.invoke("presets:delete", id);
    await loadPresets();
    if (editingPresetId === id) resetPresetForm();
    setStatus("Preset removido.");
  }
});

loadPresets();

// Font Converter handlers
fontInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const supportedFormats = ['ttf', 'otf', 'woff', 'woff2', 'svg', 'eot'];
    if (!supportedFormats.includes(ext)) {
      setStatus(`Formato não suportado. Use: ${supportedFormats.join(', ')}`, true);
      fontInput.value = "";
    } else {
      setStatus(`Arquivo selecionado: ${file.name}`);
    }
  }
});

browseFontOutputBtn.addEventListener("click", async () => {
  const result = await ipcRenderer.invoke("choose-folder");
  if (result) {
    fontOutputPath.value = result;
  }
});

openFontOutputBtn.addEventListener("click", async () => {
  const outputPath = fontOutputPath.value;
  if (!outputPath) {
    setStatus("Selecione uma pasta de saída primeiro.", true);
    return;
  }
  const convertedPath = path.join(outputPath, "converted-fonts");
  await ipcRenderer.invoke("open-folder", convertedPath);
});

convertFontBtn.addEventListener("click", async () => {
  const file = fontInput.files[0];
  const outputPath = fontOutputPath.value;

  if (!file) {
    setStatus("Selecione um arquivo de fonte.", true);
    return;
  }

  if (!outputPath) {
    setStatus("Selecione uma pasta de saída.", true);
    return;
  }

  setStatus("Convertendo fonte...");
  fontConverterLog.value = "";

  try {
    const convertedPath = path.join(outputPath, "converted-fonts");
    const result = await ipcRenderer.invoke("font:convert", {
      inputPath: file.path,
      outputPath: convertedPath,
    });

    fontConverterLog.value = result.log || "";
    
    if (result.success) {
      setStatus("[OK] Conversao concluida! Verifique a pasta de saida.");
      fontInput.value = "";
    } else {
      setStatus("[ERRO] Erro na conversao. Verifique o log.", true);
    }
  } catch (error) {
    fontConverterLog.value += `\nErro: ${error.message}\n`;
    setStatus("Erro na conversão.", true);
  }
});
