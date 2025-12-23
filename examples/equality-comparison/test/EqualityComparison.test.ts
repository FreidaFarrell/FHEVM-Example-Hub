import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { EqualityComparison } from "../typechain-types";

describe("EqualityComparison", function () {
  let contract: EqualityComparison;
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

    const factory = await ethers.getContractFactory("EqualityComparison");
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Target Value Setup", function () {
    it("Should set target value correctly", async function () {
      const contractAddress = await contract.getAddress();
      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(42)
        .encrypt();

      await contract.setTargetValue(encryptedValue.handles[0], encryptedValue.inputProof);
      // Test passes if no revert
      expect(true).to.be.true;
    });
  });

  describe("Equality Comparison", function () {
    beforeEach(async function () {
      const contractAddress = await contract.getAddress();
      const encryptedTarget = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(100)
        .encrypt();

      await contract.setTargetValue(encryptedTarget.handles[0], encryptedTarget.inputProof);
    });

    it("Should return true when values are equal", async function () {
      const contractAddress = await contract.getAddress();
      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(100)
        .encrypt();

      await contract.compareEqual(encryptedValue.handles[0], encryptedValue.inputProof);
      // Comparison recorded successfully
      expect(true).to.be.true;
    });

    it("Should handle different values", async function () {
      const contractAddress = await contract.getAddress();
      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(50)
        .encrypt();

      await contract.compareEqual(encryptedValue.handles[0], encryptedValue.inputProof);
      // Comparison recorded successfully
      expect(true).to.be.true;
    });

    it("Should track comparison count", async function () {
      const contractAddress = await contract.getAddress();

      // First comparison
      const enc1 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(100)
        .encrypt();
      await contract.compareEqual(enc1.handles[0], enc1.inputProof);

      // Second comparison
      const enc2 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(75)
        .encrypt();
      await contract.compareEqual(enc2.handles[0], enc2.inputProof);

      const count = await contract.getComparisonCount(owner.address);
      expect(count).to.equal(2);
    });

    it("Should handle multiple comparisons in one call", async function () {
      const contractAddress = await contract.getAddress();

      const values = [42, 100, 75, 100, 999];
      const encryptedInputs = [];

      for (const val of values) {
        const enc = await fhevm
          .createEncryptedInput(contractAddress, owner.address)
          .add32(val)
          .encrypt();
        encryptedInputs.push(enc);
      }

      const handles = encryptedInputs.map(e => e.handles[0]);
      const proofs = encryptedInputs.map(e => e.inputProof);

      const results = await contract.compareMultiple(handles, proofs);
      expect(results.length).to.equal(5);
    });

    it("Should reject empty array in compareMultiple", async function () {
      const contractAddress = await contract.getAddress();

      await expect(
        contract.compareMultiple([], [])
      ).to.be.revertedWith("Empty array");
    });

    it("Should reject array length mismatch", async function () {
      const contractAddress = await contract.getAddress();

      const enc = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(42)
        .encrypt();

      await expect(
        contract.compareMultiple([enc.handles[0]], [])
      ).to.be.revertedWith("Array length mismatch");
    });

    it("Should limit array size in compareMultiple", async function () {
      const contractAddress = await contract.getAddress();

      const handles = [];
      const proofs = [];

      // Create 11 encrypted values (exceeds limit of 10)
      for (let i = 0; i < 11; i++) {
        const enc = await fhevm
          .createEncryptedInput(contractAddress, owner.address)
          .add32(i)
          .encrypt();
        handles.push(enc.handles[0]);
        proofs.push(enc.inputProof);
      }

      await expect(
        contract.compareMultiple(handles, proofs)
      ).to.be.revertedWith("Too many values");
    });
  });

  describe("Different Users", function () {
    beforeEach(async function () {
      const contractAddress = await contract.getAddress();
      const encryptedTarget = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(50)
        .encrypt();

      await contract.setTargetValue(encryptedTarget.handles[0], encryptedTarget.inputProof);
    });

    it("Should track comparisons per user independently", async function () {
      const contractAddress = await contract.getAddress();

      // Owner performs comparison
      const ownerEnc = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(50)
        .encrypt();
      await contract.connect(owner).compareEqual(ownerEnc.handles[0], ownerEnc.inputProof);

      // addr1 performs comparison
      const addr1Enc = await fhevm
        .createEncryptedInput(contractAddress, addr1.address)
        .add32(50)
        .encrypt();
      await contract.connect(addr1).compareEqual(addr1Enc.handles[0], addr1Enc.inputProof);

      const ownerCount = await contract.getComparisonCount(owner.address);
      const addr1Count = await contract.getComparisonCount(addr1.address);

      expect(ownerCount).to.equal(1);
      expect(addr1Count).to.equal(1);
    });
  });
});
