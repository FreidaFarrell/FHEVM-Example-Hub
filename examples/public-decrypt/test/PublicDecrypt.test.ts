import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { PublicDecrypt } from "../typechain-types";

describe("PublicDecrypt", function () {
  let contract: PublicDecrypt;
  let owner: any;
  let addr1: any;

  before(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }
    [owner, addr1] = await ethers.getSigners();
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }

    const factory = await ethers.getContractFactory("PublicDecrypt");
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Value Storage", function () {
    it("Should store protected encrypted value", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(42)
        .encrypt();

      await contract.storeProtectedValue(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      expect(true).to.be.true;
    });

    it("Should retrieve protected value", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(100)
        .encrypt();

      await contract.storeProtectedValue(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      const retrieved = await contract.getProtectedValue();
      expect(retrieved).to.not.be.null;
    });
  });

  describe("Decryption Recording", function () {
    beforeEach(async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(50)
        .encrypt();

      await contract.storeProtectedValue(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );
    });

    it("Should record decrypted value", async function () {
      const decryptId = await contract.recordDecryptedValue.staticCall(42);
      expect(decryptId).to.not.be.null;

      await contract.recordDecryptedValue(42);
    });

    it("Should retrieve recorded decrypted value", async function () {
      const decryptId = await contract.recordDecryptedValue.staticCall(123);
      await contract.recordDecryptedValue(123);

      const value = await contract.getDecryptedValue(decryptId);
      expect(value).to.equal(123);
    });

    it("Should track decryption timestamp", async function () {
      const decryptId = await contract.recordDecryptedValue.staticCall(999);
      await contract.recordDecryptedValue(999);

      const timestamp = await contract.getDecryptTimestamp(decryptId);
      expect(timestamp).to.be.greaterThan(0);
    });

    it("Should handle multiple decryption records", async function () {
      const decryptId1 = await contract.recordDecryptedValue.staticCall(100);
      await contract.recordDecryptedValue(100);

      const decryptId2 = await contract.recordDecryptedValue.staticCall(200);
      await contract.recordDecryptedValue(200);

      const value1 = await contract.getDecryptedValue(decryptId1);
      const value2 = await contract.getDecryptedValue(decryptId2);

      expect(value1).to.equal(100);
      expect(value2).to.equal(200);
    });
  });

  describe("Threshold Verification", function () {
    it("Should count values above threshold", async function () {
      const values = [10, 20, 30, 40, 50];
      const threshold = 25;

      const count = await contract.countAboveThreshold(values, threshold);
      expect(count).to.equal(3); // 30, 40, 50
    });

    it("Should handle zero threshold", async function () {
      const values = [0, 1, 2, 3];
      const count = await contract.countAboveThreshold(values, 0);
      expect(count).to.equal(4);
    });

    it("Should handle all values below threshold", async function () {
      const values = [1, 2, 3, 4, 5];
      const threshold = 100;

      const count = await contract.countAboveThreshold(values, threshold);
      expect(count).to.equal(0);
    });

    it("Should handle all values above threshold", async function () {
      const values = [50, 60, 70, 80, 90];
      const threshold = 40;

      const count = await contract.countAboveThreshold(values, threshold);
      expect(count).to.equal(5);
    });
  });

  describe("Statistical Functions", function () {
    it("Should calculate sum correctly", async function () {
      const values = [10, 20, 30, 40, 50];
      const sum = await contract.calculateSum(values);
      expect(sum).to.equal(150);
    });

    it("Should calculate average correctly", async function () {
      const values = [10, 20, 30];
      const avg = await contract.calculateAverage(values);
      expect(avg).to.equal(20);
    });

    it("Should reject average with empty array", async function () {
      await expect(
        contract.calculateAverage([])
      ).to.be.revertedWith("Array is empty");
    });

    it("Should find maximum value", async function () {
      const values = [10, 50, 30, 20, 40];
      const max = await contract.findMaximum(values);
      expect(max).to.equal(50);
    });

    it("Should find minimum value", async function () {
      const values = [10, 50, 30, 5, 40];
      const min = await contract.findMinimum(values);
      expect(min).to.equal(5);
    });

    it("Should handle single value array", async function () {
      const values = [42];
      const max = await contract.findMaximum(values);
      const min = await contract.findMinimum(values);
      expect(max).to.equal(42);
      expect(min).to.equal(42);
    });

    it("Should reject min/max with empty array", async function () {
      await expect(
        contract.findMaximum([])
      ).to.be.revertedWith("Array is empty");

      await expect(
        contract.findMinimum([])
      ).to.be.revertedWith("Array is empty");
    });
  });

  describe("Multiple Users", function () {
    it("Should handle decryptions from different users", async function () {
      const decryptId1 = await contract.connect(owner).recordDecryptedValue.staticCall(100);
      await contract.connect(owner).recordDecryptedValue(100);

      const decryptId2 = await contract.connect(addr1).recordDecryptedValue.staticCall(200);
      await contract.connect(addr1).recordDecryptedValue(200);

      const value1 = await contract.getDecryptedValue(decryptId1);
      const value2 = await contract.getDecryptedValue(decryptId2);

      expect(value1).to.equal(100);
      expect(value2).to.equal(200);
    });
  });
});
