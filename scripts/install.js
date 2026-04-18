#!/usr/bin/env node
/**
 * install.js
 * 跨 Agent Skill 安装器
 * 支持 Claude Code、Cursor、Windsurf、GitHub Copilot、Gemini CLI
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
    getInstallPath: (skillName) => path.join(os.homedir(), '.claude', 'skills', skillName),
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
    getInstallPath: () => path.join(os.homedir(), '.cursor', 'rules'),
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
    getInstallPath: (skillName) => path.join(os.homedir(), '.codeium', 'windsurf', 'skills', skillName),
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
    getInstallPath: (skillName) => path.join(os.homedir(), '.github', 'agents', skillName),
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
    getInstallPath: (skillName) => path.join(os.homedir(), '.gemini', 'antigravity', 'skills', skillName),
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
    gemini: false
  };

  for (const arg of args) {
    if (arg === '--all' || arg === '-a') options.all = true;
    if (arg === '--claude' || arg === '-c') options.claude = true;
    if (arg === '--cursor') options.cursor = true;
    if (arg === '--windsurf' || arg === '-w') options.windsurf = true;
    if (arg === '--copilot') options.copilot = true;
    if (arg === '--gemini') options.gemini = true;
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
  --help      显示帮助信息

示例:
  docconvert-install           # 交互式选择
  docconvert-install --all     # 安装到所有
  docconvert-install --claude  # 仅 Claude Code
      `);
      process.exit(0);
    }
  }

  return options;
}

// 复制目录
async function copyDir(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

// 安装到 Claude Code / Windsurf / Copilot / Gemini（直接复制对应的 SKILL 文件）
async function installToSkill(skillPath, agentName, skillFileName) {
  const srcFile = path.join(SKILL_SOURCE_DIR, skillFileName);

  // 创建 skill 目录
  await fs.promises.mkdir(skillPath, { recursive: true });

  // 复制单个 skill 文件
  await fs.promises.copyFile(srcFile, path.join(skillPath, 'SKILL.md'));

  console.log(`  [OK] ${agentName}: ${skillPath}`);
}

// 安装到 Cursor（转换为 .mdc 格式）
async function installToCursor(rulesPath) {
  const srcFile = path.join(SKILL_SOURCE_DIR, 'SKILL.cursor.md');
  const destFile = path.join(rulesPath, `${SKILL_NAME}.mdc`);

  // 读取 Cursor 格式的 skill 文件
  const content = await fs.promises.readFile(srcFile, 'utf-8');

  // 创建 rules 目录
  await fs.promises.mkdir(rulesPath, { recursive: true });

  // 写入 .mdc 文件
  await fs.promises.writeFile(destFile, content, 'utf-8');

  console.log(`  [OK] Cursor: ${destFile}`);
}

// 主安装函数
async function install(targets) {
  let installed = 0;
  let skipped = 0;

  for (const agentId of targets) {
    const agent = AGENTS[agentId];
    if (!agent) continue;

    try {
      if (agentId === 'cursor') {
        await installToCursor(agent.getInstallPath());
      } else {
        await installToSkill(agent.getInstallPath(SKILL_NAME), agent.name, agent.getSkillFile());
      }
      installed++;
    } catch (err) {
      console.error(`  [ERROR] ${agent.name}: ${err.message}`);
      skipped++;
    }
  }

  return { installed, skipped };
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

  if (availableAgents.length === 0) {
    console.log('\n⚠️  未检测到任何支持的 Agent 或缺少对应的 Skill 文件。');
    console.log('  请确保已安装以下工具之一：Claude Code、Cursor、Windsurf');
    process.exit(1);
  }

  let targets = [];

  // 解析安装目标
  if (args.all) {
    // 安装到所有检测到的
    targets = availableAgents.map(a => a.id);
    console.log(`\n📦 将安装到所有 ${targets.length} 个检测到的 Agent...\n`);
  } else if (args.claude || args.cursor || args.windsurf || args.copilot || args.gemini) {
    // 指定 Agent
    const argMap = { claude: args.claude, cursor: args.cursor, windsurf: args.windsurf, copilot: args.copilot, gemini: args.gemini };
    targets = Object.entries(argMap)
      .filter(([_, enabled]) => enabled)
      .map(([id, _]) => id)
      .filter(id => availableAgents.some(a => a.id === id));

    if (targets.length === 0) {
      console.log('\n⚠️  指定的目标 Agent 未检测到或缺少 Skill 文件。');
      process.exit(1);
    }
    console.log(`\n📦 将安装到指定的 ${targets.length} 个 Agent...\n`);
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
  }

  // 执行安装
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const result = await install(targets);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (result.installed > 0) {
    console.log(`✅ 安装完成！成功: ${result.installed}${result.skipped > 0 ? `, 失败: ${result.skipped}` : ''}`);
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