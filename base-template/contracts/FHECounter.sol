// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title A simple FHE counter contract
/// @notice A basic example demonstrating encrypted counter operations
/// @dev This contract shows fundamental FHEVM patterns for increment and decrement operations
contract FHECounter is ZamaEthereumConfig {
    euint32 private _count;

    /// @notice Returns the current encrypted count
    /// @return The current encrypted count value
    function getCount() external view returns (euint32) {
        return _count;
    }

    /// @notice Increments the counter by a specified encrypted value
    /// @param inputEuint32 The encrypted input value as external type
    /// @param inputProof The zero-knowledge proof validating the encrypted input
    /// @dev This example omits overflow checks for simplicity.
    /// In production, implement proper range validation.
    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        // Convert external encrypted type to internal encrypted type
        euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);

        // Perform encrypted addition
        _count = FHE.add(_count, encryptedValue);

        // Grant permissions for the encrypted result
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    /// @notice Decrements the counter by a specified encrypted value
    /// @param inputEuint32 The encrypted input value as external type
    /// @param inputProof The zero-knowledge proof validating the encrypted input
    /// @dev This example omits underflow checks for simplicity.
    /// In production, implement proper range validation.
    function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        // Convert external encrypted type to internal encrypted type
        euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);

        // Perform encrypted subtraction
        _count = FHE.sub(_count, encryptedValue);

        // Grant permissions for the encrypted result
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}
