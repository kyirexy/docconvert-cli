#!/usr/bin/env node
/**
 * docconvert CLI wrapper
 * Detects Python environment and forwards to Python script
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Detect Python executable
function findPython() {
  const candidates = ['python3', 'python', 'py'];
  for (const cmd of candidates) {
    try {
      const result = require('child_process').spawnSync(cmd, ['--version'], { encoding: 'utf-8' });
      if (result.status === 0) return cmd;
    } catch (e) {}
  }
  return null;
}

// Check environment
function checkEnv() {
  console.log('[docconvert] Checking environment...\n');

  // Check Python
  const python = findPython();
  if (!python) {
    console.log('[ERROR] Python not found.');
    console.log('Please install Python: https://www.python.org/downloads/');
    return false;
  }
  console.log(`[OK] Python found: ${python}`);

  // Check Pandoc
  try {
    const result = require('child_process').spawnSync('pandoc', ['--version'], { encoding: 'utf-8' });
    if (result.status === 0) {
      console.log('[OK] Pandoc found');
    }
  } catch (e) {
    console.log('[WARN] Pandoc not found. Install: https://pandoc.org/installing.html');
    console.log('  Windows: winget install JohnMacFarlane.Pandoc');
    console.log('  macOS: brew install pandoc');
    console.log('  Linux: sudo apt install pandoc');
  }

  // Check PDF engine
  const engines = ['xelatex', 'tectonic', 'pdflatex'];
  let pdfEngine = null;
  for (const engine of engines) {
    try {
      const result = require('child_process').spawnSync(engine, ['--version'], { encoding: 'utf-8' });
      if (result.status === 0) {
        pdfEngine = engine;
        console.log(`[OK] PDF engine found: ${engine}`);
        break;
      }
    } catch (e) {}
  }
  if (!pdfEngine) {
    console.log('[WARN] No PDF engine found (xelatex/tectonic). PDF output will not work.');
    console.log('  Install MikTeX: winget install MikTex.MikTex');
  }

  return true;
}

// Run skill installer
function runInstaller(args) {
  const { spawn } = require('child_process');
  const installScript = path.join(__dirname, '..', 'scripts', 'install.js');

  if (!fs.existsSync(installScript)) {
    console.error('[ERROR] install.js not found.');
    process.exit(1);
  }

  const child = spawn('node', [installScript, ...args], {
    stdio: 'inherit',
    shell: false
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

// Forward to Python script
function main() {
  const args = process.argv.slice(2);

  // --check flag: show environment info
  if (args.includes('--check') || args.includes('-k')) {
    checkEnv();
    return;
  }

  // --install flag: run skill installer
  if (args.includes('--install')) {
    const installArgs = args.filter(a => !a.startsWith('--install'));
    runInstaller(installArgs);
    return;
  }

  // Find Python
  const python = findPython();
  if (!python) {
    console.error('[ERROR] Python not found. Please install Python first.');
    process.exit(1);
  }

  // Find the Python script
  const scriptPath = path.join(__dirname, '..', 'docconvert.py');

  if (!fs.existsSync(scriptPath)) {
    console.error(`[ERROR] docconvert.py not found at: ${scriptPath}`);
    process.exit(1);
  }

  // Spawn Python with all arguments
  const child = spawn(python, [scriptPath, ...args], {
    stdio: 'inherit',
    shell: false
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main();
