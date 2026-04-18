# -*- coding: utf-8 -*-
"""Markdown -> HTML 转换"""
import os
import subprocess
from pathlib import Path
from ._base import load_config, get_output_dir


def md_to_html(input_file: str, output_file: str = None, config: dict = None, output_dir: str = None) -> bool:
    """
    将 Markdown 转换为 HTML

    Args:
        input_file: 输入的 .md 文件路径
        output_file: 输出的 .html 文件路径，None 则自动生成
        config: 配置字典
        output_dir: 输出目录，None 则使用当前工作目录/html/

    Returns:
        True 如果转换成功
    """
    if config is None:
        config = load_config()

    input_path = Path(input_file).resolve()
    if not input_path.exists():
        print(f"[ERROR] Input file not found: {input_file}")
        return False

    # 确定输出路径
    if output_file:
        output_file = Path(output_file)
        output_file.parent.mkdir(parents=True, exist_ok=True)
    else:
        out_dir = get_output_dir("html", output_dir, config)
        out_dir.mkdir(parents=True, exist_ok=True)
        output_file = out_dir / input_path.with_suffix(".html").name

    # 构建 Pandoc 命令
    cmd = [
        "pandoc",
        str(input_path),
        "-o", str(output_file),
        "--standalone",
        "--self-contained",
    ]

    try:
        print(f"[CONVERT] {input_path.name} -> {output_file.name} (HTML)")

        # 切换到 md 文件所在目录
        original_cwd = os.getcwd()
        os.chdir(input_path.parent)
        try:
            subprocess.run(cmd, capture_output=True, text=True, check=True, encoding='utf-8')
        finally:
            os.chdir(original_cwd)

        print(f"[OK] {output_file}")
        return True

    except subprocess.CalledProcessError as e:
        print(f"[FAIL] Conversion failed: {input_file}")
        if e.stderr:
            print(f"   Error: {e.stderr}")
        return False
    except Exception as e:
        print(f"[ERROR] Exception: {e}")
        return False
