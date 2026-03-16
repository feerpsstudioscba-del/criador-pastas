const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const archiver = require("archiver");
const pkg = require("./package.json");

const userDataDir = app.getPath("userData");
const presetsPath = path.join(userDataDir, "presets.json");
const defaultPresets = [
  {
    id: "preset-video",
    nome: "Pasta Raiz (para criacao de video)",
    itens: ["Audio", "Imagens", "Assets", "Render"],
  },
  {
    id: "preset-banners",
    nome: "Pasta Raiz (para criacao de banners)",
    itens: ["DOCs", "FORMATOS", "GIF", "ZIP", "HTML5", "LINK"],
  },
];

const IMAGE_EXTENSIONS = new Set([".gif", ".png", ".jpg", ".jpeg", ".bmp"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov"]);
const SUPPORTED_EXTENSIONS = new Set([...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS]);

const escapeHtmlAttribute = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const toRelativeMediaUrl = (filename) => encodeURIComponent(String(filename ?? ""));

const ensurePresetStore = () => {
  fs.mkdirSync(userDataDir, { recursive: true });
  if (!fs.existsSync(presetsPath)) {
    fs.writeFileSync(presetsPath, JSON.stringify(defaultPresets, null, 2), "utf-8");
  }
};

const readPresets = () => {
  ensurePresetStore();
  try {
    const data = fs.readFileSync(presetsPath, "utf-8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
};

const writePresets = (presets) => {
  fs.writeFileSync(presetsPath, JSON.stringify(presets, null, 2), "utf-8");
};

const makePresetId = () => `pst-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const isFile = (filePath) => {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
};

const firstExistingFile = (candidates) => candidates.find((candidate) => isFile(candidate));

const isDirectory = (dirPath) => {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
};

const runProcessAndCapture = (command, args = [], options = {}) =>
  new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    let child;
    try {
      child = spawn(command, args, {
        windowsHide: true,
        ...options,
      });
    } catch (err) {
      reject(err);
      return;
    }

    if (child.stdout) {
      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });
    }
    if (child.stderr) {
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.once("error", reject);
    child.once("close", (code) => {
      resolve({
        code: typeof code === "number" ? code : -1,
        stdout,
        stderr,
      });
    });
  });

const getGifExporterRoots = () =>
  Array.from(
    new Set(
      [
        path.resolve(process.resourcesPath || "", "gif-export"),
        path.resolve(process.resourcesPath || "", "GIF EXPORT"),
        path.resolve(path.dirname(process.execPath), "gif-export"),
        path.resolve(path.dirname(process.execPath), "GIF EXPORT"),
        path.resolve(__dirname, "..", "GIF EXPORT"),
        path.resolve(process.cwd(), "..", "GIF EXPORT"),
        path.resolve(process.cwd(), "GIF EXPORT"),
      ].filter(Boolean)
    )
  );

const findGifExporterCliTarget = () => {
  const roots = getGifExporterRoots();

  const exeCandidates = roots.flatMap((root) => [
    path.join(root, "dist", "GIF-Still-Exporter-CLI.exe"),
    path.join(root, "GIF-Still-Exporter-CLI.exe"),
  ]);
  const exePath = firstExistingFile(exeCandidates);
  if (exePath) {
    return {
      mode: "exe",
      command: exePath,
      cwd: path.dirname(exePath),
    };
  }

  const scriptCandidates = roots.map((root) => path.join(root, "cli.py"));
  const scriptPath = firstExistingFile(scriptCandidates);
  if (scriptPath) {
    return {
      mode: "python",
      scriptPath,
      cwd: path.dirname(scriptPath),
    };
  }

  return null;
};

const findGifExporterAssets = () => {
  const roots = getGifExporterRoots();
  for (const root of roots) {
    const imagesDir = path.join(root, "IMAGENS");
    const fontsDir = path.join(root, "FONTS");
    if (isDirectory(imagesDir) && isDirectory(fontsDir)) {
      return { imagesDir, fontsDir };
    }
  }
  return null;
};

const parseJsonFromOutput = (rawOutput) => {
  if (!rawOutput || typeof rawOutput !== "string") return null;
  const trimmed = rawOutput.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    // If there are extra logs around JSON, try the last non-empty line.
    const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) return null;
    const lastLine = lines[lines.length - 1];
    try {
      return JSON.parse(lastLine);
    } catch {
      return null;
    }
  }
};

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1100,
    minHeight: 650,
    backgroundColor: "#2a276f",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, "index.html"));
  win.maximize();

  const menu = Menu.buildFromTemplate([
    {
      label: "Arquivo",
      submenu: [
        {
          label: "Fechar",
          role: "quit",
        },
      ],
    },
    {
      label: "Sobre",
      click: () => {
        dialog.showMessageBox(win, {
          title: "Sobre",
          message: `${pkg.productName || pkg.name} v${pkg.version}`,
          detail: pkg.description,
        });
      },
    },
  ]);
  Menu.setApplicationMenu(menu);
}

ipcMain.handle("choose-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle("open-folder", async (_event, folderPath) => {
  if (!folderPath || !isDirectory(folderPath)) {
    return { success: false, message: "Pasta invalida." };
  }
  const errorMessage = await shell.openPath(folderPath);
  if (errorMessage) {
    return { success: false, message: errorMessage };
  }
  return { success: true };
});

ipcMain.on("create-folders", (event, { path: basePath, folders }) => {
  const unique = Array.from(new Set(folders || [])).filter(Boolean);
  let created = 0;
  for (const folder of unique) {
    const folderPath = path.join(basePath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      created++;
    }
  }
  event.reply("folders-created", created);
});

ipcMain.handle("presets:list", async () => {
  return readPresets();
});

ipcMain.handle("presets:save", async (_event, preset) => {
  const presets = readPresets();
  const nome = (preset?.nome || "").trim();
  const itens = Array.isArray(preset?.itens)
    ? preset.itens
        .map((i) => (typeof i === "string" ? i.replace(/\t/g, "  ").replace(/\s+$/g, "") : ""))
        .filter((i) => i.trim() !== "")
    : [];
  if (!nome || itens.length === 0) return presets;

  if (preset?.id) {
    const idx = presets.findIndex((p) => p.id === preset.id);
    if (idx >= 0) {
      presets[idx] = { ...presets[idx], nome, itens };
    } else {
      presets.push({ id: preset.id, nome, itens });
    }
  } else {
    presets.push({ id: makePresetId(), nome, itens });
  }

  writePresets(presets);
  return presets;
});

ipcMain.handle("presets:delete", async (_event, id) => {
  const presets = readPresets();
  const filtered = presets.filter((p) => p.id !== id);
  writePresets(filtered);
  return filtered;
});

const runAndMapCliResult = async (command, args, cwd) => {
  const result = await runProcessAndCapture(command, args, { cwd });
  const payload = parseJsonFromOutput(result.stdout);
  if (result.code !== 0) {
    return {
      ok: false,
      message:
        (payload && payload.error) || result.stderr.trim() || `Falha no processador (codigo ${result.code}).`,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  }
  if (!payload || payload.success !== true) {
    return {
      ok: false,
      message: (payload && payload.error) || "Resposta invalida do processador.",
      stdout: result.stdout,
      stderr: result.stderr,
    };
  }

  return { ok: true, payload, stdout: result.stdout, stderr: result.stderr };
};

const runGifExporterCli = async (cliArgs) => {
  const target = findGifExporterCliTarget();
  if (!target) {
    return {
      success: false,
      message:
        "Processador do GIF nao encontrado. Gere 'GIF-Still-Exporter-CLI.exe' em 'GIF EXPORT/dist' ou mantenha 'GIF EXPORT/cli.py'.",
    };
  }

  if (target.mode === "exe") {
    try {
      const mapped = await runAndMapCliResult(target.command, cliArgs, target.cwd);
      if (!mapped.ok) {
        return {
          success: false,
          message: mapped.message,
          stdout: mapped.stdout,
          stderr: mapped.stderr,
        };
      }
      return { success: true, mode: "exe", payload: mapped.payload };
    } catch (err) {
      return {
        success: false,
        message: `Falha ao executar EXE CLI: ${err && err.message ? err.message : String(err)}`,
      };
    }
  }

  const launchers =
    process.platform === "win32"
      ? [
          { command: "py", args: ["-3", target.scriptPath, ...cliArgs] },
          { command: "python", args: [target.scriptPath, ...cliArgs] },
        ]
      : [
          { command: "python3", args: [target.scriptPath, ...cliArgs] },
          { command: "python", args: [target.scriptPath, ...cliArgs] },
        ];

  let lastError = null;
  for (const launcher of launchers) {
    try {
      const mapped = await runAndMapCliResult(launcher.command, launcher.args, target.cwd);
      if (!mapped.ok) {
        lastError = new Error(mapped.message);
        continue;
      }
      return { success: true, mode: "python", payload: mapped.payload };
    } catch (err) {
      lastError = err;
    }
  }

  return {
    success: false,
    message: `Falha ao executar processador Python: ${lastError && lastError.message ? lastError.message : "interpretador nao encontrado."}`,
  };
};

const appendPdfAssetsArgs = (cliArgs) => {
  const assets = findGifExporterAssets();
  if (!assets) return;
  cliArgs.push("--images-dir", assets.imagesDir, "--fonts-dir", assets.fontsDir);
};

ipcMain.handle(
  "gif-exporter:process",
  async (
    _event,
    { inputDir, outputDir, recursive, createSubfolders, generatePdf, mergeFilename, exportMode } = {}
  ) => {
    const safeInputDir = (inputDir || "").toString().trim();
    const safeOutputDir = (outputDir || "").toString().trim();
    const safeGeneratePdf = Boolean(generatePdf);
    const safeMergeFilename = (mergeFilename || "").toString().trim();
    const safeExportMode =
      exportMode === "all" || exportMode === "peak" || exportMode === "auto" ? exportMode : "auto";

    if (!safeInputDir || !isDirectory(safeInputDir)) {
      return { success: false, message: "Pasta raiz dos GIFs invalida." };
    }

    if (!safeOutputDir) {
      return { success: false, message: "Pasta de saida vazia." };
    }

    try {
      fs.mkdirSync(safeOutputDir, { recursive: true });
    } catch (err) {
      return {
        success: false,
        message: `Nao foi possivel criar a pasta de saida: ${err && err.message ? err.message : String(err)}`,
      };
    }

    const cliArgs = [
      "--mode",
      "export",
      "--input-dir",
      safeInputDir,
      "--output-dir",
      safeOutputDir,
      "--export-mode",
      safeExportMode,
      ...(recursive ? ["--recursive"] : []),
      ...(createSubfolders ? [] : ["--no-subfolders"]),
    ];

    if (safeGeneratePdf) {
      cliArgs.push("--generate-pdf");
      if (safeMergeFilename) {
        cliArgs.push("--merge-filename", safeMergeFilename);
      }
      appendPdfAssetsArgs(cliArgs);
    }

    const result = await runGifExporterCli(cliArgs);
    if (!result.success) {
      return result;
    }

    return {
      success: true,
      mode: result.mode,
      summary: result.payload.summary,
      pdf: result.payload.pdf || null,
    };
  }
);

ipcMain.handle(
  "gif-exporter:create-pdf",
  async (_event, { inputDir, outputDir, mergeFilename } = {}) => {
    const safeInputDir = (inputDir || "").toString().trim();
    const safeOutputDir = (outputDir || "").toString().trim();
    const safeMergeFilename = (mergeFilename || "").toString().trim();

    if (!safeInputDir || !isDirectory(safeInputDir)) {
      return { success: false, message: "Pasta de entrada com PNGs invalida." };
    }

    if (!safeOutputDir) {
      return { success: false, message: "Pasta de saida vazia." };
    }

    try {
      fs.mkdirSync(safeOutputDir, { recursive: true });
    } catch (err) {
      return {
        success: false,
        message: `Nao foi possivel criar a pasta de saida: ${err && err.message ? err.message : String(err)}`,
      };
    }

    const cliArgs = [
      "--mode",
      "pdf",
      "--input-dir",
      safeInputDir,
      "--output-dir",
      safeOutputDir,
      "--generate-pdf",
    ];

    if (safeMergeFilename) {
      cliArgs.push("--merge-filename", safeMergeFilename);
    }

    appendPdfAssetsArgs(cliArgs);
    const result = await runGifExporterCli(cliArgs);
    if (!result.success) {
      return result;
    }

    return {
      success: true,
      mode: result.mode,
      summary: result.payload.summary,
      pdf: result.payload.pdf || null,
    };
  }
);

const HTML_TEMPLATE = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>%%TITLE%%</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    html, body { margin: 0; padding: 0; background: #ffffff; }
  </style>
</head>
<body>
%%BODY%%
</body>
</html>`;

const buildHtmlContent = (baseName, filename, clickUrl, isVideo, metricsNote) => {
  const safeMetrics = metricsNote ? metricsNote.replace(/--+/g, "-").trim() : "";
  const metricsComment = safeMetrics ? `  <!-- Metrics: ${safeMetrics} -->\n` : "";
  const safeTitle = escapeHtmlAttribute(baseName);
  const safeAlt = escapeHtmlAttribute(baseName);
  const safeClickUrl = escapeHtmlAttribute(clickUrl);
  const mediaUrl = toRelativeMediaUrl(filename);

  const mediaTag = isVideo
    ? [
        `  <a href="${safeClickUrl}" target="_blank" rel="noopener noreferrer">`,
        `    <video src="${mediaUrl}" controls playsinline style="display:block;border:0;">`,
        "      Seu navegador nao suporta video HTML5.",
        "    </video>",
        "  </a>",
      ].join("\n")
    : [
        `  <a href="${safeClickUrl}" target="_blank" rel="noopener noreferrer">`,
        `    <img src="${mediaUrl}" alt="${safeAlt}" style="display:block;border:0;" />`,
        "  </a>",
      ].join("\n");

  return HTML_TEMPLATE.replace(/%%TITLE%%/g, safeTitle).replace("%%BODY%%", `${metricsComment}${mediaTag}`);
};

const createZip = (zipPath, htmlPath, assetPath, assetName) =>
  new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));
    archive.pipe(output);
    archive.file(htmlPath, { name: "index.html" });
    archive.file(assetPath, { name: assetName });
    archive.finalize();
  });

