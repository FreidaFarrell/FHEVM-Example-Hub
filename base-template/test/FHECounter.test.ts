import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { FHECounter } from "../typechain-types";

describe("FHECounter", function () {
  let fheCounter: FHECounter;
  let owner: any;
  let addr1: any;

  before(async function () {
    // Skip tests if not running on FHEVM mock
    if (!fhevm.isMock) {
      this.skip();
    }

    [owner, addr1] = await ethers.getSigners();
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }

    // Deploy FHECounter
    const FHECounterFactory = await ethers.getContractFactory("FHECounter");
    fheCounter = await FHECounterFactory.deploy();
    await fheCounter.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should initialize with unencrypted count", async function () {
      const count = await fheCounter.getCount();
      expect(count).to.equal(ethers.ZeroHash);
    });
  });

  describe("Increment", function () {
    it("Should increment encrypted count by 1", async function () {
      const contractAddress = await fheCounter.getAddress();

      // Encrypt value 1
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(1)
        .encrypt();

      // Execute increment
      const tx = await fheCounter.increment(
        encryptedInput.handles[0],
        encryptedInput.inputProof
      );
      await tx.wait();

      // Verify result
      const encryptedCount = await fheCounter.getCount();
      const decryptedCount = await fhevm.userDecryptEuint(
        ethers.TypedDataEncoder,
        encryptedCount,
        contractAddress,
        owner
      );
      expect(decryptedCount).to.equal(1);
    });

    it("Should handle multiple increments", async function () {
      const contractAddress = await fheCounter.getAddress();

      // First increment by 5
      const encrypted5 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(5)
        .encrypt();

      const tx1 = await fheCounter.increment(
        encrypted5.handles[0],
        encrypted5.inputProof
      );
      await tx1.wait();

      // Second increment by 3
      const encrypted3 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(3)
        .encrypt();

      const tx2 = await fheCounter.increment(
        encrypted3.handles[0],
        encrypted3.inputProof
      );
      await tx2.wait();

      // Verify total is 8
      const encryptedCount = await fheCounter.getCount();
      const decryptedCount = await fhevm.userDecryptEuint(
        ethers.TypedDataEncoder,
        encryptedCount,
        contractAddress,
        owner
      );
      expect(decryptedCount).to.equal(8);
    });
  });

  describe("Decrement", function () {
    it("Should decrement encrypted count by 1", async function () {
      const contractAddress = await fheCounter.getAddress();

      // Increment by 5 first
      const encrypted5 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(5)
        .encrypt();

      const incTx = await fheCounter.increment(
        encrypted5.handles[0],
        encrypted5.inputProof
      );
      await incTx.wait();

      // Then decrement by 2
      const encrypted2 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(2)
        .encrypt();

      const decTx = await fheCounter.decrement(
        encrypted2.handles[0],
        encrypted2.inputProof
      );
      await decTx.wait();

      // Verify result is 3
      const encryptedCount = await fheCounter.getCount();
      const decryptedCount = await fhevm.userDecryptEuint(
        ethers.TypedDataEncoder,
        encryptedCount,
        contractAddress,
        owner
      );
      expect(decryptedCount).to.equal(3);
    });
  });
});
