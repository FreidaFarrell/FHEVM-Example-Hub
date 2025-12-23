# Encrypt Single Value Example

**Category**: Encryption Patterns
**Difficulty**: Beginner
**Concept**: Single Value Encryption

## Overview

Demonstrates the fundamental pattern for receiving, validating, and storing a single encrypted value.

## Key Features

- **Input Proof Validation**: Validates zero-knowledge proofs
- **State Management**: Secure encrypted value storage
- **Permission Handling**: Proper FHE permission patterns
- **Owner Tracking**: Single owner per encrypted value
- **Value Updates**: Secure value replacement

## Setup

```bash
npm install
npm run compile
npm run test
```

## Contract Functions

- `encryptSecret()` - Store an encrypted secret
- `getEncryptedSecret()` - Retrieve encrypted value (owner only)
- `updateSecret()` - Update encrypted value (owner only)
- `isSecretEncrypted()` - Check if value is stored
- `getSecretOwner()` - Get value owner
- `getEncryptionTimestamp()` - Get encryption time

## Key Concepts

### Input Proof Pattern

```solidity
euint32 internalValue = FHE.fromExternal(externalValue, inputProof);
```

Converts external encrypted type to internal and validates the proof in one step.

### Permission Pattern

```solidity
FHE.allowThis(internalValue);      // Contract can use
FHE.allow(internalValue, msg.sender); // User can decrypt
```

Both permissions are required for proper functionality.

## Use Cases

- Secure password storage
- Confidential data vaults
- Private authentication values
- Encrypted secrets management

## Tests

Run tests:
```bash
npm run test
```

Coverage includes:
- Encryption and storage
- Owner verification
- Authorization checks
- Update operations
- Edge cases

## References

- FHEVM Docs: https://docs.zama.ai/
- Input Proof Pattern: See competition requirements
