## 快速参考 / Quick Reference

### 命令速查

```bash
# 基本转换
docconvert input.md                    # md -> docx（默认）
docconvert input.md -t html            # md -> html
docconvert input.md -t pdf             # md -> pdf
docconvert input.docx -t md            # docx -> md

# 输出控制
docconvert input.md --output-dir ./output/   # 指定输出目录
docconvert --batch ./docs/                   # 批量转换

# 模板使用
docconvert input.md --template my.docx       # 使用模板
```

### 格式对应表

| 源格式 | 目标格式 | 命令 |
|--------|----------|------|
| md | docx | `docconvert x.md` |
| md | html | `docconvert x.md -t html` |
| md | pdf | `docconvert x.md -t pdf` |
| docx | md | `docconvert x.docx -t md` |
| docx | pdf | `docconvert x.docx -t pdf` |
| html | docx | `docconvert x.html -t docx` |

### 环境检查

```bash
docconvert --check
```

输出示例：
```
[docconvert] Checking environment...

[OK] Python found: python
[OK] Pandoc found
[OK] PDF engine found: xelatex
```
