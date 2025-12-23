// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Input Proof Example
/// @notice Demonstrates input proof validation and security patterns
/// @dev Shows how zero-knowledge proofs secure encrypted inputs
contract InputProof is ZamaEthereumConfig {
    struct ValidationRecord {
        address validator;
        uint256 timestamp;
        bool isValid;
    }

    mapping(bytes32 => ValidationRecord) private _validationRecords;
    mapping(address => uint256) private _proofCount;
    uint256 private _totalProofsValidated;

    event ProofValidated(address indexed user, uint256 timestamp, bool isValid);
    event ProofRejected(address indexed user, uint256 timestamp, string reason);

    /// @notice Validate and process an input proof
    /// @param encryptedValue The encrypted value with proof
    /// @param inputProof The zero-knowledge proof binding the value
    /// @return proofId Unique identifier for this validation
    /// @dev Input proofs ensure:
    ///      1. Value is properly encrypted
    ///      2. Value is bound to specific contract and user
    ///      3. Value hasn't been tampered with
    function validateInputProof(externalEuint32 encryptedValue, bytes calldata inputProof)
        external
        returns (bytes32 proofId)
    {
        // The FHE.fromExternal call validates the input proof
        // If the proof is invalid, this will revert
        // If valid, the value is properly decrypted into contract accessible form
        euint32 validatedValue = FHE.fromExternal(encryptedValue, inputProof);

        // Generate unique proof ID
        proofId = keccak256(abi.encodePacked(msg.sender, block.timestamp, encryptedValue));

        // Record validation
        _validationRecords[proofId] = ValidationRecord({
            validator: msg.sender,
            timestamp: block.timestamp,
            isValid: true
        });

        _proofCount[msg.sender]++;
        _totalProofsValidated++;

        // Grant permissions to the validated value
        FHE.allowThis(validatedValue);
        FHE.allow(validatedValue, msg.sender);

        emit ProofValidated(msg.sender, block.timestamp, true);

        return proofId;
    }

    /// @notice Batch validate multiple input proofs
    /// @param encryptedValues Array of encrypted values
    /// @param proofs Array of zero-knowledge proofs
    /// @return proofIds Array of validation identifiers
    function validateMultipleProofs(
        externalEuint32[] calldata encryptedValues,
        bytes[] calldata proofs
    ) external returns (bytes32[] memory proofIds) {
        require(encryptedValues.length == proofs.length, "Array length mismatch");
        require(encryptedValues.length > 0, "Empty array");
        require(encryptedValues.length <= 10, "Too many proofs");

        proofIds = new bytes32[](encryptedValues.length);

        for (uint256 i = 0; i < encryptedValues.length; i++) {
            // Each FHE.fromExternal validates its proof
            euint32 validatedValue = FHE.fromExternal(encryptedValues[i], proofs[i]);

            bytes32 proofId = keccak256(
                abi.encodePacked(msg.sender, block.timestamp, i, encryptedValues[i])
            );

            _validationRecords[proofId] = ValidationRecord({
                validator: msg.sender,
                timestamp: block.timestamp,
                isValid: true
            });

            FHE.allowThis(validatedValue);
            FHE.allow(validatedValue, msg.sender);

            proofIds[i] = proofId;
        }

        _proofCount[msg.sender] += encryptedValues.length;
        _totalProofsValidated += encryptedValues.length;

        emit ProofValidated(msg.sender, block.timestamp, true);

        return proofIds;
    }

    /// @notice Get validation record for a proof
    /// @param proofId The proof identifier
    /// @return Record containing validator, timestamp, and validity
    function getValidationRecord(bytes32 proofId)
        external
        view
        returns (address validator, uint256 timestamp, bool isValid)
    {
        ValidationRecord storage record = _validationRecords[proofId];
        require(record.validator != address(0), "Proof record not found");

        return (record.validator, record.timestamp, record.isValid);
    }

    /// @notice Get proof validation count for a user
    /// @param user The user address
    /// @return Number of proofs validated by the user
    function getUserProofCount(address user) external view returns (uint256) {
        return _proofCount[user];
    }

    /// @notice Get total proofs validated on this contract
    /// @return Total number of proofs validated
    function getTotalProofsValidated() external view returns (uint256) {
        return _totalProofsValidated;
    }

    /// @notice Check if a proof is valid
    /// @param proofId The proof identifier
    /// @return true if proof is valid
    function isProofValid(bytes32 proofId) external view returns (bool) {
        return _validationRecords[proofId].isValid;
    }

    /// @notice Demonstrate proof binding verification
    /// @dev Shows that proofs are bound to [contract, user] pairs
    function verifyProofBinding(externalEuint32 encryptedValue, bytes calldata inputProof)
        external
        returns (bool)
    {
        // This demonstrates that:
        // 1. The proof is valid for this contract
        // 2. The proof is valid for msg.sender
        // 3. If the same proof is used with different user, it would fail

        try FHE.fromExternal(encryptedValue, inputProof) returns (euint32) {
            return true;
        } catch {
            return false;
        }
    }
}
