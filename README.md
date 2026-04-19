# docconvert

AI 原生的本地文档格式转换工具，支持 Markdown、Word、HTML、PDF 互相转换，基于 Pandoc，纯本地处理。

[![npm version](https://img.shields.io/npm/v/docconvert-cli)](https://www.npmjs.com/package/docconvert-cli)
[![license](https://img.shields.io/npm/l/docconvert-cli)](LICENSE)

> **TL;DR**: 给需要处理文档格式的开发者/写作者使用，一键将 md/docx/html/pdf 互相转换，中文支持完善，开箱即用。

[快速开始](#快速开始) · [功能列表](#功能列表) · [环境要求](#环境要求) · [支持平台](#支持平台)

---

## 为什么选 docconvert？

- **格式全覆盖**：支持 md ↔ docx ↔ html ↔ pdf 五种格式互转
- **中文优化**：自动修复中文字体（黑体、宋体），告别乱码
- **批量转换**：一行命令转换整个目录
- **跨 Agent 支持**：一键安装 Skill 到 Claude Code、Cursor、Windsurf 等主流 Agent

---

## 快速开始

### 安装

```bash
npm install -g docconvert-cli
```

### 第一个示例

```bash
# md 转 docx（输出到 ./word/）
docconvert input.md

# 指定目标格式
docconvert input.md -t html
docconvert input.md -t pdf
docconvert input.docx -t md
```

**预期输出：**

```
[CONVERT] input.md -> input.docx (DOCX)
[FONT] Fixed: SimHei (headings), SimSun (body)
[OK] ./word/input.docx
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
| 模板套用 | 自定义 Word 模板 |

---

## 详细使用

### 基本转换

```bash
# md -> docx（默认），输出到 ./word/
docconvert input.md

# 指定输出目录
docconvert input.md --output-dir ./我的输出/

# 使用模板
docconvert input.md --template 我的模板.docx
```

### 批量转换

```bash
docconvert --batch ./文档目录/
docconvert --batch ./docs/ --output-dir ./converted/
```

### 检查环境

```bash
docconvert --check
```

---

## 环境要求

| 依赖 | 说明 | 安装命令 |
|------|------|---------|
| Python 3.6+ | 必需 | [python.org](https://www.python.org/downloads/) |
| Pandoc | 必需 | `winget install JohnMacFarlane.Pandoc` |
| xelatex | 仅 PDF | `winget install MikTex.MikTex` |

---

## 支持平台

| Agent | Skill 安装路径 |
|-------|---------------|
| Claude Code | `~/.claude/skills/docconvert/` |
| Cursor | `~/.cursor/rules/docconvert.mdc` |
| Windsurf | `~/.codeium/windsurf/skills/docconvert/` |
| GitHub Copilot | `~/.github/agents/docconvert/` |
| Gemini CLI | `~/.gemini/antigravity/skills/docconvert/` |

### 安装 Skill 到 Agent

```bash
# 交互式选择要安装的 Agent
docconvert --install

# 安装到所有检测到的 Agent
docconvert --install --all

# 仅安装到指定 Agent
docconvert --install --claude
docconvert --install --cursor
```

---

## 项目结构

```
docconvert-cli/
├── docconvert.py           # Python 主入口
├── bin/
│   └── docconvert.js      # npm CLI 入口
├── scripts/
│   ├── postinstall.js     # npm 安装后钩子
│   └── install.js         # 跨 Agent Skill 安装器
├── skills/                # Agent Skill 文件
│   ├── SKILL.md
│   ├── SKILL.cursor.md
│   └── SKILL.windsurf.md
├── convert/               # 转换模块
│   ├── _base.py
│   ├── _fonts.py
│   ├── md2docx.py
│   ├── docx2md.py
│   ├── md2html.py
│   ├── md2pdf.py
│   └── docx2pdf.py
└── templates/
```

---

## 常见问题

**Q: 转换后中文显示乱码？**
确保原文件编码为 UTF-8。

**Q: PDF 输出失败？**
运行 `docconvert --check` 检查 PDF 引擎是否安装。

---

## 支持

有问题请提 [Issues](https://github.com/kyirexy/docconvert-cli/issues)

---

## 许可证

MIT - 查看 [LICENSE](LICENSE)
