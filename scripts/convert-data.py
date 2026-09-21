import openpyxl
import csv
import json
import os
import shutil
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def main():
    excel_path = r'c:\Users\hiepvd2\Desktop\lottery_lpmedia\data\Data Import.xlsx'
    csv_path = r'c:\Users\hiepvd2\Desktop\lottery_lpmedia\data\data.csv'
    csv_bak_path = r'c:\Users\hiepvd2\Desktop\lottery_lpmedia\data\data.csv.bak'
    dist_csv_path = r'c:\Users\hiepvd2\Desktop\lottery_lpmedia\dist\data\data.csv'

    print(f"Loading Excel file from {excel_path}...")
    wb = openpyxl.load_workbook(excel_path)
    sheet = wb.active

    rows = list(sheet.iter_rows(values_only=True))
    header = rows[0]
    print(f"Excel header: {header}")

    # Backup existing data.csv
    if os.path.exists(csv_path):
        shutil.copyfile(csv_path, csv_bak_path)
        print(f"Backed up {csv_path} to {csv_bak_path}")

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
        # Loại bỏ tiền tố ÔNG, BÀ (kể cả nhiều dấu cách) và viết hoa toàn bộ
        name = re.sub(r"^(ÔNG|BÀ)\s+", "", raw_name, flags=re.IGNORECASE).strip().upper()

        agency = str(row[3]).strip() if row[3] is not None else ""
        
        raw_cccd = str(row[4]).strip() if row[4] is not None else ""
        # Xóa bỏ dấu nháy ' và " ở đầu/cuối
        clean_cccd = raw_cccd.strip("'\"").strip()
        # Bù số 0 ở đầu nếu là CCCD có 10-11 số do Excel làm mất số 0
        if clean_cccd.isdigit() and 9 <= len(clean_cccd) <= 11:
            clean_cccd = clean_cccd.zfill(12)
        cccd = clean_cccd

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
            "prizeWon": prizeWon
        })

        inline_data.append({
            "id": int(code_4),
            "code": code_4,
            "name": name,
            "phone": phone,
            "nationalId": cccd,
            "agency": agency,
            "answer": answer,
            "prizeWon": prizeWon
        })

    print(f"Successfully converted {len(converted_rows)} participants.")

    # Write to data/data.csv
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(["id", "name", "phone", "nationalId", "agency", "answer", "prizeWon"])
        for r in converted_rows:
            writer.writerow([
                r["id"],
                r["name"],
                r["phone"],
                r["nationalId"],
                r["agency"],
                r["answer"],
                r["prizeWon"]
            ])
    print(f"Wrote {len(converted_rows)} rows to {csv_path}")

    # Write to dist/data/data.csv if dist exists
    if os.path.exists(os.path.dirname(dist_csv_path)):
        shutil.copyfile(csv_path, dist_csv_path)
        print(f"Updated {dist_csv_path}")

    # Save inline JSON for Final.html embedding
    inline_json_path = r'c:\Users\hiepvd2\Desktop\lottery_lpmedia\data\inline_participants.json'
    with open(inline_json_path, 'w', encoding='utf-8') as f:
        json.dump(inline_data, f, ensure_ascii=False, indent=2)
    print(f"Saved inline data to {inline_json_path}")

if __name__ == "__main__":
    main()
