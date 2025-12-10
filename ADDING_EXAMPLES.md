# Guide: Adding New FHEVM Examples

**Complete guide for developers adding new examples to the FHEVM Example Hub**

---

## Overview

This guide explains how to create and add new FHEVM example projects to the hub using the automated scaffolding tools.

---

## Quick Start: Create New Example

### Method 1: Single Example (Recommended)

```bash
# Create a new example project
npx ts-node scripts/create-fhevm-example.ts my-example basic

# Navigate to the project
cd examples/my-example

# Install dependencies
npm install

# Start developing
npm run compile
npm run test
```

### Method 2: Create Full Category

```bash
# Create all examples in a category
npx ts-node scripts/create-fhevm-category.ts basic

# Or create all categories
npx ts-node scripts/create-fhevm-category.ts
```

### Method 3: Manual Setup

```bash
# 1. Create directory structure
mkdir -p examples/my-example/{contracts,test,scripts}

# 2. Copy template files from base-template/
cp base-template/* examples/my-example/

# 3. Add your Solidity contract
# 4. Create test file
# 5. Update package.json and README.md
```

---

## Project Structure Requirements

Each example project must have this structure:

```
examples/my-example/
├── contracts/
│   └── MyExample.sol          # Main contract with JSDoc
├── test/
│   └── MyExample.test.ts       # Test suite with JSDoc
├── scripts/
│   └── deploy.ts              # Deployment script
├── hardhat.config.ts          # Configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── README.md                  # Example documentation
├── .env.example               # Environment template
└── .gitignore                 # Git ignore rules
```

---

## Step-by-Step: Writing a New Example

### Step 1: Create Project Structure

```bash
# Using the automated tool
npx ts-node scripts/create-fhevm-example.ts my-counter basic
```

### Step 2: Write Your Contract

**File**: `contracts/MyCounter.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";

/**
 * @title MyCounter
 * @description A simple FHE-encrypted counter demonstrating basic operations
 * @chapter: basic
 */
contract MyCounter {
    euint32 private count;

    /**
     * @notice Increment the counter by an encrypted value
     * @param encryptedValue The encrypted increment value
     */
    function increment(uint32 encryptedValue) external {
        euint32 increment = FHE.asEuint32(encryptedValue);
        count = FHE.add(count, increment);

        FHE.allowThis(count);
        FHE.allow(count, msg.sender);
    }

    /**
     * @notice Get the current count (encrypted)
     * @return The encrypted counter value
     */
    function getCount() external view returns (euint32) {
        return count;
    }
}
```

**Key Elements**:
- JSDoc comments with @title, @description, @chapter
- FHE imports and usage
- Clear function documentation
- Proper permission management

### Step 3: Write Comprehensive Tests

**File**: `test/MyCounter.test.ts`

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * @title MyCounter Tests
 * @description Test suite for encrypted counter contract
 * @chapter: basic
 */
describe("MyCounter", function () {
    let contract: any;
    let owner: any;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        const MyCounter = await ethers.getContractFactory("MyCounter");
        contract = await MyCounter.deploy();
        await contract.deployed();
    });

    describe("Increment", function () {
        it("Should increment counter", async function () {
            const tx = await contract.increment(10);
            expect(tx).to.emit(contract, "Incremented");
        });

        it("Should handle multiple increments", async function () {
            await contract.increment(5);
            await contract.increment(3);
            // Verify through contract state
            expect(await contract.getCount()).to.not.be.undefined;
        });
    });

    describe("Error Handling", function () {
        it("Should handle invalid inputs", async function () {
            // Test boundary conditions
            await expect(contract.increment(0)).to.not.be.reverted;
        });
    });
});
```

**Test Requirements**:
- Test happy path
- Test error conditions
- Test edge cases
- Use clear test descriptions
- Include JSDoc comments

### Step 4: Create Deployment Script

**File**: `scripts/deploy.ts`

```typescript
import { ethers } from "hardhat";

/**
 * @title Deployment Script
 * @description Deploys MyCounter contract to specified network
 * @chapter: deployment
 */
