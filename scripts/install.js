#!/usr/bin/env node
/**
 * install.js
 * 跨 Agent Skill 安装器
 * 支持 Claude Code、Cursor、Windsurf、GitHub Copilot、Gemini CLI
 *
 * 支持两种安装模式：
 * - 复制模式（默认）：复制文件到 Agent 目录
 * - 软链接模式（--symlink）：创建符号链接，npm 更新后自动同步
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const prompts = require('prompts');

const SKILL_NAME = 'docconvert';
const SKILL_SOURCE_DIR = path.join(__dirname, '..', 'skills');

// Agent 配置
const AGENTS = {
  claude: {
    id: 'claude',
    name: 'Claude Code',
    detect: async () => {
      try {
        await fs.promises.access(path.join(os.homedir(), '.claude'));
        return true;
      } catch {
        return false;
      }
    },
    getInstallPath: () => path.join(os.homedir(), '.claude', 'skills', SKILL_NAME),
    getSymlinkTarget: () => path.join(__dirname, '..', 'skills'),
    getSkillFile: () => 'SKILL.md',
    format: 'skill'
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    detect: async () => {
      try {
        await fs.promises.access(path.join(os.homedir(), '.cursor'));
        return true;
      } catch {
        return false;
      }
    },
    getInstallPath: () => path.join(os.homedir(), '.cursor', 'rules', `${SKILL_NAME}.mdc`),
    getSymlinkTarget: () => path.join(__dirname, '..', 'skills', 'SKILL.cursor.md'),
    getSkillFile: () => 'SKILL.cursor.md',
    format: 'mdc'
  },
  windsurf: {
    id: 'windsurf',
    name: 'Windsurf',
    detect: async () => {
      try {
        await fs.promises.access(path.join(os.homedir(), '.codeium', 'windsurf'));
        return true;
      } catch {
        return false;
      }
    },
    getInstallPath: () => path.join(os.homedir(), '.codeium', 'windsurf', 'skills', SKILL_NAME),
    getSymlinkTarget: () => path.join(__dirname, '..', 'skills'),
    getSkillFile: () => 'SKILL.windsurf.md',
    format: 'skill'
  },
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    detect: async () => {
      try {
        await fs.promises.access(path.join(os.homedir(), '.github'));
        return true;
      } catch {
        return false;
      }
    },
    getInstallPath: () => path.join(os.homedir(), '.github', 'agents', SKILL_NAME),
    getSymlinkTarget: () => path.join(__dirname, '..', 'skills'),
    getSkillFile: () => 'SKILL.md',
    format: 'skill'
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini CLI',
    detect: async () => {
      try {
        await fs.promises.access(path.join(os.homedir(), '.gemini', 'antigravity'));
        return true;
      } catch {
        return false;
      }
    },
    getInstallPath: () => path.join(os.homedir(), '.gemini', 'antigravity', 'skills', SKILL_NAME),
    getSymlinkTarget: () => path.join(__dirname, '..', 'skills'),
    getSkillFile: () => 'SKILL.md',
    format: 'skill'
  }
};

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    all: false,
    claude: false,
    cursor: false,
    windsurf: false,
    copilot: false,
    gemini: false,
    symlink: false,
    unlink: false
  };

  for (const arg of args) {
    if (arg === '--all' || arg === '-a') options.all = true;
    if (arg === '--claude' || arg === '-c') options.claude = true;
    if (arg === '--cursor') options.cursor = true;
    if (arg === '--windsurf' || arg === '-w') options.windsurf = true;
    if (arg === '--copilot') options.copilot = true;
    if (arg === '--gemini') options.gemini = true;
    if (arg === '--symlink' || arg === '--link' || arg === '-s') options.symlink = true;
    if (arg === '--unlink' || arg === '-r') options.unlink = true;
    if (arg === '--help' || arg === '-h') {
      console.log(`
docconvert-install - 跨 Agent Skill 安装器

用法: docconvert-install [选项]

选项:
  --all       安装到所有检测到的 Agent
  --claude    仅安装到 Claude Code
  --cursor    仅安装到 Cursor
  --windsurf  仅安装到 Windsurf
  --copilot   仅安装到 GitHub Copilot
  --gemini    仅安装到 Gemini CLI
  --symlink   使用软链接安装（npm 更新后 Skill 自动同步）
  --unlink    卸载 Skill（删除软链接或安装目录）
  --help      显示帮助信息

示例:
  docconvert-install --all           # 复制安装到所有
  docconvert-install --all --symlink # 软链接安装（推荐）
  docconvert-install --unlink        # 卸载所有 Agent 的 Skill
      `);
      process.exit(0);
    }
  }

  return options;
}

// 创建符号链接（目录）
async function createSymlinkDir(src, dest) {
  try {
    // 检查目标是否已存在
    const destStat = await fs.promises.stat(dest).catch(() => null);
    if (destStat) {
      if (destStat.isSymbolicLink()) {
        // 已经是软链接，先删除
        await fs.promises.unlink(dest);
      } else if (destStat.isDirectory()) {
        // 是目录，删除它
        await fs.promises.rm(dest, { recursive: true });
      }
    }
    // 创建符号链接
    await fs.promises.symlink(src, dest, 'junction');
  } catch (err) {
    throw err;
  }
}

// 创建符号链接（文件）
async function createSymlinkFile(src, dest) {
  try {
    // 检查目标是否已存在
    const destStat = await fs.promises.stat(dest).catch(() => null);
    if (destStat) {
      if (destStat.isSymbolicLink()) {
        await fs.promises.unlink(dest);
      } else {
        await fs.promises.unlink(dest);
      }
    }
    await fs.promises.symlink(src, dest, 'file');
  } catch (err) {
    throw err;
  }
}

// 复制单个文件
async function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  await fs.promises.mkdir(destDir, { recursive: true });
  await fs.promises.copyFile(src, dest);
}

// 软链接安装（Claude Code / Windsurf / Copilot / Gemini）
async function symlinkToSkill(installPath, agentName, agentId) {
  const agent = AGENTS[agentId];
  const symlinkTarget = agent.getSymlinkTarget();

  if (agentId === 'cursor') {
    // Cursor: 软链接到单个 .mdc 文件
    await createSymlinkFile(symlinkTarget, installPath);
  } else {
    // 其他 Agent: 软链接到 skills 目录
    await createSymlinkDir(symlinkTarget, installPath);
  }

  console.log(`  [OK] ${agentName}: ${installPath} → ${symlinkTarget}`);
}

// 复制安装（Claude Code / Windsurf / Copilot / Gemini）
async function copyToSkill(installPath, agentName, skillFileName) {
  const srcFile = path.join(SKILL_SOURCE_DIR, skillFileName);
  const destFile = path.join(installPath, 'SKILL.md');

  await fs.promises.mkdir(installPath, { recursive: true });
  await copyFile(srcFile, destFile);

  console.log(`  [OK] ${agentName}: ${destFile}`);
}

// 软链接安装 Cursor
async function symlinkCursor(installPath) {
  const agent = AGENTS['cursor'];
  const symlinkTarget = agent.getSymlinkTarget();
  await createSymlinkFile(symlinkTarget, installPath);
  console.log(`  [OK] Cursor: ${installPath} → ${symlinkTarget}`);
}

// 复制安装 Cursor
async function copyCursor(installPath) {
  const srcFile = path.join(SKILL_SOURCE_DIR, 'SKILL.cursor.md');
  await fs.promises.mkdir(path.dirname(installPath), { recursive: true });
  await copyFile(srcFile, installPath);
  console.log(`  [OK] Cursor: ${installPath}`);
}

// 卸载 Skill
async function uninstallSkill(agentId, agentName, installPath) {
  try {
    const stat = await fs.promises.stat(installPath).catch(() => null);
    if (!stat) {
      return false; // 不存在
    }

    if (stat.isSymbolicLink()) {
      await fs.promises.unlink(installPath);
    } else if (stat.isDirectory()) {
      await fs.promises.rm(installPath, { recursive: true });
    } else {
      await fs.promises.unlink(installPath);
    }

    console.log(`  [OK] ${agentName}: 已卸载`);
    return true;
  } catch (err) {
    console.error(`  [ERROR] ${agentName}: ${err.message}`);
    return false;
  }
}

// 主安装函数
async function install(targets, useSymlink = false) {
  let installed = 0;
  let skipped = 0;

  for (const agentId of targets) {
    const agent = AGENTS[agentId];
    if (!agent) continue;

    try {
      if (useSymlink) {
        if (agentId === 'cursor') {
          await symlinkCursor(agent.getInstallPath());
        } else {
          await symlinkToSkill(agent.getInstallPath(), agent.name, agentId);
        }
      } else {
        if (agentId === 'cursor') {
          await copyCursor(agent.getInstallPath());
        } else {
          await copyToSkill(agent.getInstallPath(), agent.name, agent.getSkillFile());
        }
      }
      installed++;
    } catch (err) {
      console.error(`  [ERROR] ${agent.name}: ${err.message}`);
      skipped++;
    }
  }

  return { installed, skipped };
}

// 主卸载函数
async function uninstall(targets) {
  let uninstalled = 0;

  for (const agentId of targets) {
    const agent = AGENTS[agentId];
    if (!agent) continue;

    if (await uninstallSkill(agentId, agent.name, agent.getInstallPath())) {
      uninstalled++;
    }
  }

  return { uninstalled };
}

// 主函数
async function main() {
  console.log('\n🚀 docconvert Skill 安装器\n');

  const args = parseArgs();

  // 检查 skill 源目录
  if (!fs.existsSync(SKILL_SOURCE_DIR)) {
    console.error(`[ERROR] Skill 源目录不存在: ${SKILL_SOURCE_DIR}`);
    process.exit(1);
  }

  // 探测已安装的 Agent
  console.log('🔍 正在扫描系统中的 Agent...\n');
  const detected = [];

  for (const [id, agent] of Object.entries(AGENTS)) {
    const isDetected = await agent.detect();
    const skillFile = path.join(SKILL_SOURCE_DIR, agent.getSkillFile());
    const hasSkillFile = fs.existsSync(skillFile);
    detected.push({
      id,
      name: agent.name,
      isDetected,
      hasSkillFile,
      format: agent.format
    });
    console.log(`  ${isDetected ? '[✓]' : '[ ]'} ${agent.name}${isDetected ? ' (已检测)' : ''}`);
  }

  const availableAgents = detected.filter(a => a.isDetected && a.hasSkillFile);

  // 卸载模式
  if (args.unlink) {
    console.log('\n📦 正在卸载 Skill...\n');
    const targets = availableAgents.map(a => a.id);
    if (targets.length === 0) {
      console.log('⚠️  没有已安装的 Skill。');
      return;
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const result = await uninstall(targets);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ 卸载完成！已卸载 ${result.uninstalled} 个。\n`);
    return;
  }

  if (availableAgents.length === 0) {
    console.log('\n⚠️  未检测到任何支持的 Agent 或缺少对应的 Skill 文件。');
    console.log('  请确保已安装以下工具之一：Claude Code、Cursor、Windsurf');
    process.exit(1);
  }

  let targets = [];

  // 解析安装目标
  if (args.all) {
    targets = availableAgents.map(a => a.id);
    console.log(`\n📦 将安装到所有 ${targets.length} 个检测到的 Agent...`);
    console.log(args.symlink ? '(使用软链接，npm 更新后自动同步)\n' : '(复制文件)\n');
  } else if (args.claude || args.cursor || args.windsurf || args.copilot || args.gemini) {
    const argMap = { claude: args.claude, cursor: args.cursor, windsurf: args.windsurf, copilot: args.copilot, gemini: args.gemini };
    targets = Object.entries(argMap)
      .filter(([_, enabled]) => enabled)
      .map(([id, _]) => id)
      .filter(id => availableAgents.some(a => a.id === id));

    if (targets.length === 0) {
      console.log('\n⚠️  指定的目标 Agent 未检测到或缺少 Skill 文件。');
      process.exit(1);
    }
    console.log(`\n📦 将安装到指定的 ${targets.length} 个 Agent...`);
    console.log(args.symlink ? '(使用软链接，npm 更新后自动同步)\n' : '(复制文件)\n');
  } else {
    // 交互式选择
    console.log('\n📋 请选择要安装 Skill 的目标 Agent:\n');

    const choices = availableAgents.map(a => ({
      title: `${a.name} (${a.format})`,
      value: a.id,
      selected: true
    }));

    const response = await prompts({
      type: 'multiselect',
      name: 'targets',
      message: '选择 Agent (按空格键选择，回车确认):',
      choices
    });

    targets = response.targets || [];

    if (targets.length === 0) {
      console.log('\n⚠️  未选择任何 Agent，取消安装。');
      process.exit(0);
    }

    console.log(args.symlink ? '\n(使用软链接，npm 更新后自动同步)\n' : '\n(复制文件)\n');
  }

  // 执行安装
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const result = await install(targets, args.symlink);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (result.installed > 0) {
    console.log(`✅ 安装完成！成功: ${result.installed}${result.skipped > 0 ? `, 失败: ${result.skipped}` : ''}`);
    if (args.symlink) {
      console.log('   💡 提示：使用软链接模式，npm 更新后 Skill 自动同步！');
    }
    console.log('   请重启你的 Agent 使 Skill 生效。\n');
  } else {
    console.log('❌ 安装失败。\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n[ERROR]', err.message);
  process.exit(1);
});