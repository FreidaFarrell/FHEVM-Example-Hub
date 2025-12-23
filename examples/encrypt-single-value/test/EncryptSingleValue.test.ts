import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { EncryptSingleValue } from "../typechain-types";

describe("EncryptSingleValue", function () {
  let contract: EncryptSingleValue;
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

    const factory = await ethers.getContractFactory("EncryptSingleValue");
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Encryption", function () {
    it("Should encrypt and store a single value", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(12345)
        .encrypt();

      await contract.encryptSecret(encryptedValue.handles[0], encryptedValue.inputProof);

      const isEncrypted = await contract.isSecretEncrypted();
      expect(isEncrypted).to.be.true;
    });

    it("Should track encryption timestamp", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(999)
        .encrypt();

      const txResponse = await contract.encryptSecret(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );
      const txReceipt = await txResponse.wait();

      const timestamp = await contract.getEncryptionTimestamp(owner.address);
      expect(timestamp).to.be.greaterThan(0);
    });

    it("Should allow owner to retrieve encrypted secret", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(55555)
        .encrypt();

      await contract.encryptSecret(encryptedValue.handles[0], encryptedValue.inputProof);

      const retrieved = await contract.getEncryptedSecret();
      expect(retrieved).to.not.be.null;
    });

    it("Should prevent non-owner from retrieving secret", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(77777)
        .encrypt();

      await contract.encryptSecret(encryptedValue.handles[0], encryptedValue.inputProof);

      await expect(
        contract.connect(addr1).getEncryptedSecret()
      ).to.be.revertedWith("Unauthorized: only secret owner can retrieve");
    });
  });

  describe("Secret Owner", function () {
    it("Should set correct secret owner", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(11111)
        .encrypt();

      await contract.encryptSecret(encryptedValue.handles[0], encryptedValue.inputProof);

      const secretOwner = await contract.getSecretOwner();
      expect(secretOwner).to.equal(owner.address);
    });

    it("Should allow different users to encrypt different secrets", async function () {
      const contractAddress = await contract.getAddress();

      // Owner encrypts first secret
      const ownerEnc = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(111)
        .encrypt();
      await contract.connect(owner).encryptSecret(ownerEnc.handles[0], ownerEnc.inputProof);

      // addr1 encrypts second secret (overwrites)
      const addr1Enc = await fhevm
        .createEncryptedInput(contractAddress, addr1.address)
        .add32(222)
        .encrypt();
      await contract.connect(addr1).encryptSecret(addr1Enc.handles[0], addr1Enc.inputProof);

      const currentOwner = await contract.getSecretOwner();
      expect(currentOwner).to.equal(addr1.address);
    });
  });

  describe("Update Secret", function () {
    beforeEach(async function () {
      const contractAddress = await contract.getAddress();
      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(100)
        .encrypt();

      await contract.encryptSecret(encryptedValue.handles[0], encryptedValue.inputProof);
    });

    it("Should allow owner to update secret", async function () {
      const contractAddress = await contract.getAddress();

      const newEncryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(200)
        .encrypt();

      await contract.updateSecret(newEncryptedValue.handles[0], newEncryptedValue.inputProof);

      const isEncrypted = await contract.isSecretEncrypted();
      expect(isEncrypted).to.be.true;
    });

    it("Should prevent non-owner from updating secret", async function () {
      const contractAddress = await contract.getAddress();

      const newEncryptedValue = await fhevm
        .createEncryptedInput(contractAddress, addr1.address)
        .add32(300)
        .encrypt();

      await expect(
        contract.connect(addr1).updateSecret(newEncryptedValue.handles[0], newEncryptedValue.inputProof)
      ).to.be.revertedWith("Unauthorized: only original owner can update");
    });

    it("Should update timestamp when secret is updated", async function () {
      const contractAddress = await contract.getAddress();

      const firstTimestamp = await contract.getEncryptionTimestamp(owner.address);

      // Wait a bit and update
      await new Promise(resolve => setTimeout(resolve, 100));

      const newEncryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(400)
        .encrypt();

      await contract.updateSecret(newEncryptedValue.handles[0], newEncryptedValue.inputProof);

      const secondTimestamp = await contract.getEncryptionTimestamp(owner.address);
      expect(secondTimestamp).to.be.greaterThanOrEqual(firstTimestamp);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero value encryption", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(0)
        .encrypt();

      await contract.encryptSecret(encryptedValue.handles[0], encryptedValue.inputProof);

      const isEncrypted = await contract.isSecretEncrypted();
      expect(isEncrypted).to.be.true;
    });

    it("Should handle maximum uint32 value", async function () {
      const contractAddress = await contract.getAddress();

      const maxUint32 = 4294967295; // 2^32 - 1
      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(maxUint32)
        .encrypt();

      await contract.encryptSecret(encryptedValue.handles[0], encryptedValue.inputProof);

      const isEncrypted = await contract.isSecretEncrypted();
      expect(isEncrypted).to.be.true;
    });

    it("Should return false for isSecretEncrypted when no secret stored", async function () {
      const isEncrypted = await contract.isSecretEncrypted();
      expect(isEncrypted).to.be.false;
    });

    it("Should handle large encryption sequences", async function () {
      const contractAddress = await contract.getAddress();

      for (let i = 0; i < 5; i++) {
        const encryptedValue = await fhevm
          .createEncryptedInput(contractAddress, owner.address)
          .add32(i * 1000)
          .encrypt();

        await contract.updateSecret(encryptedValue.handles[0], encryptedValue.inputProof);
      }

      const isEncrypted = await contract.isSecretEncrypted();
      expect(isEncrypted).to.be.true;
    });
  });
});
