# docconvert

AI 原生的本地文档格式转换工具，支持 Markdown、Word、HTML、PDF 互相转换，基于 Pandoc，纯本地处理。

## When to Use / 触发条件

当用户请求以下操作时**必须**使用此 skill：

### 格式转换类
- "转换文档格式"、"转成 docx/html/pdf/md"
- "md 转 word"、"word 转 markdown"
- "把这个 markdown 转成 html/pdf/word"
- "把 docx 转成 md/pdf"
- "批量转换文档"
- "帮我转一下这个文件"
- "/docconvert"

### 模板套用类（毕业论文/报告/合同）
- "按毕业论文格式导出"
- "转成 word 并套用模板"
- "生成标准格式的 docx"
- "按照学术论文格式排版"

## Instructions / 执行步骤

### 标准转换流程

**第一步：识别源文件格式**

| 文件扩展名 | 源格式 |
|-----------|--------|
| `.md` / `.markdown` | Markdown |
| `.docx` / `.doc` | Word |
| `.html` / `.htm` | HTML |
| `.pdf` | PDF |

**第二步：确定目标格式**

| 用户意图 | 目标格式 | 命令参数 |
|---------|---------|---------|
| "转成 docx/word" | docx | `-t docx` |
| "转成 md/markdown" | md | `-t md` |
| "转成 html/网页" | html | `-t html` |
| "转成 pdf" | pdf | `-t pdf` |

**第三步：执行转换**

```bash
# 基本转换（输出到 ./word/, ./html/, ./pdf/）
docconvert <源文件>

# 指定目标格式
docconvert <源文件> -t <格式>

# 指定输出目录
docconvert <源文件> --output-dir ./输出目录/

# 使用 Word 模板（推荐用于毕业论文/正式文档）
docconvert <源文件> --template templates/default.docx

# 批量转换
docconvert --batch ./目录/
```

**第四步：反馈结果**

转换成功后告知用户：
- ✅ 输出文件完整路径
- ✅ 图片位置（如果有）
- ✅ 转换的格式信息

### 模板套用流程（毕业论文/正式文档）

**当用户要求套用模板时：**

```bash
# 使用默认模板套用
docconvert <论文.md> --template templates/default.docx

# 使用自定义模板
docconvert <论文.md> --template 我的毕业论文模板.docx
```

## Examples / 常用场景示例

### 场景 1：毕业论文转换

**用户输入：** "把我的论文 md 转成 word，要套用毕业论文模板"

**Agent 执行：**
```bash
docconvert 毕业论文.md --template templates/default.docx
```

**预期输出：**
```
[CONVERT] 毕业论文.md -> 毕业论文.docx (DOCX)
[FONT] Fixed: SimHei (headings), SimSun (body)
[TEMPLATE] Applied: default.docx
[OK] ./word/毕业论文.docx
```

---

### 场景 2：批量文档转换

**用户输入：** "把这个文件夹里的所有 md 转成 docx"

**Agent 执行：**
```bash
docconvert --batch ./文档目录/
```

---

### 场景 3：Word 转 Markdown

**用户输入：** "把这个 word 转成 md，图片也要保留"

**Agent 执行：**
```bash
docconvert 报告.docx -t md
```

**预期输出：**
```
[CONVERT] 报告.docx -> 报告.md (MD)
[OK] ./md/报告.md
[INFO] Media extracted to: ./md/media/
```

---

### 场景 4：快速网页发布

**用户输入：** "把这个 markdown 转成 html，我要发博客"

**Agent 执行：**
```bash
docconvert 文章.md -t html
```

---

### 场景 5：PDF 导出

**用户输入：** "转成 pdf 格式"

**Agent 执行：**
```bash
docconvert 演示文稿.md -t pdf
```

---

## Configuration / 配置说明

### 内置模板

| 模板 | 适用场景 | 命令 |
|------|---------|------|
| `default.docx` | 通用文档/毕业论文 | `--template default.docx` |
| 自定义模板 | 用户自定义格式 | `--template 你的模板.docx` |

### 环境要求

- **Python 3.6+**（必需）
- **Pandoc**（必需）
- **xelatex**（仅 PDF 输出需要）

### 输出目录

| 格式 | 默认输出 |
|------|---------|
| docx | `./word/` |
| md | `./md/` |
| html | `./html/` |
| pdf | `./pdf/` |

## Notes / 注意事项

1. **中文乱码**：确保原文件编码为 UTF-8
2. **图片路径**：相对路径图片会被正确处理
3. **模板样式**：模板中的字体/颜色会被保留
4. **批量转换**：自动跳过已转换的文件
