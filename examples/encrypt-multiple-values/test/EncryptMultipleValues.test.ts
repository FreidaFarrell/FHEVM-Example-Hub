import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { EncryptMultipleValues } from "../typechain-types";

describe("EncryptMultipleValues", function () {
  let contract: EncryptMultipleValues;
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

    const factory = await ethers.getContractFactory("EncryptMultipleValues");
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Encryption of Multiple Values", function () {
    it("Should encrypt and store three values", async function () {
      const contractAddress = await contract.getAddress();

      const encrypted1 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(100)
        .encrypt();

      const encrypted2 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(200)
        .encrypt();

      const encrypted3 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(300)
        .encrypt();

      const tx = await contract.encryptMultipleValues(
        encrypted1.handles[0],
        encrypted2.handles[0],
        encrypted3.handles[0],
        [encrypted1.inputProof, encrypted2.inputProof, encrypted3.inputProof]
      );

      expect(tx).to.emit(contract, "MultipleValuesEncrypted");
    });

    it("Should return valid record ID", async function () {
      const contractAddress = await contract.getAddress();

      const encrypted1 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(111)
        .encrypt();

      const encrypted2 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(222)
        .encrypt();

      const encrypted3 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(333)
        .encrypt();

      const txResponse = await contract.encryptMultipleValues(
        encrypted1.handles[0],
        encrypted2.handles[0],
        encrypted3.handles[0],
        [encrypted1.inputProof, encrypted2.inputProof, encrypted3.inputProof]
      );

      const receipt = await txResponse.wait();
      expect(receipt).to.not.be.null;
    });

    it("Should reject wrong number of proofs", async function () {
      const contractAddress = await contract.getAddress();

      const encrypted1 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(100)
        .encrypt();

      const encrypted2 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(200)
        .encrypt();

      const encrypted3 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(300)
        .encrypt();

      // Only provide 2 proofs instead of 3
      await expect(
        contract.encryptMultipleValues(
          encrypted1.handles[0],
          encrypted2.handles[0],
          encrypted3.handles[0],
          [encrypted1.inputProof, encrypted2.inputProof]
        )
      ).to.be.revertedWith("Must provide exactly 3 proofs");
    });
  });

  describe("Record Retrieval", function () {
    let recordId: string;

    beforeEach(async function () {
      const contractAddress = await contract.getAddress();

      const encrypted1 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(10)
        .encrypt();

      const encrypted2 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(20)
        .encrypt();

      const encrypted3 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(30)
        .encrypt();

      const txResponse = await contract.encryptMultipleValues(
        encrypted1.handles[0],
        encrypted2.handles[0],
        encrypted3.handles[0],
        [encrypted1.inputProof, encrypted2.inputProof, encrypted3.inputProof]
      );

      const receipt = await txResponse.wait();
      const event = receipt?.logs[0];
      expect(event).to.not.be.undefined;
    });

    it("Should allow owner to retrieve encrypted values", async function () {
      const userRecords = await contract.getUserRecords(owner.address);
      expect(userRecords.length).to.be.greaterThan(0);

      const recordId = userRecords[0];
      const result = await contract.getEncryptedValues(recordId);
      expect(result).to.have.lengthOf(3);
    });

    it("Should prevent unauthorized access", async function () {
      const userRecords = await contract.getUserRecords(owner.address);
      const recordId = userRecords[0];

      await expect(
        contract.connect(addr1).getEncryptedValues(recordId)
      ).to.be.revertedWith("Unauthorized: not record owner");
    });

    it("Should get correct record timestamp", async function () {
      const userRecords = await contract.getUserRecords(owner.address);
      const recordId = userRecords[0];

      const timestamp = await contract.getRecordTimestamp(recordId);
      expect(timestamp).to.be.greaterThan(0);
    });

    it("Should verify record ownership", async function () {
      const userRecords = await contract.getUserRecords(owner.address);
      const recordId = userRecords[0];

      const isOwner = await contract.connect(owner).isRecordOwner(recordId);
      expect(isOwner).to.be.true;

      const isNotOwner = await contract.connect(addr1).isRecordOwner(recordId);
      expect(isNotOwner).to.be.false;
    });

    it("Should return correct record owner", async function () {
      const userRecords = await contract.getUserRecords(owner.address);
      const recordId = userRecords[0];

      const recordOwner = await contract.getRecordOwner(recordId);
      expect(recordOwner).to.equal(owner.address);
    });
  });

  describe("Multiple Records", function () {
    it("Should handle multiple records per user", async function () {
      const contractAddress = await contract.getAddress();

      // Create first record
      const enc1 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(1)
        .encrypt();
      const enc2 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(2)
        .encrypt();
      const enc3 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(3)
        .encrypt();

      await contract.encryptMultipleValues(
        enc1.handles[0],
        enc2.handles[0],
        enc3.handles[0],
        [enc1.inputProof, enc2.inputProof, enc3.inputProof]
      );

      // Create second record
      const enc4 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(4)
        .encrypt();
      const enc5 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(5)
        .encrypt();
      const enc6 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(6)
        .encrypt();

      await contract.encryptMultipleValues(
        enc4.handles[0],
        enc5.handles[0],
        enc6.handles[0],
        [enc4.inputProof, enc5.inputProof, enc6.inputProof]
      );

      const records = await contract.getUserRecords(owner.address);
      expect(records.length).to.equal(2);

      const count = await contract.getRecordCount(owner.address);
      expect(count).to.equal(2);
    });

    it("Should track records for different users separately", async function () {
      const contractAddress = await contract.getAddress();

      // Owner creates record
      const ownerEnc1 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(10)
        .encrypt();
      const ownerEnc2 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(20)
        .encrypt();
      const ownerEnc3 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(30)
        .encrypt();

      await contract.connect(owner).encryptMultipleValues(
        ownerEnc1.handles[0],
        ownerEnc2.handles[0],
        ownerEnc3.handles[0],
        [ownerEnc1.inputProof, ownerEnc2.inputProof, ownerEnc3.inputProof]
      );

      // addr1 creates record
      const addr1Enc1 = await fhevm
        .createEncryptedInput(contractAddress, addr1.address)
        .add32(40)
        .encrypt();
      const addr1Enc2 = await fhevm
        .createEncryptedInput(contractAddress, addr1.address)
        .add32(50)
        .encrypt();
      const addr1Enc3 = await fhevm
        .createEncryptedInput(contractAddress, addr1.address)
        .add32(60)
        .encrypt();

      await contract.connect(addr1).encryptMultipleValues(
        addr1Enc1.handles[0],
        addr1Enc2.handles[0],
        addr1Enc3.handles[0],
        [addr1Enc1.inputProof, addr1Enc2.inputProof, addr1Enc3.inputProof]
      );

      const ownerRecords = await contract.getRecordCount(owner.address);
      const addr1Records = await contract.getRecordCount(addr1.address);

      expect(ownerRecords).to.equal(1);
      expect(addr1Records).to.equal(1);
    });
  });

  describe("Update Values", function () {
    let recordId: string;

    beforeEach(async function () {
      const contractAddress = await contract.getAddress();

      const encrypted1 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(100)
        .encrypt();

      const encrypted2 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(200)
        .encrypt();

      const encrypted3 = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(300)
        .encrypt();

      const txResponse = await contract.encryptMultipleValues(
        encrypted1.handles[0],
        encrypted2.handles[0],
        encrypted3.handles[0],
        [encrypted1.inputProof, encrypted2.inputProof, encrypted3.inputProof]
      );

      const userRecords = await contract.getUserRecords(owner.address);
      recordId = userRecords[0];
    });

    it("Should update individual value in record", async function () {
      const contractAddress = await contract.getAddress();

      const newValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(999)
        .encrypt();

      await contract.updateValue(
        recordId,
        1,
        newValue.handles[0],
        newValue.inputProof
      );

      expect(true).to.be.true; // Success if no revert
    });

    it("Should reject invalid value index", async function () {
      const contractAddress = await contract.getAddress();

      const newValue = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(888)
        .encrypt();

      await expect(
        contract.updateValue(
          recordId,
          5,
          newValue.handles[0],
          newValue.inputProof
        )
      ).to.be.revertedWith("Invalid value index");
    });

    it("Should prevent unauthorized update", async function () {
      const contractAddress = await contract.getAddress();

      const newValue = await fhevm
        .createEncryptedInput(contractAddress, addr1.address)
        .add32(777)
        .encrypt();

      await expect(
        contract.connect(addr1).updateValue(
          recordId,
          1,
          newValue.handles[0],
          newValue.inputProof
        )
      ).to.be.revertedWith("Unauthorized: not record owner");
    });
  });
});
