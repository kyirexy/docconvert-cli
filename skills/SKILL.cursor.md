---
description: AI 原生的本地文档格式转换工具，支持 md/docx/html/pdf 互相转换，基于 Pandoc，纯本地处理。
globs:
---

# docconvert

AI 原生的本地文档格式转换工具，支持 Markdown、Word、HTML、PDF 互相转换。

## When to Use / 触发条件

当用户请求以下操作时使用此 skill：

- "转换文档格式"、"转成 docx/html/pdf/md"
- "md 转 word"、"word 转 markdown"
- "把这个 markdown 转成 html/pdf/word"
- "把 docx 转成 md/pdf"
- "批量转换文档"
- "帮我转一下这个文件"
- "/docconvert"

## Instructions / 执行步骤

### 第一步：识别转换方向

根据用户输入识别源文件格式和目标格式：

```
输入包含 "md" 或 "markdown" → 源格式可能是 .md
输入包含 "docx" 或 "word" → 源格式可能是 .docx
输入包含 "html" 或 "网页" → 可能要转 html
输入包含 "pdf" → 可能要转 pdf
```

### 第二步：确定目标格式

| 用户意图 | 目标格式 | 命令 |
|---------|---------|------|
| "转成 docx/word" | docx | `-t docx`（默认） |
| "转成 md/markdown" | md | `-t md` |
| "转成 html/网页" | html | `-t html` |
| "转成 pdf" | pdf | `-t pdf` |

### 第三步：执行转换

```bash
# 基本转换（自动输出到 ./word/, ./html/, ./pdf/）
docconvert <源文件>

# 指定目标格式
docconvert <源文件> -t <格式>

# 指定输出目录
docconvert <源文件> --output-dir ./输出目录/

# 批量转换
docconvert --batch ./目录/

# 使用模板
docconvert <源文件> --template 模板.docx
```

### 第四步：反馈结果

转换成功后告知用户：
- 输出文件路径
- 如果有图片，说明图片位置

## Examples / 输入输出示例

### 示例 1：md → docx

**用户输入：** "帮我把这个 md 转成 word"

**Agent 执行：**
```bash
docconvert 用户文件.md -t docx
```

**预期输出：**
```
[CONVERT] 用户文件.md -> 用户文件.docx (DOCX)
[FONT] Fixed: SimHei (headings), SimSun (body)
[OK] ./word/用户文件.docx
```

---

### 示例 2：docx → md

**用户输入：** "把这份 word 转成 markdown"

**Agent 执行：**
```bash
docconvert 用户文件.docx -t md
```

**预期输出：**
```
[CONVERT] 用户文件.docx -> 用户文件.md (MD)
[OK] ./md/用户文件.md
[INFO] Media extracted to: ./md/media
```

---

### 示例 3：md → PDF

**用户输入：** "转成 pdf 格式"

**Agent 执行：**
```bash
docconvert 用户文件.md -t pdf
```

**预期输出：**
```
[CONVERT] 用户文件.md -> 用户文件.pdf (PDF)
[OK] ./pdf/用户文件.pdf
```

## Configuration / 配置说明

### 环境要求

- **Python 3.6+**
- **Pandoc**（必需）
- **xelatex**（仅 PDF 输出时需要）

### 安装命令

```bash
# Windows
winget install JohnMacFarlane.Pandoc
winget install MikTex.MikTex  # 仅 PDF

# macOS
brew install pandoc

# Linux
sudo apt install pandoc
```

### 输出目录说明

默认情况下，输出到当前工作目录的格式子文件夹：

| 格式 | 默认输出目录 |
|------|------------|
| docx | ./word/ |
| md | ./md/ |
| html | ./html/ |
| pdf | ./pdf/ |

可通过 `--output-dir` 或 `config.json` 自定义。

## Resources / 资源

```
docconvert/
├── docconvert.py          # 主入口
├── convert/              # 转换模块
│   ├── _base.py        # 公共函数
│   ├── _fonts.py       # 字体修复
│   ├── md2docx.py     # md → docx
│   ├── docx2md.py      # docx → md
│   ├── md2html.py      # md → html
│   ├── md2pdf.py       # md → pdf
│   └── docx2pdf.py     # docx → pdf
├── templates/           # Word 模板
└── config.json          # 配置文件
```