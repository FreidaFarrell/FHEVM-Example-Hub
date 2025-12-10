# FHE Counter - Basic Example

**Category**: Basic
**Difficulty**: Beginner
**Chapter**: basic

## Overview

A simple encrypted counter contract demonstrating fundamental FHEVM concepts and operations on encrypted values.

## What You'll Learn

This example teaches:

1. **Encrypted Integer Types**: Working with `euint32` encrypted values
2. **Arithmetic Operations**: Addition and subtraction on encrypted data
3. **Permission Management**: Using `FHE.allow()` and `FHE.allowThis()`
4. **State Management**: Storing encrypted data in contract state
5. **Event Emission**: Logging operations with events
6. **Testing**: Writing comprehensive tests for encrypted contracts

## Key Concepts

### Encrypted Counter

The contract stores a counter as encrypted data (`euint32`), meaning:
- The counter value is encrypted on the blockchain
- Only authorized parties can decrypt and see the value
- Arithmetic operations can be performed on the encrypted value
- No one can modify the counter without authorization

### Functions

#### getCount()
```solidity
function getCount() external view returns (euint32)
```
Returns the encrypted counter value. The actual numeric value remains encrypted.

#### increment(uint32 amount, bytes calldata proof)
```solidity
function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external
```
Increments the counter by the encrypted amount:
- Input is encrypted externally
- Verified using input proof
- Operation performed on encrypted values
- Permission updated for caller

#### decrement(uint32 amount, bytes calldata proof)
```solidity
function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external
```
Decrements the counter by the encrypted amount using same pattern as increment.

#### reset()
```solidity
function reset() external
```
Resets counter to zero and updates permissions.

## Setup & Installation

### Prerequisites
- Node.js v16+ and npm
- Basic Solidity knowledge
- Understanding of FHE concepts (see tutorial)

### Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Check test coverage
npm run test:coverage

# Deploy to Sepolia testnet
npm run deploy:sepolia
```

## Project Structure

```
├── contracts/
│   └── Counter.sol         # Main contract
├── test/
│   └── Counter.test.ts     # Test suite
├── scripts/
│   └── deploy.ts           # Deployment script
├── hardhat.config.ts       # Hardhat configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── README.md              # This file
```

## Contract Walkthrough

### 1. Imports

```solidity
import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
```

- `FHE`: Library providing encrypted operations
- `euint32`: 32-bit encrypted unsigned integer type
- `ZamaEthereumConfig`: Configuration for Sepolia network

### 2. State Variable

```solidity
euint32 private _count;
```

Stores the encrypted counter. Privacy is maintained because:
- Value is encrypted
- Only contract and authorized users can decrypt
- Operations don't require decryption

### 3. Constructor

```solidity
constructor() {
    _count = FHE.asEuint32(0);
    FHE.allowThis(_count);
}
```

- Initializes counter to encrypted zero
- `FHE.allowThis()` permits contract to use the value

### 4. Increment Function

```solidity
function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);
    _count = FHE.add(_count, encryptedValue);
    FHE.allowThis(_count);
    FHE.allow(_count, msg.sender);
    emit CounterIncremented(msg.sender, block.timestamp);
}
```

**Steps:**
1. Convert external encrypted input to contract encrypted type
2. Add encrypted values (no decryption needed!)
3. Update permissions for contract
4. Grant permission to caller
5. Emit event for indexing

## Testing Strategy

Tests cover multiple scenarios:

### Basic Functionality
- ✓ Deployment succeeds
- ✓ Counter initializes
- ✓ Can increment counter
- ✓ Can decrement counter
- ✓ Can reset counter

### Multiple Operations
- ✓ Multiple increments work
- ✓ Multiple decrements work
- ✓ Mixed operations work
- ✓ State persists correctly

### Advanced Scenarios
- ✓ Large values handled
- ✓ Zero operations work
- ✓ Events emitted correctly
- ✓ Permissions respected
- ✓ Different users can operate

### Test Coverage

Run test coverage:
```bash
npm run test:coverage
```

Target: >80% coverage

## Deployment

### Sepolia Testnet

1. **Set up environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

2. **Get test ETH**
   - Visit: https://sepoliafaucet.com/
   - Enter your address
   - Receive test ETH

3. **Deploy contract**
```bash
npm run deploy:sepolia
```

4. **Verify deployment**
   - Check transaction on Etherscan (Sepolia)
   - Note contract address
   - Test with web3 tools

## Key Learnings

After completing this example, understand:

1. **Encrypted Data Types**: `euint32`, `euint64`, `ebool` basics
2. **FHE Operations**: Addition, subtraction, other operations
3. **Permission System**: `FHE.allow()`, `FHE.allowThis()`
4. **Smart Contract Patterns**: State management, events
5. **Testing**: Encrypted contract testing best practices

## Next Steps

### Extending This Example

1. **Add multiplication**: Extend with multiplication operations
2. **Add comparisons**: Implement greater/less than operations
3. **Add access control**: Implement role-based operations
4. **Add multiple counters**: Track multiple encrypted values

### Advanced Concepts

1. Study the next example: Arithmetic operations
2. Learn about: Multi-value encryption
3. Explore: Access control patterns
4. Implement: Public decryption

## Common Issues & Solutions

### Compilation Errors

**Problem**: `Cannot find module '@fhevm/solidity'`
**Solution**: Run `npm install @fhevm/solidity`

**Problem**: `Solidity version mismatch`
**Solution**: Check hardhat.config.ts version matches pragma

### Test Failures

**Problem**: `FHE operations not supported`
**Solution**: Use latest hardhat FHEVM plugin

**Problem**: `Permission denied`
**Solution**: Ensure `FHE.allowThis()` and `FHE.allow()` called

### Deployment Issues

**Problem**: `Insufficient funds`
**Solution**: Get more Sepolia ETH from faucet

**Problem**: `Network error`
**Solution**: Verify RPC URL in .env file

## Resources

### Official Documentation
- [Zama FHEVM Docs](https://docs.zama.ai/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Guide](https://hardhat.org/)

### Related Examples
- Arithmetic Operations - Adding more FHE operations
- Comparison - Using FHE comparisons
- Access Control - Permission management

### Community
- [Zama Discord](https://discord.com/invite/zama)
- [Zama Forum](https://forum.zama.ai/)
- [GitHub Issues](https://github.com/zama-ai)

## Troubleshooting

### Build Issues

```bash
# Clean and rebuild
npm run clean
npm install
npm run compile
```

### Test Issues

```bash
# Run with verbose output
npm run test -- --verbose

# Run specific test
npm run test -- --grep "increment"
```

### Deployment Issues

```bash
# Test locally first
npm run deploy

# Check configuration
cat hardhat.config.ts

# Verify environment
cat .env
```

## Summary

This example demonstrates:
- ✓ Encrypted state management
- ✓ Operations on encrypted values
- ✓ Permission management
- ✓ Smart contract patterns
- ✓ Comprehensive testing

**Congratulations!** You've learned the basics of FHEVM development. Proceed to the next example to deepen your understanding.

---

**Example Version**: 1.0
**Last Updated**: December 2025
**Status**: Production Ready
