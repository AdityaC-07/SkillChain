// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SkillCertificate
 * @dev ERC-721 tokens representing vocational certificates issued by authorized institutes.
 * Inherits from OpenZeppelin's `ERC721URIStorage`, `Ownable`, and `Pausable`.
 */
contract SkillCertificate is ERC721URIStorage, Ownable, Pausable {
    /// @notice Auto-incrementing token id counter (total ever minted)
    uint256 private _tokenIdCounter;

    /// @notice Mapping of tokenId => revoked flag
    mapping(uint256 => bool) public revokedTokens;

    /// @notice Mapping of tokenId => issuer address (which institute minted the certificate)
    mapping(uint256 => address) public issuedBy;

    /// @notice Mapping of authorized issuer addresses
    mapping(address => bool) public authorizedIssuers;

    /// @notice Emitted when a certificate is minted
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string tokenURI,
        uint256 timestamp
    );

    /// @notice Emitted when a certificate is revoked
    event CertificateRevoked(uint256 indexed tokenId, address indexed revokedBy, uint256 timestamp);

    /// @notice Emitted when an issuer is authorized by the owner
    event IssuerAuthorized(address indexed issuer);

    /// @notice Emitted when an issuer is revoked by the owner
    event IssuerRevoked(address indexed issuer);

    /**
     * @dev Constructor sets token `name` and `symbol`.
     */
    constructor() ERC721("SkillChain Certificate", "SKIL") {}

    /**
     * @notice Authorize an address to mint certificates.
     * @dev Only callable by the contract owner (e.g., platform admin).
     * @param issuer The address to authorize as an issuer.
     */
    function authorizeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }

    /**
     * @notice Revoke an issuer's authorization.
     * @dev Only callable by the contract owner.
     * @param issuer The address whose issuer rights are revoked.
     */
    function revokeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }

    /**
     * @notice Mint a certificate NFT to `to` with `tokenURI` metadata.
     * @dev Can only be called by an authorized issuer and when contract is not paused.
     *      Records the issuer and emits `CertificateIssued` with a timestamp.
     * @param to Recipient address that will own the certificate token.
     * @param tokenURI The metadata URI for the certificate (IPFS/HTTP).
     * @return tokenId The newly minted token id.
     */
    function mintCertificate(address to, string memory tokenURI) external whenNotPaused returns (uint256) {
        require(authorizedIssuers[msg.sender], "SkillCertificate: caller is not an authorized issuer");

        _tokenIdCounter += 1;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        issuedBy[tokenId] = msg.sender;

        emit CertificateIssued(tokenId, to, msg.sender, tokenURI, block.timestamp);

        return tokenId;
    }

    /**
     * @notice Verify certificate details for a token id.
     * @dev If the token does not exist, returns empty values instead of reverting.
     * @param tokenId The token id to verify.
     * @return uri The tokenURI string (or empty if not exists).
     * @return owner The owner address (or address(0) if not exists).
     * @return issuer The issuer address that minted the token (or address(0) if not exists).
     * @return isRevoked Whether the certificate has been revoked.
     */
    function verifyCertificate(uint256 tokenId)
        external
        view
        returns (string memory uri, address owner, address issuer, bool isRevoked)
    {
        if (!_exists(tokenId)) {
            return ("", address(0), address(0), false);
        }

        uri = tokenURI(tokenId);
        owner = ownerOf(tokenId);
        issuer = issuedBy[tokenId];
        isRevoked = revokedTokens[tokenId];
    }

    /**
     * @notice Revoke a certificate without burning it so an on-chain audit trail remains.
     * @dev Can only be called by the original issuer who minted the token or the current token owner.
     * @param tokenId The token id to revoke.
     */
    function revokeCertificate(uint256 tokenId) external {
        require(_exists(tokenId), "SkillCertificate: token does not exist");

        address issuer = issuedBy[tokenId];
        address ownerAddr = ownerOf(tokenId);

        require(msg.sender == issuer || msg.sender == ownerAddr, "SkillCertificate: caller cannot revoke");

        revokedTokens[tokenId] = true;

        emit CertificateRevoked(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @notice Pause minting and transfers in emergency situations.
     * @dev Only callable by the contract owner.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract.
     * @dev Only callable by the contract owner.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Returns the total number of certificates ever minted.
     * @dev This counts all minted tokens (including revoked), and does not decrease on revocation.
     * @return The total supply (highest token id minted).
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Overrides `_beforeTokenTransfer` to respect the paused state.
     */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);
        require(!paused(), "SkillCertificate: token transfer while paused");
    }

    // The following functions are overrides required by Solidity for multiple inheritance.
    function _burn(uint256 tokenId) internal virtual override(ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
