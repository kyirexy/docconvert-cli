#!/usr/bin/env node
/**
 * postinstall.js
 * npm 全局安装后自动检查环境并提示用户安装 skill
 */

const { execSync } = require('child_process');

function checkEnv() {
  console.log('\n[docconvert] Checking environment...\n');

  // Check Python
  const pythonCmds = ['python3', 'python', 'py'];
  let pythonFound = false;
  for (const cmd of pythonCmds) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      console.log(`[OK] Python found: ${cmd}`);
      pythonFound = true;
      break;
    } catch (e) {}
  }
  if (!pythonFound) {
    console.log('[ERROR] Python not found. Please install Python: https://www.python.org/downloads/');
  }

  // Check Pandoc
  try {
    execSync('pandoc --version', { stdio: 'ignore' });
    console.log('[OK] Pandoc found');
  } catch (e) {
    console.log('[WARN] Pandoc not found. Install: https://pandoc.org/installing.html');
    console.log('  Windows: winget install JohnMacFarlane.Pandoc');
  }

  // Check PDF engine
  const engines = ['xelatex', 'tectonic', 'pdflatex'];
  let pdfFound = false;
  for (const engine of engines) {
    try {
      execSync(`${engine} --version`, { stdio: 'ignore' });
      console.log(`[OK] PDF engine found: ${engine}`);
      pdfFound = true;
      break;
    } catch (e) {}
  }
  if (!pdfFound) {
    console.log('[WARN] No PDF engine found (xelatex/tectonic). PDF output will not work.');
    console.log('  Install MikTeX: winget install MikTex.MikTex');
  }

  console.log('');
}

function showSkillInstallGuide() {
  console.log('\n========================================');
  console.log('  🎉 docconvert-cli 安装成功！');
  console.log('========================================\n');
  console.log('  安装 Skill 到你的 Agent:\n');
  console.log('    docconvert --install           # 交互式选择');
  console.log('    docconvert --install --all    # 安装到所有 Agent\n');
  console.log('  支持的平台: Claude Code, Cursor, Windsurf, Copilot, Gemini CLI\n');
  console.log('========================================\n');
}

// Run
checkEnv();
showSkillInstallGuide();
