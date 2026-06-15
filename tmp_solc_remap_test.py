from pathlib import Path
import subprocess

root = Path(r'C:/Users/Agniv Dutta/SkillChain')
contract = root / 'app' / 'contracts' / 'SkillCertificate.sol'
solc = Path(r'C:/Users/Agniv Dutta/.solcx/solc-v0.8.24/solc.exe')
print('root', root)
print('contract', contract)
print('solc', solc)
remaps = [
    '@openzeppelin/=node_modules/@openzeppelin/',
    '@openzeppelin=node_modules/@openzeppelin',
    f'@openzeppelin/={root.as_posix()}/node_modules/@openzeppelin/',
    f'@openzeppelin={root.as_posix()}/node_modules/@openzeppelin'
]
for remap in remaps:
    args = [
        str(solc),
        remap,
        '--combined-json', 'abi,bin',
        '--base-path', root.as_posix(),
        '--allow-paths', root.as_posix(),
        '--allow-paths', (root / 'node_modules').as_posix(),
        '--allow-paths', (root / 'node_modules' / '@openzeppelin').as_posix(),
        str(contract)
    ]
    print('trying', remap)
    print('cmd', args[:10], '...')
    proc = subprocess.run(args, capture_output=True, text=True)
    print('returncode', proc.returncode)
    print('stderr', proc.stderr[:1000])
    print('stdout', proc.stdout[:500])
    print('---')
