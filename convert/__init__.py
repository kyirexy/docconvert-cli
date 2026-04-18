# -*- coding: utf-8 -*-
"""
文档格式转换模块
支持: md <-> docx, md -> html, md -> pdf, docx -> pdf
"""
from pathlib import Path

from .md2docx import md_to_docx
from .docx2md import docx_to_md
from .md2html import md_to_html
from .md2pdf import md_to_pdf
from .docx2pdf import docx_to_pdf
from ._base import load_config, find_pandoc, check_pandoc_installed, check_pdf_engine, get_script_dir


SUPPORTED_FORMATS = ["docx", "md", "html", "pdf"]


def convert(
    input_file: str,
    output_file: str = None,
    to_format: str = "docx",
    template: str = None,
    config: dict = None,
    output_dir: str = None
) -> bool:
    """
    统一转换入口

    Args:
        input_file: 输入文件路径
        output_file: 输出文件路径，None 则自动生成到 output_dir
        to_format: 目标格式 ('docx', 'md', 'html', 'pdf')
        template: Word 模板路径（仅 docx 输出时有效）
        config: 配置字典
        output_dir: 输出目录，None 则使用当前工作目录下的格式子文件夹

    Returns:
        True 如果转换成功
    """
    if config is None:
        config = load_config()

    # 根据输入文件扩展名判断是否是 md 文件
    input_ext = Path(input_file).suffix.lower()

    if to_format == "docx":
        if input_ext == ".md":
            return md_to_docx(input_file, output_file, template, config, output_dir)
        elif input_ext == ".docx":
            print("[ERROR] docx to docx not supported, use docx2md first")
            return False
        else:
            print(f"[ERROR] Unsupported input format for docx output: {input_ext}")
            return False

    elif to_format == "md":
        if input_ext == ".docx":
            return docx_to_md(input_file, output_file, config, output_dir)
        else:
            print(f"[ERROR] Supported input for md output: .docx, got: {input_ext}")
            return False

    elif to_format == "html":
        if input_ext == ".md":
            return md_to_html(input_file, output_file, config, output_dir)
        else:
            print(f"[ERROR] Supported input for html output: .md, got: {input_ext}")
            return False

    elif to_format == "pdf":
        if input_ext == ".md":
            return md_to_pdf(input_file, output_file, config, output_dir)
        elif input_ext == ".docx":
            return docx_to_pdf(input_file, output_file, config, output_dir)
        else:
            print(f"[ERROR] Supported input for pdf output: .md, .docx, got: {input_ext}")
            return False

    else:
        print(f"[ERROR] Unsupported format: {to_format}")
        return False
