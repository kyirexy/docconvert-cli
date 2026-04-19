#!/usr/bin/env node
/**
 * postinstall.js
 * npm 全局安装后自动检查环境并安装 Skill（使用软链接）
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_NAME = 'docconvert';

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

// Agent 配置
const AGENTS = {
  claude: {
    name: 'Claude Code',
    detect: () => {
      try {
        fs.accessSync(path.join(os.homedir(), '.claude'));
        return true;
      } catch {
        return false;
      }
    },
    getInstallPath: () => path.join(os.homedir(), '.claude', 'skills', SKILL_NAME),
    getSymlinkTarget: () => path.join(__dirname, '..', 'skills')
  },
  cursor: {
    name: 'Cursor',
    detect: () => {
      try {
        fs.accessSync(path.join(os.homedir(), '.cursor'));
        return true;
      } catch {
        return false;
      }
    },
    getInstallPath: () => path.join(os.homedir(), '.cursor', 'rules', `${SKILL_NAME}.mdc`),
    getSymlinkTarget: () => path.join(__dirname, '..', 'skills', 'SKILL.cursor.md')
  },
  windsurf: {
    name: 'Windsurf',
    detect: () => {
      try {
        fs.accessSync(path.join(os.homedir(), '.codeium', 'windsurf'));
        return true;
      } catch {
        return false;
      }
    },
    getInstallPath: () => path.join(os.homedir(), '.codeium', 'windsurf', 'skills', SKILL_NAME),
    getSymlinkTarget: () => path.join(__dirname, '..', 'skills')
  },
  gemini: {
    name: 'Gemini CLI',
    detect: () => {
      try {
        fs.accessSync(path.join(os.homedir(), '.gemini', 'antigravity'));
        return true;
      } catch {
        return false;
      }
    },
    getInstallPath: () => path.join(os.homedir(), '.gemini', 'antigravity', 'skills', SKILL_NAME),
    getSymlinkTarget: () => path.join(__dirname, '..', 'skills')
  }
};

// 创建软链接
async function createSymlink(src, dest) {
  try {
    const stat = fs.statSync(dest).catch(() => null);
    if (stat) {
      if (stat.isSymbolicLink()) {
        fs.unlinkSync(dest);
      } else if (stat.isDirectory()) {
        fs.rmSync(dest, { recursive: true });
      } else {
        fs.unlinkSync(dest);
      }
    }
    fs.symlinkSync(src, dest, 'junction');
    return true;
  } catch (err) {
    console.error(`[ERROR] ${dest}: ${err.message}`);
    return false;
  }
}

// 自动安装 Skill（软链接模式）
async function autoInstallSkills() {
  console.log('\n========================================');
  console.log('  🎉 docconvert-cli 安装成功！');
  console.log('========================================\n');

  const symlinkTarget = path.join(__dirname, '..', 'skills');
  const SKILL_SOURCE = path.join(__dirname, '..', 'skills');

  if (!fs.existsSync(SKILL_SOURCE)) {
    console.log('[WARN] Skill source not found, skipping Skill install.');
    return;
  }

  console.log('📦 正在安装 Skill 到 Agent (软链接模式)...\n');

  let installed = 0;

  for (const [id, agent] of Object.entries(AGENTS)) {
    if (!agent.detect()) continue;

    const installPath = agent.getInstallPath();
    const symlinkTarget = agent.getSymlinkTarget();

    if (createSymlink(symlinkTarget, installPath)) {
      console.log(`  [OK] ${agent.name}: ${installPath}`);
      installed++;
    }
  }

  if (installed > 0) {
    console.log(`\n✅ Skill 安装完成！成功: ${installed}`);
    console.log('   💡 使用软链接模式，npm 更新后 Skill 自动同步！');
    console.log('   请重启你的 Agent 使 Skill 生效。\n');
  } else {
    console.log('\n⚠️  没有检测到已安装的 Agent。\n');
  }

  console.log('========================================\n');
  console.log('  手动安装 Skill 命令:\n');
  console.log('    docconvert --install --all --symlink  # 安装到所有 Agent');
  console.log('    docconvert --install --claude      # 仅 Claude Code\n');
  console.log('========================================\n');
}

// 运行
checkEnv();
autoInstallSkills().catch(console.error);