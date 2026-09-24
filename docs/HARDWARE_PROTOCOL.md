# ESP32 Environmental & Hardware Communication Protocol
**Project**: SIH Problem Statement 26096 — Digital Heritage Archive for Memorials, Manuscripts & Ambedkar  
**Target Architecture**: Phase 12 ESP32 Microcontroller Integration & PREMIS 3.0 Preservation Protocol  

---

## 1. Physical Interface & Wiring Specification

The physical preservation vitrine monitor communicates via UART over USB CDC or RS-485 Modbus RTU at **115,200 baud, 8 data bits, no parity, 1 stop bit (8N1)**.

### Pinout Mapping (ESP32-WROOM-32D)
| ESP32 GPIO | Peripheral Device | Protocol | Function |
| :--- | :--- | :--- | :--- |
| **GPIO 21 (SDA)** | Sensirion SHT31-D, BH1750, SCD30 | I2C (400 kHz) | Shared I2C Data bus for Temp, RH, Lux, CO2 |
| **GPIO 22 (SCL)** | Sensirion SHT31-D, BH1750, SCD30 | I2C (400 kHz) | Shared I2C Clock bus |
| **GPIO 4** | RC522 / PN532 NFC Module | SPI (MISO) | NFC Master In Slave Out |
| **GPIO 18** | RC522 / PN532 NFC Module | SPI (SCK) | NFC Serial Clock |
| **GPIO 19** | RC522 / PN532 NFC Module | SPI (MOSI) | NFC Master Out Slave In |
| **GPIO 5** | RC522 / PN532 NFC Module | SPI (CS) | NFC Chip Select |
| **GPIO 12, 13, 14, 27** | Tactile Arcade Pushbuttons | Digital In (Pull-up) | Navigation Buttons (Home, Audio, Lang, Help) |
| **GPIO 25, 26, 33** | RGB High-Flux LED Driver | PWM (LEDC) | System Conservation Status Indicator |

---

## 2. Telemetry Packet Schema

Packets are transmitted periodically (default: every 10 seconds) or upon interrupt event (button press, NFC badge tap) via HTTP POST to `/api/v1/hardware/esp32/telemetry`.

```json
{
  "device_id": "esp32-preservation-chamber-01",
  "packet_type": "TELEMETRY",
  "timestamp": "2026-09-24T17:30:00Z",
  "sensors": {
    "temperature_c": 20.45,
    "humidity_rh": 49.80,
    "light_lux": 118.5,
    "co2_ppm": 412.0
  },
  "button_states": [0, 0, 0, 0],
  "nfc_tag_uid": "04A1B2C3D4E5F6",
  "firmware_version": "v2.12.0-esp32-idf"
}
```

---

## 3. Preservation Standards & Conservation Thresholds

In accordance with international archival conservation guidelines (National Archives, British Library, and PREMIS 3.0 metadata standards):

| Environmental Metric | Target Range (Optimal) | Warning Threshold | Critical Conservation Breach | Preservation Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Chamber Temperature** | **18.0°C – 22.0°C** | 16.0°C – 18.0°C<br>22.0°C – 24.0°C | **< 16.0°C** or **> 24.0°C** | Accelerates acid hydrolysis and paper embrittlement |
| **Relative Humidity (RH)** | **45.0% – 55.0%** | 40.0% – 45.0%<br>55.0% – 60.0% | **< 40.0%** (Desiccation)<br>**> 60.0%** (Mold risk) | >60% enables fungal spore germination; <40% causes parchment contraction |
| **Ambient Illumination** | **< 200 Lux** | 200 – 300 Lux | **> 300 Lux** | Photochemical discoloration, ink fading, and lignin darkening |
| **CO2 Concentration** | **< 600 ppm** | 600 – 1000 ppm | **> 1000 ppm** | Indicates inadequate chamber air exchange |

---

## 4. Fault Detection & Staleness Protocol

1. **Physical Sensor Plausibility**:
   The backend validator rejects physically impossible values:
   - Temperature must satisfy: $-20.0^\circ\text{C} \le T \le 80.0^\circ\text{C}$
   - Relative Humidity must satisfy: $0.0\% \le \text{RH} \le 100.0\%$
   - Lux must satisfy: $\text{Lux} \ge 0.0$
2. **Sensor Staleness**:
   If no telemetry packet has arrived within **120 seconds**, the subsystem transitions to `STALE` status, flags an administrative alert, and records a PREMIS preservation risk event.
