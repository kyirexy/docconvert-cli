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

### 二、安装 Skill 到 AI Agent

```bash
# 安装到所有支持的 Agent
docconvert --install --all

# 或交互式选择
docconvert --install
```

### 三、直接使用

```bash
# md -> docx（默认）
docconvert input.md

# 指定格式
docconvert input.md -t html
docconvert input.md -t pdf

# 使用模板（毕业论文/正式文档）
docconvert 论文.md --template templates/default.docx
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
| Claude Code | `docconvert --install --claude` |
| Cursor | `docconvert --install --cursor` |
| Windsurf | `docconvert --install --windsurf` |
| GitHub Copilot | `docconvert --install --copilot` |
| Gemini CLI | `docconvert --install --gemini` |

全部安装：`docconvert --install --all`

---

## 项目结构

```
docconvert-cli/
├── docconvert.py              # Python 主入口
├── bin/docconvert.js         # npm CLI 入口
├── scripts/install.js         # 跨 Agent Skill 安装器
├── skills/                   # Agent Skill 文件
│   ├── SKILL.md            # Claude Code
│   ├── SKILL.cursor.md    # Cursor
│   └── SKILL.windsurf.md  # Windsurf
├── convert/                  # 转换模块
└── templates/               # Word 模板
```

---

## 常见问题

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
