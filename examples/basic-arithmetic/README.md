# FHE Arithmetic Operations - Basic Example

**Category**: Basic
**Difficulty**: Beginner
**Chapter**: basic

## Overview

Demonstrates arithmetic and comparison operations on encrypted values without decryption.

## What You'll Learn

This example teaches:

1. **Arithmetic Operations**: Addition, subtraction, multiplication, division
2. **Comparison Operations**: Equality, less than, less than or equal
3. **Mixed Operations**: Combining multiple operations
4. **Plain Value Operations**: Operations between encrypted and plain values
5. **Operation Events**: Tracking operations with events
6. **State Management**: Storing operation results

## Key Concepts

### Encrypted Arithmetic

The contract demonstrates operations on encrypted values:
- **Addition**: `FHE.add(a, b)` - Add two encrypted values
- **Subtraction**: `FHE.sub(a, b)` - Subtract encrypted values
- **Multiplication**: `FHE.mul(a, b)` - Multiply encrypted values
- **Division**: `FHE.div(a, b)` - Divide encrypted values

### Encrypted Comparisons

Compare encrypted values without decryption:
- **Equal**: `FHE.eq(a, b)` - Check if values are equal
- **Less Than**: `FHE.lt(a, b)` - Check if a < b
- **Less or Equal**: `FHE.lte(a, b)` - Check if a <= b

### Power of FHE

The amazing capability of Fully Homomorphic Encryption:
- ✓ Perform math without decrypting
- ✓ Compare values privately
- ✓ Verify results without seeing inputs
- ✓ Maintain complete privacy

## Functions

### Arithmetic Functions

#### add(euint32 a, euint32 b)
```solidity
function add(euint32 a, euint32 b) external returns (euint32)
```
Adds two encrypted 32-bit unsigned integers. Result is stored and permissions updated.

#### subtract(euint32 a, euint32 b)
```solidity
function subtract(euint32 a, euint32 b) external returns (euint32)
```
Subtracts b from a (encrypted). Returns and stores result.

#### multiply(euint32 a, euint32 b)
```solidity
function multiply(euint32 a, euint32 b) external returns (euint32)
```
Multiplies two encrypted values. Useful for scaling operations.

#### divide(euint32 a, euint32 b)
```solidity
function divide(euint32 a, euint32 b) external returns (euint32)
```
Divides a by b (encrypted). Requires careful divisor handling.

### Comparison Functions

#### equal(euint32 a, euint32 b)
```solidity
function equal(euint32 a, euint32 b) external returns (uint256)
```
Checks if two encrypted values are equal. Returns encrypted boolean as uint.

#### lessThan(euint32 a, euint32 b)
```solidity
function lessThan(euint32 a, euint32 b) external returns (uint256)
```
Checks if a is less than b (encrypted comparison).

#### lessOrEqual(euint32 a, euint32 b)
```solidity
function lessOrEqual(euint32 a, euint32 b) external returns (uint256)
```
Checks if a is less than or equal to b.

### Mixed Operation

#### addPlain(euint32 encrypted, uint32 plainValue)
```solidity
function addPlain(euint32 encrypted, uint32 plainValue) external returns (euint32)
```
Adds encrypted and plaintext values. Demonstrates heterogeneous operations.