ipcMain.handle("gerador:generate", async (_event, { gifsDir, clickUrl, outputDir, metrics }) => {
  try {
    const assetsDir = gifsDir;
    if (!assetsDir || !fs.existsSync(assetsDir) || !fs.statSync(assetsDir).isDirectory()) {
      return { success: false, message: "Pasta de arquivos invalida." };
    }

    if (!clickUrl) return { success: false, message: "URL de clique vazia." };

    if (!outputDir) outputDir = assetsDir;
    try {
      fs.mkdirSync(outputDir, { recursive: true });
    } catch (e) {
      return { success: false, message: `Erro ao criar pasta de saida: ${e.message}` };
    }

    const files = fs.readdirSync(assetsDir).filter((f) => {
      try {
        const full = path.join(assetsDir, f);
        const ext = path.extname(f).toLowerCase();
        return fs.statSync(full).isFile() && SUPPORTED_EXTENSIONS.has(ext);
      } catch {
        return false;
      }
    });

    if (files.length === 0) return { success: false, message: "Nenhum arquivo suportado encontrado." };

    files.sort();
    let htmlCount = 0;
    let zipCount = 0;
    const metricsNote = (metrics || "").toString();

    for (const filename of files) {
      const baseName = path.parse(filename).name;
      const ext = path.extname(filename).toLowerCase();
      const isVideo = VIDEO_EXTENSIONS.has(ext);
      const assetPath = path.join(assetsDir, filename);

      const bannerDir = path.join(outputDir, baseName);
      try {
        fs.mkdirSync(bannerDir, { recursive: true });
      } catch (e) {
        return { success: false, message: `Erro ao criar pasta ${bannerDir}: ${e.message}` };
      }

      const htmlPath = path.join(bannerDir, "index.html");
      const localAssetPath = path.join(bannerDir, filename);
      const zipPath = path.join(bannerDir, `${baseName}.zip`);

      try {
        fs.copyFileSync(assetPath, localAssetPath);

        const htmlContent = buildHtmlContent(baseName, filename, clickUrl, isVideo, metricsNote);
        fs.writeFileSync(htmlPath, htmlContent, { encoding: "utf-8", flag: "w" });
        htmlCount++;

        await createZip(zipPath, htmlPath, localAssetPath, filename);
        zipCount++;
      } catch (err) {
        return { success: false, message: `Erro ao processar ${filename}: ${err.message}` };
      }
    }

    return { success: true, htmlCount, zipCount, outputDir };
  } catch (err) {
    return { success: false, message: err && err.message ? err.message : String(err) };
  }
});

