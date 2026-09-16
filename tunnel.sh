#!/bin/bash

# ==============================================================================
# Script Quản Trị Cloudflare Quick Tunnel - Lucky Draw App
# ==============================================================================

PORT=3000
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/tunnel.log"
PID_FILE="$SCRIPT_DIR/tunnel.pid"

# Hàm lấy link Tunnel từ log file
get_tunnel_url() {
    if [ -f "$LOG_FILE" ]; then
        # Tìm link https://*.trycloudflare.com mới nhất trong log
        URL=$(grep -oE 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' "$LOG_FILE" | tail -n 1)
        echo "$URL"
    else
        echo ""
    fi
}

# Hàm Start Tunnel
start_tunnel() {
    # Kiểm tra xem tunnel đã chạy chưa
    RUNNING_PID=$(pgrep -f "cloudflared tunnel")
    if [ -n "$RUNNING_PID" ] && [ -f "$LOG_FILE" ]; then
        CURRENT_URL=$(get_tunnel_url)
        if [ -n "$CURRENT_URL" ]; then
            echo "⚠️  Cloudflare Tunnel đang chạy rồi! (PID: $RUNNING_PID)"
            echo "=================================================================="
            echo "👉 Link Trang Chủ:      $CURRENT_URL"
            echo "👉 Màn Hình Quay Thưởng: $CURRENT_URL/Final.html"
            echo "=================================================================="
            return
        fi
    fi

    # Nếu đang có tiến trình cũ nhưng không có log hoặc mất URL, dừng trước
    if [ -n "$RUNNING_PID" ]; then
        echo "🔄 Dọn dẹp tiến trình cũ (PID: $RUNNING_PID)..."
        pkill -9 -f "cloudflared tunnel" > /dev/null 2>&1
        sleep 1
    fi

    # Kiểm tra đã cài cloudflared chưa
    if ! command -v cloudflared &> /dev/null; then
        echo "❌ Chưa tìm thấy lệnh 'cloudflared' trên hệ thống!"
        echo "   Vui lòng cài đặt nhanh bằng lệnh:"
        echo "   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && dpkg -i cloudflared.deb"
        exit 1
    fi

    echo "🚀 Đang khởi động Cloudflare Tunnel trỏ vào port $PORT..."
    rm -f "$LOG_FILE" "$PID_FILE"
    touch "$LOG_FILE"

    # Khởi động với cờ --logfile chuẩn của cloudflared
    nohup cloudflared tunnel --url "http://127.0.0.1:$PORT" --no-autoupdate --logfile "$LOG_FILE" > /dev/null 2>&1 &
    NEW_PID=$!
    echo "$NEW_PID" > "$PID_FILE"

    echo "⏳ Đang kết nối tới Cloudflare Network (đang lấy link HTTPS)..."
    sleep 3

    # Đọc link URL
    MAX_RETRY=12
    COUNT=0
    TUNNEL_URL=""

    while [ $COUNT -lt $MAX_RETRY ]; do
        TUNNEL_URL=$(get_tunnel_url)
        if [ -n "$TUNNEL_URL" ]; then
            break
        fi
        sleep 1
        COUNT=$((COUNT + 1))
    done

    if [ -n "$TUNNEL_URL" ]; then
        echo "=================================================================="
        echo "🎉 CLOUDFLARE TUNNEL ĐÃ SẴN SÀNG!"
        echo "=================================================================="
        echo "👉 Link Trang Chủ:      $TUNNEL_URL"
        echo "👉 Màn Hình Quay Thưởng: $TUNNEL_URL/Final.html"
        echo "=================================================================="
        echo "(Ghi chú: Link chạy ngầm 24/7, đóng terminal SSH web vẫn hoạt động)"
    else
        echo "⚠️  Tunnel đã bật ngầm nhưng chưa lấy được link ngay. Hãy gõ:"
        echo "   ./tunnel.sh url"
    fi
}

# Hàm Stop Tunnel
stop_tunnel() {
    echo "🛑 Đang dừng Cloudflare Tunnel..."
    pkill -f "cloudflared tunnel"
    rm -f "$PID_FILE"
    echo "✅ Đã dừng Cloudflare Tunnel thành công!"
}

# Hàm Status & URL
status_tunnel() {
    RUNNING_PID=$(pgrep -f "cloudflared tunnel")
    if [ -n "$RUNNING_PID" ]; then
        echo "🟢 Trạng thái: ĐANG CHẠY (PID: $RUNNING_PID)"
        CURRENT_URL=$(get_tunnel_url)
        if [ -n "$CURRENT_URL" ]; then
            echo "=================================================================="
            echo "👉 Link Trang Chủ:      $CURRENT_URL"
            echo "👉 Màn Hình Quay Thưởng: $CURRENT_URL/Final.html"
            echo "=================================================================="
        else
            echo "⚠️ Chưa tìm thấy link URL trong log. Hãy xem log: cat $LOG_FILE"
        fi
    else
        echo "🔴 Trạng thái: ĐÃ DỪNG (Không có tiến trình tunnel nào đang chạy)"
    fi
}

# Điều hướng tham số
case "$1" in
    start)
        start_tunnel
        ;;
    stop)
        stop_tunnel
        ;;
    restart)
        stop_tunnel
        sleep 2
        start_tunnel
        ;;
    status|url)
        status_tunnel
        ;;
    log|logs)
        tail -n 30 -f "$LOG_FILE"
        ;;
    *)
        echo "================================================="
        echo "     HƯỚNG DẪN QUẢN TRỊ CLOUDFLARE TUNNEL        "
        echo "================================================="
        echo "Cách dùng:"
        echo "  ./tunnel.sh start    : Khởi động tunnel ngầm & lấy link HTTPS"
        echo "  ./tunnel.sh stop     : Dừng tunnel"
        echo "  ./tunnel.sh restart  : Khởi động lại tunnel và tạo link mới"
        echo "  ./tunnel.sh status   : Kiểm tra trạng thái và xem link hiện tại"
        echo "  ./tunnel.sh logs     : Xem log trực tiếp của tunnel"
        echo "================================================="
        status_tunnel
        ;;
esac
