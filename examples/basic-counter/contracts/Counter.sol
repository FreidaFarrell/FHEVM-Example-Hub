// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title FHECounter
 * @description Simple FHE counter contract demonstrating encrypted arithmetic
 * @chapter: basic
 */
contract FHECounter is ZamaEthereumConfig {
    euint32 private _count;

    event CounterIncremented(address indexed caller, uint256 timestamp);
    event CounterDecremented(address indexed caller, uint256 timestamp);

    /**
     * @notice Initialize counter to zero
     */
    constructor() {
        _count = FHE.asEuint32(0);
        FHE.allowThis(_count);
    }

    /**
     * @notice Get the encrypted counter value
     * @return The encrypted counter
     */
    function getCount() external view returns (euint32) {
        return _count;
    }

    /**
     * @notice Increment counter by encrypted amount
     * @param inputEuint32 The encrypted increment value
     * @param inputProof Input proof for verification
     */
    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);
        _count = FHE.add(_count, encryptedValue);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);

        emit CounterIncremented(msg.sender, block.timestamp);
    }

    /**
     * @notice Decrement counter by encrypted amount
     * @param inputEuint32 The encrypted decrement value
     * @param inputProof Input proof for verification
     */
    function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);
        _count = FHE.sub(_count, encryptedValue);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);

        emit CounterDecremented(msg.sender, block.timestamp);
    }

    /**
     * @notice Reset counter to zero
     */
    function reset() external {
        _count = FHE.asEuint32(0);
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}
