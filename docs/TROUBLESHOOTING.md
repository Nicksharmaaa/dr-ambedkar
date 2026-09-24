# Operational Troubleshooting & Diagnostics Guide
**Project**: SIH Problem Statement 26096 — Digital Heritage Archive for Memorials, Manuscripts & Ambedkar  
**Target Architecture**: Phase 12 Museum Kiosk, HAL, Security & Assistant Operations  

---

## 1. Quick Resolution Matrix

| Symptom | Root Cause | Immediate Diagnostic / Resolution |
| :--- | :--- | :--- |
| **Assistant returns: "The available archive does not contain sufficient evidence to answer this reliably."** | **Intentional System Behavior**: The query cannot be grounded in retrieved passages; mandatory zero-hallucination policy triggered. | **Not an error.** Rephrase inquiry with specific terms from BAWS or verify if the subject is present in the archive catalog. |
| **Assistant shows: "MANDATORY ABSTENTION (OFFLINE)"** | Device disconnected from the internet / Turso Cloud. | Check gallery Wi-Fi or Ethernet cable. The archive exhibits and catalog remain 100% browsable offline. |
| **Admin pages return: 401 Unauthorized or 403 Forbidden** | Missing or incorrect admin authentication token. | Pass header `X-Admin-Key: <ADMIN_API_KEY>` or set bearer token in request headers. Ensure `ADMIN_API_KEY` matches server environment. |
| **ESP32 Sensor Status shows `STALE`** | No telemetry packet received in >120 seconds. | Check ESP32 USB/RS485 cable and power supply. Verify baud rate is 115,200 baud. In demo mode, the server auto-falls back to simulation. |
| **Environmental Warning / Mold Alert** | Humidity > 60% RH or Temperature > 24°C in vitrine. | Inspect gallery HVAC and vitrine dehumidification silica gel packets immediately. |
| **Voice microphone input not responding** | Browser lacks Web Speech API or microphone permission denied. | Use Chrome, Edge, or Safari; ensure browser microphone permissions are set to "Allow"; check physical USB boundary mic cable. |
| **Thermal receipt printer does not cut paper** | Printer disconnected or paper roll exhausted. | Verify 24V power supply; check paper roll orientation; review `/admin/hardware` capability matrix. |
| **Touchscreen touches misaligned or ghost clicks** | Capacitive panel needs calibration or dirty glass surface. | Clean glass with anti-static microfiber cloth; run Windows Touch Calibration Tool (`tabcal.exe`). |

---

## 2. Verifying Subsystem Health via CLI

To verify all system components without opening a browser:

```powershell
# 1. Probe API health
curl -s http://127.0.0.1:8000/api/v1/health

# 2. Check Turso Database connection
curl -s http://127.0.0.1:8000/api/v1/database/health

# 3. Check Hardware Profile and connected peripherals
curl -s http://127.0.0.1:8000/api/v1/hardware/profile

# 4. Check Current Preservation Climate
curl -s http://127.0.0.1:8000/api/v1/hardware/environment/current

# 5. Check Kiosk Sync Manifest
curl -s http://127.0.0.1:8000/api/v1/kiosk/manifest
```

---

## 3. Emergency Gallery Recovery Procedure

If a museum kiosk enters an unresponsive state during operating hours:
1. Press `Alt + F4` or physical reboot button on the Mini PC.
2. The operating system auto-logs in and launches Microsoft Edge / Chromium in locked kiosk mode (`--kiosk http://localhost:3000/kiosk`).
3. If internet is down, the PWA service worker immediately serves the cached exhibition bundle from local IndexedDB without interruption.
