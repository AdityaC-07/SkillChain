from pathlib import Path
import subprocess

root = Path(r'C:/Users/Agniv Dutta/SkillChain')
contract = Path('app/contracts/SkillCertificate.sol')
solc = Path(r'C:/Users/Agniv Dutta/.solcx/solc-v0.8.24/solc.exe')
remaps = [
    '@openzeppelin=node_modules/@openzeppelin',
    '@openzeppelin/=node_modules/@openzeppelin/',
    f'@openzeppelin={root.as_posix()}/node_modules/@openzeppelin',
    f'@openzeppelin/={root.as_posix()}/node_modules/@openzeppelin/'
]
for remap in remaps:
    args = [
        str(solc),
        '--combined-json', 'abi,bin',
        '--base-path', root.as_posix(),
        '--allow-paths', ','.join([root.as_posix(), (root / 'node_modules').as_posix()]),
        remap,
        str(contract)
    ]
    print('trying', remap)
    proc = subprocess.run(args, capture_output=True, text=True)
    print('ret', proc.returncode)
    print('stderr', proc.stderr[:1200])
    print('stdout', proc.stdout[:400])
    print('---')
