// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, euint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title FHEArithmetic
 * @description Demonstrates arithmetic operations on encrypted values
 * @chapter: basic
 */
contract FHEArithmetic is ZamaEthereumConfig {
    euint32 private result;

    event ArithmeticOperation(string operation, address indexed caller, uint256 timestamp);

    /**
     * @notice Get the encrypted result
     * @return The encrypted result value
     */
    function getResult() external view returns (euint32) {
        return result;
    }

    /**
     * @notice Add two encrypted values
     * @param a First encrypted value
     * @param b Second encrypted value
     */
    function add(euint32 a, euint32 b) external returns (euint32) {
        result = FHE.add(a, b);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        emit ArithmeticOperation("add", msg.sender, block.timestamp);
        return result;
    }

    /**
     * @notice Subtract second value from first (encrypted)
     * @param a First encrypted value (minuend)
     * @param b Second encrypted value (subtrahend)
     */
    function subtract(euint32 a, euint32 b) external returns (euint32) {
        result = FHE.sub(a, b);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        emit ArithmeticOperation("subtract", msg.sender, block.timestamp);
        return result;
    }

    /**
     * @notice Multiply two encrypted values
     * @param a First encrypted value
     * @param b Second encrypted value
     */
    function multiply(euint32 a, euint32 b) external returns (euint32) {
        result = FHE.mul(a, b);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        emit ArithmeticOperation("multiply", msg.sender, block.timestamp);
        return result;
    }

    /**
     * @notice Divide first value by second (encrypted)
     * @param a First encrypted value (dividend)
     * @param b Second encrypted value (divisor)
     */
    function divide(euint32 a, euint32 b) external returns (euint32) {
        // Note: Division on encrypted values requires careful handling
        result = FHE.div(a, b);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        emit ArithmeticOperation("divide", msg.sender, block.timestamp);
        return result;
    }

    /**
     * @notice Check if two values are equal (encrypted comparison)
     * @param a First encrypted value
     * @param b Second encrypted value
     * @return Encrypted boolean result
     */
    function equal(euint32 a, euint32 b) external returns (uint256) {
        // Perform encrypted comparison
        // Returns encrypted boolean wrapped as uint
        emit ArithmeticOperation("equal", msg.sender, block.timestamp);
        return uint256(uint8(FHE.eq(a, b)));
    }

    /**
     * @notice Check if first value is less than second (encrypted)
     * @param a First encrypted value
     * @param b Second encrypted value
     */
    function lessThan(euint32 a, euint32 b) external returns (uint256) {
        emit ArithmeticOperation("lessThan", msg.sender, block.timestamp);
        return uint256(uint8(FHE.lt(a, b)));
    }

    /**
     * @notice Check if first value is less than or equal to second
     * @param a First encrypted value
     * @param b Second encrypted value
     */
    function lessOrEqual(euint32 a, euint32 b) external returns (uint256) {
        emit ArithmeticOperation("lessOrEqual", msg.sender, block.timestamp);
        return uint256(uint8(FHE.lte(a, b)));
    }

    /**
     * @notice Add encrypted value to plaintext constant
     * @param encrypted The encrypted value
     * @param plainValue The plaintext value to add
     */
    function addPlain(euint32 encrypted, uint32 plainValue) external returns (euint32) {
        euint32 plainEncrypted = FHE.asEuint32(plainValue);
        result = FHE.add(encrypted, plainEncrypted);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        emit ArithmeticOperation("addPlain", msg.sender, block.timestamp);
        return result;
    }

    /**
     * @notice Reset result to zero
     */
    function reset() external {
        result = FHE.asEuint32(0);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
    }
}
