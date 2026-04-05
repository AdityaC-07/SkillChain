// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillCertificate is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Emit event when a certificate is issued — useful for tracking on-chain
    event CertificateIssued(uint256 indexed tokenId, address recipient, string tokenURI);
    event CertificateRevoked(uint256 indexed tokenId);

    constructor() ERC721("SkillCertificate", "SKIL") Ownable(msg.sender) {}

    // Only the contract owner (institute wallet) can mint
    function mintCertificate(address to, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        emit CertificateIssued(tokenId, to, tokenURI);
        return tokenId;
    }

    // Anyone can call this to verify — read only, no gas cost for callers off-chain
    function verifyCertificate(uint256 tokenId) public view returns (string memory, address) {
        return (tokenURI(tokenId), ownerOf(tokenId));
    }

    // Revoke = burn the NFT
    function revokeCertificate(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
        emit CertificateRevoked(tokenId);
    }
}
