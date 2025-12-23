import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { InputProof } from "../typechain-types";

describe("InputProof", function () {
  let contract: InputProof;
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

    const factory = await ethers.getContractFactory("InputProof");
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Single Proof Validation", function () {
    it("Should validate input proof", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(42)
        .encrypt();

      const tx = await contract.validateInputProof(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      expect(tx).to.emit(contract, "ProofValidated");
    });

    it("Should return valid proof ID", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(100)
        .encrypt();

      const proofId = await contract.validateInputProof.staticCall(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      expect(proofId).to.not.be.null;
    });

    it("Should reject invalid proof", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(50)
        .encrypt();

      // Use wrong proof (proof from different value)
      const anotherValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(999)
        .encrypt();

      await expect(
        contract.validateInputProof(
          encryptedValue.handles[0],
          anotherValue.inputProof // Wrong proof
        )
      ).to.be.reverted;
    });

    it("Should track validation records", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(77)
        .encrypt();

      const proofId = await contract.validateInputProof.staticCall(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      await contract.validateInputProof(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      const record = await contract.getValidationRecord(proofId);
      expect(record[0]).to.equal(owner.address); // validator
      expect(record[2]).to.be.true; // isValid
    });

    it("Should count user proofs", async function () {
      const contractAddress = await contract.getAddress();

      // Validate one proof
      const enc1 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(10)
        .encrypt();

      await contract.validateInputProof(
        enc1.handles[0],
        enc1.inputProof
      );

      let count = await contract.getUserProofCount(owner.address);
      expect(count).to.equal(1);

      // Validate another proof
      const enc2 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(20)
        .encrypt();

      await contract.validateInputProof(
        enc2.handles[0],
        enc2.inputProof
      );

      count = await contract.getUserProofCount(owner.address);
      expect(count).to.equal(2);
    });
  });

  describe("Batch Proof Validation", function () {
    it("Should validate multiple proofs", async function () {
      const contractAddress = await contract.getAddress();

      const values = [10, 20, 30];
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

      const proofIds = await contract.validateMultipleProofs.staticCall(handles, proofs);
      expect(proofIds.length).to.equal(3);

      await contract.validateMultipleProofs(handles, proofs);

      const count = await contract.getUserProofCount(owner.address);
      expect(count).to.equal(3);
    });

    it("Should reject array length mismatch", async function () {
      const contractAddress = await contract.getAddress();

      const enc = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(42)
        .encrypt();

      await expect(
        contract.validateMultipleProofs([enc.handles[0]], [])
      ).to.be.revertedWith("Array length mismatch");
    });

    it("Should reject empty array", async function () {
      await expect(
        contract.validateMultipleProofs([], [])
      ).to.be.revertedWith("Empty array");
    });

    it("Should limit batch size", async function () {
      const contractAddress = await contract.getAddress();

      const handles = [];
      const proofs = [];

      // Create 11 proofs (exceeds limit)
      for (let i = 0; i < 11; i++) {
        const enc = await fhevm
          .createEncryptedInput(contractAddress, owner.address)
          .add32(i)
          .encrypt();
        handles.push(enc.handles[0]);
        proofs.push(enc.inputProof);
      }

      await expect(
        contract.validateMultipleProofs(handles, proofs)
      ).to.be.revertedWith("Too many proofs");
    });
  });

  describe("Proof Verification", function () {
    it("Should verify proof binding", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(100)
        .encrypt();

      const isValid = await contract.verifyProofBinding(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      expect(isValid).to.be.true;
    });

    it("Should reject invalid proof binding", async function () {
      const contractAddress = await contract.getAddress();

      const enc1 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(50)
        .encrypt();

      const enc2 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(75)
        .encrypt();

      const isValid = await contract.verifyProofBinding(
        enc1.handles[0],
        enc2.inputProof // Wrong proof
      );

      expect(isValid).to.be.false;
    });
  });

  describe("Statistics", function () {
    it("Should track total proofs validated", async function () {
      const contractAddress = await contract.getAddress();

      // Owner validates proofs
      for (let i = 0; i < 3; i++) {
        const enc = await fhevm
          .createEncryptedInput(contractAddress, owner.address)
          .add32(i)
          .encrypt();
        await contract.connect(owner).validateInputProof(
          enc.handles[0],
          enc.inputProof
        );
      }

      // addr1 validates proofs
      for (let i = 0; i < 2; i++) {
        const enc = await fhevm
          .createEncryptedInput(contractAddress, addr1.address)
          .add32(i + 10)
          .encrypt();
        await contract.connect(addr1).validateInputProof(
          enc.handles[0],
          enc.inputProof
        );
      }

      const total = await contract.getTotalProofsValidated();
      expect(total).to.equal(5);

      const ownerCount = await contract.getUserProofCount(owner.address);
      const addr1Count = await contract.getUserProofCount(addr1.address);

      expect(ownerCount).to.equal(3);
      expect(addr1Count).to.equal(2);
    });

    it("Should check proof validity", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(111)
        .encrypt();

      const proofId = await contract.validateInputProof.staticCall(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      await contract.validateInputProof(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      const isValid = await contract.isProofValid(proofId);
      expect(isValid).to.be.true;
    });
  });
});
