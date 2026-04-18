# -*- coding: utf-8 -*-
"""公共函数模块"""
import json
import shutil
import os
from pathlib import Path


def find_pandoc() -> str | None:
    """检测 Pandoc 是否已安装"""
    return shutil.which("pandoc")


def check_pandoc_installed() -> bool:
    """检查 Pandoc 是否安装，未安装时打印安装指南"""
    if find_pandoc() is None:
        print("=" * 60)
        print("[ERROR] Pandoc not found")
        print()
        print("Please install Pandoc first:")
        print()
        print("  Windows (winget):")
        print("    winget install JohnMacFarlane.Pandoc")
        print()
        print("  Windows (chocolatey):")
        print("    choco install pandoc")
        print()
        print("  macOS:")
        print("    brew install pandoc")
        print()
        print("  Linux (Ubuntu/Debian):")
        print("    sudo apt install pandoc")
        print()
        print("  Or download from: https://pandoc.org/installing.html")
        print("=" * 60)
        return False
    return True


def check_pdf_engine() -> tuple[str, bool]:
    """检测可用的 PDF 引擎，返回 (引擎名, 是否可用)"""
    engines = ["xelatex", "tectonic", "pdflatex", "lualatex"]
    for engine in engines:
        if shutil.which(engine):
            return (engine, True)
    return ("xelatex", False)


def get_script_dir() -> Path:
    """获取脚本所在目录"""
    return Path(__file__).parent.parent.resolve()


def get_output_dir(to_format: str, output_dir: str = None, config: dict = None) -> Path:
    """
    获取输出目录。

    优先级：
    1. 用户指定的 output_dir 参数
    2. config.json 中的配置（如果指定了绝对路径）
    3. 当前工作目录 + 格式子文件夹（如 ./word/, ./html/, ./pdf/）

    Args:
        to_format: 目标格式
        output_dir: 用户指定的输出目录（可选）
        config: 配置字典（可选）

    Returns:
        输出目录的 Path 对象
    """
    # 用户显式指定了输出目录
    if output_dir:
        path = Path(output_dir)
        if not path.is_absolute():
            path = Path.cwd() / path
        return path

    # 检查 config 是否有绝对路径配置
    if config:
        format_key = {
            "docx": "output_dir",
            "html": "html_output_dir",
            "pdf": "pdf_output_dir",
            "md": "output_dir",
        }.get(to_format, "output_dir")

        config_path = config.get(format_key, "")
        if config_path:
            path = Path(config_path)
            if path.is_absolute():
                return path
            # 相对路径 -> 基于当前工作目录
            return Path.cwd() / path

    # 默认：当前工作目录 + 格式子文件夹
    format_folder = {
        "docx": "word",
        "html": "html",
        "pdf": "pdf",
        "md": "md",
    }.get(to_format, to_format)

    return Path.cwd() / format_folder


def load_config(config_path: str = None) -> dict:
    """加载配置文件"""
    script_dir = get_script_dir()

    if config_path is None:
        config_path = script_dir / "config.json"
    else:
        config_path = Path(config_path)
        if not config_path.is_absolute():
            config_path = script_dir / config_path

    if not config_path.exists():
        return {
            "template": "",
            "output_dir": "word",
            "html_output_dir": "html",
            "pdf_output_dir": "pdf",
        }

    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    # 模板路径相对于脚本目录
    if config.get("template") and not Path(config["template"]).is_absolute():
        config["template"] = str(script_dir / config["template"])

    # output_dir 相关路径保持相对路径（将由 get_output_dir 基于 cwd 解析）
    # 不再自动转为绝对路径

    # 设置默认值
    config.setdefault("output_dir", "word")
    config.setdefault("html_output_dir", "html")
    config.setdefault("pdf_output_dir", "pdf")

    return config
