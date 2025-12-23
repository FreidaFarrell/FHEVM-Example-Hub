# Public Decrypt Example

**Category**: Decryption Patterns
**Difficulty**: Intermediate
**Concept**: Public Decryption with Verification

## Overview

Demonstrates recording and verifying publicly decrypted values with statistical analysis.

## Key Features

- **Decryption Recording**: Register plaintext values on-chain
- **Public Verification**: Verify decrypted values meet conditions
- **Statistical Analysis**: Calculate stats on decrypted values
- **Threshold Checking**: Verify values meet thresholds
- **Min/Max Finding**: Identify extrema in datasets

## Setup

```bash
npm install
npm run compile
npm run test
```

## Contract Functions

- `storeProtectedValue()` - Store encrypted value
- `recordDecryptedValue()` - Register plaintext decryption
- `countAboveThreshold()` - Count values meeting threshold
- `calculateSum()` - Sum decrypted values
- `calculateAverage()` - Average of values
- `findMaximum()` - Find maximum value
- `findMinimum()` - Find minimum value

## Key Concepts

### Decryption Recording

```solidity
bytes32 decryptId = keccak256(abi.encodePacked(msg.sender, block.timestamp, decryptedValue));
```

Creates tamper-proof record of decryption.

### Verification Functions

```solidity
uint256 count = countAboveThreshold(values, threshold);
```

Publicly verify properties of decrypted data without privacy concerns.

## Use Cases

- Privacy-preserving voting tabulation
- Confidential auction result publication
- Encrypted vote counting
- Public statistics from encrypted data

## Tests

Run tests:
```bash
npm run test
```

Coverage includes:
- Value storage and recording
- Threshold verification
- Statistical calculations
- Edge case handling

## References

- FHEVM Docs: https://docs.zama.ai/
- Public Decryption Patterns
