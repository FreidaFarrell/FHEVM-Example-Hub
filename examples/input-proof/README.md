# Input Proof Example

**Category**: Security Patterns
**Difficulty**: Advanced
**Concept**: Zero-Knowledge Input Proofs

## Overview

Demonstrates zero-knowledge proof validation ensuring encrypted inputs are properly bound to contract and user.

## Key Features

- **Proof Validation**: Verify zero-knowledge proofs
- **Binding Verification**: Ensure [contract, user] binding
- **Batch Proofs**: Validate multiple proofs atomically
- **Tamper Detection**: Detect invalid or modified proofs
- **Audit Trail**: Track all proof validations

## Setup

```bash
npm install
npm run compile
npm run test
```

## Contract Functions

- `validateInputProof()` - Validate single proof
- `validateMultipleProofs()` - Validate proof batch
- `getValidationRecord()` - Retrieve validation details
- `getUserProofCount()` - Count user's validations
- `verifyProofBinding()` - Check proof is valid for user
- `isProofValid()` - Check proof validity status

## Key Concepts

### Proof Validation

```solidity
euint32 validatedValue = FHE.fromExternal(externalValue, inputProof);
```

Implicitly validates that:
1. Proof is mathematically valid
2. Value is bound to this contract
3. Value is bound to msg.sender
4. Value hasn't been tampered with

### Proof Binding

Proofs are bound to [contract address, user address] pairs. Using the same proof with:
- Different contract → fails
- Different user → fails
- Different value → fails

## Use Cases

- Secure input validation
- Proof-based authentication
- Tamper detection
- Zero-knowledge verification

## Tests

Run tests:
```bash
npm run test
```

Coverage includes:
- Single proof validation
- Batch proof validation
- Invalid proof rejection
- Binding verification
- Tamper detection

## References

- FHEVM Docs: https://docs.zama.ai/
- Zero-Knowledge Proofs
- Input Proof Security
