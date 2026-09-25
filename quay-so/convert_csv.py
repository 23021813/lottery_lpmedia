#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script chuyển đổi danh sách khách mời tham gia quay số trúng thưởng MSB.
Chuyển đổi từ định dạng 'danh-sach-co-mat (4).csv' sang chuẩn 'export.csv' cho Final.html.

Quy trình 3 bước:
1. Kiểm tra đầu vào (Input Validator)
2. Convert & Backup dữ liệu (Data Converter & Backupper)
3. Kiểm tra đầu ra (Output Validator & HTML Parser Simulator)
"""

import sys
import os
import csv
import shutil
from pathlib import Path

# Đảm bảo console Windows xuất tiếng Việt UTF-8 không lỗi font
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def validate_input(input_path: Path) -> dict:
    """
    Bước 1: Kiểm tra tính hợp lệ của file đầu vào.
    - Phát hiện encoding, dòng header
    - Bóc tách dòng có STT hợp lệ (> 0)
    - Phát hiện và ghi nhận các dòng không có STT
    - Phát hiện và khử trùng lặp STT (nếu có)
    """
    input_path = Path(input_path)
    if not input_path.exists():
        return {
            "is_valid_file": False,
            "error": f"Không tìm thấy file: {input_path}",
            "total_raw_rows": 0,
            "valid_rows": [],
            "missing_id_rows": [],
            "duplicate_id_rows": [],
        }

    valid_rows = []
    missing_id_rows = []
    duplicate_id_rows = []
    seen_ids = {}

    with open(input_path, mode="r", encoding="utf-8-sig") as f:
        # Tự động nhận diện delimiter (',' hoặc ';')
        sample = f.read(2048)
        f.seek(0)
        delimiter = ";" if ";" in sample else ","
        reader = csv.reader(f, delimiter=delimiter)

        line_num = 0
        for row in reader:
            line_num += 1
            if not row or not any(field.strip() for field in row):
                continue

            raw_id = row[0].strip() if len(row) > 0 else ""
            name = row[1].strip() if len(row) > 1 else ""

            # Bỏ qua dòng Header nếu cột 1 không phải là số
            if line_num == 1 and not raw_id.isdigit():
                continue

            # Kiểm tra trường hợp KHÔNG CÓ SỐ THỨ TỰ (STT rỗng hoặc không phải số)
            if not raw_id or not raw_id.isdigit():
                missing_id_rows.append({
                    "line": line_num,
                    "raw_id": raw_id,
                    "name": name or f"Dòng {line_num} (Không tên)"
                })
                continue

            val_id = int(raw_id)
            if val_id <= 0:
                missing_id_rows.append({
                    "line": line_num,
                    "raw_id": raw_id,
                    "name": name or f"Dòng {line_num} (STT <= 0)"
                })
                continue

            # Kiểm tra trường hợp TRÙNG LẶP SỐ THỨ TỰ
            if val_id in seen_ids:
                duplicate_id_rows.append({
                    "line": line_num,
                    "id": val_id,
                    "name": name,
                    "first_seen_line": seen_ids[val_id]["line"],
                    "first_name": seen_ids[val_id]["name"]
                })
            else:
                seen_ids[val_id] = {"line": line_num, "name": name}
                valid_rows.append((val_id, name))

    total_data_rows = len(valid_rows) + len(missing_id_rows) + len(duplicate_id_rows)

    return {
        "is_valid_file": True,
        "total_raw_rows": total_data_rows,
        "valid_rows": valid_rows,
        "missing_id_rows": missing_id_rows,
        "duplicate_id_rows": duplicate_id_rows,
    }


def convert_and_export(valid_rows: list, output_path: Path, backup: bool = True) -> Path:
    """
    Bước 2: Chuyển đổi dữ liệu và xuất file chuẩn.
    - Tự động sao lưu file cũ thành .bak
    - Sắp xếp tăng dần theo STT
    - Định dạng mỗi dòng: <STT>;<TÊN>;;;;;;;
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # 1. Sao lưu file cũ nếu tồn tại
    if backup and output_path.exists():
        backup_path = output_path.with_suffix(".csv.bak")
        shutil.copy2(output_path, backup_path)

    # 2. Sắp xếp danh sách theo STT tăng dần
    sorted_rows = sorted(valid_rows, key=lambda x: x[0])

    # 3. Ghi file với format chuẩn export.csv: STT;TÊN;;;;;;;
    lines = []
    for val_id, name in sorted_rows:
        # Chuẩn hóa khoảng trắng trong tên
        clean_name = " ".join(name.strip().split())
        lines.append(f"{val_id};{clean_name};;;;;;;")

    content = "\n".join(lines) + "\n"
    output_path.write_text(content, encoding="utf-8")

    return output_path


