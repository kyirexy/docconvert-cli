# docconvert

AI 原生的本地文档格式转换工具，支持 Markdown、Word、HTML、PDF 互相转换，基于 Pandoc，纯本地处理。

[![npm version](https://img.shields.io/npm/v/docconvert-cli)](https://www.npmjs.com/package/docconvert-cli)
[![license](https://img.shields.io/npm/l/docconvert-cli)](LICENSE)

> **TL;DR**: 一键将 md/docx/html/pdf 互相转换，中文支持完善，**支持 AI Agent 智能调用**。

[快速开始](#快速开始) · [在 AI Agent 中使用](#在-ai-agent-中使用) · [命令行使用](#命令行使用) · [环境要求](#环境要求)

---

## 在 AI Agent 中使用（推荐）

安装 Skill 后，在 Claude Code、Cursor、Windsurf 等 AI Agent 中，**直接描述你的需求**即可：

### 常用场景

| 你的需求 | 在 Agent 中这样说 |
|---------|------------------|
| md 转 Word | "帮我把这个 md 文件转成 word" |
| 毕业论文格式 | "按毕业论文格式导出这个 md" |
| Word 转 md | "把这个 word 转成 markdown" |
| 转 PDF | "转成 pdf 格式" |
| 批量转换 | "把这个文件夹里的 md 都转成 docx" |
| 套用模板 | "用模板套用转成 word" |

### 示例对话

```
你: 帮我把论文.md 转成 word，按毕业论文格式
Agent:
  docconvert 论文.md --template templates/default.docx
  ✅ 毕业论文.docx 已生成到 ./word/ 目录
```

### Skill 触发方式

1. **Slash 命令**: 输入 `/docconvert`
2. **自然语言**: "转成 word"、"导出 docx"、"帮我转换文档"
3. **批量处理**: "批量转换这个文件夹"

---

## 快速开始

### 一、安装

```bash
npm install -g docconvert-cli
```

### 二、自动安装 Skill

npm 安装后会自动安装 Skill 到检测到的 Agent（使用软链接，npm 更新后 Skill 自动同步）：

```
========================================
  🎉 docconvert-cli 安装成功！
========================================

📦 正在安装 Skill 到 Agent (软链接模式)...

  [OK] Claude Code: ~/.claude/skills/docconvert
  [OK] Gemini CLI: ~/.gemini/antigravity/skills/docconvert

✅ Skill 安装完成！请重启你的 Agent 使 Skill 生效。
========================================
```

### 三、手动安装/更新 Skill

```bash
# 安装到所有 Agent（软链接模式，npm 更新后自动同步）
docconvert --install --all --symlink

# 复制模式（静态安装）
docconvert --install --all

# 卸载 Skill
docconvert --install --unlink
```

---

## 命令行使用

### 基本转换

```bash
docconvert <源文件>              # 自动识别格式，输出到对应目录
docconvert <源文件> -t docx     # 指定目标格式
docconvert <源文件> --output-dir ./输出/  # 指定输出目录
```

### 模板套用

```bash
# 使用内置模板
docconvert 论文.md --template default.docx

# 使用自定义模板
docconvert 文章.md --template 我的模板.docx
```

### 批量转换

```bash
docconvert --batch ./目录/
docconvert --batch ./docs/ --output-dir ./converted/
```

### 环境检查

```bash
docconvert --check
```

---

## 功能列表

| 功能 | 说明 |
|------|------|
| md → docx | Markdown 转 Word，支持模板 |
| docx → md | Word 转 Markdown，提取图片 |
| md → html | Markdown 转网页（自包含） |
| md → pdf | Markdown 转 PDF |
| docx → pdf | Word 转 PDF |
| 批量转换 | 整个目录一键转换 |
| 模板套用 | 毕业论文/报告/合同等格式 |

---

## 环境要求

| 依赖 | 说明 | 安装 |
|------|------|------|
| Python 3.6+ | 必需 | [python.org](https://www.python.org/downloads/) |
| Pandoc | 必需 | `winget install JohnMacFarlane.Pandoc` |
| xelatex | 仅 PDF | `winget install MikTex.MikTex` |

---

## 支持的平台

| Agent | 安装命令 |
|-------|---------|
| Claude Code | `docconvert --install --claude --symlink` |
| Cursor | `docconvert --install --cursor --symlink` |
| Windsurf | `docconvert --install --windsurf --symlink` |
| GitHub Copilot | `docconvert --install --copilot --symlink` |
| Gemini CLI | `docconvert --install --gemini --symlink` |

全部安装：`docconvert --install --all --symlink`

---

## 项目结构

```
docconvert-cli/
├── skill.json                 # 包配置
├── src/
│   ├── platforms/           # 平台配置
│   │   ├── claude.json
│   │   ├── cursor.json
│   │   └── windsurf.json
│   └── base/
│       ├── skill-content.md  # 通用 Skill 内容
│       └── examples.md      # 快速参考
├── skills/                   # Agent Skill 文件
│   ├── SKILL.md            # Claude Code
│   ├── SKILL.cursor.md     # Cursor
│   └── SKILL.windsurf.md   # Windsurf
├── convert/                  # 转换模块
├── templates/               # Word 模板
└── scripts/
    ├── install.js          # Skill 安装器
    └── postinstall.js       # npm 安装后钩子
```

---

## 常见问题

**Q: 软链接模式 vs 复制模式？**

- **软链接（--symlink）**：npm 更新后 Skill 自动同步，推荐
- **复制（默认）**：文件静态拷贝，不受 npm 更新影响

**Q: 转换后中文乱码？**
确保原文件编码为 UTF-8。

**Q: PDF 输出失败？**
运行 `docconvert --check` 检查 PDF 引擎。

**Q: 如何在 Agent 中触发？**
直接说 "帮我转成 word" 或输入 `/docconvert`

---

## 支持

有问题请提 [Issues](https://github.com/kyirexy/docconvert-cli/issues)

---

## 许可证

MIT - 查看 [LICENSE](LICENSE)
