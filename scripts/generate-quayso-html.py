import json
import os

def generate_quayso_html():
    # Load inline participants
    json_path = os.path.join('data', 'inline_participants.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        participants = json.load(f)

    json_str = json.dumps(participants, ensure_ascii=False)

    html_content = f'''<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap" rel="stylesheet" />
    <title>Quay Số Trúng Thưởng - Giải Nhất Nhì Ba</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            text-rendering: optimizeLegibility;
        }}

        body {{
            font-family: "Be Vietnam Pro", Arial, sans-serif;
            background-color: #2b550b;
            background-image: radial-gradient(circle at 50% 30%, #386b0e 0%, #2b550b 60%, #173305 100%);
            color: #fff;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow-x: hidden;
        }}

        .game-root {{
            width: 100%;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px 20px 50px 20px;
            position: relative;
            z-index: 2;
        }}

        /* ===== THANH TOP BAR SÂN KHẤU & LOGO ===== */
        .stage-top-bar {{
            display: flex;
            justify-content: flex-end;
            align-items: center;
            width: 100%;
            max-width: 1280px;
            margin-bottom: 24px;
            padding: 0 8px;
        }}

        .action-btn-group {{
            display: flex;
            gap: 12px;
            align-items: center;
        }}

        .btn-top-icon {{
            background: rgba(14, 30, 6, 0.75);
            border: 1.5px solid rgba(226, 180, 72, 0.5);
            color: #ffeaa7;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.25s ease;
            backdrop-filter: blur(8px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }}

        .btn-top-icon:hover {{
            background: linear-gradient(135deg, #d4ac0d 0%, #f1c40f 100%);
            color: #0f2005;
            border-color: #fff3c4;
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 6px 20px rgba(241, 196, 15, 0.6);
        }}

        .icon-svg {{
            width: 20px;
            height: 20px;
        }}

        /* ===== KHỐI TRUNG TÂM QUAY SỐ ===== */
        .stage-center-box {{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 900px;
            margin-top: 10px;
            text-align: center;
        }}

        /* Bộ chọn giải thưởng */
        .prize-selector-card {{
            background: rgba(12, 26, 6, 0.85);
            border: 2px solid rgba(226, 180, 72, 0.6);
            border-radius: 20px;
            padding: 16px 28px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 30px rgba(226, 180, 72, 0.2);
            backdrop-filter: blur(12px);
            margin-bottom: 36px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }}

        .prize-selector-label {{
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #ffeaa7;
            text-shadow: 0 2px 8px rgba(226, 180, 72, 0.5);
        }}

        .prize-select-wrapper {{
            position: relative;
            display: inline-block;
        }}

        #prizeSelect {{
            appearance: none;
            -webkit-appearance: none;
            background: linear-gradient(135deg, #18330c 0%, #0d1e06 100%);
            border: 2px solid #e2b448;
            border-radius: 14px;
            color: #fff3c4;
            font-family: "Be Vietnam Pro", sans-serif;
            font-size: 28px;
            font-weight: 900;
            line-height: 1.4;
            min-height: 64px;
            padding: 14px 56px 12px 24px;
            cursor: pointer;
            outline: none;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
            transition: all 0.25s ease;
        }}

        #prizeSelect option {{
            background-color: #0d1e06;
            color: #fff3c4;
            padding: 12px 20px;
            font-size: 20px;
            font-weight: 700;
            line-height: 1.4;
        }}

        #prizeSelect:hover, #prizeSelect:focus {{
            border-color: #fff3c4;
            box-shadow: 0 0 20px rgba(226, 180, 72, 0.5);
        }}

        .select-arrow {{
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            color: #e2b448;
            font-size: 18px;
            font-weight: 900;
        }}

        .prize-filter-toggle {{
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12.5px;
            color: #d2e4cb;
            cursor: pointer;
            user-select: none;
            margin-top: 4px;
        }}

        .prize-filter-toggle input {{
            cursor: pointer;
            accent-color: #e2b448;
            width: 16px;
            height: 16px;
        }}

        /* Máy quay Slot Machine */
        .slot-machine-container {{
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-bottom: 36px;
            padding: 20px 28px;
            background: rgba(10, 22, 5, 0.88);
            border: 2px solid rgba(226, 180, 72, 0.45);
            border-radius: 28px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8), 0 0 40px rgba(226, 180, 72, 0.25);
            backdrop-filter: blur(14px);
        }}

        .slot-box {{
            width: 120px;
            height: 160px;
            background: radial-gradient(circle at 50% 20%, #1e3c0f 0%, #0c1c06 100%);
            border: 3px solid #e2b448;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 96px;
            font-weight: 900;
            color: #fff3c4;
            box-shadow: inset 0 0 25px rgba(0, 0, 0, 0.9), 0 6px 20px rgba(0, 0, 0, 0.6);
            text-shadow: 0 0 25px rgba(255, 234, 167, 0.5), 0 4px 15px rgba(0, 0, 0, 0.9);
            font-variant-numeric: tabular-nums;
            font-feature-settings: "tnum";
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }}

        .slot-box.is-spinning {{
            border-color: #fff3c4;
            box-shadow: 0 0 30px rgba(241, 196, 15, 0.8), inset 0 0 20px rgba(241, 196, 15, 0.4);
            animation: pulseGlow 0.4s infinite alternate;
        }}

        @keyframes pulseGlow {{
            0% {{ box-shadow: 0 0 15px rgba(241, 196, 15, 0.5); }}
            100% {{ box-shadow: 0 0 35px rgba(255, 243, 196, 0.9); }}
        }}

        .slot-box.is-stopped {{
            border-color: #e2b448;
            transform: scale(1.02);
        }}

        /* Nút quay số lớn */
        .btn-spin-action {{
            background: linear-gradient(135deg, #d4ac0d 0%, #f1c40f 50%, #b7950b 100%);
            border: 2px solid #fff3c4;
            border-radius: 40px;
            color: #122204;
            font-family: "Be Vietnam Pro", sans-serif;
            font-size: 24px;
            font-weight: 900;
            height: 64px;
            min-width: 320px;
            padding: 0 48px;
            cursor: pointer;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            box-shadow: 0 6px 25px rgba(241, 196, 15, 0.5), 0 0 35px rgba(241, 196, 15, 0.3);
            transition: all 0.25s ease;
            outline: none;
        }}

        .btn-spin-action:hover:not(:disabled) {{
            background: linear-gradient(135deg, #b7950b 0%, #d4ac0d 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 35px rgba(241, 196, 15, 0.8);
        }}

        .btn-spin-action:disabled {{
            background: rgba(226, 180, 72, 0.35);
            border-color: rgba(226, 180, 72, 0.35);
            color: rgba(255, 255, 255, 0.5);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }}

        .btn-spin-action.btn-stopping {{
            background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
            border-color: #ffb8b8;
            color: #ffffff;
            box-shadow: 0 6px 25px rgba(231, 76, 60, 0.6);
        }}

        /* ===== BẢNG DANH SÁCH TRÚNG GIẢI (HALL OF FAME) ===== */
        .winners-history-container {{
            width: 100%;
            max-width: 1000px;
            margin-top: 48px;
            background: rgba(12, 26, 6, 0.9);
            border: 1.5px solid rgba(226, 180, 72, 0.45);
            border-radius: 20px;
            padding: 24px 28px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(12px);
        }}

        .winners-history-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(226, 180, 72, 0.3);
            padding-bottom: 14px;
            margin-bottom: 18px;
        }}

        .winners-history-title {{
            font-size: 18px;
            font-weight: 800;
            color: #fff3c4;
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }}

        .winners-count-tag {{
            font-size: 13px;
            font-weight: 700;
            color: #e2b448;
            background: rgba(226, 180, 72, 0.15);
            padding: 4px 12px;
            border-radius: 12px;
            border: 1px solid rgba(226, 180, 72, 0.3);
        }}

        .winners-table {{
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }}

        .winners-table th {{
            font-size: 12px;
            font-weight: 800;
            color: #e2b448;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 10px 14px;
            border-bottom: 1px solid rgba(226, 180, 72, 0.2);
        }}

        .winners-table td {{
            font-size: 14px;
            padding: 12px 14px;
            color: #fff;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }}

        .winners-table tr:hover td {{
            background: rgba(226, 180, 72, 0.08);
        }}

        .badge-prize {{
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}

        .badge-giai-dac-biet {{ background: rgba(231, 76, 60, 0.25); color: #ff9999; border: 1px solid #e74c3c; }}
        .badge-giai-nhat {{ background: rgba(241, 196, 15, 0.25); color: #ffeaa7; border: 1px solid #f1c40f; }}
        .badge-giai-nhi {{ background: rgba(189, 195, 199, 0.25); color: #ecf0f1; border: 1px solid #bdc3c7; }}
        .badge-giai-ba {{ background: rgba(230, 126, 34, 0.25); color: #f39c12; border: 1px solid #d35400; }}
        .badge-khac {{ background: rgba(46, 204, 113, 0.2); color: #a8f0c6; border: 1px solid #2ecc71; }}

        .code-col {{
            font-weight: 800;
            color: #fff3c4;
            font-size: 16px;
            letter-spacing: 1px;
        }}

        .empty-history-text {{
            text-align: center;
            color: #888;
            font-style: italic;
            padding: 24px 0;
            font-size: 14px;
        }}

        /* ===== MODAL VINH DANH CỰC ĐẠI CHO MC ===== */
        .winner-announcement-backdrop {{
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(6, 15, 3, 0.88);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            z-index: 2000;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }}

        .winner-announcement-backdrop.show {{
            display: flex;
            opacity: 1;
        }}

        .winner-announcement-box {{
            background: radial-gradient(circle at 50% 10%, #1a360c 0%, #0a1804 90%);
            border: 2.5px solid #e2b448;
            border-radius: 24px;
            width: 92%;
            max-width: 720px;
            padding: 36px 32px 40px 32px;
            text-align: center;
            box-shadow: 0 0 60px rgba(226, 180, 72, 0.45), 0 20px 50px rgba(0, 0, 0, 0.85);
            transform: scale(0.85);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
        }}

        .winner-announcement-backdrop.show .winner-announcement-box {{
            transform: scale(1);
        }}

        .winner-congrats-tag {{
            color: #fff3c4;
            font-size: 15px;
            font-weight: 800;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 8px;
            text-shadow: 0 2px 8px rgba(226, 180, 72, 0.6);
        }}

        .winner-rank-large {{
            color: #f1c40f;
            font-size: 26px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 8px;
        }}

        .winner-code-large {{
            font-size: 88px;
            font-weight: 900;
            letter-spacing: 4px;
            color: #fff3c4;
            line-height: 1;
            margin: 10px 0 16px 0;
            text-shadow: 0 0 25px rgba(255, 243, 196, 0.4), 0 4px 15px rgba(0, 0, 0, 0.9);
            font-family: "Be Vietnam Pro", sans-serif;
        }}

        .winner-name-large {{
            font-size: 44px;
            font-weight: 900;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            line-height: 1.2;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
            word-break: break-word;
        }}

        .winner-agency-large {{
            font-size: 24px;
            font-weight: 700;
            color: #d2e4cb;
            margin-bottom: 18px;
            letter-spacing: 0.5px;
        }}

        .winner-secure-large {{
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: rgba(226, 180, 72, 0.15);
            border: 1px solid rgba(226, 180, 72, 0.4);
            padding: 8px 22px;
            border-radius: 30px;
            font-size: 18px;
            font-weight: 700;
            color: #fff3c4;
            letter-spacing: 1px;
        }}

        .winner-actions-group {{
            display: flex;
            gap: 16px;
            justify-content: center;
            align-items: center;
            margin-top: 26px;
            flex-wrap: wrap;
        }}

        .winner-btn-action {{
            background: linear-gradient(135deg, #d4ac0d 0%, #f1c40f 50%, #b7950b 100%);
            color: #122204;
            border: 2px solid #fff3c4;
            border-radius: 35px;
            padding: 0 38px;
            height: 52px;
            min-width: 190px;
            font-size: 18px;
            font-weight: 900;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            cursor: pointer;
            box-shadow: 0 6px 25px rgba(241, 196, 15, 0.5);
            transition: all 0.25s ease;
            font-family: "Be Vietnam Pro", sans-serif;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }}

        .winner-btn-action:hover {{
            background: linear-gradient(135deg, #b7950b 0%, #d4ac0d 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(241, 196, 15, 0.7);
        }}

        .winner-btn-absent {{
            background: rgba(180, 45, 45, 0.25);
            color: #ffb8b8;
            border: 2px solid rgba(235, 87, 87, 0.75);
            border-radius: 35px;
            padding: 0 28px;
            height: 52px;
            min-width: 180px;
            font-size: 17px;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(220, 53, 69, 0.3);
            transition: all 0.25s ease;
            font-family: "Be Vietnam Pro", sans-serif;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }}

        .winner-btn-absent:hover {{
            background: rgba(220, 53, 69, 0.5);
            border-color: #ff6b6b;
            color: #ffffff;
            transform: translateY(-2px);
        }}

        /* Responsive */
        @media screen and (max-width: 768px) {{
            .slot-machine-container {{
                gap: 8px;
                padding: 12px 16px;
            }}
            .slot-box {{
                width: 70px;
                height: 100px;
                font-size: 56px;
                border-radius: 12px;
            }}
            #prizeSelect {{
                font-size: 20px;
                line-height: 1.3;
                min-height: 52px;
                padding: 10px 42px 10px 18px;
            }}
            .btn-spin-action {{
                font-size: 18px;
                height: 52px;
                min-width: 240px;
            }}
            .winner-code-large {{
                font-size: 64px;
            }}
            .winner-name-large {{
                font-size: 28px;
            }}
        }}
    </style>
</head>
<body>
    <!-- CANVAS PHÁO HOA GIẤY (CONFETTI EFFECT) -->
    <canvas id="confettiCanvas" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999; display: none;"></canvas>

    <div class="game-root">
        <!-- THANH TOP BAR SÂN KHẤU -->
        <div class="stage-top-bar">
            <div class="action-btn-group">
                <button class="btn-top-icon" onclick="clearWinnersHistory()" title="Làm mới phiên quay" aria-label="Làm mới">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                    </svg>
                </button>
                <button class="btn-top-icon" onclick="toggleFullScreen()" title="Toàn màn hình (F11)" aria-label="Toàn màn hình">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- KHỐI TRUNG TÂM QUAY SỐ -->
        <div class="stage-center-box">
            <!-- Bộ chọn giải thưởng -->
            <div class="prize-selector-card">
                <div class="prize-selector-label">HẠNG MỤC QUAY THƯỞNG</div>
                <div class="prize-select-wrapper">
                    <select id="prizeSelect">
                        <option value="Giải Đặc Biệt">GIẢI ĐẶC BIỆT</option>
                        <option value="Giải Nhất" selected>GIẢI NHẤT</option>
                        <option value="Giải Nhì">GIẢI NHÌ</option>
                        <option value="Giải Ba">GIẢI BA</option>
                        <option value="Giải Khuyến Khích">GIẢI KHUYẾN KHÍCH</option>
                    </select>
                    <span class="select-arrow">▼</span>
                </div>
            </div>

            <!-- Cụm Slot Machine 4 số -->
            <div class="slot-machine-container">
                <div class="slot-box" id="slot0">0</div>
                <div class="slot-box" id="slot1">0</div>
                <div class="slot-box" id="slot2">0</div>
                <div class="slot-box" id="slot3">0</div>
            </div>

            <!-- Nút Quay số -->
            <button class="btn-spin-action" id="spinButton" onclick="toggleSpin()">QUAY SỐ</button>
        </div>

        <!-- BẢNG DANH SÁCH TRÚNG GIẢI (HALL OF FAME) -->
        <div class="winners-history-container" id="winnersHistoryContainer" style="display: none;">
            <div class="winners-history-header">
                <div class="winners-history-title">KẾT QUẢ</div>
                <div class="winners-count-tag" id="winnersCountTag">Đã trao: 0 giải</div>
            </div>
            <table class="winners-table">
                <thead>
                    <tr>
                        <th>Hạng mục giải</th>
                        <th>Mã số</th>
                        <th>Họ và tên</th>
                        <th>Đơn vị / Sàn</th>
                        <th>CCCD</th>
                    </tr>
                </thead>
                <tbody id="winnersTableBody">
                    <tr>
                        <td colspan="5" class="empty-history-text">Chưa có giải thưởng nào được trao trong phiên này.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- MODAL VINH DANH NGƯỜI TRÚNG GIẢI CỰC ĐẠI CHO MC -->
    <div class="winner-announcement-backdrop" id="winnerModal">
        <div class="winner-announcement-box">
            <div class="winner-congrats-tag">CHÚC MỪNG CHIẾN THẮNG</div>
            <div class="winner-rank-large" id="modalPrizeName">GIẢI NHẤT</div>
            <div class="winner-code-large" id="modalWinnerCode">#0000</div>
            <div class="winner-name-large" id="modalWinnerName">NGUYỄN VĂN A</div>
            <div class="winner-agency-large" id="modalWinnerAgency">ĐƠN VỊ PHÂN PHỐI</div>
            <div class="winner-secure-large">
                <span>CCCD:</span>
                <span id="modalWinnerCCCD">************</span>
            </div>
            <div class="winner-actions-group">
                <button class="winner-btn-action" onclick="confirmPrizeWinner()">XÁC NHẬN TRAO GIẢI</button>
                <button class="winner-btn-absent" onclick="respinAbsentWinner()">QUAY LẠI (VẮNG MẶT)</button>
            </div>
        </div>
    </div>

    <script>
    // Dữ liệu inline dự phòng 779 người từ Excel
    const INLINE_IMPORT_PARTICIPANTS = {json_str};

    const BANK_KEYWORDS = [
      'AGRIBANK', 'ACB', 'PVCOMBANK', 'MB ', 'MB THUẬN AN', 'MB TÂN THUẬN', 
      'VIETCOMBANK', 'PUBLIC BANK', 'OCB'
    ];
    const PARTNER_KEYWORDS = [
      'NAGECCO', 'HONA-G', 'P&K', 'SAE CONSTRUCTION', 'NAM LỘC TIẾN', 
      'OBC HOLDINGS', 'GIA NGHĨA HOME'
    ];

    function isGuest(p) {{
      const note = (p.note || '').toString().trim().toUpperCase();
      const agency = (p.agency || '').toString().trim().toUpperCase();
      if (note.includes('VIP') || !agency) return true;
      for (const b of BANK_KEYWORDS) {{
        if (agency.includes(b)) return true;
      }}
      for (const pt of PARTNER_KEYWORDS) {{
        if (agency.includes(pt)) return true;
      }}
      return false;
    }}

    function hasValidCCCD(p) {{
      const cccd = (p.nationalId || '').toString().trim();
      return cccd.length > 0;
    }}

    function formatCCCD(nationalId) {{
      const raw = (nationalId || "").toString().trim();
      if (!raw) return "************";
      if (raw.length < 12) return "*".repeat(12 - raw.length) + raw;
      return raw;
    }}

    let allParticipants = [];
    let winnersHistory = [];
    let isSpinning = false;
    let spinIntervals = [];
    let currentCandidate = null;

    // 1. Tải danh sách người tham gia từ data/data_import.csv hoặc inline
    async function loadImportParticipants() {{
      try {{
        const res = await fetch("data/data_import.csv");
        if (!res.ok) throw new Error("HTTP error " + res.status);
        const text = await res.text();
        const lines = text.replace(/\\r/g, "").trim().split("\\n");
        const list = [];
        for (let i = 1; i < lines.length; i++) {{
          const row = lines[i].split(",");
          if (row.length >= 5) {{
            const idStr = row[0].trim();
            const name = row[1].trim();
            const phone = row[2].trim();
            const nationalId = row[3].trim();
            const agency = row[4].trim();
            const answer = (row[5] || "C").trim();
            const prizeWon = (row[6] || "").trim();
            list.push({{
              id: parseInt(idStr, 10),
              code: idStr.padStart(4, "0"),
              name: name,
              phone: phone,
              nationalId: nationalId,
              agency: agency,
              answer: answer,
              prizeWon: prizeWon
            }});
          }}
        }}
        if (list.length > 0) {{
          allParticipants = list;
          console.log(`Đã nạp ${{allParticipants.length}} người từ data/data_import.csv`);
        }} else {{
          allParticipants = INLINE_IMPORT_PARTICIPANTS;
        }}
      }} catch (err) {{
        console.warn("Dùng dữ liệu inline dự phòng cho quayso.html:", err);
        allParticipants = INLINE_IMPORT_PARTICIPANTS;
      }}
    }}

    // 2. Quản lý Lịch sử trúng giải (localStorage)
    function loadWinnersHistory() {{
      try {{
        const saved = localStorage.getItem("quayso_winners_history");
        if (saved) {{
          winnersHistory = JSON.parse(saved);
          renderWinnersHistory();
        }}
      }} catch (e) {{
        console.error("Lỗi đọc localStorage:", e);
      }}
    }}

    function saveWinnersHistory() {{
      try {{
        localStorage.setItem("quayso_winners_history", JSON.stringify(winnersHistory));
      }} catch (e) {{
        console.error("Lỗi ghi localStorage:", e);
      }}
    }}

    function renderWinnersHistory() {{
      const container = document.getElementById("winnersHistoryContainer");
      const tbody = document.getElementById("winnersTableBody");
      const countTag = document.getElementById("winnersCountTag");

      if (winnersHistory.length === 0) {{
        container.style.display = "none";
        tbody.innerHTML = '<tr><td colspan="5" class="empty-history-text">Chưa có giải thưởng nào được trao trong phiên này.</td></tr>';
        return;
      }}

      container.style.display = "block";
      countTag.innerText = `Đã trao: ${{winnersHistory.length}} giải`;

      tbody.innerHTML = winnersHistory.map(w => {{
        let badgeClass = "badge-khac";
        if (w.prize.includes("Đặc Biệt")) badgeClass = "badge-giai-dac-biet";
        else if (w.prize.includes("Nhất")) badgeClass = "badge-giai-nhat";
        else if (w.prize.includes("Nhì")) badgeClass = "badge-giai-nhi";
        else if (w.prize.includes("Ba")) badgeClass = "badge-giai-ba";

        return `<tr>
          <td><span class="badge-prize ${{badgeClass}}">${{w.prize}}</span></td>
          <td class="code-col">#${{w.code}}</td>
          <td style="font-weight: 800;">${{w.name}}</td>
          <td style="color: #d4c5b2;">${{w.agency}}</td>
          <td style="color: #ffdca3; font-family: monospace;">${{formatCCCD(w.nationalId)}}</td>
        </tr>`;
      }}).join("");
    }}

    function clearWinnersHistory() {{
      if (confirm("Bạn có chắc chắn muốn làm mới toàn bộ phiên quay? Danh sách các giải đã trao sẽ được đặt lại.")) {{
        winnersHistory = [];
        localStorage.removeItem("quayso_winners_history");
        renderWinnersHistory();
        resetSlots();
      }}
    }}

    function resetSlots() {{
      for (let i = 0; i < 4; i++) {{
        const slot = document.getElementById(`slot${{i}}`);
        slot.innerText = "0";
        slot.classList.remove("is-spinning", "is-stopped");
      }}
    }}

    // 3. Logic Quay Số Slot Machine
    function toggleSpin() {{
      if (!isSpinning) {{
        startSpin();
      }} else {{
        stopSpin();
      }}
    }}

    function startSpin() {{
      const prize = document.getElementById("prizeSelect").value;

      // Lọc danh sách khả dụng: Mặc định LOẠI BỎ KHÁCH MỜI và NGƯỜI THIẾU CCCD HỢP LỆ (<= 4 số)
      const usedCodes = new Set(winnersHistory.map(w => w.code));
      let available = allParticipants.filter(p => !usedCodes.has(p.code) && !isGuest(p) && hasValidCCCD(p));

      if (available.length === 0) {{
        alert("Đã hết thí sinh hợp lệ chưa trúng giải để tiếp tục quay!");
        return;
      }}

      // Thuật toán chọn ngẫu nhiên cấp độ mật mã (CSPRNG) đảm bảo phân phối hoàn toàn đồng đều
      function getRandomCandidate(list) {{
        if (!list || list.length === 0) return null;
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        const randomIndex = array[0] % list.length;
        return list[randomIndex];
      }}

      // Chọn người trúng giải ngẫu nhiên thật sự
      currentCandidate = getRandomCandidate(available);

      isSpinning = true;
      const spinBtn = document.getElementById("spinButton");
      spinBtn.innerText = "DỪNG LẠI";
      spinBtn.classList.add("btn-stopping");

      // Bắt đầu chạy số
      spinIntervals = [];
      for (let i = 0; i < 4; i++) {{
        const slot = document.getElementById(`slot${{i}}`);
        slot.classList.add("is-spinning");
        slot.classList.remove("is-stopped");
        const iv = setInterval(() => {{
          slot.innerText = Math.floor(Math.random() * 10);
        }}, 50);
        spinIntervals.push(iv);
      }}
    }}

    function stopSpin() {{
      const spinBtn = document.getElementById("spinButton");
      spinBtn.disabled = true;

      const targetDigits = currentCandidate.code.split("");

      // Dừng lần lượt từng ô (0 -> 1 -> 2 -> 3)
      for (let i = 0; i < 4; i++) {{
        setTimeout(() => {{
          clearInterval(spinIntervals[i]);
          const slot = document.getElementById(`slot${{i}}`);
          slot.innerText = targetDigits[i];
          slot.classList.remove("is-spinning");
          slot.classList.add("is-stopped");

          // Khi ô cuối cùng dừng lại
          if (i === 3) {{
            setTimeout(() => {{
              isSpinning = false;
              spinBtn.innerText = "QUAY SỐ";
              spinBtn.classList.remove("btn-stopping");
              spinBtn.disabled = false;
              showWinnerModal();
            }}, 600);
          }}
        }}, i * 750);
      }}
    }}

    // 4. Modal Vinh Danh & Confetti
    function showWinnerModal() {{
      const prize = document.getElementById("prizeSelect").value;
      document.getElementById("modalPrizeName").innerText = prize;
      document.getElementById("modalWinnerCode").innerText = `#${{currentCandidate.code}}`;
      document.getElementById("modalWinnerName").innerText = currentCandidate.name;
      document.getElementById("modalWinnerAgency").innerText = currentCandidate.agency || "KHÁCH MỜI";
      document.getElementById("modalWinnerCCCD").innerText = formatCCCD(currentCandidate.nationalId);

      const modal = document.getElementById("winnerModal");
      modal.classList.add("show");

      startConfetti();
    }}

    function confirmPrizeWinner() {{
      const prize = document.getElementById("prizeSelect").value;
      winnersHistory.unshift({{
        prize: prize,
        code: currentCandidate.code,
        name: currentCandidate.name,
        agency: currentCandidate.agency || "KHÁCH MỜI",
        nationalId: currentCandidate.nationalId
      }});
      saveWinnersHistory();
      renderWinnersHistory();
      closeWinnerModal();
    }}

    function respinAbsentWinner() {{
      closeWinnerModal();
      // Reset về 0000 và chuẩn bị cho lượt quay lại
      resetSlots();
    }}

    function closeWinnerModal() {{
      const modal = document.getElementById("winnerModal");
      modal.classList.remove("show");
      stopConfetti();
    }}

    // 5. Confetti Canvas Effect
    let confettiAnimation = null;
    function startConfetti() {{
      const canvas = document.getElementById("confettiCanvas");
      canvas.style.display = "block";
      const ctx = canvas.getContext("2d");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = [];
      const colors = ["#e2b448", "#fff3c4", "#ffffff", "#2ecc71", "#f1c40f", "#27ae60"];

      for (let i = 0; i < 150; i++) {{
        particles.push({{
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          r: Math.random() * 6 + 4,
          d: Math.random() * 150 + 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          tilt: Math.floor(Math.random() * 10) - 10,
          tiltAngleIncremental: Math.random() * 0.07 + 0.05,
          tiltAngle: 0
        }});
      }}

      function draw() {{
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {{
          const p = particles[i];
          ctx.beginPath();
          ctx.lineWidth = p.r / 2;
          ctx.strokeStyle = p.color;
          ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
          ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
          ctx.stroke();

          p.tiltAngle += p.tiltAngleIncremental;
          p.y += (Math.cos(p.d) + 3 + p.r / 2) / 1.5;
          p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;

          if (p.y > canvas.height) {{
            p.x = Math.random() * canvas.width;
            p.y = -20;
          }}
        }}
        confettiAnimation = requestAnimationFrame(draw);
      }}
      draw();
    }}

    function stopConfetti() {{
      const canvas = document.getElementById("confettiCanvas");
      canvas.style.display = "none";
      if (confettiAnimation) cancelAnimationFrame(confettiAnimation);
    }}

    function toggleFullScreen() {{
      if (!document.fullscreenElement) {{
        document.documentElement.requestFullscreen().catch(err => console.error(err));
      }} else {{
        document.exitFullscreen();
      }}
    }}

    // Khởi tạo
    window.addEventListener("DOMContentLoaded", () => {{
      loadImportParticipants();
      loadWinnersHistory();
    }});
    </script>
</body>
</html>'''

    with open('quayso.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    print('Generated quayso.html successfully! Length:', len(html_content))

if __name__ == '__main__':
    generate_quayso_html()
