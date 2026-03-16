const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const joinRoot = path.resolve(__dirname, "..");
const gifExportRoot = path.resolve(joinRoot, "..", "GIF EXPORT");
const cliExePath = path.join(gifExportRoot, "dist", "GIF-Still-Exporter-CLI.exe");
const buildScriptPath = path.join(gifExportRoot, "scripts", "build.ps1");
const cliSourcePath = path.join(gifExportRoot, "cli.py");
const packageSourceDir = path.join(gifExportRoot, "gif_still_exporter");

const fail = (message) => {
  console.error(`[build:gif-exporter] ${message}`);
  process.exit(1);
};

const listPythonFiles = (dir) => {
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...listPythonFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".py")) {
      result.push(fullPath);
    }
  }
  return result;
};

const getMtimeMs = (filePath) => fs.statSync(filePath).mtimeMs;

const shouldRebuildCli = () => {
  if (!fs.existsSync(cliExePath)) return true;
  if (!fs.existsSync(cliSourcePath)) return true;
  if (!fs.existsSync(packageSourceDir)) return true;

  const exeMtime = getMtimeMs(cliExePath);
  const sourceFiles = [cliSourcePath, ...listPythonFiles(packageSourceDir)];
  const newestSourceMtime = sourceFiles.reduce((maxMtime, sourceFile) => {
    try {
      return Math.max(maxMtime, getMtimeMs(sourceFile));
    } catch {
      return maxMtime;
    }
  }, 0);

  return newestSourceMtime > exeMtime;
};

if (!shouldRebuildCli()) {
  console.log(`[build:gif-exporter] CLI encontrado: ${cliExePath}`);
  process.exit(0);
}

if (!fs.existsSync(buildScriptPath)) {
  fail(`Script de build nao encontrado: ${buildScriptPath}`);
}

console.log("[build:gif-exporter] CLI nao encontrado. Gerando com PyInstaller...");

const result = spawnSync(
  "powershell",
  ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", buildScriptPath],
  {
    cwd: gifExportRoot,
    stdio: "inherit",
    windowsHide: true,
  }
);

if (result.error) {
  fail(`Erro ao executar PowerShell: ${result.error.message}`);
}

if (result.status !== 0) {
  fail(`Build do exportador falhou com codigo ${result.status}.`);
}

if (!fs.existsSync(cliExePath)) {
  fail(`Build finalizado, mas EXE CLI nao encontrado em: ${cliExePath}`);
}

console.log(`[build:gif-exporter] CLI pronto: ${cliExePath}`);
