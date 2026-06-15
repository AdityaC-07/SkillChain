from pathlib import Path
from solcx import compile_source, install_solc, set_solc_version

root = Path(r'C:\Users\Agniv Dutta\SkillChain')
op = root / 'node_modules' / '@openzeppelin'
print('root exists', root.exists())
print('openzeppelin exists', op.exists())
print('openzeppelin path', op.as_posix())

install_solc('0.8.24')
set_solc_version('0.8.24')

source = 'import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; contract Test is ERC721URIStorage { constructor() ERC721("T","T") {} }'
remaps = [
    f'@openzeppelin/={op.as_posix()}/',
    f'@openzeppelin={op.as_posix()}',
    '@openzeppelin/=node_modules/@openzeppelin/',
    '@openzeppelin=node_modules/@openzeppelin'
]
allow = [str(root), str(root / 'node_modules')]
print('allow', allow)
for remap in remaps:
    print('trying remap', remap)
    try:
        compiled = compile_source(
            source,
            output_values=['abi', 'bin'],
            base_path=str(root),
            allow_paths=allow,
            import_remappings=[remap],
        )
        print('success', list(compiled.keys()))
        break
    except Exception as e:
        print('failed:', remap, type(e).__name__, e)
