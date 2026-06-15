from pathlib import Path
import subprocess

solc_path = Path(r'C:/Users/Agniv Dutta/.solcx/solc-v0.8.24/solc.exe')
print('solc exists:', solc_path.exists())
print('solc path:', solc_path)
proc = subprocess.run([str(solc_path), '--help'], capture_output=True, text=True)
print('returncode:', proc.returncode)
print('stdout first lines:')
for line in proc.stdout.splitlines()[:60]:
    print(line)
print('stderr first lines:')
for line in proc.stderr.splitlines()[:60]:
    print(line)
