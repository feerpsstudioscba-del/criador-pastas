const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const GIF_EXPORTER_DIR = path.join(__dirname, "..", "gif-exporter");
const GIF_EXPORTER_EXE = path.join(GIF_EXPORTER_DIR, "gif-exporter.exe");

function log(message) {
  console.log(`[ensure-gif-exporter] ${message}`);
}

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`Created directory: ${dirPath}`);
  }
}

function downloadGifExporter() {
  log("Downloading gif-exporter.exe...");

  // For now, we'll assume the exe is already present or needs to be manually added
  // In a real scenario, you would download from a URL or build it
  const exePath = path.join(GIF_EXPORTER_DIR, "gif-exporter.exe");

  if (!fs.existsSync(exePath)) {
    log("gif-exporter.exe not found. Please ensure it's present in the gif-exporter directory.");
    log("You can download it from: https://github.com/feerpsstudioscba/gif-exporter/releases");
    return false;
  }

  log("gif-exporter.exe is ready.");
  return true;
}

function buildGifExporter() {
  log("Building gif-exporter from source...");

  // This would be the build process if we had the source
  // For now, we'll just check if the exe exists
  if (fs.existsSync(GIF_EXPORTER_EXE)) {
    log("gif-exporter.exe already exists.");
    return true;
  }

  log("gif-exporter.exe not found. Attempting to build...");

  try {
    // Placeholder for build commands
    // execSync("cargo build --release", { cwd: GIF_EXPORTER_DIR, stdio: "inherit" });
    log("Build process not implemented yet.");
    return false;
  } catch (error) {
    log(`Build failed: ${error.message}`);
    return false;
  }
}

function main() {
  log("Ensuring gif-exporter is available...");

  ensureDirectory(GIF_EXPORTER_DIR);

  // Try to download first, then build if download fails
  if (downloadGifExporter()) {
    log("gif-exporter setup complete.");
    return;
  }

  if (buildGifExporter()) {
    log("gif-exporter built successfully.");
    return;
  }

  log("Failed to setup gif-exporter. Please ensure gif-exporter.exe is available.");
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { ensureDirectory, downloadGifExporter, buildGifExporter };
