from pathlib import Path
from solcx import compile_files, install_solc, set_solc_version

root = Path(r'C:/Users/Agniv Dutta/SkillChain')
contract = root / 'app' / 'contracts' / 'SkillCertificate.sol'
solc = Path(r'C:/Users/Dutta/.solcx/solc-v0.8.24/solc.exe')
install_solc('0.8.24')
set_solc_version('0.8.24')

try:
    compiled = compile_files(
        [str(contract)],
        output_values=['abi','bin'],
        base_path=str(root),
        allow_paths=[str(root), str(root / 'node_modules')],
        import_remappings=['@openzeppelin/=node_modules/@openzeppelin/'],
    )
    print('compiled keys', list(compiled.keys()))
except Exception as e:
    print('error', e)
