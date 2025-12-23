// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title User Decrypt Example
/// @notice Demonstrates user-initiated decryption of encrypted values
/// @dev Shows permission management and decryption patterns
contract UserDecrypt is ZamaEthereumConfig {
    struct EncryptedData {
        euint32 sensitiveValue;
        address owner;
        uint256 timestamp;
        bool canDecrypt;
    }

    mapping(bytes32 => EncryptedData) private _dataStore;
    mapping(address => bytes32[]) private _userDataIds;

    event DataEncrypted(address indexed user, bytes32 indexed dataId);
    event DecryptionPermissionGranted(address indexed user, bytes32 indexed dataId, address indexed grantedTo);
    event DecryptionPermissionRevoked(address indexed user, bytes32 indexed dataId, address indexed revokedFrom);

    /// @notice Store encrypted sensitive data
    /// @param encryptedValue The encrypted value (external type)
    /// @param inputProof The zero-knowledge proof
    /// @return dataId Unique identifier for the data
    function storeEncryptedData(externalEuint32 encryptedValue, bytes calldata inputProof)
        external
        returns (bytes32 dataId)
    {
        // Convert external encrypted type to internal type
        euint32 internalValue = FHE.fromExternal(encryptedValue, inputProof);

        // Generate unique data ID
        dataId = keccak256(abi.encodePacked(msg.sender, block.timestamp, block.number));

        // Store encrypted data
        _dataStore[dataId] = EncryptedData({
            sensitiveValue: internalValue,
            owner: msg.sender,
            timestamp: block.timestamp,
            canDecrypt: true
        });

        // Grant decryption permissions
        // Contract must be able to access the value
        FHE.allowThis(internalValue);
        // Owner can decrypt the value
        FHE.allow(internalValue, msg.sender);

        // Track user's data
        _userDataIds[msg.sender].push(dataId);

        emit DataEncrypted(msg.sender, dataId);

        return dataId;
    }

    /// @notice Retrieve encrypted data for decryption
    /// @param dataId The data identifier
    /// @return The encrypted value (can be decrypted by authorized users)
    /// @dev User must have permission to decrypt this value
    function getEncryptedData(bytes32 dataId) external view returns (euint32) {
        require(_dataStore[dataId].owner != address(0), "Data does not exist");
        require(_dataStore[dataId].canDecrypt, "Decryption is disabled for this data");

        return _dataStore[dataId].sensitiveValue;
    }

    /// @notice Grant decryption permission to another user
    /// @param dataId The data identifier
    /// @param user The user to grant permission to
    /// @dev Only the data owner can grant permissions
    function grantDecryptionPermission(bytes32 dataId, address user) external {
        require(_dataStore[dataId].owner == msg.sender, "Unauthorized: only owner can grant permissions");
        require(user != address(0), "Invalid user address");

        // Grant permission for user to decrypt the value
        FHE.allow(_dataStore[dataId].sensitiveValue, user);

        emit DecryptionPermissionGranted(msg.sender, dataId, user);
    }

    /// @notice Revoke decryption permission (disable decryption entirely)
    /// @param dataId The data identifier
    /// @dev This prevents ALL decryption of the data
    function revokeAllDecryptionPermissions(bytes32 dataId) external {
        require(_dataStore[dataId].owner == msg.sender, "Unauthorized: only owner can revoke permissions");

        _dataStore[dataId].canDecrypt = false;

        emit DecryptionPermissionRevoked(msg.sender, dataId, address(0));
    }

    /// @notice Re-enable decryption for data
    /// @param dataId The data identifier
    function enableDecryption(bytes32 dataId) external {
        require(_dataStore[dataId].owner == msg.sender, "Unauthorized: only owner can enable decryption");

        _dataStore[dataId].canDecrypt = true;
    }

    /// @notice Get data owner
    /// @param dataId The data identifier
    /// @return The address of the data owner
    function getDataOwner(bytes32 dataId) external view returns (address) {
        return _dataStore[dataId].owner;
    }

    /// @notice Get data timestamp
    /// @param dataId The data identifier
    /// @return The timestamp when data was stored
    function getDataTimestamp(bytes32 dataId) external view returns (uint256) {
        return _dataStore[dataId].timestamp;
    }

    /// @notice Check if decryption is enabled
    /// @param dataId The data identifier
    /// @return true if decryption is enabled
    function isDecryptionEnabled(bytes32 dataId) external view returns (bool) {
        return _dataStore[dataId].canDecrypt;
    }

    /// @notice Get all data IDs for a user
    /// @param user The user address
    /// @return Array of data IDs owned by the user
    function getUserDataIds(address user) external view returns (bytes32[] memory) {
        return _userDataIds[user];
    }

    /// @notice Get count of encrypted data for a user
    /// @param user The user address
    /// @return Count of data entries
    function getUserDataCount(address user) external view returns (uint256) {
        return _userDataIds[user].length;
    }

    /// @notice Batch store multiple encrypted values
    /// @param encryptedValues Array of encrypted values
    /// @param proofs Array of zero-knowledge proofs
    /// @return dataIds Array of unique identifiers
    function batchStoreEncryptedData(
        externalEuint32[] calldata encryptedValues,
        bytes[] calldata proofs
    ) external returns (bytes32[] memory dataIds) {
        require(encryptedValues.length == proofs.length, "Array length mismatch");
        require(encryptedValues.length > 0, "Empty array");
        require(encryptedValues.length <= 10, "Too many values");

        dataIds = new bytes32[](encryptedValues.length);

        for (uint256 i = 0; i < encryptedValues.length; i++) {
            dataIds[i] = this.storeEncryptedData(encryptedValues[i], proofs[i]);
        }

        return dataIds;
    }
}
