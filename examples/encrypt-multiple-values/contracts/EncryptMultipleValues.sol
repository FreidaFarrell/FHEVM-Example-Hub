// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Multiple Values Example
/// @notice Demonstrates encryption and storage of multiple encrypted values
/// @dev Shows how to handle arrays of encrypted values safely
contract EncryptMultipleValues is ZamaEthereumConfig {
    struct EncryptedRecord {
        euint32 value1;
        euint32 value2;
        euint32 value3;
        address owner;
        uint256 timestamp;
    }

    mapping(bytes32 => EncryptedRecord) private _records;
    mapping(address => bytes32[]) private _userRecords;

    event MultipleValuesEncrypted(
        address indexed user,
        bytes32 indexed recordId,
        uint256 timestamp
    );
    event RecordRetrieved(address indexed user, bytes32 indexed recordId);

    /// @notice Store multiple encrypted values in a single record
    /// @param value1 First encrypted value (external type)
    /// @param value2 Second encrypted value (external type)
    /// @param value3 Third encrypted value (external type)
    /// @param proofs Array of zero-knowledge proofs [proof1, proof2, proof3]
    /// @return recordId Unique identifier for the record
    function encryptMultipleValues(
        externalEuint32 value1,
        externalEuint32 value2,
        externalEuint32 value3,
        bytes[] calldata proofs
    ) external returns (bytes32 recordId) {
        require(proofs.length == 3, "Must provide exactly 3 proofs");

        // Convert all external encrypted types to internal types
        euint32 internal1 = FHE.fromExternal(value1, proofs[0]);
        euint32 internal2 = FHE.fromExternal(value2, proofs[1]);
        euint32 internal3 = FHE.fromExternal(value3, proofs[2]);

        // Generate unique record ID
        recordId = keccak256(abi.encodePacked(msg.sender, block.timestamp, block.number));

        // Store the record
        EncryptedRecord storage record = _records[recordId];
        record.value1 = internal1;
        record.value2 = internal2;
        record.value3 = internal3;
        record.owner = msg.sender;
        record.timestamp = block.timestamp;

        // Grant permissions for all three values
        FHE.allowThis(record.value1);
        FHE.allowThis(record.value2);
        FHE.allowThis(record.value3);

        FHE.allow(record.value1, msg.sender);
        FHE.allow(record.value2, msg.sender);
        FHE.allow(record.value3, msg.sender);

        // Track user's records
        _userRecords[msg.sender].push(recordId);

        emit MultipleValuesEncrypted(msg.sender, recordId, block.timestamp);
    }

    /// @notice Retrieve all three encrypted values for a record
    /// @param recordId The unique record identifier
    /// @return value1 First encrypted value
    /// @return value2 Second encrypted value
    /// @return value3 Third encrypted value
    function getEncryptedValues(bytes32 recordId)
        external
        view
        returns (euint32, euint32, euint32)
    {
        require(_records[recordId].owner == msg.sender, "Unauthorized: not record owner");

        EncryptedRecord storage record = _records[recordId];
        emit RecordRetrieved(msg.sender, recordId);

        return (record.value1, record.value2, record.value3);
    }

    /// @notice Get record timestamp
    /// @param recordId The unique record identifier
    /// @return timestamp When the record was created
    function getRecordTimestamp(bytes32 recordId) external view returns (uint256) {
        require(_records[recordId].owner == msg.sender, "Unauthorized: not record owner");
        return _records[recordId].timestamp;
    }

    /// @notice Get all record IDs for a user
    /// @param user The user address to query
    /// @return Array of record IDs owned by the user
    function getUserRecords(address user) external view returns (bytes32[] memory) {
        return _userRecords[user];
    }

    /// @notice Check if a user owns a record
    /// @param recordId The record identifier
    /// @return true if the caller owns the record
    function isRecordOwner(bytes32 recordId) external view returns (bool) {
        return _records[recordId].owner == msg.sender;
    }

    /// @notice Get record owner
    /// @param recordId The record identifier
    /// @return owner address of the record owner
    function getRecordOwner(bytes32 recordId) external view returns (address) {
        return _records[recordId].owner;
    }

    /// @notice Update one value in a record
    /// @param recordId The record to update
    /// @param valueIndex Which value to update (1, 2, or 3)
    /// @param newValue The new encrypted value
    /// @param proof The zero-knowledge proof
    function updateValue(
        bytes32 recordId,
        uint8 valueIndex,
        externalEuint32 newValue,
        bytes calldata proof
    ) external {
        require(_records[recordId].owner == msg.sender, "Unauthorized: not record owner");
        require(valueIndex >= 1 && valueIndex <= 3, "Invalid value index");

        euint32 internalValue = FHE.fromExternal(newValue, proof);

        if (valueIndex == 1) {
            _records[recordId].value1 = internalValue;
        } else if (valueIndex == 2) {
            _records[recordId].value2 = internalValue;
        } else {
            _records[recordId].value3 = internalValue;
        }

        FHE.allowThis(internalValue);
        FHE.allow(internalValue, msg.sender);
    }

    /// @notice Get count of records for a user
    /// @param user The user address
    /// @return Count of records owned by user
    function getRecordCount(address user) external view returns (uint256) {
        return _userRecords[user].length;
    }
}
