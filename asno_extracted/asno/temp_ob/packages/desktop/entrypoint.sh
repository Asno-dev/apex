#!/bin/bash
set -e

# Cleanup any stale X server locks
rm -f /tmp/.X1-lock /tmp/.X11-unix/X1

export DISPLAY=:1
export VNC_RESOLUTION=${VNC_RESOLUTION:-1280x800}
export VNC_COL_DEPTH=24

# Start virtual framebuffer
Xvfb :1 -screen 0 ${VNC_RESOLUTION}x${VNC_COL_DEPTH} -ac +extension GLX +render -noreset &
sleep 3

# Start D-Bus session (required for Firefox, LibreOffice, VS Code)
eval $(dbus-launch --sh-syntax)
export DBUS_SESSION_BUS_ADDRESS
export DONT_PROMPT_WSL_INSTALL=1

# Ensure Firefox icon exists in pixmaps (since it's a manual static install)
if [ -f /opt/firefox/browser/chrome/icons/default/default128.png ]; then
    sudo mkdir -p /usr/share/pixmaps
    sudo cp /opt/firefox/browser/chrome/icons/default/default128.png /usr/share/pixmaps/firefox.png
    sudo chmod 644 /usr/share/pixmaps/firefox.png
fi

# Fix VS Code desktop icon name (it was using 'code' but should be 'vscode')
if [ -f /home/vibeagent/Desktop/vscode.desktop ]; then
    sed -i 's/Icon=code/Icon=vscode/g' /home/vibeagent/Desktop/vscode.desktop
fi

# Set proper XFCE theme and hide unwanted desktop icons
xfconf-query -c xsettings -p /Net/IconThemeName -s Humanity || true
xfconf-query -c xfce4-desktop -p /desktop-icons/file-icons/show-filesystem -n -t bool -s false || true
xfconf-query -c xfce4-desktop -p /desktop-icons/file-icons/show-home -n -t bool -s false || true
xfconf-query -c xfce4-desktop -p /desktop-icons/file-icons/show-trash -n -t bool -s false || true
xfconf-query -c xfce4-desktop -p /desktop-icons/file-icons/show-removable -n -t bool -s false || true

# Start XFCE4
export XFCE_PANEL_MIGRATE_DEFAULT=1
startxfce4 &
sleep 5
pkill -f xfce4-power-manager || true
xfconf-query -c xfce4-panel -lv 2>/dev/null | awk '/power-manager|Power Manager/ {print $1}' | while read -r prop; do
    xfconf-query -c xfce4-panel -p "$prop" -r 2>/dev/null || true
done

# Trust desktop shortcuts so they launch without "untrusted dialog"
# Also remove any chromium shortcuts as requested
rm -f /home/vibeagent/Desktop/*hromium*.desktop 2>/dev/null || true
rm -f /home/vibeagent/Desktop/*oogle-chrome*.desktop 2>/dev/null || true

# Explicitly check for applications and log their paths
echo "[desktop] Verifying application paths..."
FF_PATH=$(command -v firefox || command -v firefox-esr || echo "NOT FOUND")
CODE_PATH=$(command -v code || echo "NOT FOUND")
LO_PATH=$(command -v libreoffice || echo "NOT FOUND")
TERM_PATH=$(command -v xfce4-terminal || echo "NOT FOUND")
FILE_PATH=$(command -v thunar || echo "NOT FOUND")

echo "  - Firefox: $FF_PATH"
echo "  - VS Code: $CODE_PATH"
echo "  - LibreOffice: $LO_PATH"
echo "  - Terminal: $TERM_PATH"
echo "  - File Manager: $FILE_PATH"

for desktop_file in /home/vibeagent/Desktop/*.desktop; do
    if [ -f "$desktop_file" ]; then
        chmod +x "$desktop_file"
        # Mark as trusted for XFCE
        gio set "$desktop_file" metadata::trusted yes 2>/dev/null || true
        gio set "$desktop_file" metadata::trusted true 2>/dev/null || true
        gio set "$desktop_file" metadata::xfce-exe-checksum "$(sha256sum "$desktop_file" | awk '{print $1}')" 2>/dev/null || true
    fi
done

# Start x11vnc
x11vnc -display :1 -nopw -listen 0.0.0.0 -xkb -forever -shared -rfbport 5900 &
sleep 2

# Start the computer-use HTTP agent
node /home/vibeagent/computer-agent.js &

# Start noVNC websockify (bridges browser WebSocket → VNC)
exec websockify --web /usr/share/novnc 6080 localhost:5900
