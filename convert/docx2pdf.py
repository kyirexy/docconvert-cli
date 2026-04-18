# -*- coding: utf-8 -*-
"""Word -> PDF 转换"""
import subprocess
from pathlib import Path
from ._base import load_config, check_pdf_engine, get_output_dir


def docx_to_pdf(input_file: str, output_file: str = None, config: dict = None, output_dir: str = None) -> bool:
    """
    将 Word 转换为 PDF

    Args:
        input_file: 输入的 .docx 文件路径
        output_file: 输出的 .pdf 文件路径，None 则自动生成
        config: 配置字典
        output_dir: 输出目录，None 则使用当前工作目录/pdf/

    Returns:
        True 如果转换成功
    """
    if config is None:
        config = load_config()

    # 检查 PDF 引擎
    engine, available = check_pdf_engine()
    if not available:
        print("=" * 60)
        print("[ERROR] No PDF engine found (xelatex/tectonic not in PATH)")
        print()
        print("For PDF output, please install xelatex:")
        print("  Windows: winget install MikTex.MikTex")
        print()
        print("Or use tectonic (no LaTeX needed):")
        print("  Windows: winget install Tectonic.tectonic")
        print("  Download: https://tectonic.org")
        print("=" * 60)
        return False

    input_path = Path(input_file).resolve()
    if not input_path.exists():
        print(f"[ERROR] Input file not found: {input_file}")
        return False

    # 确定输出路径
    if output_file:
        output_file = Path(output_file)
        output_file.parent.mkdir(parents=True, exist_ok=True)
    else:
        out_dir = get_output_dir("pdf", output_dir, config)
        out_dir.mkdir(parents=True, exist_ok=True)
        output_file = out_dir / input_path.with_suffix(".pdf").name

    # 构建 Pandoc 命令
    cmd = [
        "pandoc",
        str(input_path),
        "-o", str(output_file),
        "--pdf-engine", engine,
    ]

    try:
        print(f"[CONVERT] {input_path.name} -> {output_file.name} (PDF)")
        print(f"[INFO] Using PDF engine: {engine}")

        subprocess.run(cmd, capture_output=True, text=True, check=True, encoding='utf-8')

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
