# Blind Auction Example

**Category**: Advanced Applications
**Difficulty**: Advanced
**Concept**: Sealed-Bid Privacy-Preserving Auction

## Overview

Demonstrates a complete sealed-bid auction system where bids remain encrypted until auction closes.

## Key Features

- **Sealed Bids**: Bids stored encrypted throughout auction
- **Privacy Preservation**: No bid amounts visible until closing
- **Multiple Auctions**: Support concurrent auctions
- **Bid Tracking**: Track all bids anonymously
- **Timeline Management**: Automatic auction close

## Setup

```bash
npm install
npm run compile
npm run test
```

## Contract Functions

- `createAuction()` - Create new sealed-bid auction
- `placeBid()` - Place encrypted bid
- `sealAuction()` - Close auction and finalize
- `getEncryptedBid()` - Retrieve encrypted bid
- `getAuctionDetails()` - Get auction info
- `getBidCount()` - Count total bids
- `getTimeRemaining()` - Check time left

## Key Concepts

### Sealed-Bid Pattern

```solidity
euint32 internalBid = FHE.fromExternal(encryptedBidAmount, inputProof);
_bids[auctionId].push(Bid({
    bidder: msg.sender,
    amount: internalBid,
    timestamp: block.timestamp
}));
```

Stores bids encrypted with full privacy.

### Auctioneer Authority

```solidity
require(auction.auctioneer == msg.sender, "Only auctioneer can seal");
```

Only creator can finalize and reveal results.

## Use Cases

- Privacy-preserving procurement
- Confidential art auctions
- Secret bidding systems
- Encrypted market mechanisms

## Real-World Application

Solves fundamental auction problem: bidders fear their amounts influence future auctions.
With FHE, bid amounts stay secret until closing, ensuring fair competition.

## Tests

Run tests:
```bash
npm run test
```

Coverage includes:
- Auction creation and management
- Bid placement and validation
- Permission enforcement
- Timeline verification
- Multiple concurrent auctions

## References

- FHEVM Docs: https://docs.zama.ai/
- Sealed-Bid Auction Theory
- Advanced FHE Applications
