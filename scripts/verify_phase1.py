"""
Phase 1 Environment Verification Script
Ambedkar Heritage Intelligence & Digital Preservation System

Run this script to verify the development environment is correctly set up.
Usage: python scripts/verify_phase1.py
"""

import sys
import os
import subprocess
import json
from datetime import datetime

PASS = "PASS"
FAIL = "FAIL"
WARN = "WARN"
SKIP = "SKIP"

results = []


def check(name, fn):
    try:
        status, detail = fn()
        results.append({"check": name, "status": status, "detail": detail})
        icon = "OK" if status == PASS else ("WW" if status == WARN else ("--" if status == SKIP else "XX")) if status == PASS else ("⚠" if status == WARN else ("!" if status == SKIP else "✗"))
        print(f"  {icon} [{status}] {name}: {detail}")
    except Exception as e:
        results.append({"check": name, "status": FAIL, "detail": str(e)})
        print(f"  ✗ [FAIL] {name}: {e}")


def check_python():
    v = sys.version_info
    ver = f"{v.major}.{v.minor}.{v.micro}"
    if v.major == 3 and v.minor >= 12:
        return PASS, f"Python {ver}"
    return WARN, f"Python {ver} — recommend 3.12+"


def check_pip():
    import importlib.metadata
    pip_ver = importlib.metadata.version("pip")
    return PASS, f"pip {pip_ver}"


def check_node():
    result = subprocess.run(["node", "--version"], capture_output=True, text=True)
    if result.returncode == 0:
        ver = result.stdout.strip()
        major = int(ver.lstrip("v").split(".")[0])
        if major >= 20:
            return PASS, ver
        return WARN, f"{ver} — recommend v20+"
    return FAIL, "node not found"


def check_npm():
    result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
    if result.returncode == 0:
        return PASS, f"npm {result.stdout.strip()}"
    return FAIL, "npm not found"


def check_git():
    result = subprocess.run(["git", "--version"], capture_output=True, text=True)
    if result.returncode == 0:
        return PASS, result.stdout.strip()
    return FAIL, "git not found"


def check_gpu():
    result = subprocess.run(
        ["nvidia-smi", "--query-gpu=name,memory.total", "--format=csv,noheader"],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        gpu_info = result.stdout.strip()
        return PASS, gpu_info
    return WARN, "nvidia-smi not available — GPU inference may not be available"


def check_torch():
    try:
        import torch
        cuda_ok = torch.cuda.is_available()
        status = PASS if cuda_ok else WARN
        detail = f"PyTorch {torch.__version__}, CUDA: {cuda_ok}"
        return status, detail
    except ImportError:
        return WARN, "PyTorch not installed — required for Phase 2"


def check_docker():
    result = subprocess.run(["docker", "--version"], capture_output=True, text=True)
    if result.returncode == 0:
        return PASS, result.stdout.strip()
    return WARN, "Docker not installed — required before Phase 2"


def check_postgres():
    result = subprocess.run(["psql", "--version"], capture_output=True, text=True, shell=True)
    if result.returncode == 0:
        return PASS, result.stdout.strip()
    return WARN, "PostgreSQL not installed — required before Phase 2"


def check_network():
    import urllib.request
    try:
        with urllib.request.urlopen("https://pypi.org", timeout=5) as resp:
            if resp.status == 200:
                return PASS, "Internet reachable (PyPI HTTP 200)"
    except Exception as e:
        return FAIL, f"Network unreachable: {e}"
    return FAIL, "Unexpected response"


def check_dirs():
    required = [
        "backend/app",
        "backend-indic/app",
        "frontend",
        "data",
        "infrastructure",
        "docs",
        "models/cache",
        "scripts",
    ]
    missing = []
    for d in required:
        if not os.path.isdir(d):
            missing.append(d)
    if missing:
        return FAIL, f"Missing directories: {missing}"
    return PASS, f"All {len(required)} required directories present"


def check_env_examples():
    required = [
        "backend/.env.example",
        "backend-indic/.env.example",
        "frontend/.env.example",
    ]
    missing = [f for f in required if not os.path.exists(f)]
    if missing:
        return FAIL, f"Missing .env.example files: {missing}"
    return PASS, f"All {len(required)} .env.example files present"


def check_phase1_docs():
    docs = [
        "PHASE_1_IMPLEMENTATION_PLAN.md",
        "SYSTEM_ARCHITECTURE.md",
        "TECH_STACK.md",
        "HARDWARE_CAPABILITY.md",
        "RISK_REGISTER.md",
        "README.md",
        ".gitignore",
    ]
    missing = [d for d in docs if not os.path.exists(d)]
    if missing:
        return FAIL, f"Missing documents: {missing}"
    return PASS, f"All {len(docs)} Phase 1 documents present"


if __name__ == "__main__":
    print()
    print("=" * 70)
    print("  PHASE 1 ENVIRONMENT VERIFICATION")
    print("  Ambedkar Heritage Intelligence & Digital Preservation System")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    print()

    print("[ Runtime Environment ]")
    check("Python version", check_python)
    check("pip", check_pip)
    check("Node.js", check_node)
    check("npm", check_npm)
    check("Git", check_git)
    print()

    print("[ GPU & AI Runtime ]")
    check("NVIDIA GPU", check_gpu)
    check("PyTorch + CUDA", check_torch)
    print()

    print("[ Infrastructure ]")
    check("Docker", check_docker)
    check("PostgreSQL client", check_postgres)
    check("Network connectivity", check_network)
    print()

    print("[ Project Structure ]")
    check("Directory scaffold", check_dirs)
    check("Environment templates", check_env_examples)
    check("Phase 1 documents", check_phase1_docs)
    print()

    passed = sum(1 for r in results if r["status"] == PASS)
    warned = sum(1 for r in results if r["status"] == WARN)
    failed = sum(1 for r in results if r["status"] == FAIL)
    total = len(results)

    print("=" * 70)
    print(f"  Results: {passed}/{total} PASS | {warned} WARN | {failed} FAIL")
    if failed == 0:
        print("  STATUS: PHASE 1 ENVIRONMENT VERIFIED")
    elif failed <= 3:
        print("  STATUS: PARTIAL — address FAIL items before Phase 2")
    else:
        print("  STATUS: INCOMPLETE — multiple failures must be resolved")
    print("=" * 70)
    print()

    # Save results
    report_path = "phase1_verification_results.json"
    with open(report_path, "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "summary": {"passed": passed, "warned": warned, "failed": failed, "total": total},
            "results": results
        }, f, indent=2)
    print(f"  Results saved to: {report_path}")

    sys.exit(0 if failed == 0 else 1)

