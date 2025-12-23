import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { UserDecrypt } from "../typechain-types";

describe("UserDecrypt", function () {
  let contract: UserDecrypt;
  let owner: any;
  let addr1: any;
  let addr2: any;

  before(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }
    [owner, addr1, addr2] = await ethers.getSigners();
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }

    const factory = await ethers.getContractFactory("UserDecrypt");
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Data Storage", function () {
    it("Should store encrypted data and return data ID", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(12345)
        .encrypt();

      const tx = await contract.storeEncryptedData(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      expect(tx).to.emit(contract, "DataEncrypted");
    });

    it("Should track user data IDs", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(999)
        .encrypt();

      await contract.storeEncryptedData(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      const userDataIds = await contract.getUserDataIds(owner.address);
      expect(userDataIds.length).to.equal(1);

      const count = await contract.getUserDataCount(owner.address);
      expect(count).to.equal(1);
    });

    it("Should store correct timestamp", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(777)
        .encrypt();

      await contract.storeEncryptedData(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      const userDataIds = await contract.getUserDataIds(owner.address);
      const dataId = userDataIds[0];

      const timestamp = await contract.getDataTimestamp(dataId);
      expect(timestamp).to.be.greaterThan(0);
    });

    it("Should set correct data owner", async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(555)
        .encrypt();

      await contract.storeEncryptedData(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      const userDataIds = await contract.getUserDataIds(owner.address);
      const dataId = userDataIds[0];

      const dataOwner = await contract.getDataOwner(dataId);
      expect(dataOwner).to.equal(owner.address);
    });
  });

  describe("Data Retrieval", function () {
    let dataId: string;

    beforeEach(async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(42)
        .encrypt();

      await contract.storeEncryptedData(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      const userDataIds = await contract.getUserDataIds(owner.address);
      dataId = userDataIds[0];
    });

    it("Should retrieve encrypted data", async function () {
      const encryptedValue = await contract.getEncryptedData(dataId);
      expect(encryptedValue).to.not.be.null;
    });

    it("Should reject retrieval of non-existent data", async function () {
      const fakeDataId = ethers.keccak256(ethers.toUtf8Bytes("fake"));

      await expect(
        contract.getEncryptedData(fakeDataId)
      ).to.be.revertedWith("Data does not exist");
    });

    it("Should check if decryption is enabled", async function () {
      const isEnabled = await contract.isDecryptionEnabled(dataId);
      expect(isEnabled).to.be.true;
    });
  });

  describe("Permission Management", function () {
    let dataId: string;

    beforeEach(async function () {
      const contractAddress = await contract.getAddress();

      const encryptedValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(100)
        .encrypt();

      await contract.storeEncryptedData(
        encryptedValue.handles[0],
        encryptedValue.inputProof
      );

      const userDataIds = await contract.getUserDataIds(owner.address);
      dataId = userDataIds[0];
    });

    it("Should grant decryption permission to another user", async function () {
      const tx = await contract.grantDecryptionPermission(dataId, addr1.address);

      expect(tx).to.emit(contract, "DecryptionPermissionGranted")
        .withArgs(owner.address, dataId, addr1.address);
    });

    it("Should prevent non-owner from granting permissions", async function () {
      await expect(
        contract.connect(addr1).grantDecryptionPermission(dataId, addr2.address)
      ).to.be.revertedWith("Unauthorized: only owner can grant permissions");
    });

    it("Should reject invalid user address", async function () {
      await expect(
        contract.grantDecryptionPermission(dataId, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid user address");
    });

    it("Should revoke all decryption permissions", async function () {
      await contract.revokeAllDecryptionPermissions(dataId);

      const isEnabled = await contract.isDecryptionEnabled(dataId);
      expect(isEnabled).to.be.false;

      await expect(
        contract.getEncryptedData(dataId)
      ).to.be.revertedWith("Decryption is disabled for this data");
    });

    it("Should prevent non-owner from revoking permissions", async function () {
      await expect(
        contract.connect(addr1).revokeAllDecryptionPermissions(dataId)
      ).to.be.revertedWith("Unauthorized: only owner can revoke permissions");
    });

    it("Should re-enable decryption after revocation", async function () {
      await contract.revokeAllDecryptionPermissions(dataId);

      let isEnabled = await contract.isDecryptionEnabled(dataId);
      expect(isEnabled).to.be.false;

      await contract.enableDecryption(dataId);

      isEnabled = await contract.isDecryptionEnabled(dataId);
      expect(isEnabled).to.be.true;
    });

    it("Should prevent non-owner from enabling decryption", async function () {
      await contract.revokeAllDecryptionPermissions(dataId);

      await expect(
        contract.connect(addr1).enableDecryption(dataId)
      ).to.be.revertedWith("Unauthorized: only owner can enable decryption");
    });
  });

  describe("Batch Operations", function () {
    it("Should batch store multiple encrypted values", async function () {
      const contractAddress = await contract.getAddress();

      const values = [10, 20, 30, 40, 50];
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

      const dataIds = await contract.batchStoreEncryptedData.staticCall(handles, proofs);
      expect(dataIds.length).to.equal(5);

      await contract.batchStoreEncryptedData(handles, proofs);

      const count = await contract.getUserDataCount(owner.address);
      expect(count).to.equal(5);
    });

    it("Should reject empty array in batch store", async function () {
      await expect(
        contract.batchStoreEncryptedData([], [])
      ).to.be.revertedWith("Empty array");
    });

    it("Should reject array length mismatch in batch store", async function () {
      const contractAddress = await contract.getAddress();

      const enc = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(42)
        .encrypt();

      await expect(
        contract.batchStoreEncryptedData([enc.handles[0]], [])
      ).to.be.revertedWith("Array length mismatch");
    });

    it("Should limit array size in batch store", async function () {
      const contractAddress = await contract.getAddress();

      const handles = [];
      const proofs = [];

      for (let i = 0; i < 11; i++) {
        const enc = await fhevm
          .createEncryptedInput(contractAddress, owner.address)
          .add32(i)
          .encrypt();
        handles.push(enc.handles[0]);
        proofs.push(enc.inputProof);
      }

      await expect(
        contract.batchStoreEncryptedData(handles, proofs)
      ).to.be.revertedWith("Too many values");
    });
  });

  describe("Multiple Users", function () {
    it("Should handle data from different users separately", async function () {
      const contractAddress = await contract.getAddress();

      // Owner stores data
      const ownerEnc = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(111)
        .encrypt();
      await contract.connect(owner).storeEncryptedData(
        ownerEnc.handles[0],
        ownerEnc.inputProof
      );

      // addr1 stores data
      const addr1Enc = await fhevm
        .createEncryptedInput(contractAddress, addr1.address)
        .add32(222)
        .encrypt();
      await contract.connect(addr1).storeEncryptedData(
        addr1Enc.handles[0],
        addr1Enc.inputProof
      );

      const ownerCount = await contract.getUserDataCount(owner.address);
      const addr1Count = await contract.getUserDataCount(addr1.address);

      expect(ownerCount).to.equal(1);
      expect(addr1Count).to.equal(1);
    });
  });
});
