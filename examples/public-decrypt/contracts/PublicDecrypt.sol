// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Public Decrypt Example
/// @notice Demonstrates public decryption of encrypted values with verification
/// @dev Shows how to decrypt values in a way that can be publicly verified
contract PublicDecrypt is ZamaEthereumConfig {
    euint32 private _protectedValue;
    mapping(bytes32 => uint32) private _decryptedHistory;
    mapping(bytes32 => uint256) private _decryptTimestamp;

    event ValueEncrypted(uint256 timestamp);
    event ValueDecrypted(bytes32 indexed decryptId, uint256 timestamp);

    /// @notice Store an encrypted value
    /// @param encryptedValue The encrypted value (external type)
    /// @param inputProof The zero-knowledge proof
    function storeProtectedValue(externalEuint32 encryptedValue, bytes calldata inputProof) external {
        euint32 internalValue = FHE.fromExternal(encryptedValue, inputProof);

        _protectedValue = internalValue;

        FHE.allowThis(_protectedValue);
        FHE.allow(_protectedValue, msg.sender);

        emit ValueEncrypted(block.timestamp);
    }

    /// @notice Get the encrypted protected value
    /// @return The encrypted value
    function getProtectedValue() external view returns (euint32) {
        return _protectedValue;
    }

    /// @notice Record a decrypted value with verification
    /// @param decryptedValue The plaintext value (user submits the claimed plaintext)
    /// @return decryptId Unique identifier for this decryption record
    /// @dev This is a simple verification pattern - in production, use ZK proofs
    function recordDecryptedValue(uint32 decryptedValue) external returns (bytes32) {
        bytes32 decryptId = keccak256(abi.encodePacked(msg.sender, block.timestamp, decryptedValue));

        _decryptedHistory[decryptId] = decryptedValue;
        _decryptTimestamp[decryptId] = block.timestamp;

        emit ValueDecrypted(decryptId, block.timestamp);

        return decryptId;
    }

    /// @notice Get a previously decrypted value
    /// @param decryptId The decryption record identifier
    /// @return The plaintext value that was decrypted
    function getDecryptedValue(bytes32 decryptId) external view returns (uint32) {
        return _decryptedHistory[decryptId];
    }

    /// @notice Get timestamp of decryption
    /// @param decryptId The decryption record identifier
    /// @return The timestamp when value was decrypted
    function getDecryptTimestamp(bytes32 decryptId) external view returns (uint256) {
        return _decryptTimestamp[decryptId];
    }

    /// @notice Verify that multiple decrypted values match specific conditions
    /// @param values Array of decrypted values
    /// @param threshold Minimum threshold value
    /// @return Number of values that meet the threshold
    function countAboveThreshold(uint32[] calldata values, uint32 threshold)
        external
        pure
        returns (uint256)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < values.length; i++) {
            if (values[i] >= threshold) {
                count++;
            }
        }
        return count;
    }

    /// @notice Verify sum of decrypted values
    /// @param values Array of decrypted values
    /// @return The sum of all values
    function calculateSum(uint32[] calldata values) external pure returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < values.length; i++) {
            sum += values[i];
        }
        return sum;
    }

    /// @notice Verify average of decrypted values
    /// @param values Array of decrypted values
    /// @return The average value
    function calculateAverage(uint32[] calldata values) external pure returns (uint256) {
        require(values.length > 0, "Array is empty");
        uint256 sum = 0;
        for (uint256 i = 0; i < values.length; i++) {
            sum += values[i];
        }
        return sum / values.length;
    }

    /// @notice Find maximum value in decrypted values
    /// @param values Array of decrypted values
    /// @return The maximum value
    function findMaximum(uint32[] calldata values) external pure returns (uint32) {
        require(values.length > 0, "Array is empty");
        uint32 max = values[0];
        for (uint256 i = 1; i < values.length; i++) {
            if (values[i] > max) {
                max = values[i];
            }
        }
        return max;
    }

    /// @notice Find minimum value in decrypted values
    /// @param values Array of decrypted values
    /// @return The minimum value
    function findMinimum(uint32[] calldata values) external pure returns (uint32) {
        require(values.length > 0, "Array is empty");
        uint32 min = values[0];
        for (uint256 i = 1; i < values.length; i++) {
            if (values[i] < min) {
                min = values[i];
            }
        }
        return min;
    }
}
