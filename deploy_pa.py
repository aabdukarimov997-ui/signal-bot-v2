#!/usr/bin/env python3
"""
PythonAnywhere deploy script for Signal Bot V2.
Usage: python deploy_pa.py --username YOUR_PA_USERNAME --token YOUR_API_TOKEN
"""
import argparse
import os
import time
import zipfile
import io
import requests

API_BASE = "https://www.pythonanywhere.com/api/v0"


def upload_file(username, token, remote_path, content):
    url = f"{API_BASE}/{username}/files{remote_path}"
    resp = requests.put(url, headers={"Authorization": f"Token {token}"}, data=content)
    resp.raise_for_status()
    print(f"  ✓ {remote_path}")


def run_command(username, token, command, wait=True):
    """Open a console, run a command, return output."""
    # List existing consoles
    resp = requests.get(f"{API_BASE}/{username}/consoles/", headers={"Authorization": f"Token {token}"})
    resp.raise_for_status()
    consoles = resp.json()

    # Reuse existing bash console or create new
    console_url = None
    for c in consoles:
        if c.get("executable") == "bash":
            console_url = c["url"]
            break

    if not console_url:
        resp = requests.post(
            f"{API_BASE}/{username}/consoles/",
            headers={"Authorization": f"Token {token}"},
            json={"executable": "bash"},
        )
        resp.raise_for_status()
        console_url = resp.json()["url"]

    # Send command
    resp = requests.post(
        f"{console_url}send_input/",
        headers={"Authorization": f"Token {token}"},
        json={"input": command + "\n"},
    )
    resp.raise_for_status()

    if not wait:
        return None, None

    time.sleep(3)

    # Get output
    resp = requests.get(
        f"{console_url}get_latest_output/",
        headers={"Authorization": f"Token {token}"},
    )
    resp.raise_for_status()
    data = resp.json()
    return console_url, data.get("output", "")


def main():
    parser = argparse.ArgumentParser(description="Deploy Signal Bot V2 to PythonAnywhere")
    parser.add_argument("--username", required=True, help="PythonAnywhere username")
    parser.add_argument("--token", required=True, help="PythonAnywhere API token")
    parser.add_argument("--project-dir", default="./", help="Local project directory")
    args = parser.parse_args()

    u = args.username
    t = args.token
    project_root = os.path.abspath(args.project_dir)

    print("=" * 50)
    print("🚀 Deploying Signal Bot V2 to PythonAnywhere")
    print("=" * 50)

    # 1. Upload project files
    print("\n📁 Uploading project files...")
    home = f"/home/{u}"
    remote_base = f"{home}/signal-bot-v2"

    # List of files to upload (relative to project root)
    exclude_dirs = {".git", "__pycache__", ".pytest_cache", ".aider", ".aider*", "venv", ".venv"}
    exclude_exts = {".pyc", ".pyo"}

    for root, dirs, files in os.walk(project_root):
        # Skip excluded dirs
        dirs[:] = [d for d in dirs if d not in exclude_dirs]

        for fname in files:
            ext = os.path.splitext(fname)[1]
            if ext in exclude_exts:
                continue
            if fname in {".env", ".gitignore"}:
                continue

            local_path = os.path.join(root, fname)
            rel_path = os.path.relpath(local_path, project_root)
            remote_path = f"{remote_base}/{rel_path}"

            try:
                with open(local_path, "rb") as f:
                    content = f.read()
                upload_file(u, t, remote_path, content)
            except Exception as e:
                print(f"  ✗ {rel_path}: {e}")

    # 2. Create .env file
    print("\n🔑 Creating .env file...")
    env_content = """# ══════════════════════════════════
# 📱 BOT SOZLAMALARI
# ══════════════════════════════════
BOT_TOKEN=8578002085:AAGXiYliV972bPc8S0QToZ_u-YdmVYp3X9Q
BOT_USERNAME=Udkjdbdbb_bot
DB_TYPE=sqlite
DB_NAME=signal_bot_v2.sqlite
PRIVATE_CHANNEL_ID=-1002271613164
FREE_CHANNEL_LINK=https://t.me/Mexc_Kucoin_Bitget
CARD_NUMBER=8600 2113 9408 0402
CARD_HOLDER=FALONCHAYEV FALONCHA
ADMIN_IDS=[6194170580]
ADMIN_LINK=@treder7090
"""
    upload_file(u, t, f"{remote_base}/.env", env_content)

    # 3. Create virtual environment and install deps
    print("\n🐍 Setting up Python virtual environment...")
    cmds = [
        f"cd {remote_base}",
        "python3.12 -m venv venv",
        "source venv/bin/activate",
        "pip install --upgrade pip",
        "pip install aiosqlite",
        "pip install .",
        "alembic upgrade head",
    ]
    for cmd in cmds:
        print(f"  Running: {cmd}")
        con_url, output = run_command(u, t, cmd)
        if output:
            for line in output.split("\n")[-10:]:
                if line.strip():
                    print(f"    {line.strip()}")
        time.sleep(2)

    # 4. Create always-on task
    print("\n⏰ Creating Always-on task...")
    task_command = (
        f"cd {remote_base} && source venv/bin/activate && python -m bot.main"
    )
    resp = requests.post(
        f"{API_BASE}/{u}/always_on_tasks/",
        headers={"Authorization": f"Token {t}"},
        json={
            "command": task_command,
            "enabled": True,
        },
    )
    if resp.status_code in (200, 201):
        print("  ✓ Always-on task created!")
        print(f"  Command: {task_command}")
    else:
        print(f"  ✗ Failed: {resp.status_code} {resp.text}")

    print("\n" + "=" * 50)
    print("✅ Deploy complete!")
    print(f"📂 Your bot: {remote_base}")
    print("🌐 PythonAnywhere Dashboard: https://www.pythonanywhere.com/user/{u}/")
    print("=" * 50)


if __name__ == "__main__":
    main()