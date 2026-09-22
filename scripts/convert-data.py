import openpyxl
import csv
import json
import os
import shutil
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def main():
    excel_path = r'c:\Users\hiepvd2\Desktop\lottery_lpmedia\data\KetQuaCheckin_22-09-20260936.xlsx'
    import_csv_path = r'c:\Users\hiepvd2\Desktop\lottery_lpmedia\data\data_import.csv'
    dist_import_csv_path = r'c:\Users\hiepvd2\Desktop\lottery_lpmedia\dist\data\data_import.csv'
    inline_json_path = r'c:\Users\hiepvd2\Desktop\lottery_lpmedia\data\inline_participants.json'

    print(f"Loading Excel file from {excel_path}...")
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    sheet = wb.active

    rows = list(sheet.iter_rows(values_only=True))
    header = rows[0]
    print(f"Excel header: {header}")

    converted_rows = []
    inline_data = []

    for i, row in enumerate(rows[1:], start=2):
        raw_code = str(row[0]).strip() if row[0] is not None else ""
        match = re.match(r"^(\d{4})", raw_code)
        if not match:
            print(f"Warning: Row {i} has invalid code: '{raw_code}'")
            continue
        code_4 = match.group(1)
        
        raw_name = str(row[1]).strip() if row[1] is not None else ""
        # Loại bỏ tiền tố ÔNG, BÀ (kể cả nhiều dấu cách thừa) và viết hoa toàn bộ
        name = re.sub(r"^(ÔNG|BÀ)\s+", "", raw_name, flags=re.IGNORECASE).strip().upper()

        agency = str(row[3]).strip() if row[3] is not None else ""
        
        raw_cccd = str(row[4]).strip() if row[4] is not None else ""
        # Xóa bỏ dấu nháy ' và " ở đầu/cuối
        clean_cccd = raw_cccd.strip("'\"").strip()
        if clean_cccd.lower() == 'none':
            clean_cccd = ""
        # Bù số 0 ở đầu nếu là CCCD có 9-11 số do Excel làm mất số 0
        if clean_cccd.isdigit() and 9 <= len(clean_cccd) <= 11:
            clean_cccd = clean_cccd.zfill(12)
        cccd = clean_cccd

        raw_note = str(row[5]).strip() if len(row) > 5 and row[5] is not None else ""
        if raw_note.lower() == 'none':
            raw_note = ""
        note = raw_note

        phone = ""
        answer = "C"
        prizeWon = ""

        converted_rows.append({
            "id": code_4,
            "name": name,
            "phone": phone,
            "nationalId": cccd,
            "agency": agency,
            "answer": answer,
            "prizeWon": prizeWon,
            "note": note
        })

        inline_data.append({
            "id": int(code_4),
            "code": code_4,
            "name": name,
            "phone": phone,
            "nationalId": cccd,
            "agency": agency,
            "note": note,
            "answer": answer,
            "prizeWon": prizeWon
        })

    print(f"Successfully converted {len(converted_rows)} participants for quayso.html.")

    # Write ONLY to data/data_import.csv (for quayso.html)
    with open(import_csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(["id", "name", "phone", "nationalId", "agency", "answer", "prizeWon", "note"])
        for r in converted_rows:
            writer.writerow([
                r["id"],
                r["name"],
                r["phone"],
                r["nationalId"],
                r["agency"],
                r["answer"],
                r["prizeWon"],
                r["note"]
            ])
    print(f"Wrote {len(converted_rows)} rows to {import_csv_path}")

    if os.path.exists(os.path.dirname(dist_import_csv_path)):
        shutil.copyfile(import_csv_path, dist_import_csv_path)
        print(f"Updated {dist_import_csv_path}")

    # Save inline JSON for quayso.html embedding
    with open(inline_json_path, 'w', encoding='utf-8') as f:
        json.dump(inline_data, f, ensure_ascii=False, indent=2)
    print(f"Saved inline data to {inline_json_path}")

if __name__ == "__main__":
    main()
