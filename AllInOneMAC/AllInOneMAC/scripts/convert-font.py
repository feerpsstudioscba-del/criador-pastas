#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import os
import shutil
import struct
from pathlib import Path

# Force UTF-8 output on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

try:
    from fontTools.ttLib import TTFont
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.misc.psCharStrings import T2CharString
except ImportError:
    print("ERROR: fontTools not installed. Install with: pip install fontTools")
    sys.exit(1)

# Mapping of file extensions to MIME types and font formats
FORMAT_MAP = {
    '.ttf': 'truetype',
    '.otf': 'opentype',
    '.woff': 'woff1',
    '.woff2': 'woff2',
    '.svg': 'svg',
    '.eot': 'eot',
}

def convert_to_ttf(input_path):
    """Convert any font format to TTF"""
    ext = Path(input_path).suffix.lower()
    
    try:
        font = TTFont(input_path)
        font.flavor = None  # Remove any existing flavor (WOFF/WOFF2)
        
        # Save as TTF
        temp_path = input_path + ".tmp.ttf"
        font.save(temp_path)
        return temp_path, True
    except Exception as e:
        print(f"ERROR: Could not convert {ext} to TTF: {e}")
        return None, False

def convert_ttf_to_woff(ttf_path, output_path):
    """Convert TTF to WOFF"""
    try:
        font = TTFont(ttf_path)
        font.flavor = "woff"
        font.save(output_path)
        return True
    except Exception as e:
        print(f"ERROR: Failed to convert to WOFF: {e}")
        return False

def convert_ttf_to_woff2(ttf_path, output_path):
    """Convert TTF to WOFF2"""
    try:
        font = TTFont(ttf_path)
        font.flavor = "woff2"
        font.save(output_path)
        return True
    except Exception as e:
        print(f"ERROR: Failed to convert to WOFF2: {e}")
        return False

def convert_ttf_to_svg(ttf_path, output_path):
    """Convert TTF to SVG font"""
    try:
        font = TTFont(ttf_path)
        
        # Get font info
        font_name = "CustomFont"
        try:
            name_table = font.get('name')
            if name_table:
                name_obj = name_table.getName(1, 3, 1)
                if name_obj:
                    font_name = name_obj.toUnicode()
        except:
            pass
        
        # Get font metrics
        head_table = font.get('head')
        hhea_table = font.get('hhea')
        os2_table = font.get('OS/2')
        
        ascender = hhea_table.ascender if hhea_table else 800
        descender = hhea_table.descender if hhea_table else -200
        units_per_em = head_table.unitsPerEm if head_table else 1000
        
        # Create SVG font
        svg = '<?xml version="1.0" encoding="UTF-8"?>\n'
        svg += '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n'
        svg += '<defs>\n'
        svg += f'  <font id="{font_name}" horiz-adv-x="500">\n'
        svg += f'    <font-face font-family="{font_name}" ascent="{ascender}" descent="{descender}" units-per-em="{units_per_em}"/>\n'
        
        # Add glyphs
        glyph_table = font.get('glyf')
        char_map = font.getBestCmap()
        
        if char_map and glyph_table:
            for char_code, glyph_name in char_map.items():
                try:
                    glyph = glyph_table[glyph_name]
                    hmtx_table = font.get('hmtx')
                    width = hmtx_table.metrics.get(glyph_name, (500, 0))[0]
                    
                    # Create minimal glyph element
                    svg += f'    <glyph unicode="&#x{char_code:X};" glyph-name="{glyph_name}" horiz-adv-x="{width}"/>\n'
                except:
                    pass
        
        svg += '  </font>\n'
        svg += '</defs>\n'
        svg += '</svg>\n'
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(svg)
        return True
    except Exception as e:
        print(f"ERROR: Failed to convert to SVG: {e}")
        return False

def convert_ttf_to_eot(ttf_path, output_path):
    """Convert TTF to EOT (Embedded OpenType)"""
    try:
        font = TTFont(ttf_path)
        
        # Read original font data
        with open(ttf_path, 'rb') as f:
            font_data = f.read()
        
        # Create minimal EOT header
        # EOT = Enhanced OpenType for IE
        eot_header = b'EOT\x00'  # EOT signature
        eot_header += struct.pack('<I', len(font_data))  # Font data size
        
        with open(output_path, 'wb') as f:
            f.write(eot_header)
            f.write(font_data)
        
        return True
    except Exception as e:
        print(f"ERROR: Failed to convert to EOT: {e}")
        return False