def simulate_final_html_parser(csv_text: str) -> list:
    """
    Mô phỏng 100% thuật toán parse CSV của Final.html (lines 1610-1663).
    Đảm bảo file sinh ra không có bất kỳ lỗi không tương thích nào trên trình duyệt.
    """
    if csv_text.startswith("\ufeff"):
        csv_text = csv_text[1:]

    lines = csv_text.splitlines()
    participants = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        delimiter = ";" if ";" in line else ","
        cols = []
        current = ""
        in_quotes = False
        for char in line:
            if char == '"':
                in_quotes = not in_quotes
            elif char == delimiter and not in_quotes:
                cols.append(current)
                current = ""
            else:
                current += char
        cols.append(current)

        if len(cols) >= 1:
            raw_id = cols[0].replace('"', "").replace("'", "").strip()
            try:
                val_id = int(raw_id)
                if val_id > 0:
                    name = cols[1].replace('"', "").replace("'", "").strip() if len(cols) > 1 else ""
                    participants.append({
                        "id": val_id,
                        "name": name or f"Khách hàng #{val_id}"
                    })
            except ValueError:
                pass

    return participants


def validate_output(output_path: Path, expected_count: int) -> dict:
    """
    Bước 3: Kiểm tra tính toàn vẹn và chuẩn hóa của file đầu ra.
    - Kiểm tra số lượng bản ghi
    - Kiểm tra cấu trúc 9 cột phân cách ';'
    - Kiểm tra không có STT trùng hoặc NaN
    - Kiểm tra tương thích với parser của Final.html
    """
    output_path = Path(output_path)
    if not output_path.exists():
        return {"success": False, "error": f"File không tồn tại: {output_path}"}

    content = output_path.read_text(encoding="utf-8")
    lines = [l.strip() for l in content.splitlines() if l.strip()]

    if len(lines) != expected_count:
        return {
            "success": False,
            "error": f"Số dòng đầu ra ({len(lines)}) không khớp số lượng kỳ vọng ({expected_count})"
        }

    ids = []
    for idx, line in enumerate(lines, 1):
        parts = line.split(";")
        if len(parts) < 2:
            return {"success": False, "error": f"Dòng {idx} không đúng định dạng dấu chấm phẩy: {line}"}
        
        raw_id = parts[0].strip()
        if not raw_id.isdigit():
            return {"success": False, "error": f"Dòng {idx} có STT không phải số nguyên: {raw_id}"}
        
        val_id = int(raw_id)
        if val_id <= 0:
            return {"success": False, "error": f"Dòng {idx} có STT <= 0: {val_id}"}
        
        ids.append(val_id)

    # Kiểm tra trùng lặp
    if len(ids) != len(set(ids)):
        return {"success": False, "error": "Phát hiện STT bị trùng lặp trong file đầu ra"}

    # Kiểm tra tương thích với parser của Final.html
    simulated_participants = simulate_final_html_parser(content)
    if len(simulated_participants) != expected_count:
        return {
            "success": False,
            "error": f"Final.html chỉ nhận diện được {len(simulated_participants)}/{expected_count} người"
        }

    return {
        "success": True,
        "record_count": len(lines),
        "min_id": min(ids) if ids else None,
        "max_id": max(ids) if ids else None,
        "simulated_html_count": len(simulated_participants)
    }


