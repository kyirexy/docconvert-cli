# docconvert Skill

AI Agent 文档格式转换技能，支持 Claude Code、Cursor、Windsurf 等主流 Agent 平台。

## 自动安装

通过 `npm install -g docconvert-cli` 全局安装后，Skill 会自动部署到你的 Agent。

## 手动安装 Skill

如果需要手动安装或重新安装 Skill，运行：

```bash
docconvert --install          # 交互式选择要安装的 Agent
docconvert --install --all    # 安装到所有检测到的 Agent
docconvert --install --claude # 仅安装到 Claude Code
```

或直接使用安装器：

```bash
docconvert-install            # 交互式选择
docconvert-install --all      # 安装到所有
docconvert-install --claude   # 仅 Claude Code
```

## 支持的平台

| Agent | 安装路径 | 格式 |
|-------|---------|------|
| Claude Code | `~/.claude/skills/docconvert/` | SKILL.md |
| Cursor | `~/.cursor/rules/` | .mdc |
| Windsurf | `~/.codeium/windsurf/skills/docconvert/` | SKILL.md |
| GitHub Copilot | `~/.github/agents/docconvert/` | SKILL.md |
| Gemini CLI | `~/.gemini/antigravity/skills/docconvert/` | SKILL.md |

## 触发方式

在 Agent 对话中：

- 输入 `/docconvert`
- 或描述转换需求："帮我把这个 md 转成 word"、"把 docx 转成 pdf"等

## 环境要求

- Python 3.6+
- Pandoc（必需）
- xelatex/tectonic（仅 PDF 输出需要）
