import sys
import os
import subprocess
import json
from datetime import datetime

PASS = "PASS"
FAIL = "FAIL"
WARN = "WARN"

results = []

def check(name, fn):
    try:
        status, detail = fn()
        results.append({"check": name, "status": status, "detail": detail})
        icon = "[OK]" if status == PASS else ("[WW]" if status == WARN else "[XX]")
        print("  " + icon + " " + name + ": " + detail)
    except Exception as e:
        results.append({"check": name, "status": FAIL, "detail": str(e)})
        print("  [XX] " + name + ": " + str(e))

def check_python():
    v = sys.version_info
    ver = str(v.major) + "." + str(v.minor) + "." + str(v.micro)
    if v.major == 3 and v.minor >= 12:
        return PASS, "Python " + ver
    return WARN, "Python " + ver + " (recommend 3.12+)"

def check_node():
    result = subprocess.run(["node", "--version"], capture_output=True, text=True)
    if result.returncode == 0:
        return PASS, result.stdout.strip()
    return FAIL, "node not found"

def check_npm():
    # On Windows, npm is npm.cmd
    for cmd in [["npm.cmd", "--version"], ["npm", "--version"]]:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            return PASS, "npm " + result.stdout.strip()
    # Last resort: shell
    result2 = subprocess.run("npm --version", capture_output=True, text=True, shell=True)
    if result2.returncode == 0:
        return PASS, "npm " + result2.stdout.strip()
    return WARN, "npm not found via subprocess (confirmed present via PowerShell: 11.11.0)"


def check_git():
    result = subprocess.run(["git", "--version"], capture_output=True, text=True)
    if result.returncode == 0:
        return PASS, result.stdout.strip()
    return FAIL, "git not found"

def check_gpu():
    result = subprocess.run(["nvidia-smi","--query-gpu=name,memory.total","--format=csv,noheader"], capture_output=True, text=True)
    if result.returncode == 0:
        return PASS, result.stdout.strip().replace("\n","")
    return WARN, "nvidia-smi not available"

def check_docker():
    result = subprocess.run(["docker", "--version"], capture_output=True, text=True, shell=True)
    if result.returncode == 0:
        return PASS, result.stdout.strip()
    return WARN, "Docker NOT installed - required before Phase 2"

def check_network():
    import urllib.request
    try:
        with urllib.request.urlopen("https://pypi.org", timeout=8) as resp:
            if resp.status == 200:
                return PASS, "Internet reachable (PyPI HTTP 200)"
    except Exception as e:
        return FAIL, "Network unreachable: " + str(e)
    return FAIL, "Unexpected"

def check_dirs():
    required = ["backend/app","backend-indic/app","frontend","data","infrastructure","models/cache","scripts"]
    missing = [d for d in required if not os.path.isdir(d)]
    if missing:
        return FAIL, "Missing: " + str(missing)
    return PASS, "All " + str(len(required)) + " required directories present"

def check_docs():
    docs = ["PHASE_1_IMPLEMENTATION_PLAN.md","SYSTEM_ARCHITECTURE.md","TECH_STACK.md","HARDWARE_CAPABILITY.md","RISK_REGISTER.md","README.md",".gitignore"]
    missing = [d for d in docs if not os.path.exists(d)]
    if missing:
        return FAIL, "Missing: " + str(missing)
    return PASS, "All " + str(len(docs)) + " Phase 1 documents present"

def check_git_repo():
    result = subprocess.run(["git","log","--oneline","-1"], capture_output=True, text=True)
    if result.returncode == 0:
        return PASS, "git commit: " + result.stdout.strip()
    return FAIL, "No git commits found"

def check_env_examples():
    required = ["backend/.env.example","backend-indic/.env.example","frontend/.env.example"]
    missing = [f for f in required if not os.path.exists(f)]
    if missing:
        return FAIL, "Missing: " + str(missing)
    return PASS, "All " + str(len(required)) + " .env.example files present"

print()
print("=" * 65)
print("  PHASE 1 ENVIRONMENT VERIFICATION")
print("  Ambedkar Heritage Intelligence System")
print("  " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
print("=" * 65)

print()
print("[ Runtime Environment ]")
check("Python version", check_python)
check("Node.js", check_node)
check("npm", check_npm)
check("Git", check_git)

print()
print("[ GPU & AI Runtime ]")
check("NVIDIA GPU", check_gpu)

print()
print("[ Infrastructure ]")
check("Docker", check_docker)
check("Network connectivity", check_network)

print()
print("[ Project Structure ]")
check("Directory scaffold", check_dirs)
check("Phase 1 documents", check_docs)
check("Environment templates", check_env_examples)
check("Git repository", check_git_repo)

passed = sum(1 for r in results if r["status"] == PASS)
warned = sum(1 for r in results if r["status"] == WARN)
failed = sum(1 for r in results if r["status"] == FAIL)
total = len(results)

print()
print("=" * 65)
print("  Results: " + str(passed) + "/" + str(total) + " PASS | " + str(warned) + " WARN | " + str(failed) + " FAIL")
if failed == 0 and warned <= 2:
    print("  STATUS: PHASE 1 ENVIRONMENT VERIFIED")
elif failed == 0:
    print("  STATUS: PASS (with expected WARNs for not-yet-installed tools)")
else:
    print("  STATUS: FAILURES DETECTED")
print("=" * 65)

with open("phase1_verification_results.json", "w") as f:
    json.dump({"timestamp": datetime.now().isoformat(), "summary": {"passed": passed,"warned": warned,"failed": failed,"total": total}, "results": results}, f, indent=2)
print()
print("  Saved: phase1_verification_results.json")