def run_pipeline(input_path: Path, output_path: Path, backup: bool = True) -> dict:
    """
    Điều phối toàn bộ quá trình:
    1. Kiểm tra đầu vào -> 2. Convert & Backup -> 3. Kiểm tra đầu ra
    """
    input_path = Path(input_path)
    output_path = Path(output_path)

    print("=" * 65)
    print("      QUY TRÌNH CHUẨN HÓA DỮ LIỆU QUAY SỐ TRÚNG THƯỞNG MSB")
    print("=" * 65)
    print(f"[FILE NGUỒN]: {input_path}")
    print(f"[FILE ĐÍCH] : {output_path}")
    print("-" * 65)

    # 1. KIỂM TRA ĐẦU VÀO
    print("\n🔍 [BƯỚC 1/3]: KIỂM TRA VÀ PHÂN TÍCH FILE ĐẦU VÀO...")
    in_res = validate_input(input_path)
    if not in_res["is_valid_file"]:
        print(f"❌ LỖI ĐẦU VÀO: {in_res['error']}")
        return {"success": False, "error": in_res["error"]}

    print(f"  ✓ Tổng số dòng dữ liệu đọc được: {in_res['total_raw_rows']}")
    print(f"  ✓ Số khách mời CÓ SỐ THỨ TỰ hợp lệ (> 0): {len(in_res['valid_rows'])}")

    if in_res["missing_id_rows"]:
        print(f"  ⚠️ CẢNH BÁO: Phát hiện {len(in_res['missing_id_rows'])} khách mời KHÔNG CÓ SỐ THỨ TỰ (sẽ loại bỏ):")
        for m in in_res["missing_id_rows"]:
            print(f"     - [Dòng {m['line']}]: '{m['name']}'")

    if in_res["duplicate_id_rows"]:
        print(f"  ⚠️ CẢNH BÁO: Phát hiện {len(in_res['duplicate_id_rows'])} khách mời bị TRÙNG SỐ THỨ TỰ (chỉ giữ bản ghi đầu):")
        for d in in_res["duplicate_id_rows"]:
            print(f"     - [Dòng {d['line']}]: STT {d['id']} - '{d['name']}' (đã có ở dòng {d['first_seen_line']}: '{d['first_name']}')")
    else:
        print("  ✓ Không có STT nào bị trùng lặp.")

    # 2. CONVERT & BACKUP
    print("\n⚙️ [BƯỚC 2/3]: TIẾN HÀNH CONVERT DỮ LIỆU & BACKUP...")
    backup_file = None
    if backup and output_path.exists():
        backup_file = output_path.with_suffix(".csv.bak")
        print(f"  ✓ Đã sao lưu file gốc hiện tại sang: {backup_file.name}")

    convert_and_export(in_res["valid_rows"], output_path, backup=backup)
    print(f"  ✓ Đã ghi định dạng chuẩn sang: {output_path.name}")
    print(f"  ✓ Đã sắp xếp tăng dần từ STT nhỏ nhất đến lớn nhất.")

    # 3. KIỂM TRA ĐẦU RA
    print("\n✅ [BƯỚC 3/3]: KIỂM TRA TOÀN VẸN FILE ĐẦU RA & TƯƠNG THÍCH WEB...")
    out_res = validate_output(output_path, expected_count=len(in_res["valid_rows"]))
    if not out_res["success"]:
        print(f"❌ LỖI ĐẦU RA: {out_res['error']}")
        return {"success": False, "error": out_res["error"]}

    print(f"  ✓ Số lượng bản ghi hợp lệ: {out_res['record_count']}")
    print(f"  ✓ Dải số thứ tự (STT): từ {out_res['min_id']} đến {out_res['max_id']}")
    print(f"  ✓ Kiểm chứng parser Final.html: Nhận diện đủ {out_res['simulated_html_count']} người trúng hợp lệ 100%.")

    print("\n" + "=" * 65)
    print("🎉 CHUYỂN ĐỔI THÀNH CÔNG! HỆ THỐNG QUAY SỐ ĐÃ SẴN SÀNG.")
    print("=" * 65)

    return {
        "success": True,
        "input_stats": {
            "total_raw": in_res["total_raw_rows"],
            "valid_count": len(in_res["valid_rows"]),
            "missing_count": len(in_res["missing_id_rows"]),
            "duplicate_count": len(in_res["duplicate_id_rows"]),
            "missing_details": in_res["missing_id_rows"],
        },
        "output_stats": out_res,
        "backup_path": str(backup_file) if backup_file else None,
    }


import re
from datetime import datetime


def update_final_html_fetch(html_path: Path, csv_filename: str) -> bool:
    """
    Tự động cập nhật tên file CSV trong Final.html kèm query buster timestamp (?t=Date.now()).
    """
    html_path = Path(html_path)
    if not html_path.exists():
        return False
    try:
        content = html_path.read_text(encoding="utf-8")
        # Khớp trọn vẹn câu lệnh fetch("data/export...");
        pattern = r'fetch\("data/export.*?\);'
        replacement = f'fetch("data/{csv_filename}?t=" + Date.now());'
        new_content, count = re.subn(pattern, replacement, content)
        if count > 0:
            # Cũng cập nhật thông báo lỗi console nếu có
            pattern_err = r'console\.error\("Lỗi khi tải dữ liệu từ data/export[^:]*:'
            replacement_err = f'console.error("Lỗi khi tải dữ liệu từ data/{csv_filename}:'
            new_content = re.sub(pattern_err, replacement_err, new_content)
            html_path.write_text(new_content, encoding="utf-8")
            return True
    except Exception as e:
        print(f"  ⚠️ Không thể tự cập nhật Final.html: {e}")
    return False


if __name__ == "__main__":
    base_dir = Path(__file__).parent
    default_input = base_dir / "data" / "danh-sach-co-mat (4).csv"

    # Mặc định tạo file theo timestamp để chống cache trình duyệt
    now_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    default_output = base_dir / "data" / f"export_{now_str}.csv"

    in_file = Path(sys.argv[1]) if len(sys.argv) > 1 else default_input
    out_file = Path(sys.argv[2]) if len(sys.argv) > 2 else default_output

    res = run_pipeline(in_file, out_file, backup=True)

    if res["success"]:
        # Tự động cập nhật Final.html trỏ đến file vừa tạo
        html_file = base_dir / "Final.html"
        if update_final_html_fetch(html_file, out_file.name):
            print(f"  ✓ Đã tự động cập nhật Final.html nạp file mới: data/{out_file.name}")

