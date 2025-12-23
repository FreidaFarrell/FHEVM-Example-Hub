# User Decrypt Example

**Category**: Decryption Patterns
**Difficulty**: Intermediate
**Concept**: User-Initiated Decryption

## Overview

Demonstrates permission-based decryption where users control access to their encrypted data.

## Key Features

- **Permission Granularity**: Grant/revoke individual decryption rights
- **Batch Storage**: Store multiple encrypted items per user
- **Access Control**: Owner controls who can decrypt
- **Enable/Disable**: Toggle decryption on entire datasets
- **Audit Trail**: Track decryption timestamps

## Setup

```bash
npm install
npm run compile
npm run test
```

## Contract Functions

- `storeEncryptedData()` - Store encrypted data with permissions
- `getEncryptedData()` - Retrieve encrypted data
- `grantDecryptionPermission()` - Allow specific user to decrypt
- `revokeAllDecryptionPermissions()` - Disable all decryption
- `enableDecryption()` - Re-enable decryption
- `batchStoreEncryptedData()` - Store multiple items at once

## Key Concepts

### Permission Management

```solidity
FHE.allow(_value, user);  // Grant decrypt permission
```

Users can have decryption permissions revoked at will by the owner.

### Decryption Toggle

```solidity
_dataStore[dataId].canDecrypt = false;  // Disable all decryption
```

Prevents any decryption without explicit per-item permissions.

## Use Cases

- Confidential medical records
- Private financial statements
- Encrypted communications
- Controlled data sharing

## Tests

Run tests:
```bash
npm run test
```

Coverage includes:
- Data storage and retrieval
- Permission granularity
- Batch operations
- Access control
- Revocation patterns

## References

- FHEVM Docs: https://docs.zama.ai/
- Permission Patterns
