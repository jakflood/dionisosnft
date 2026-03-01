// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";

import {DionisosMarketplace} from "../src/DionisosMarketplace.sol";
import {DionisosPassport721} from "../src/DionisosPassport721.sol";
import {DionisosPassport1155} from "../src/DionisosPassport1155.sol";

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract MockWBTC is ERC20 {
    constructor() ERC20("Wrapped BTC", "WBTC") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MarketplaceTest is Test {
    address owner = address(0xA11CE);
    address treasury = address(0xBEEF);
    // Keep these as simple, valid hex literals (uint160 -> address).
    address seller = address(0x5E11E7);
    address buyer = address(0xB0B);

    DionisosMarketplace market;
    DionisosPassport721 p721;
    DionisosPassport1155 p1155;
    MockWBTC wbtc;

    function setUp() public {
        vm.startPrank(owner);
        market = new DionisosMarketplace(owner, treasury);
        p721 = new DionisosPassport721(owner, "https://example.com/token/");
        p1155 = new DionisosPassport1155(owner, "https://example.com/batch/{id}.json");
        wbtc = new MockWBTC();

        market.setAllowedPaymentToken(address(wbtc), true);
        vm.stopPrank();

        // Give seller/buyer ETH
        vm.deal(seller, 100 ether);
        vm.deal(buyer, 100 ether);

        // Mint passports to seller
        vm.startPrank(owner);
        p721.mint(seller);
        p1155.mintBatch(seller, 10);
        vm.stopPrank();

        // Approvals
        vm.prank(seller);
        p721.setApprovalForAll(address(market), true);

        vm.prank(seller);
        p1155.setApprovalForAll(address(market), true);
    }

    function test_buyERC721_withETH() public {
        DionisosMarketplace.ListingRules memory rules = DionisosMarketplace.ListingRules({
            maxPrice: 0,
            allowlistRoot: bytes32(0),
            cooldownSeconds: 0
        });

        vm.prank(seller);
        uint256 listingId = market.listERC721(address(p721), 1, 1 ether, address(0), rules);

        uint256 sellerBalBefore = seller.balance;

        vm.prank(buyer);
        market.buy{value: 1 ether}(listingId, new bytes32[](0));

        assertEq(p721.ownerOf(1), buyer);
        assertEq(seller.balance, sellerBalBefore + 1 ether);
    }

    function test_buyERC1155_withWBTC() public {
        DionisosMarketplace.ListingRules memory rules = DionisosMarketplace.ListingRules({
            maxPrice: 0,
            allowlistRoot: bytes32(0),
            cooldownSeconds: 0
        });

        // Buyer gets WBTC
        wbtc.mint(buyer, 2e8); // pretend 2 WBTC with 8 decimals
        vm.prank(buyer);
        wbtc.approve(address(market), type(uint256).max);

        vm.prank(seller);
        uint256 listingId = market.listERC1155(address(p1155), 1, 2, 1e8, address(wbtc), rules);

        uint256 sellerTokenBefore = wbtc.balanceOf(seller);

        vm.prank(buyer);
        market.buy(listingId, new bytes32[](0));

        assertEq(p1155.balanceOf(buyer, 1), 2);
        assertEq(wbtc.balanceOf(seller), sellerTokenBefore + 1e8);
    }

    function test_allowlist_singleLeaf() public {
        // Root for single leaf allowlist is just leaf itself.
        bytes32 leaf = keccak256(abi.encodePacked(buyer));
        bytes32 root = leaf;

        DionisosMarketplace.ListingRules memory rules = DionisosMarketplace.ListingRules({
            maxPrice: 0,
            allowlistRoot: root,
            cooldownSeconds: 0
        });

        vm.prank(seller);
        uint256 listingId = market.listERC721(address(p721), 1, 1 ether, address(0), rules);

        // Buyer can buy with empty proof
        vm.prank(buyer);
        market.buy{value: 1 ether}(listingId, new bytes32[](0));
        assertEq(p721.ownerOf(1), buyer);
    }

    function test_cooldown_preventsRelistImmediately() public {
        DionisosMarketplace.ListingRules memory rules = DionisosMarketplace.ListingRules({
            maxPrice: 0,
            allowlistRoot: bytes32(0),
            cooldownSeconds: 3600
        });

        vm.prank(seller);
        uint256 listingId = market.listERC721(address(p721), 1, 1 ether, address(0), rules);

        vm.prank(buyer);
        market.buy{value: 1 ether}(listingId, new bytes32[](0));

        // Buyer approves market and tries to relist immediately
        vm.prank(buyer);
        p721.setApprovalForAll(address(market), true);

        vm.prank(buyer);
        vm.expectRevert(DionisosMarketplace.CooldownActive.selector);
        market.listERC721(address(p721), 1, 1 ether, address(0), rules);

        // After cooldown passes, relist works
        vm.warp(block.timestamp + 3600);
        vm.prank(buyer);
        market.listERC721(address(p721), 1, 1 ether, address(0), rules);
    }

    function test_fee_splits_toTreasury() public {
        vm.startPrank(owner);
        market.setFeeBps(250); // 2.5%
        vm.stopPrank();

        DionisosMarketplace.ListingRules memory rules = DionisosMarketplace.ListingRules({
            maxPrice: 0,
            allowlistRoot: bytes32(0),
            cooldownSeconds: 0
        });

        vm.prank(seller);
        uint256 listingId = market.listERC721(address(p721), 1, 1 ether, address(0), rules);

        uint256 sellerBefore = seller.balance;
        uint256 treasuryBefore = treasury.balance;

        vm.prank(buyer);
        market.buy{value: 1 ether}(listingId, new bytes32[](0));

        // 2.5% of 1 ETH = 0.025 ETH
        assertEq(treasury.balance, treasuryBefore + 0.025 ether);
        assertEq(seller.balance, sellerBefore + 0.975 ether);
    }
}
