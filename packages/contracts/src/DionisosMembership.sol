// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * Dionisos Membership NFT (ERC-721)
 * - Admin-minted in MVP
 * - Tier is stored per tokenId
 * - Optional transfer cooldown can be enabled later
 */
contract DionisosMembership is ERC721, Ownable {
    enum Tier { ACCESS, CELLAR, PATRON }

    mapping(uint256 => Tier) public tierOf;
    uint256 public nextId;

    event MembershipMinted(address indexed to, uint256 indexed tokenId, Tier tier);

    constructor(address initialOwner) ERC721("Dionisos Membership", "DION") Ownable(initialOwner) {
        nextId = 1;
    }

    function mint(address to, Tier tier) external onlyOwner returns (uint256 tokenId) {
        tokenId = nextId++;
        tierOf[tokenId] = tier;
        _safeMint(to, tokenId);
        emit MembershipMinted(to, tokenId, tier);
    }
}
