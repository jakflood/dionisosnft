// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "openzeppelin-contracts/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * Case/Batch Passport (ERC-1155)
 * token URI points to off-chain canonical metadata.
 */
contract DionisosPassport1155 is ERC1155, Ownable {
    uint256 public nextId;

    event BatchMinted(address indexed to, uint256 indexed tokenId, uint256 amount);

    constructor(address initialOwner, string memory uri_) ERC1155(uri_) Ownable(initialOwner) {
        nextId = 1;
    }

    function mintBatch(address to, uint256 amount) external onlyOwner returns (uint256 tokenId) {
        tokenId = nextId++;
        _mint(to, tokenId, amount, "");
        emit BatchMinted(to, tokenId, amount);
    }
}
