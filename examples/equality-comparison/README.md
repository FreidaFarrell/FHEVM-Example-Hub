# Equality Comparison Example

**Category**: Basic FHE Operations
**Difficulty**: Beginner
**Concept**: FHE Comparison Operations

## Overview

Demonstrates encrypted equality comparison using `FHE.eq()` - comparing encrypted values without decryption.

## Key Features

- **Equality Comparison**: Compare encrypted values using `FHE.eq()`
- **Multi-value Comparison**: Batch compare multiple encrypted values
- **Permission Management**: Proper permission handling for encrypted comparisons
- **Result Tracking**: Store and retrieve comparison results

## Setup

```bash
npm install
npm run compile
npm run test
```

## Contract Functions

- `setTargetValue()` - Set encrypted target value
- `compareEqual()` - Compare single encrypted value with target
- `compareMultiple()` - Compare array of encrypted values
- `getLastComparison()` - Retrieve last comparison result
- `getComparisonCount()` - Get user's comparison count

## Key Concepts

### FHE Equality Operation

```solidity
ebool result = FHE.eq(encryptedValue, targetValue);
```

Returns an encrypted boolean indicating equality without revealing either value.

### Comparison Workflow

1. Set encrypted target value
2. Submit encrypted value to compare
3. Receive encrypted boolean result
4. Decrypt result to learn comparison outcome

## Use Cases

- Privacy-preserving authentication
- Confidential identity verification
- Encrypted data matching
- Private equality checks

## Tests

Run comprehensive tests:
```bash
npm run test
```

Tests cover:
- Single value comparison
- Multiple value comparison
- Permission management
- Result tracking
- Edge cases

## References

- FHEVM Docs: https://docs.zama.ai/
- Solidity: https://docs.soliditylang.org/
