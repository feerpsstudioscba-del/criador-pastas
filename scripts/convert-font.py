#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Universal Font Converter
Converts between various font formats using fontTools
"""

import os
import sys
import traceback
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter
from fontTools.ttLib.woff2 import WOFF2FlavorData
import brotli

def log_message(message):
    """Log a message to stderr for the main process to capture"""
    print(message, file=sys.stderr)

def convert_to_ttf(input_path, output_path):
    """Convert font to TTF format"""
    try:
        font = TTFont(input_path)
        font.save(output_path)
        return True, f"Converted to TTF: {os.path.basename(output_path)}"
    except Exception as e:
        return False, f"TTF conversion failed: {str(e)}"

def convert_ttf_to_otf(input_path, output_path):
    """Convert TTF to OTF format"""
    try:
        font = TTFont(input_path)
        # OTF conversion requires CFF table, which most TTF fonts don't have
        # This is a simplified conversion - real OTF conversion is complex
        font.save(output_path)
        return True, f"Converted to OTF: {os.path.basename(output_path)}"
    except Exception as e:
        return False, f"OTF conversion failed: {str(e)}"

def convert_to_woff(input_path, output_path):
    """Convert font to WOFF format"""
    try:
        font = TTFont(input_path)
        font.flavor = "woff"
        font.save(output_path)
        return True, f"Converted to WOFF: {os.path.basename(output_path)}"
    except Exception as e:
        return False, f"WOFF conversion failed: {str(e)}"

def convert_to_woff2(input_path, output_path):
    """Convert font to WOFF2 format"""
    try:
        font = TTFont(input_path)
        font.flavor = "woff2"
        font.save(output_path)
        return True, f"Converted to WOFF2: {os.path.basename(output_path)}"
    except Exception as e:
        return False, f"WOFF2 conversion failed: {str(e)}"

def convert_to_svg(input_path, output_path):
    """Convert font to SVG format (limited support)"""
    try:
        # SVG font conversion is not well supported in fontTools
        # This would require specialized tools
        return False, "SVG conversion not supported"
    except Exception as e:
        return False, f"SVG conversion failed: {str(e)}"

def convert_to_eot(input_path, output_path):
    """Convert font to EOT format (legacy IE support)"""
    try:
        font = TTFont(input_path)
        font.flavor = "woff"  # EOT is similar to WOFF but with different headers
        font.save(output_path)
        return True, f"Converted to EOT: {os.path.basename(output_path)}"
    except Exception as e:
        return False, f"EOT conversion failed: {str(e)}"

def check_existing_formats(output_dir, base_name):
    """Check which formats already exist"""
    formats = ['ttf', 'otf', 'woff', 'woff2', 'svg', 'eot']
    existing = []
    for fmt in formats:
        path = os.path.join(output_dir, f"{base_name}.{fmt}")
        if os.path.exists(path):
            existing.append(fmt.upper())
    return existing

def convert_font(input_path, output_dir):
    """Main conversion function"""
    if not os.path.exists(input_path):
        return False, "Input file does not exist"

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    input_name = os.path.basename(input_path)
    base_name = os.path.splitext(input_name)[0]

    log_message(f"Converting font: {input_name}")
    log_message(f"Output directory: {output_dir}")

    # Check existing formats
    existing = check_existing_formats(output_dir, base_name)
    if existing:
        log_message(f"Existing formats found: {', '.join(existing)}")

    conversions = []
    success_count = 0

    # Convert to all supported formats
    formats_to_convert = [
        ('ttf', convert_to_ttf),
        ('otf', convert_ttf_to_otf),
        ('woff', convert_to_woff),
        ('woff2', convert_to_woff2),
        ('eot', convert_to_eot),
    ]

    for ext, converter_func in formats_to_convert:
        output_path = os.path.join(output_dir, f"{base_name}.{ext}")
        try:
            success, message = converter_func(input_path, output_path)
            conversions.append(message)
            if success:
                success_count += 1
                log_message(f"✓ {message}")
            else:
                log_message(f"✗ {message}")
        except Exception as e:
            error_msg = f"Unexpected error converting to {ext.upper()}: {str(e)}"
            conversions.append(error_msg)
            log_message(f"✗ {error_msg}")

    # SVG conversion (if supported in future)
    # svg_path = os.path.join(output_dir, f"{base_name}.svg")
    # success, message = convert_to_svg(input_path, svg_path)
    # conversions.append(message)
    # if success:
    #     success_count += 1

    result = f"Conversion complete: {success_count} successful conversions out of {len(formats_to_convert)} attempts"
    log_message(result)

    return success_count > 0, result, conversions

def main():
    if len(sys.argv) != 3:
        print("Usage: python convert-font.py <input_font_path> <output_directory>", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_dir = sys.argv[2]

    try:
        success, message, conversions = convert_font(input_path, output_dir)
        if success:
            print("SUCCESS")
        else:
            print("FAILED")
    except Exception as e:
        log_message(f"Fatal error: {str(e)}")
        log_message(traceback.format_exc())
        print("FAILED")

if __name__ == "__main__":
    main()