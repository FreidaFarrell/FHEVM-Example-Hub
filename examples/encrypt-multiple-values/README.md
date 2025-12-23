# Encrypt Multiple Values Example

**Category**: Encryption Patterns
**Difficulty**: Intermediate
**Concept**: Multi-value Encryption

## Overview

Demonstrates storing and managing multiple encrypted values in structured form.

## Key Features

- **Record Structure**: Group multiple encrypted values
- **Batch Operations**: Store multiple values atomically
- **Access Control**: Owner-only value retrieval
- **Value Updates**: Update individual values in records
- **Metadata Tracking**: Timestamps and ownership info

## Setup

```bash
npm install
npm run compile
npm run test
```

## Contract Functions

- `encryptMultipleValues()` - Store three encrypted values
- `getEncryptedValues()` - Retrieve all encrypted values
- `updateValue()` - Update single value in record
- `getRecordTimestamp()` - Get creation timestamp
- `getUserRecords()` - List user's records
- `getRecordCount()` - Count user's records

## Key Concepts

### Record Storage

```solidity
struct EncryptedRecord {
    euint32 value1;
    euint32 value2;
    euint32 value3;
    address owner;
    uint256 timestamp;
}
```

Groups related encrypted values for organized management.

### Multi-value Permission Handling

```solidity
FHE.allowThis(record.value1);
FHE.allowThis(record.value2);
FHE.allowThis(record.value3);
```

Each value requires individual permission grant.

## Use Cases

- Encrypted transaction records
- Confidential account balances
- Private credential storage
- Encrypted profile data

## Tests

Run tests:
```bash
npm run test
```

Coverage includes:
- Multi-value encryption
- Record retrieval
- Batch operations
- Value updates
- Authorization

## References

- FHEVM Docs: https://docs.zama.ai/
- Array Handling Patterns
