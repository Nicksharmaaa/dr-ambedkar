"""
Phase 12 Test Suite — Hardware Abstraction Layer (HAL) & ESP32 Preservation Telemetry
Validates:
  - HAL Deployment Profiles (DEVELOPMENT, TABLET_DEMO, KIOSK, INSTITUTIONAL)
  - 10-Peripheral capability detection and graceful degradation
  - ESP32 telemetry packet ingestion and physical bounds validation
  - Preservation standard compliance (18-22°C, 45-55% RH, <200 lux)
  - Sensor staleness tracking and alert evaluation
"""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
import pytest
from app.services.hardware.hal import (
    DeploymentProfile,
    HardwareManager,
    PeripheralStatus,
)
from app.services.hardware.esp32 import (
    EnvironmentalReading,
    ESP32TelemetryPacket,
    PreservationMonitor,
)


def test_hal_profiles_and_peripherals():
    """Verify hardware profiles configure all 10 peripherals appropriately."""
    mgr = HardwareManager(profile=DeploymentProfile.DEVELOPMENT)
    summary = mgr.get_summary()

    assert summary["deployment_profile"] == "DEVELOPMENT"
    assert summary["total_capabilities"] == 10
    capabilities = summary["capabilities"]

    expected_peripherals = [
        "display",
        "audio_output",
        "microphone",
        "camera",
        "qr_reader",
        "nfc_reader",
        "document_scanner",
        "physical_buttons",
        "environmental_sensor",
        "status_indicator",
    ]
    for p_id in expected_peripherals:
        assert p_id in capabilities, f"Peripheral {p_id} missing from HAL"

    # Switch to KIOSK profile
    kiosk_mgr = HardwareManager(profile=DeploymentProfile.KIOSK)
    kiosk_summary = kiosk_mgr.get_summary()
    assert kiosk_summary["deployment_profile"] == "KIOSK"
    assert kiosk_summary["capabilities"]["display"]["available"] is True
    assert kiosk_summary["capabilities"]["qr_reader"]["status"] == PeripheralStatus.OPERATIONAL.value


def test_hal_graceful_capability_degradation():
    """Verify HAL initializes without crashing and reports capabilities gracefully."""
    mgr = HardwareManager(profile=DeploymentProfile.DEVELOPMENT)
    assert len(mgr.capabilities) == 10
    for key, cap in mgr.capabilities.items():
        assert cap.name is not None
        assert cap.status in [
            PeripheralStatus.OPERATIONAL,
            PeripheralStatus.SIMULATED,
            PeripheralStatus.DEGRADED,
            PeripheralStatus.UNAVAILABLE,
        ]


def test_esp32_optimal_preservation_conditions():
    """Verify optimal environmental conditions return OPTIMAL status."""
    monitor = PreservationMonitor()
    packet = ESP32TelemetryPacket(
        device_id="esp32-preservation-test",
        sensors=EnvironmentalReading(
            temperature_c=20.0,
            humidity_rh=50.0,
            light_lux=120.0,
            co2_ppm=415.0,
        ),
    )
    status = monitor.ingest_packet(packet)

    assert status.status == "OPTIMAL"
    assert len(status.active_alerts) == 0
    assert status.is_stale is False


def test_esp32_environmental_warnings_and_breaches():
    """Verify out-of-bounds conservation conditions trigger alarms."""
    monitor = PreservationMonitor()

    # Extreme high temperature (27.5°C) & high humidity (68% RH)
    packet_extreme = ESP32TelemetryPacket(
        device_id="esp32-preservation-test",
        sensors=EnvironmentalReading(
            temperature_c=27.5,
            humidity_rh=68.0,
            light_lux=80.0,
        ),
    )
    status_extreme = monitor.ingest_packet(packet_extreme)
    assert status_extreme.status in ["WARNING", "CRITICAL"]
    assert len(status_extreme.active_alerts) >= 1
    assert any("temperature" in a.lower() for a in status_extreme.active_alerts)
    assert any("humidity" in a.lower() for a in status_extreme.active_alerts)

    # Excessive ambient light (>200 Lux causes photochemical degradation)
    packet_light = ESP32TelemetryPacket(
        device_id="esp32-preservation-test",
        sensors=EnvironmentalReading(
            temperature_c=20.0,
            humidity_rh=50.0,
            light_lux=350.0,
        ),
    )
    status_light = monitor.ingest_packet(packet_light)
    assert status_light.status in ["WARNING", "CRITICAL"]
    assert any("light" in a.lower() for a in status_light.active_alerts)


def test_esp32_physical_bounds_rejection():
    """Verify sensor data violating physical sensor limits is rejected."""
    # Temperature below -20°C
    with pytest.raises(ValueError):
        EnvironmentalReading(temperature_c=-40.0, humidity_rh=50.0, light_lux=100.0)

    # Humidity above 100%
    with pytest.raises(ValueError):
        EnvironmentalReading(temperature_c=20.0, humidity_rh=120.0, light_lux=100.0)

    # Negative lux
    with pytest.raises(ValueError):
        EnvironmentalReading(temperature_c=20.0, humidity_rh=50.0, light_lux=-10.0)


def test_esp32_sensor_staleness_detection():
    """Verify telemetry older than 120 seconds is flagged as stale."""
    monitor = PreservationMonitor()
    old_time = datetime.now(timezone.utc) - timedelta(seconds=150)
    monitor.last_received_at = old_time

    status = monitor.get_current_status()
    assert status.is_stale is True
    assert status.status == "STALE"