async function main() {
    console.log("Deploying MyCounter...");

    const MyCounter = await ethers.getContractFactory("MyCounter");
    const contract = await MyCounter.deploy();
    await contract.deployed();

    console.log("MyCounter deployed to:", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

### Step 5: Update Documentation

**File**: `README.md`

```markdown
# My Counter

A simple encrypted counter demonstrating FHEVM basic operations.

## Concepts Covered

- Encrypted integer types (euint32)
- Addition on encrypted values (FHE.add)
- Permission management (FHE.allow)
- State management with encrypted data

## Setup

\`\`\`bash
npm install
npm run compile
npm run test
\`\`\`

## Key Functions

- `increment(uint32)` - Increment counter by encrypted value
- `getCount()` - Get encrypted counter value

## Testing

\`\`\`bash
npm run test
npm run test:coverage
\`\`\`

## Deployment

\`\`\`bash
npm run deploy:sepolia
\`\`\`

## Learning Outcomes

After studying this example, you'll understand:
1. How to define encrypted data types
2. Performing operations on encrypted values
3. Managing permissions for encrypted data
4. Testing encrypted smart contracts
```

---

## Documentation Standards

### Code Comments

Every function must have JSDoc-style documentation:

```solidity
/**
 * @notice Short description of what the function does
 * @dev Technical implementation details
 * @param paramName Description of parameter
 * @return Description of return value
 */
function myFunction(uint256 paramName) external returns (bool) {
    // Implementation
}
```

### Annotations

Include these JSDoc annotations:

```
@title - Contract/file title
@description - Detailed description
@chapter - Category (basic, encryption, access-control, advanced)
@notice - User-facing description
@dev - Developer notes
@param - Parameter documentation
@return - Return value documentation
```

### Example Categories

- **basic**: Counter, arithmetic, comparison
- **encryption**: Single/multi value encryption
- **access-control**: Permissions, authorization
- **advanced**: Auctions, voting, complex patterns

---

## Testing Standards

### Minimum Test Coverage

Each example must include tests for:

1. **Happy Path**
   - Normal operation
   - Expected outcomes
   - State changes

2. **Error Conditions**
   - Invalid inputs
   - Unauthorized access
   - State violations

3. **Edge Cases**
   - Boundary values
   - Overflow/underflow
   - Special conditions

### Test Structure

```typescript
describe("ContractName", function () {
    // Setup
    beforeEach(async function () { });

    // Feature tests
    describe("Feature", function () {
        it("should do something", async function () { });
    });

    // Error tests
    describe("Error Handling", function () {
        it("should reject invalid input", async function () { });
    });
});
```

---

## Auto-Generating Documentation

### Generate Category Documentation

```bash
# Generate docs for all examples
npx ts-node scripts/generate-docs.ts examples

# Generate README for a single example
npx ts-node scripts/generate-docs.ts single my-counter
```

### What Gets Generated

1. **EXAMPLES_DOCS.md** - Master documentation
2. **Category READMEs** - Category overviews
3. **Individual READMEs** - Example-specific docs

### Customizing Generation

Edit `scripts/generate-docs.ts` to customize:
- Documentation format
- Included sections
- Organization structure
- Output locations

---

## Publishing Your Example

### Checklist Before Publishing

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Test coverage > 80%
- [ ] JSDoc comments complete
- [ ] README written
- [ ] .env.example configured
- [ ] No hardcoded values
- [ ] Deployment script tested
- [ ] Sepolia testnet verified
- [ ] Security audit complete

### Steps to Publish

1. **Local Testing**
   ```bash
   npm run compile
   npm run test
   npm run test:coverage
   ```

2. **Testnet Deployment**
   ```bash
   npm run deploy:sepolia
   ```

3. **Verify Contract** (Optional)
   ```bash
   npx hardhat verify CONTRACT_ADDRESS --network sepolia
   ```

4. **Document Results**
   - Add deployment address to README
   - Document gas usage
   - Note any issues/learnings

5. **Submit Example**
   - Push to repository
   - Create pull request
   - Include description and testing results

---

## Extending Existing Examples

### Adding Features to an Example

1. **Update Contract**
   - Add new functions
   - Update JSDoc comments
   - Maintain backward compatibility

2. **Add Tests**
   - Test new functionality
   - Test interactions
   - Ensure coverage stays > 80%

3. **Update Documentation**
   - Document new features
   - Add usage examples
   - Update README

4. **Test Thoroughly**
   ```bash
   npm run test
   npm run test:coverage
   npm run deploy:sepolia
   ```

---

## Troubleshooting

### Compilation Errors

**Problem**: `Error: Solidity version mismatch`
**Solution**: Update hardhat.config.ts solidity version to match

**Problem**: `Cannot find module @fhevm/solidity`
**Solution**: Run `npm install @fhevm/solidity`

### Test Failures

**Problem**: `FHE operations not supported in tests`
**Solution**: Use Hardhat's FHE mock library or skip encryption in tests

**Problem**: `Gas estimation failed`
**Solution**: Increase gas limit in test configuration

### Deployment Issues

**Problem**: `Insufficient funds`
**Solution**: Request Sepolia ETH from faucet

**Problem**: `Contract address already exists`
**Solution**: Use different address or deploy to different network

---

## Best Practices

### Code Quality

✅ **DO**
- Write clear, readable code
- Use meaningful variable names
- Add comprehensive comments
- Follow Solidity style guide
- Test edge cases

❌ **DON'T**
- Hardcode sensitive values
- Skip error handling
- Use unsafe math operations
- Implement unnecessary features
- Over-complicate logic

### Security

✅ **DO**
- Validate all inputs
- Check permissions/authorization
- Use safe arithmetic (with FHE operations)
- Follow FHEVM best practices
- Test security scenarios

❌ **DON'T**
- Trust user inputs
- Skip access control
- Ignore overflow/underflow
- Use deprecated functions
- Deploy without auditing

### Documentation

✅ **DO**
- Document all functions
- Explain complex logic
- Include usage examples
- Provide learning path
- Keep documentation current

❌ **DON'T**
- Use unclear names
- Skip comments on complex code
- Mix multiple concepts
- Assume knowledge
- Let docs get outdated

---

## Examples Repository Structure

```
├── examples/
│   ├── basic/
│   │   ├── counter/
│   │   ├── arithmetic/
│   │   └── comparison/
│   ├── encryption/
│   │   ├── single-encrypt/
│   │   ├── multi-encrypt/
│   │   ├── user-decrypt/
│   │   └── public-decrypt/
│   ├── access-control/
│   │   ├── role-based/
│   │   ├── allow-transient/
│   │   └── input-proof/
│   └── advanced/
│       ├── blind-auction/
│       ├── voting/
│       └── privacy-pool/
├── scripts/
│   ├── create-fhevm-example.ts
│   ├── create-fhevm-category.ts
│   └── generate-docs.ts
└── base-template/
    ├── hardhat.config.ts
    ├── package.json
    └── README.md
```

---

## Support & Community

### Getting Help

- **Zama Discord**: https://discord.com/invite/zama
- **Zama Forum**: https://forum.zama.ai/
- **GitHub Issues**: Report problems and ask questions

### Contributing

- Submit examples via pull request
- Follow guidelines in this document
- Include tests and documentation
- Be open to feedback and improvements

---

## Version Updates

### Updating FHEVM Version

When FHEVM library updates:

1. Update `base-template/package.json`
2. Update all example `package.json` files
3. Test all examples compile and run
4. Update documentation if needed
5. Announce breaking changes

### Maintaining Examples

Regular maintenance tasks:

- [ ] Test with latest FHEVM version
- [ ] Update dependencies
- [ ] Review and improve examples
- [ ] Fix reported issues
- [ ] Add new examples

---

## Next Steps

1. **Choose a concept** to demonstrate
2. **Create project structure** using tools
3. **Write contract code** with FHE operations
4. **Create comprehensive tests**
5. **Document thoroughly**
6. **Deploy and verify**
7. **Submit to hub**

---

*Guide for Adding FHEVM Examples - Version 1.0*
*Updated: December 2025*
