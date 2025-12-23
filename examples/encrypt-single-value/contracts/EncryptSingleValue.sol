// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Single Value Example
/// @notice Demonstrates encryption and storage of a single encrypted value
/// @dev Shows the pattern for securely handling external encrypted inputs
contract EncryptSingleValue is ZamaEthereumConfig {
    euint32 private _encryptedSecret;
    address private _secretOwner;
    mapping(address => uint256) private _encryptionTimestamp;

    event SecretEncrypted(address indexed encryptor, uint256 timestamp);
    event SecretRetrieved(address indexed requester, uint256 timestamp);

    /// @notice Store an encrypted value
    /// @param encryptedValue The encrypted value as external type
    /// @param inputProof The zero-knowledge proof validating the encryption
    /// @dev This demonstrates the proper pattern for receiving encrypted external inputs
    function encryptSecret(externalEuint32 encryptedValue, bytes calldata inputProof) external {
        // Step 1: Convert external encrypted type to internal encrypted type
        // This validates the input proof and ensures the value is properly bound
        euint32 internalValue = FHE.fromExternal(encryptedValue, inputProof);

        // Step 2: Store the encrypted value
        _encryptedSecret = internalValue;
        _secretOwner = msg.sender;
        _encryptionTimestamp[msg.sender] = block.timestamp;

        // Step 3: Grant permissions for the encrypted value
        // allowThis() - allows the contract to use the encrypted value
        FHE.allowThis(_encryptedSecret);
        // allow() - allows the caller to decrypt the value
        FHE.allow(_encryptedSecret, msg.sender);

        emit SecretEncrypted(msg.sender, block.timestamp);
    }

    /// @notice Retrieve the encrypted secret
    /// @return The encrypted value (only contract and secret owner can access)
    function getEncryptedSecret() external view returns (euint32) {
        require(_secretOwner == msg.sender, "Unauthorized: only secret owner can retrieve");
        return _encryptedSecret;
    }

    /// @notice Get the encryption timestamp
    /// @param user The user to query
    /// @return The timestamp when the secret was encrypted
    function getEncryptionTimestamp(address user) external view returns (uint256) {
        return _encryptionTimestamp[user];
    }

    /// @notice Update an encrypted value
    /// @param newEncryptedValue The new encrypted value
    /// @param inputProof The zero-knowledge proof
    function updateSecret(externalEuint32 newEncryptedValue, bytes calldata inputProof) external {
        require(_secretOwner == msg.sender, "Unauthorized: only original owner can update");

        // Convert and store new value
        euint32 newValue = FHE.fromExternal(newEncryptedValue, inputProof);
        _encryptedSecret = newValue;

        // Grant new permissions
        FHE.allowThis(_encryptedSecret);
        FHE.allow(_encryptedSecret, msg.sender);

        _encryptionTimestamp[msg.sender] = block.timestamp;
        emit SecretEncrypted(msg.sender, block.timestamp);
    }

    /// @notice Check if a value is encrypted (always true if stored)
    /// @return true if secret has been set
    function isSecretEncrypted() external view returns (bool) {
        return _secretOwner != address(0);
    }

    /// @notice Get the owner of the stored secret
    /// @return The address that encrypted the secret
    function getSecretOwner() external view returns (address) {
        return _secretOwner;
    }
}
