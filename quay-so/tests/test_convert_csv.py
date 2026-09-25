import unittest
import tempfile
import shutil
from pathlib import Path
import sys
import os

# Add parent directory to sys.path so we can import convert_csv
sys.path.insert(0, str(Path(__file__).parent.parent))

from convert_csv import (
    validate_input,
    convert_and_export,
    validate_output,
    simulate_final_html_parser,
    run_pipeline,
)


class TestCSVConversion(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.test_dir_path = Path(self.test_dir)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_validate_input_with_missing_and_duplicates(self):
        # Tạo file CSV mẫu có header, dòng chuẩn, dòng thiếu số, dòng trùng số
        sample_csv = self.test_dir_path / "sample_input.csv"
        sample_content = (
            "Số thứ tự,Tên khách mời\n"
            "36,PHẠM VĂN PHÚC\n"
            "37,TRẦN THỊ HƯƠNG\n"
            ",Nguyễn Bá Hào\n"  # Không có số
            "38,NGUYỄN THỊ THƠ\n"
            ",VŨ THỊ VÂN ANH\n"  # Không có số
            "36,PHẠM VĂN PHÚC TRÙNG\n"  # Trùng số 36
        )
        sample_csv.write_text(sample_content, encoding="utf-8")

        result = validate_input(sample_csv)

        self.assertTrue(result["is_valid_file"])
        self.assertEqual(result["total_raw_rows"], 6)
        # Có 3 số hợp lệ duy nhất: 36, 37, 38
        self.assertEqual(len(result["valid_rows"]), 3)
        # 2 dòng thiếu số
        self.assertEqual(len(result["missing_id_rows"]), 2)
        missing_names = [m["name"] for m in result["missing_id_rows"]]
        self.assertIn("Nguyễn Bá Hào", missing_names)
        self.assertIn("VŨ THỊ VÂN ANH", missing_names)

        # 1 dòng trùng số
        self.assertEqual(len(result["duplicate_id_rows"]), 1)
        self.assertEqual(result["duplicate_id_rows"][0]["id"], 36)

    def test_convert_and_export_format(self):
        valid_rows = [
            (40, "NGUYỄN THÀNH TRUNG"),
            (36, "PHẠM VĂN PHÚC"),
            (38, "NGUYỄN THỊ THƠ"),
        ]
        output_csv = self.test_dir_path / "export.csv"

        # Chạy convert
        convert_and_export(valid_rows, output_csv, backup=False)

        self.assertTrue(output_csv.exists())
        lines = output_csv.read_text(encoding="utf-8").strip().splitlines()

        # Đã sắp xếp tăng dần: 36, 38, 40
        self.assertEqual(len(lines), 3)
        self.assertEqual(lines[0], "36;PHẠM VĂN PHÚC;;;;;;;")
        self.assertEqual(lines[1], "38;NGUYỄN THỊ THƠ;;;;;;;")
        self.assertEqual(lines[2], "40;NGUYỄN THÀNH TRUNG;;;;;;;")

    def test_backup_existing_file(self):
        output_csv = self.test_dir_path / "export.csv"
        output_csv.write_text("OLD CONTENT", encoding="utf-8")

        valid_rows = [(1, "CTY TEST")]
        convert_and_export(valid_rows, output_csv, backup=True)

        backup_file = self.test_dir_path / "export.csv.bak"
        self.assertTrue(backup_file.exists())
        self.assertEqual(backup_file.read_text(encoding="utf-8"), "OLD CONTENT")

    def test_validate_output_and_simulate_html(self):
        output_csv = self.test_dir_path / "export.csv"
        content = (
            "36;PHẠM VĂN PHÚC;;;;;;;\n"
            "37;TRẦN THỊ HƯƠNG;;;;;;;\n"
            "38;NGUYỄN THỊ THƠ;;;;;;;\n"
        )
        output_csv.write_text(content, encoding="utf-8")

        validation = validate_output(output_csv, expected_count=3)
        self.assertTrue(validation["success"])
        self.assertEqual(validation["record_count"], 3)

        # Kiểm tra giả lập Final.html đọc file
        html_participants = simulate_final_html_parser(content)
        self.assertEqual(len(html_participants), 3)
        self.assertEqual(html_participants[0]["id"], 36)
        self.assertEqual(html_participants[0]["name"], "PHẠM VĂN PHÚC")

    def test_run_pipeline_end_to_end(self):
        input_csv = self.test_dir_path / "input.csv"
        input_csv.write_text(
            "STT,Tên\n10,CÔNG TY A\n,VÔ DANH\n20,CÔNG TY B\n", encoding="utf-8"
        )
        output_csv = self.test_dir_path / "output.csv"

        summary = run_pipeline(input_csv, output_csv, backup=False)
        self.assertTrue(summary["success"])
        self.assertEqual(summary["input_stats"]["valid_count"], 2)
        self.assertEqual(summary["input_stats"]["missing_count"], 1)
        self.assertEqual(summary["output_stats"]["record_count"], 2)


if __name__ == "__main__":
    unittest.main()
