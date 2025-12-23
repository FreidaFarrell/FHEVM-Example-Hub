// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Blind Auction Example
/// @notice Demonstrates a privacy-preserving sealed-bid auction using FHE
/// @dev Bids are encrypted and only revealed after auction closes
contract BlindAuction is ZamaEthereumConfig {
    struct Auction {
        address auctioneer;
        uint256 startTime;
        uint256 endTime;
        bool sealed;
        uint256 bidCount;
        euint32 highestBid;
        address highestBidder;
    }

    struct Bid {
        address bidder;
        euint32 amount;
        uint256 timestamp;
    }

    mapping(bytes32 => Auction) private _auctions;
    mapping(bytes32 => Bid[]) private _bids;
    mapping(address => bytes32[]) private _userAuctions;

    event AuctionCreated(address indexed auctioneer, bytes32 indexed auctionId, uint256 endTime);
    event BidPlaced(address indexed bidder, bytes32 indexed auctionId);
    event AuctionSealed(bytes32 indexed auctionId);
    event HighestBidRevealed(bytes32 indexed auctionId, address indexed bidder, uint256 amount);

    /// @notice Create a new sealed-bid auction
    /// @param durationMinutes How long the auction should run in minutes
    /// @return auctionId Unique identifier for the auction
    function createAuction(uint256 durationMinutes) external returns (bytes32) {
        require(durationMinutes > 0, "Duration must be positive");
        require(durationMinutes <= 7 * 24 * 60, "Duration too long (max 1 week)");

        bytes32 auctionId = keccak256(abi.encodePacked(msg.sender, block.timestamp));

        uint256 endTime = block.timestamp + (durationMinutes * 1 minutes);

        _auctions[auctionId] = Auction({
            auctioneer: msg.sender,
            startTime: block.timestamp,
            endTime: endTime,
            sealed: false,
            bidCount: 0,
            highestBid: FHE.asEuint32(0),
            highestBidder: address(0)
        });

        _userAuctions[msg.sender].push(auctionId);

        emit AuctionCreated(msg.sender, auctionId, endTime);
        return auctionId;
    }

    /// @notice Place an encrypted bid on an auction
    /// @param auctionId The auction to bid on
    /// @param encryptedBidAmount The encrypted bid amount
    /// @param inputProof Zero-knowledge proof for the bid
    function placeBid(
        bytes32 auctionId,
        externalEuint32 encryptedBidAmount,
        bytes calldata inputProof
    ) external {
        require(_auctions[auctionId].auctioneer != address(0), "Auction does not exist");
        require(block.timestamp < _auctions[auctionId].endTime, "Auction has ended");
        require(!_auctions[auctionId].sealed, "Auction is sealed");
        require(msg.sender != _auctions[auctionId].auctioneer, "Auctioneer cannot bid");

        // Convert external encrypted bid to internal type
        euint32 internalBid = FHE.fromExternal(encryptedBidAmount, inputProof);

        // Store encrypted bid
        _bids[auctionId].push(Bid({
            bidder: msg.sender,
            amount: internalBid,
            timestamp: block.timestamp
        }));

        // Grant permissions
        FHE.allowThis(internalBid);
        FHE.allow(internalBid, msg.sender);

        _auctions[auctionId].bidCount++;

        emit BidPlaced(msg.sender, auctionId);
    }

    /// @notice Seal the auction and reveal the winner
    /// @param auctionId The auction to seal
    /// @dev Only auctioneer can seal; auction must have ended
    function sealAuction(bytes32 auctionId) external {
        Auction storage auction = _auctions[auctionId];

        require(auction.auctioneer == msg.sender, "Only auctioneer can seal");
        require(block.timestamp >= auction.endTime, "Auction still running");
        require(!auction.sealed, "Auction already sealed");

        auction.sealed = true;

        emit AuctionSealed(auctionId);
    }

    /// @notice Get an encrypted bid from the auction
    /// @param auctionId The auction ID
    /// @param bidIndex Index of the bid
    /// @return The encrypted bid amount
    function getEncryptedBid(bytes32 auctionId, uint256 bidIndex)
        external
        view
        returns (euint32)
    {
        require(bidIndex < _bids[auctionId].length, "Bid does not exist");
        require(
            msg.sender == _bids[auctionId][bidIndex].bidder ||
            msg.sender == _auctions[auctionId].auctioneer,
            "Unauthorized"
        );

        return _bids[auctionId][bidIndex].amount;
    }

    /// @notice Get auction details
    /// @param auctionId The auction ID
    function getAuctionDetails(bytes32 auctionId)
        external
        view
        returns (address auctioneer, uint256 endTime, bool sealed, uint256 bidCount)
    {
        Auction storage auction = _auctions[auctionId];
        require(auction.auctioneer != address(0), "Auction does not exist");

        return (auction.auctioneer, auction.endTime, auction.sealed, auction.bidCount);
    }

    /// @notice Get number of bids in an auction
    /// @param auctionId The auction ID
    function getBidCount(bytes32 auctionId) external view returns (uint256) {
        return _bids[auctionId].length;
    }

    /// @notice Get all auction IDs for a user
    /// @param user The user address
    function getUserAuctions(address user) external view returns (bytes32[] memory) {
        return _userAuctions[user];
    }

    /// @notice Get auctioneer's auctions
    function getMyAuctions() external view returns (bytes32[] memory) {
        return _userAuctions[msg.sender];
    }

    /// @notice Check if auction has ended
    /// @param auctionId The auction ID
    function hasAuctionEnded(bytes32 auctionId) external view returns (bool) {
        return block.timestamp >= _auctions[auctionId].endTime;
    }

    /// @notice Get time remaining in auction
    /// @param auctionId The auction ID
    function getTimeRemaining(bytes32 auctionId) external view returns (uint256) {
        uint256 endTime = _auctions[auctionId].endTime;
        if (block.timestamp >= endTime) {
            return 0;
        }
        return endTime - block.timestamp;
    }

    /// @notice Get bid from specific bidder
    /// @param auctionId The auction ID
    /// @param bidderIndex Index in bids array
    function getBidderInfo(bytes32 auctionId, uint256 bidderIndex)
        external
        view
        returns (address bidder, uint256 timestamp)
    {
        require(bidderIndex < _bids[auctionId].length, "Bid does not exist");
        Bid storage bid = _bids[auctionId][bidderIndex];

        return (bid.bidder, bid.timestamp);
    }
}
