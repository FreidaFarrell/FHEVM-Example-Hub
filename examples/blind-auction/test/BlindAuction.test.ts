import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { BlindAuction } from "../typechain-types";

describe("BlindAuction", function () {
  let contract: BlindAuction;
  let auctioneer: any;
  let bidder1: any;
  let bidder2: any;

  before(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }
    [auctioneer, bidder1, bidder2] = await ethers.getSigners();
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }

    const factory = await ethers.getContractFactory("BlindAuction");
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Auction Creation", function () {
    it("Should create an auction", async function () {
      const tx = await contract.createAuction(60); // 60 minute auction

      expect(tx).to.emit(contract, "AuctionCreated");
    });

    it("Should reject zero duration", async function () {
      await expect(contract.createAuction(0)).to.be.revertedWith(
        "Duration must be positive"
      );
    });

    it("Should reject excessively long duration", async function () {
      // 8 weeks in minutes = 80640 minutes
      await expect(contract.createAuction(80640)).to.be.revertedWith(
        "Duration too long"
      );
    });

    it("Should return auction ID", async function () {
      const auctionId = await contract.createAuction.staticCall(30);
      expect(auctionId).to.not.be.null;
    });

    it("Should track auctioneer auctions", async function () {
      await contract.connect(auctioneer).createAuction(60);
      await contract.connect(auctioneer).createAuction(60);

      const myAuctions = await contract.connect(auctioneer).getMyAuctions();
      expect(myAuctions.length).to.equal(2);
    });
  });

  describe("Bidding", function () {
    let auctionId: string;

    beforeEach(async function () {
      const tx = await contract.connect(auctioneer).createAuction(60);
      const receipt = await tx.wait();

      // Get auction ID from event or create a new one
      const createTx = await contract.connect(auctioneer).createAuction(60);
      const myAuctions = await contract.connect(auctioneer).getMyAuctions();
      auctionId = myAuctions[myAuctions.length - 1];
    });

    it("Should place an encrypted bid", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedBid = await fhevm
        .createEncryptedInput(contractAddress, bidder1.address)
        .add32(1000)
        .encrypt();

      const tx = await contract
        .connect(bidder1)
        .placeBid(auctionId, encryptedBid.handles[0], encryptedBid.inputProof);

      expect(tx).to.emit(contract, "BidPlaced");
    });

    it("Should prevent auctioneer from bidding", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedBid = await fhevm
        .createEncryptedInput(contractAddress, auctioneer.address)
        .add32(5000)
        .encrypt();

      await expect(
        contract.connect(auctioneer).placeBid(auctionId, encryptedBid.handles[0], encryptedBid.inputProof)
      ).to.be.revertedWith("Auctioneer cannot bid");
    });

    it("Should accept multiple bids", async function () {
      const contractAddress = await contract.getAddress();

      // Bid from bidder1
      const bid1 = await fhevm
        .createEncryptedInput(contractAddress, bidder1.address)
        .add32(1000)
        .encrypt();

      await contract
        .connect(bidder1)
        .placeBid(auctionId, bid1.handles[0], bid1.inputProof);

      // Bid from bidder2
      const bid2 = await fhevm
        .createEncryptedInput(contractAddress, bidder2.address)
        .add32(2000)
        .encrypt();

      await contract
        .connect(bidder2)
        .placeBid(auctionId, bid2.handles[0], bid2.inputProof);

      const bidCount = await contract.getBidCount(auctionId);
      expect(bidCount).to.equal(2);
    });

    it("Should track bid count", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedBid = await fhevm
        .createEncryptedInput(contractAddress, bidder1.address)
        .add32(1500)
        .encrypt();

      await contract
        .connect(bidder1)
        .placeBid(auctionId, encryptedBid.handles[0], encryptedBid.inputProof);

      const details = await contract.getAuctionDetails(auctionId);
      expect(details[3]).to.equal(1); // bidCount
    });
  });

  describe("Auction Sealing", function () {
    let auctionId: string;

    beforeEach(async function () {
      const myAuctions1 = await contract.connect(auctioneer).getMyAuctions();
      const initialCount = myAuctions1.length;

      await contract.connect(auctioneer).createAuction(1); // 1 minute auction
      const myAuctions2 = await contract.connect(auctioneer).getMyAuctions();
      auctionId = myAuctions2[myAuctions2.length - 1];
    });

    it("Should prevent sealing before auction ends", async function () {
      await expect(
        contract.connect(auctioneer).sealAuction(auctionId)
      ).to.be.revertedWith("Auction still running");
    });

    it("Should prevent non-auctioneer from sealing", async function () {
      // Wait for auction to end
      await new Promise(resolve => setTimeout(resolve, 70000)); // 70 seconds

      await expect(
        contract.connect(bidder1).sealAuction(auctionId)
      ).to.be.revertedWith("Only auctioneer can seal");
    });
  });

  describe("Auction Details", function () {
    let auctionId: string;

    beforeEach(async function () {
      const myAuctions1 = await contract.connect(auctioneer).getMyAuctions();
      const initialCount = myAuctions1.length;

      await contract.connect(auctioneer).createAuction(60);
      const myAuctions2 = await contract.connect(auctioneer).getMyAuctions();
      auctionId = myAuctions2[myAuctions2.length - 1];
    });

    it("Should return correct auction details", async function () {
      const details = await contract.getAuctionDetails(auctionId);
      expect(details[0]).to.equal(auctioneer.address); // auctioneer
      expect(details[2]).to.equal(false); // sealed
      expect(details[3]).to.equal(0); // bidCount
    });

    it("Should check auction not ended", async function () {
      const hasEnded = await contract.hasAuctionEnded(auctionId);
      expect(hasEnded).to.be.false;
    });

    it("Should get time remaining", async function () {
      const remaining = await contract.getTimeRemaining(auctionId);
      expect(remaining).to.be.greaterThan(0);
    });

    it("Should return zero time when auction ended", async function () {
      // Create a very short auction
      const myAuctions = await contract.connect(auctioneer).getMyAuctions();
      const shortAuctionId = myAuctions[myAuctions.length - 1];

      // Wait for it to end
      await new Promise(resolve => setTimeout(resolve, 70000));

      const remaining = await contract.getTimeRemaining(shortAuctionId);
      expect(remaining).to.equal(0);
    });
  });

  describe("Bid Information", function () {
    let auctionId: string;

    beforeEach(async function () {
      const myAuctions1 = await contract.connect(auctioneer).getMyAuctions();
      await contract.connect(auctioneer).createAuction(60);

      const myAuctions2 = await contract.connect(auctioneer).getMyAuctions();
      auctionId = myAuctions2[myAuctions2.length - 1];

      // Place a bid
      const contractAddress = await contract.getAddress();
      const encryptedBid = await fhevm
        .createEncryptedInput(contractAddress, bidder1.address)
        .add32(1000)
        .encrypt();

      await contract
        .connect(bidder1)
        .placeBid(auctionId, encryptedBid.handles[0], encryptedBid.inputProof);
    });

    it("Should get bidder info", async function () {
      const bidderInfo = await contract.getBidderInfo(auctionId, 0);
      expect(bidderInfo[0]).to.equal(bidder1.address); // bidder
      expect(bidderInfo[1]).to.be.greaterThan(0); // timestamp
    });

    it("Should reject invalid bid index", async function () {
      await expect(
        contract.getBidderInfo(auctionId, 999)
      ).to.be.revertedWith("Bid does not exist");
    });
  });

  describe("Multiple Auctions", function () {
    it("Should handle multiple concurrent auctions", async function () {
      // Create auctions from different auctioneers
      await contract.connect(auctioneer).createAuction(60);
      await contract.connect(bidder1).createAuction(60);
      await contract.connect(bidder2).createAuction(60);

      const auctioneer1Auctions = await contract.connect(auctioneer).getMyAuctions();
      const auctioneer2Auctions = await contract.connect(bidder1).getMyAuctions();
      const auctioneer3Auctions = await contract.connect(bidder2).getMyAuctions();

      expect(auctioneer1Auctions.length).to.be.greaterThan(0);
      expect(auctioneer2Auctions.length).to.be.greaterThan(0);
      expect(auctioneer3Auctions.length).to.be.greaterThan(0);
    });
  });
});
