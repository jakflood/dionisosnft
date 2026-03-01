// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * Premium Bottle Passport (ERC-721)
 * tokenURI points to off-chain canonical metadata.
 */
contract DionisosPassport721 is ERC721, Ownable {
    uint256 public nextId;
    string private _baseTokenURI;

    event PassportMinted(address indexed to, uint256 indexed tokenId);
    event BaseURIUpdated(string newBaseURI);

    constructor(address initialOwner, string memory baseTokenURI)
        ERC721("Dionisos Passport (721)", "DIONP")
        Ownable(initialOwner)
    {
        nextId = 1;
        _baseTokenURI = baseTokenURI;
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function mint(address to) external onlyOwner returns (uint256 tokenId) {
        tokenId = nextId++;
        _safeMint(to, tokenId);
        emit PassportMinted(to, tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
