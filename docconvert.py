#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Document format converter based on Pandoc
Supports: md <-> docx, md -> html, md -> pdf, docx -> pdf
"""
import argparse
import sys
from pathlib import Path

# 添加 convert 模块路径
sys.path.insert(0, str(Path(__file__).parent))

from convert import (
    convert,
    SUPPORTED_FORMATS,
    check_pandoc_installed,
    check_pdf_engine,
    load_config,
)


def main():
    parser = argparse.ArgumentParser(
        description="Document format converter based on Pandoc",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Supported formats: docx, md, html, pdf

Examples:
  # Markdown to Word (default)
  python docconvert.py input.md

  # Markdown to HTML / PDF
  python docconvert.py input.md -t html
  python docconvert.py input.md -t pdf

  # Word to Markdown / PDF
  python docconvert.py input.docx -t md
  python docconvert.py input.docx -t pdf

  # Specify output directory
  python docconvert.py input.md -o ./my_output/
  python docconvert.py input.md --output-dir ./output/

  # Batch convert
  python docconvert.py --batch ./docs/

  # Use template
  python docconvert.py input.md --template my_template.docx

  # Check environment
  python docconvert.py --check
        """
    )

    parser.add_argument(
        "input",
        nargs="?",
        help="Input file (md, docx)"
    )

    parser.add_argument(
        "output",
        nargs="?",
        help="Output file path (or output directory if ending with /)"
    )

    parser.add_argument(
        "-t", "--to",
        dest="to_format",
        choices=SUPPORTED_FORMATS,
        default="docx",
        help="Target format (default: docx)"
    )

    parser.add_argument(
        "-o", "--output-dir",
        dest="output_dir",
        help="Output directory (default: ./word/, ./html/, ./pdf/)"
    )

    parser.add_argument(
        "--batch", "--b",
        action="store_true",
        help="Batch mode: convert all files in directory"
    )

    parser.add_argument(
        "--template",
        metavar="FILE",
        help="Word template file (.docx) for docx output"
    )

    parser.add_argument(
        "-c", "--config",
        metavar="FILE",
        help="Config file path (default: ./config.json)"
    )

    parser.add_argument(
        "--check", "-k",
        action="store_true",
        help="Check environment (Pandoc + PDF engine)"
    )

    args = parser.parse_args()

    # 加载配置
    config = load_config(args.config)

    # 检查环境
    if args.check:
        if check_pandoc_installed():
            print("[OK] Pandoc is installed")
        else:
            return 1
        engine, available = check_pdf_engine()
        if available:
            print(f"[OK] PDF engine: {engine}")
        else:
            print("[WARN] No PDF engine found (xelatex/tectonic not in PATH)")
            print("       PDF output will not work without it.")
        return 0

    # 检查 Pandoc
    if not check_pandoc_installed():
        return 1

    # 无参数时显示帮助
    if args.input is None:
        parser.print_help()
        return 0

    # 批量模式
    if args.batch:
        return batch_mode(args, config)

    # 单文件模式
    # 如果 output 看起来像目录（以 / 结尾或是相对路径且没有扩展名），当作 output_dir 处理
    output_file = None
    output_dir = args.output_dir

    if args.output:
        out_path = Path(args.output)
        if out_path.is_dir() or str(args.output).endswith('/'):
            # 用户指定的是目录
            output_dir = args.output
        else:
            # 用户指定的是文件路径
            output_file = args.output

    success = convert(
        args.input,
        output_file,
        args.to_format,
        args.template,
        config,
        output_dir
    )
    return 0 if success else 1


def batch_mode(args, config):
    """批量转换"""
    from convert import md_to_docx, md_to_html, md_to_pdf, docx_to_md, docx_to_pdf

    input_dir = Path(args.input)
    if not input_dir.is_dir():
        print(f"[ERROR] Not a directory: {input_dir}")
        return 1

    to_format = args.to_format
    output_dir = args.output_dir

    # 找到所有要转换的文件
    if to_format == "md":
        files = list(input_dir.glob("*.docx"))
        converter = lambda f, cfg, od: docx_to_md(str(f), None, cfg, od)
        desc = "DOCX -> MD"
    else:
        files = list(input_dir.glob("*.md"))
        if to_format == "docx":
            converter = lambda f, cfg, od: md_to_docx(str(f), None, args.template, cfg, od)
            desc = "MD -> DOCX"
        elif to_format == "html":
            converter = lambda f, cfg, od: md_to_html(str(f), None, cfg, od)
            desc = "MD -> HTML"
        elif to_format == "pdf":
            converter = lambda f, cfg, od: md_to_pdf(str(f), None, cfg, od)
            desc = "MD -> PDF"

    if not files:
        print(f"[WARN] No files found to convert in: {input_dir}")
        return 0

    print(f"[SCAN] Found {len(files)} files")
    print(f"[TO]   {desc}")
    if output_dir:
        print(f"[OUT]  Output directory: {output_dir}")
    print("-" * 50)

    success = 0
    failed = 0
    for f in files:
        if converter(f, config, output_dir):
            success += 1
        else:
            failed += 1

    print("-" * 50)
    print(f"[DONE] {success} success, {failed} failed")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