## Setup & Installation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to Sepolia
npm run deploy:sepolia
```

## Project Structure

```
basic-arithmetic/
├── contracts/
│   └── Arithmetic.sol         # Arithmetic operations contract
├── test/
│   └── Arithmetic.test.ts     # Comprehensive test suite
├── scripts/
│   └── deploy.ts              # Deployment script
├── hardhat.config.ts          # Configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # This file
```

## Contract Walkthrough

### State Variable

```solidity
euint32 private result;
```

Stores the result of the last operation, encrypted.

### Event

```solidity
event ArithmeticOperation(
    string operation,
    address indexed caller,
    uint256 timestamp
);
```

Emitted whenever an operation is performed, logging:
- The operation name (add, subtract, etc.)
- Who called it
- When it was called

### Add Function Example

```solidity
function add(euint32 a, euint32 b) external returns (euint32) {
    // Perform encrypted addition (no decryption!)
    result = FHE.add(a, b);

    // Update permissions
    FHE.allowThis(result);        // Contract can use
    FHE.allow(result, msg.sender); // Caller can decrypt

    // Log the operation
    emit ArithmeticOperation("add", msg.sender, block.timestamp);

    return result;
}
```

**Key Points**:
1. Both inputs are already encrypted
2. FHE.add works on ciphertexts
3. No intermediate decryption needed
4. Result is encrypted
5. Permissions set for access

## Testing Strategy

Tests cover:

### Basic Operations
- ✓ Addition of encrypted values
- ✓ Subtraction of encrypted values
- ✓ Multiplication of encrypted values
- ✓ Division of encrypted values

### Comparisons
- ✓ Equality checking
- ✓ Less than comparison
- ✓ Less or equal comparison

### Mixed Operations
- ✓ Encrypted + plaintext
- ✓ Operation sequences
- ✓ Complex calculations

### Edge Cases
- ✓ Zero values
- ✓ Large numbers
- ✓ Result reuse

### Events & Permissions
- ✓ Event emissions
- ✓ Caller tracking
- ✓ Permission management

## Real-World Applications

### Financial
- **Encrypted Account Balance**: Add/subtract without revealing balance
- **Private Transactions**: Calculate fees without exposing amounts
- **Confidential Auditing**: Verify calculations without seeing values

### Healthcare
- **Encrypted Metrics**: Compare vital signs privately
- **Confidential Analysis**: Calculate statistics on private data
- **Privacy-Preserving Verification**: Verify measurements

### Supply Chain
- **Encrypted Pricing**: Calculate discounts without revealing costs
- **Confidential Inventory**: Track quantities privately
- **Secure Auditing**: Verify operations without data exposure

## Key Learnings

After this example, understand:

1. **FHE Arithmetic**: All basic math operations work on ciphertexts
2. **No Decryption Required**: Calculate without revealing intermediate values
3. **Encrypted Comparisons**: Compare values while maintaining privacy
4. **Mixed Operations**: Combine encrypted and plaintext values
5. **State Management**: Store encrypted results securely

## Extending This Example

### Ideas for Enhancement

1. **More Operations**: Modulo, bitwise operations
2. **Complex Calculations**: Compound operations
3. **Multiple Results**: Track multiple operation results
4. **Operation History**: Log all operations
5. **Access Control**: Different permissions per user

### Advanced Concepts

1. **Range Proofs**: Prove value is in range without revealing it
2. **Conditional Operations**: If/else on encrypted values
3. **Loops**: Iterate operations on encrypted data
4. **Nested Operations**: Operations on operation results

## Common Issues & Solutions

### Issue: Type Mismatch
**Problem**: `euint32` vs `euint64` type mismatch
**Solution**: Ensure consistent types in operations

### Issue: Permission Denied
**Problem**: Cannot decrypt result
**Solution**: Verify `FHE.allow()` called with correct address

### Issue: Operation Failed
**Problem**: Division by zero or invalid operation
**Solution**: Add input validation before operations

## Resources

### Documentation
- [Zama FHEVM Docs](https://docs.zama.ai/)
- [Solidity Docs](https://docs.soliditylang.org/)
- [FHE Concepts](../../../FHEVM_CONCEPTS.md)

### Related Examples
- Basic Counter - Simple encrypted operations
- Comparisons - More comparison patterns
- Encryption - Data encryption techniques

## Summary

This example demonstrates:
- ✓ Arithmetic on encrypted values
- ✓ Comparisons without decryption
- ✓ Mixed encrypted/plaintext operations
- ✓ Event tracking
- ✓ Comprehensive testing

**Next**: Explore comparisons, encryption, and access control examples.

---

**Example Version**: 1.0
**Last Updated**: December 2025
**Status**: Production Ready