ipcMain.handle("font:convert", async (_event, { inputPath, outputPath }) => {
  try {
    const convertScriptPath = path.join(__dirname, "scripts", "convert-font.py");
    
    // Create output directory
    fs.mkdirSync(outputPath, { recursive: true });
    
    // Run the Python conversion script using the virtual environment Python
    const { spawn } = require("child_process");
    const pythonExe = path.join(__dirname, ".venv", "Scripts", "python.exe");
    
    return new Promise((resolve) => {
      let output = "";
      let errorOutput = "";
      
      // Check if we're running in a venv, if not use system python
      const pythonCmd = fs.existsSync(pythonExe) ? pythonExe : "python";
      
      const pythonProcess = spawn(pythonCmd, [convertScriptPath, inputPath, outputPath]);
      
      pythonProcess.stdout.on("data", (data) => {
        const line = data.toString();
        output += line;
      });
      
      pythonProcess.stderr.on("data", (data) => {
        const line = data.toString();
        errorOutput += line;
        output += line;
      });
      
      pythonProcess.on("close", (code) => {
        if (code === 0) {
          // Delete the original input file after successful conversion
          try {
            fs.unlinkSync(inputPath);
            output += `\n[OK] Arquivo original removido apos conversao bem-sucedida.`;
          } catch (e) {
            output += `\n[AVISO] Nao foi possivel remover arquivo original: ${e.message}`;
          }
          
          resolve({ 
            success: true, 
            log: output 
          });
        } else {
          resolve({ 
            success: false, 
            log: output || errorOutput || "Erro desconhecido na conversao" 
          });
        }
      });
      
      pythonProcess.on("error", (err) => {
        resolve({ 
          success: false, 
          log: `Erro ao executar conversão: ${err.message}\n\nCertifique-se de que Python está instalado e fontTools está disponível.\nInstale com: pip install fontTools` 
        });
      });
    });
  } catch (err) {
    return { success: false, log: `Erro: ${err.message}` };
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.whenReady().then(createWindow);
