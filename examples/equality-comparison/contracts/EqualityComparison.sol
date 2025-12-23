// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, ebool, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Equality Comparison Example
/// @notice Demonstrates FHE equality comparison operations
/// @dev Shows how to compare encrypted values using FHE.eq()
contract EqualityComparison is ZamaEthereumConfig {
    // Storage for encrypted values and their comparison results
    euint32 private _targetValue;
    mapping(address => ebool) private _isEqual;
    mapping(address => uint256) private _comparisonCount;

    event ComparisonPerformed(address indexed user, uint256 timestamp);
    event TargetValueSet(uint256 timestamp);

    /// @notice Initialize with a target encrypted value
    /// @param encryptedTarget The encrypted target value as external type
    /// @param inputProof The zero-knowledge proof for the encrypted input
    function setTargetValue(externalEuint32 encryptedTarget, bytes calldata inputProof) external {
        _targetValue = FHE.fromExternal(encryptedTarget, inputProof);

        FHE.allowThis(_targetValue);
        FHE.allow(_targetValue, msg.sender);

        emit TargetValueSet(block.timestamp);
    }

    /// @notice Compare an encrypted value with the target value
    /// @param encryptedValue The encrypted value to compare as external type
    /// @param inputProof The zero-knowledge proof for the encrypted input
    /// @return The encrypted boolean result (true if values are equal)
    function compareEqual(externalEuint32 encryptedValue, bytes calldata inputProof) external returns (ebool) {
        // Convert external encrypted input to internal type
        euint32 internalValue = FHE.fromExternal(encryptedValue, inputProof);

        // Perform encrypted equality comparison
        // Returns euint4 (encrypted boolean-like value)
        ebool result = FHE.eq(internalValue, _targetValue);

        // Grant permissions
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        // Store result for the caller
        _isEqual[msg.sender] = result;
        _comparisonCount[msg.sender]++;

        emit ComparisonPerformed(msg.sender, block.timestamp);

        return result;
    }

    /// @notice Get the last comparison result for a user
    /// @param user The user address to query
    /// @return The encrypted boolean result of their last comparison
    function getLastComparison(address user) external view returns (ebool) {
        return _isEqual[user];
    }

    /// @notice Get the number of comparisons a user has performed
    /// @param user The user address to query
    /// @return The count of comparisons
    function getComparisonCount(address user) external view returns (uint256) {
        return _comparisonCount[user];
    }

    /// @notice Multi-value comparison: check if multiple encrypted values equal the target
    /// @param encryptedValues Array of encrypted values as external type
    /// @param inputProofs Array of zero-knowledge proofs
    /// @return Array of encrypted boolean results
    function compareMultiple(
        externalEuint32[] calldata encryptedValues,
        bytes[] calldata inputProofs
    ) external returns (ebool[] memory) {
        require(encryptedValues.length == inputProofs.length, "Array length mismatch");
        require(encryptedValues.length > 0, "Empty array");
        require(encryptedValues.length <= 10, "Too many values"); // Prevent excessive computation

        ebool[] memory results = new ebool[](encryptedValues.length);

        for (uint256 i = 0; i < encryptedValues.length; i++) {
            euint32 internalValue = FHE.fromExternal(encryptedValues[i], inputProofs[i]);
            results[i] = FHE.eq(internalValue, _targetValue);

            FHE.allowThis(results[i]);
            FHE.allow(results[i], msg.sender);
        }

        return results;
    }
}
