// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

import {IERC721} from "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import {IERC721Receiver} from "openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";

import {IERC1155} from "openzeppelin-contracts/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155Receiver} from "openzeppelin-contracts/contracts/token/ERC1155/IERC1155Receiver.sol";

import {IERC165} from "openzeppelin-contracts/contracts/utils/introspection/IERC165.sol";
import {ERC165} from "openzeppelin-contracts/contracts/utils/introspection/ERC165.sol";

import {MerkleProof} from "openzeppelin-contracts/contracts/utils/cryptography/MerkleProof.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

/**
 * DionisosMarketplace
 *
 * Official marketplace with enforceable rules.
 *
 * Payments:
 * - native ETH (paymentToken = address(0))
 * - whitelisted ERC-20 tokens (e.g., BTC-backed ERC-20 on Base)
 *
 * Notes on "cooldown":
 * - MVP enforces cooldown only for *re-listing on this official marketplace*.
 * - It is tracked per (asset, tokenId) and updated on successful purchase.
 */
contract DionisosMarketplace is Ownable, ReentrancyGuard, ERC165, IERC721Receiver, IERC1155Receiver {
    using SafeERC20 for IERC20;

    // -------- Errors --------
    error NotSeller();
    error ListingNotFound();
    error ListingInactive();
    error PriceTooHigh();
    error BuyerNotAllowed();
    error PaymentTokenNotAllowed();
    error InvalidAmount();
    error UnsupportedAsset();
    error InvalidPrice();
    error CooldownActive();
    error FeeTooHigh();
    error TreasuryNotSet();

    // -------- Types --------
    enum AssetStandard {
        ERC721,
        ERC1155
    }

    struct ListingRules {
        uint256 maxPrice; // 0 => no cap
        bytes32 allowlistRoot; // 0 => no allowlist
        uint64 cooldownSeconds; // 0 => no cooldown
    }

    struct Listing {
        address seller;
        address asset;
        uint256 tokenId;
        uint256 amount; // for 1155; must be 1 for 721
        uint256 price; // denominated in paymentToken
        address paymentToken; // address(0) for native ETH
        AssetStandard standard;
        ListingRules rules;
        uint64 createdAt;
        bool active;
    }

    // -------- Storage --------
    uint256 public nextListingId;
    mapping(uint256 => Listing) public listings;

    // ERC-20 payment whitelist. Note: native ETH is always allowed.
    mapping(address => bool) public allowedPaymentTokens;

    // Cooldown tracking per asset+tokenId for re-listing on this marketplace.
    mapping(address => mapping(uint256 => uint64)) public lastTradeAt;

    // Optional protocol fee (bps) sent to treasury.
    uint16 public feeBps; // 0..1000 (<=10%)
    address public treasury;

    // -------- Events --------
    event PaymentTokenAllowed(address indexed token, bool allowed);
    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed asset,
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        address paymentToken
    );
    event Cancelled(uint256 indexed listingId);
    event Purchased(uint256 indexed listingId, address indexed buyer, uint256 price, address paymentToken);

    event FeeUpdated(uint16 feeBps);
    event TreasuryUpdated(address indexed treasury);

    constructor(address initialOwner, address initialTreasury) Ownable(initialOwner) {
        nextListingId = 1;
        treasury = initialTreasury;
        feeBps = 0;
    }

    // -------- Admin --------
    function setAllowedPaymentToken(address token, bool allowed) external onlyOwner {
        allowedPaymentTokens[token] = allowed;
        emit PaymentTokenAllowed(token, allowed);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    /// @notice Sets protocol fee in basis points. Hard-capped at 10% for safety.
    function setFeeBps(uint16 newFeeBps) external onlyOwner {
        if (newFeeBps > 1000) revert FeeTooHigh();
        feeBps = newFeeBps;
        emit FeeUpdated(newFeeBps);
    }

    // -------- Listings --------
    function listERC721(
        address asset,
        uint256 tokenId,
        uint256 price,
        address paymentToken,
        ListingRules calldata rules
    ) external returns (uint256 listingId) {
        _validateListingCommon(asset, price, paymentToken, rules);
        _validateERC721(asset);

        if (rules.cooldownSeconds != 0) {
            uint64 last = lastTradeAt[asset][tokenId];
            if (last != 0 && block.timestamp < uint256(last) + uint256(rules.cooldownSeconds)) revert CooldownActive();
        }

        // Transfer asset to escrow
        IERC721(asset).safeTransferFrom(msg.sender, address(this), tokenId);

        listingId = nextListingId++;
        listings[listingId] = Listing({
            seller: msg.sender,
            asset: asset,
            tokenId: tokenId,
            amount: 1,
            price: price,
            paymentToken: paymentToken,
            standard: AssetStandard.ERC721,
            rules: rules,
            createdAt: uint64(block.timestamp),
            active: true
        });

        emit Listed(listingId, msg.sender, asset, tokenId, 1, price, paymentToken);
    }

    function listERC1155(
        address asset,
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        address paymentToken,
        ListingRules calldata rules
    ) external returns (uint256 listingId) {
        if (amount == 0) revert InvalidAmount();
        _validateListingCommon(asset, price, paymentToken, rules);
        _validateERC1155(asset);

        if (rules.cooldownSeconds != 0) {
            uint64 last = lastTradeAt[asset][tokenId];
            if (last != 0 && block.timestamp < uint256(last) + uint256(rules.cooldownSeconds)) revert CooldownActive();
        }

        // Transfer to escrow
        IERC1155(asset).safeTransferFrom(msg.sender, address(this), tokenId, amount, "");

        listingId = nextListingId++;
        listings[listingId] = Listing({
            seller: msg.sender,
            asset: asset,
            tokenId: tokenId,
            amount: amount,
            price: price,
            paymentToken: paymentToken,
            standard: AssetStandard.ERC1155,
            rules: rules,
            createdAt: uint64(block.timestamp),
            active: true
        });

        emit Listed(listingId, msg.sender, asset, tokenId, amount, price, paymentToken);
    }

    function cancel(uint256 listingId) external {
        Listing storage L = listings[listingId];
        if (L.seller == address(0)) revert ListingNotFound();
        if (!L.active) revert ListingInactive();
        if (L.seller != msg.sender) revert NotSeller();

        L.active = false;
        _returnAsset(L);
        emit Cancelled(listingId);
    }

    // -------- Purchase --------
    function buy(uint256 listingId, bytes32[] calldata merkleProof) external payable nonReentrant {
        Listing storage L = listings[listingId];
        if (L.seller == address(0)) revert ListingNotFound();
        if (!L.active) revert ListingInactive();

        // Enforce optional max price
        if (L.rules.maxPrice != 0 && L.price > L.rules.maxPrice) revert PriceTooHigh();

        // Enforce optional allowlist
        if (L.rules.allowlistRoot != bytes32(0)) {
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
            bool ok = MerkleProof.verify(merkleProof, L.rules.allowlistRoot, leaf);
            if (!ok) revert BuyerNotAllowed();
        }

        L.active = false;

        _collectPayment(L);
        _deliverAsset(L, msg.sender);

        // Track cooldown for future re-listing (official market only)
        lastTradeAt[L.asset][L.tokenId] = uint64(block.timestamp);

        emit Purchased(listingId, msg.sender, L.price, L.paymentToken);
    }

    // -------- Internals --------
    function _validateListingCommon(
        address asset,
        uint256 price,
        address paymentToken,
        ListingRules calldata rules
    ) internal view {
        if (asset == address(0)) revert UnsupportedAsset();
        if (price == 0) revert InvalidPrice();

        if (paymentToken != address(0) && !allowedPaymentTokens[paymentToken]) revert PaymentTokenNotAllowed();

        // Avoid creating unfillable listings
        if (rules.maxPrice != 0 && price > rules.maxPrice) revert PriceTooHigh();
    }

    function _validateERC721(address asset) internal view {
        if (!_supportsInterface(asset, type(IERC721).interfaceId)) revert UnsupportedAsset();
    }

    function _validateERC1155(address asset) internal view {
        if (!_supportsInterface(asset, type(IERC1155).interfaceId)) revert UnsupportedAsset();
    }

    function _supportsInterface(address asset, bytes4 interfaceId) internal view returns (bool) {
        try IERC165(asset).supportsInterface(interfaceId) returns (bool ok) {
            return ok;
        } catch {
            return false;
        }
    }

    function _collectPayment(Listing storage L) internal {
        uint256 fee = 0;
        if (feeBps != 0) {
            if (treasury == address(0)) revert TreasuryNotSet();
            fee = (L.price * feeBps) / 10_000;
        }
        uint256 toSeller = L.price - fee;

        if (L.paymentToken == address(0)) {
            // Native ETH
            if (msg.value != L.price) revert InvalidAmount();

            if (fee != 0) {
                (bool s1, ) = payable(treasury).call{value: fee}("");
                require(s1, "ETH_FEE_TRANSFER_FAILED");
            }
            (bool s2, ) = payable(L.seller).call{value: toSeller}("");
            require(s2, "ETH_SELLER_TRANSFER_FAILED");
        } else {
            // ERC-20
            if (msg.value != 0) revert InvalidAmount();

            IERC20 token = IERC20(L.paymentToken);
            token.safeTransferFrom(msg.sender, address(this), L.price);

            if (fee != 0) {
                token.safeTransfer(treasury, fee);
            }
            token.safeTransfer(L.seller, toSeller);
        }
    }

    function _deliverAsset(Listing storage L, address to) internal {
        if (L.standard == AssetStandard.ERC721) {
            IERC721(L.asset).safeTransferFrom(address(this), to, L.tokenId);
        } else {
            IERC1155(L.asset).safeTransferFrom(address(this), to, L.tokenId, L.amount, "");
        }
    }

    function _returnAsset(Listing storage L) internal {
        _deliverAsset(L, L.seller);
    }

    // -------- Receivers --------
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function onERC1155Received(address, address, uint256, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC721Receiver).interfaceId ||
            interfaceId == type(IERC1155Receiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