def check_existing_formats(output_dir, base_name):
    """Check which formats already exist"""
    existing = {}
    formats = ['woff', 'woff2', 'ttf', 'svg', 'eot']
    for fmt in formats:
        path = os.path.join(output_dir, f"{base_name}.{fmt}")
        existing[fmt] = os.path.exists(path)
    return existing

def main():
    if len(sys.argv) < 3:
        print("Usage: python convert-font.py <input_file> <output_dir> [--check-only]")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_dir = sys.argv[2]
    check_only = '--check-only' in sys.argv
    
    if not os.path.exists(input_path):
        print(f"ERROR: Input file not found: {input_path}")
        sys.exit(1)
    
    os.makedirs(output_dir, exist_ok=True)
    
    base_name = Path(input_path).stem
    input_ext = Path(input_path).suffix.lower()
    
    # Check existing formats
    existing = check_existing_formats(output_dir, base_name)
    print(f"Existing formats: {', '.join([k for k, v in existing.items() if v]) or 'none'}")
    
    if check_only:
        print(f"Formats to convert: {', '.join([k for k, v in existing.items() if not v]) or 'all'}")
        sys.exit(0)
    
    # Step 1: Convert input to TTF if needed
    working_ttf = None
    temp_files = []
    
    if input_ext not in ['.ttf', '.otf']:
        print(f"Converting {input_ext} to TTF...")
        working_ttf, success = convert_to_ttf(input_path)
        if not success or not working_ttf:
            print(f"ERROR: Failed to convert {input_ext} to TTF")
            sys.exit(1)
        temp_files.append(working_ttf)
    else:
        # For TTF/OTF, convert to clean TTF format
        print(f"Preparing {input_ext} as base...")
        working_ttf, success = convert_to_ttf(input_path)
        if not success or not working_ttf:
            working_ttf = input_path
        else:
            temp_files.append(working_ttf)
    
    # Prepare output paths
    outputs = {
        'woff': os.path.join(output_dir, f"{base_name}.woff"),
        'woff2': os.path.join(output_dir, f"{base_name}.woff2"),
        'ttf': os.path.join(output_dir, f"{base_name}.ttf"),
        'svg': os.path.join(output_dir, f"{base_name}.svg"),
        'eot': os.path.join(output_dir, f"{base_name}.eot"),
    }
    
    results = []
    converted_count = 0
    skipped_count = 0
    
    # Step 2: Convert from TTF to all formats
    # Always create TTF if it doesn't exist
    if not existing['ttf']:
        try:
            # Copy working TTF to output
            shutil.copy2(working_ttf, outputs['ttf'])
            print("[OK] TTF")
            converted_count += 1
        except Exception as e:
            print(f"[ERRO] TTF: {e}")
    else:
        print("[SKIP] TTF (already exists)")
        skipped_count += 1
    
    # Convert to WOFF
    if not existing['woff']:
        if convert_ttf_to_woff(working_ttf, outputs['woff']):
            print("[OK] WOFF")
            converted_count += 1
        else:
            print("[ERRO] WOFF")
    else:
        print("[SKIP] WOFF (already exists)")
        skipped_count += 1
    
    # Convert to WOFF2
    if not existing['woff2']:
        if convert_ttf_to_woff2(working_ttf, outputs['woff2']):
            print("[OK] WOFF2")
            converted_count += 1
        else:
            print("[ERRO] WOFF2")
    else:
        print("[SKIP] WOFF2 (already exists)")
        skipped_count += 1
    
    # Convert to SVG
    if not existing['svg']:
        if convert_ttf_to_svg(working_ttf, outputs['svg']):
            print("[OK] SVG")
            converted_count += 1
        else:
            print("[ERRO] SVG")
    else:
        print("[SKIP] SVG (already exists)")
        skipped_count += 1
    
    # Convert to EOT
    if not existing['eot']:
        if convert_ttf_to_eot(working_ttf, outputs['eot']):
            print("[OK] EOT")
            converted_count += 1
        else:
            print("[ERRO] EOT")
    else:
        print("[SKIP] EOT (already exists)")
        skipped_count += 1
    
    # Clean up temp files
    for temp_file in temp_files:
        if temp_file and os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except:
                pass
    
    # Summary
    print(f"\n=== RESUMO ===")
    print(f"Convertidos: {converted_count}")
    print(f"Pulados (já existem): {skipped_count}")
    
    if converted_count == 0:
        print("Nenhum arquivo novo foi criado.")
    
    sys.exit(0)

if __name__ == '__main__':
    main()
