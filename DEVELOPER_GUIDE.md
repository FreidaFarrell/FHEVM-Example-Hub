# Developer Implementation Guide

**Confidential Product Traceability System**
**Version**: 1.0
**Status**: Production Ready

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Setup](#project-setup)
3. [Smart Contract Development](#smart-contract-development)
4. [Frontend Development](#frontend-development)
5. [Testing & Debugging](#testing--debugging)
6. [Deployment Guide](#deployment-guide)
7. [Extending the System](#extending-the-system)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)

---

## Getting Started

### Prerequisites

**Required Knowledge**
- Basic Solidity programming
- Ethereum smart contract concepts
- JavaScript ES6+ and async/await
- HTML5/CSS3 basics
- MetaMask wallet usage

**Required Tools**
- Node.js (v14.0+)
- npm or yarn package manager
- A code editor (VS Code recommended)
- MetaMask browser extension
- Git for version control

### Quick Setup (5 minutes)

**Step 1: Clone Repository**
```bash
git clone https://github.com/FreidaFarrell/PrivacyTraceability
cd PrivacyTraceability
```

**Step 2: Install Dependencies**
```bash
npm install
```

**Step 3: Configure Environment**
```bash
# Create .env file
cp .env.example .env

# Add your Sepolia RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

**Step 4: Deploy Contract (Optional)**
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

**Step 5: Run Frontend**
```bash
# Open index.html in browser
# Or use local server
npx http-server
```

---

## Project Setup

### Directory Structure

```
PrivacyTraceability/
├── contracts/
│   ├── PrivacyTraceability.sol      # Main contract
│   └── PrivateTraceability.sol      # Alternative version
├── test/
│   ├── privacy.test.ts              # Test suite
│   └── integration.test.ts           # Integration tests
├── scripts/
│   └── deploy.js                    # Deployment script
├── docs/
│   ├── README.md                    # Quick reference
│   ├── FHEVM_CONCEPTS.md            # Concept guide
│   ├── HELLO_FHEVM_TUTORIAL.md      # Tutorial
│   └── QUICK_START.md               # Quick start
├── index.html                       # Web interface
├── app.js                           # Frontend logic
├── hardhat.config.ts                # Hardhat configuration
├── package.json                     # Dependencies
├── vercel.json                      # Vercel config
└── .env                             # Environment variables
```

### Dependency Installation

```bash
# Core dependencies
npm install --save ethers@^6.0.0
npm install --save @fhevm/solidity@^1.0.0

# Development dependencies
npm install --save-dev hardhat
npm install --save-dev @nomicfoundation/hardhat-toolbox
npm install --save-dev @nomiclabs/hardhat-etherscan
npm install --save-dev dotenv

# Optional: Testing
npm install --save-dev mocha chai
npm install --save-dev typescript ts-node
```

### Environment Configuration

**Create .env file**
```
# RPC Endpoints
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY

# Private Keys (NEVER commit to git)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_WITHOUT_0x_PREFIX

# Etherscan API (for verification)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY

# Contract Address (after deployment)
CONTRACT_ADDRESS=0xD2BF97b3D170fde0ef4c20249D31A88F9FA915AC
```

**Add to .gitignore**
```
.env
.env.local
node_modules/
dist/
build/
*.log
```

---

## Smart Contract Development

### Contract Structure

**File**: `contracts/PrivacyTraceability.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ============= IMPORTS =============
import { FHE, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";

// ============= MAIN CONTRACT =============
contract PrivacyTraceability {
    // ===== State Variables =====
    // Storage declarations

    // ===== Events =====
    // Event definitions

    // ===== Modifiers =====
    // Access control modifiers

    // ===== Constructor =====
    // Initialization

    // ===== Public Functions =====
    // External functions

    // ===== Internal Functions =====
    // Internal helper functions

    // ===== View Functions =====
    // Query functions (no state change)
}
```

### Compilation

**Using Hardhat**
```bash
# Compile all contracts
npx hardhat compile

# Compile with specified version
npx hardhat compile --solc-input-version 0.8.24

# Force recompilation
npx hardhat compile --force

# Show compile errors
npx hardhat compile --verbose
```

**Compilation Output**
```
artifacts/
├── contracts/
│   ├── PrivacyTraceability.sol/
│   │   └── PrivacyTraceability.json  # ABI and bytecode
│   └── ...
└── typechain-types/  # TypeScript types
```

### Adding New Functions

**Example: Add Permission Check Function**

```solidity
/// @notice Check if user is authorized for a function
/// @param _user Address to check
/// @return Boolean indicating authorization status
function isUserAuthorized(address _user)
    public
    view
    returns (bool)
{
    return authorizedManufacturers[_user] || _user == owner;
}
```

**Steps**:
1. Plan function logic
2. Write function with JSDoc comments
3. Add access control (modifiers)
4. Implement validation
5. Write tests
6. Update documentation

### Testing Smart Contracts

**Test File**: `test/privacy.test.ts`

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("PrivacyTraceability", function () {
    let contract;
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("PrivacyTraceability");
        contract = await Contract.deploy();
        await contract.deployed();
    });

    describe("Deployment", function () {
        it("Should set owner to deployer", async function () {
            expect(await contract.owner()).to.equal(owner.address);
        });
    });

    describe("Product Management", function () {
        it("Should add product successfully", async function () {
            const tx = await contract.addProduct(
                "PROD001",
                "Test Product",
                "Test Manufacturer",
                true
            );

            expect(tx).to.emit(contract, "ProductAdded");
        });

        it("Should prevent duplicate product", async function () {
            await contract.addProduct(
                "PROD001",
                "Test Product",
                "Test Manufacturer",
                true
            );

            await expect(
                contract.addProduct(
                    "PROD001",
                    "Another Product",
                    "Another Manufacturer",
                    true
                )
            ).to.be.revertedWith("Product already exists");
        });
    });

    describe("Authorization", function () {
        it("Should not allow unauthorized users", async function () {
            await expect(
                contract.connect(user1).addProduct(
                    "PROD002",
                    "Test",
                    "Manufacturer",
                    true
                )
            ).to.be.revertedWith("Not authorized");
        });

        it("Should authorize user", async function () {
            await contract.setManufacturerAuthorization(user1.address, true);

            const tx = await contract.connect(user1).addProduct(
                "PROD002",
                "Test",
                "Manufacturer",
                true
            );

            expect(tx).to.emit(contract, "ProductAdded");
        });
    });
});
```

**Run Tests**
```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/privacy.test.ts

# Show test coverage
npx hardhat coverage

# Watch mode (requires installation)
npx hardhat test --watch
```

---

## Frontend Development

### HTML Structure

**File**: `index.html`

**Main Sections**
```html
<!-- Header with navigation -->
<header>
    <h1>Product Traceability System</h1>
    <nav>
        <button id="connectBtn">Connect MetaMask</button>
        <div id="accountInfo"></div>
    </nav>
</header>

<!-- Status panel -->
<section id="statusPanel">
    <!-- Connection and authorization status -->
</section>

<!-- Main application panels -->
<main>
    <!-- Manufacturer panel -->
    <section id="manufacturerPanel">
        <!-- Product registration form -->
    </section>

    <!-- Query panel -->
    <section id="queryPanel">
        <!-- Product information query -->
    </section>

    <!-- Dashboard -->
    <section id="dashboard">
        <!-- System statistics -->
    </section>
</main>

<!-- Footer -->
<footer>
    <!-- Support and links -->
</footer>
```

### JavaScript Architecture

**File**: `app.js`

**Core State Management**
```javascript
const app = {
    // State
    provider: null,
    signer: null,
    contract: null,

    // Methods
    init: async function() { /* ... */ },
    connect: async function() { /* ... */ },
    addProduct: async function() { /* ... */ },
    queryProduct: async function() { /* ... */ },

    // UI Updates
    updateStatus: function() { /* ... */ },
    showError: function(msg) { /* ... */ },
    showSuccess: function(msg) { /* ... */ }
};
```

### Key Development Tasks

**1. Add New UI Component**

```javascript
// Step 1: Add HTML element
// <section id="newPanel"><!-- HTML --></section>

// Step 2: Add functionality
app.newFunction = async function() {
    const input = document.getElementById('inputId').value;

    try {
        const result = await app.contract.method(input);
        this.showSuccess('Success!');
        this.updateUI();
    } catch (error) {
        this.showError(error.message);
    }
};

// Step 3: Add event listener
document.getElementById('buttonId').addEventListener('click',
    () => app.newFunction()
);
```

**2. Add Contract Interaction**

```javascript
// Step 1: Create wrapper function
app.newContractFunction = async function(param1, param2) {
    try {
        // Validate inputs
        if (!param1) throw new Error("Invalid parameter");

        // Show loading state
        this.setLoading(true);

        // Call contract
        const tx = await this.contract.functionName(param1, param2);

        // Wait for confirmation
        const receipt = await tx.wait(1);

        // Update UI
        this.showSuccess("Transaction confirmed!");
        this.updateDashboard();

        return receipt;
    } catch (error) {
        this.showError(`Error: ${error.message}`);
        console.error(error);
    } finally {
        this.setLoading(false);
    }
};
```

**3. Add Error Handling**

```javascript
// Create error handler
app.handleError = function(error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
        this.showError("Insufficient funds for transaction");
    } else if (error.code === 'CALL_EXCEPTION') {
        this.showError("Transaction reverted: " + error.reason);
    } else if (error.message.includes('Not authorized')) {
        this.showError("You are not authorized for this action");
    } else {
        this.showError("Error: " + error.message);
    }
};
```

### CSS Styling

**Responsive Design Approach**

```css
/* Mobile-first approach */
/* Base styles for mobile */
.container {
    padding: 1rem;
    width: 100%;
}

.panel {
    margin-bottom: 2rem;
    padding: 1rem;
    border-radius: 8px;
}

/* Tablet */
@media (min-width: 768px) {
    .container {
        max-width: 750px;
    }

    .panels {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
    }

    .panels {
        grid-template-columns: 1fr 1fr 1fr;
    }
}
```

---

## Testing & Debugging

### Unit Testing

**Test Authorization Logic**
```typescript
describe("Authorization System", function () {
    it("Only owner can authorize", async function () {
        const [owner, user1, user2] = await ethers.getSigners();

        // Owner can authorize
        await contract.setManufacturerAuthorization(user1.address, true);
        expect(await contract.authorizedManufacturers(user1.address)).to.be.true;

        // User cannot authorize
        await expect(
            contract.connect(user1).setManufacturerAuthorization(user2.address, true)
        ).to.be.reverted;
    });
});
```

### Integration Testing

**Test Complete Workflow**
```typescript
describe("Complete Workflow", function () {
    it("Full supply chain flow", async function () {
        // 1. Deploy contract
        const contract = await deployContract();

        // 2. Authorize manufacturer
        await contract.setManufacturerAuthorization(mfg.address, true);

        // 3. Add product
        await contract.connect(mfg).addProduct(
            "P001", "Product", "Manufacturer", true
        );

        // 4. Verify product
        const result = await contract.productExists("P001");
        expect(result).to.be.true;

        // 5. Get product info
        const info = await contract.getProduct("P001");
        expect(info.productName).to.equal("Product");
    });
});
```

### Debugging Techniques

**1. Console Logging**
```javascript
// In frontend
console.log('Contract:', app.contract);
console.log('Current account:', app.currentAccount);
console.log('Transaction:', tx);

// In Solidity (using hardhat console)
import "hardhat/console.sol";

// In function
console.log("Product ID:", _productId);
console.log("Product exists:", products[_productId].exists);
```

**2. Hardhat Inspector**
```bash
# Enable inspector for contract execution
node --inspect-brk ./node_modules/.bin/hardhat test
```

**3. Event Inspection**
```javascript
// Listen to events
contract.on("ProductAdded", (productId, name, mfg, sender, timestamp) => {
    console.log("Product added:", { productId, name, mfg, sender, timestamp });
});

// Get past events
const events = await contract.queryFilter("ProductAdded");
events.forEach(event => {
    console.log("Event:", event.args);
});
```

**4. Transaction Simulation**
```bash
# Test transaction before sending
npx hardhat run scripts/simulate.ts --network sepolia

# Use tenderly for debugging
# https://dashboard.tenderly.co/
```

---

## Deployment Guide

### Local Testing

**Start Local Hardhat Network**
```bash
# Terminal 1: Start node
npx hardhat node

# Terminal 2: Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment (Sepolia)

**Step 1: Get Sepolia ETH**
```
1. Go to https://sepoliafaucet.com/
2. Enter your address
3. Receive test ETH
```

**Step 2: Deploy Contract**
```bash
# Set up environment
export SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
export PRIVATE_KEY=0xYOUR_KEY

# Deploy
npx hardhat run scripts/deploy.js --network sepolia
```

**Step 3: Verify Contract (Optional)**
```bash
# Get contract address from deployment output
export CONTRACT_ADDRESS=0x...

# Verify on Etherscan
npx hardhat verify \
    $CONTRACT_ADDRESS \
    --network sepolia \
    --constructor-args scripts/arguments.ts
```

### Frontend Deployment (Vercel)

**Step 1: Prepare Files**
```bash
# Ensure all files are ready
ls -la index.html app.js vercel.json
```

**Step 2: Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Step 3: Connect to Vercel**
```bash
# Via https://vercel.com
# 1. Import GitHub repository
# 2. Select project
# 3. Deploy
# 4. Get live URL
```

### Mainnet Deployment (When Ready)

**Considerations**
1. Extensive testing on testnet
2. Security audit recommended
3. Graduated rollout strategy
4. Monitoring and alerting

**Process**
```bash
# Step 1: Final testing
npx hardhat test --network sepolia

# Step 2: Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Step 3: Verify
npx hardhat verify CONTRACT_ADDRESS --network mainnet

# Step 4: Monitor
# Watch transactions on Etherscan
# Monitor for errors and issues
```

---

## Extending the System

### Adding New Features

**Example: Batch Management**

```solidity
// 1. Add new struct
struct Batch {
    uint256 batchId;
    address createdBy;
    uint256 createdAt;
    string[] productIds;
    bool isSealed;
}

// 2. Add storage
mapping(uint256 => Batch) private batches;
uint256 private nextBatchId = 1;

// 3. Add function
function createBatch(string[] memory _productIds)
    external
    onlyAuthorized
    returns (uint256)
{
    uint256 batchId = nextBatchId++;
    batches[batchId] = Batch({
        batchId: batchId,
        createdBy: msg.sender,
        createdAt: block.timestamp,
        productIds: _productIds,
        isSealed: false
    });

    emit BatchCreated(batchId, msg.sender);
    return batchId;
}

// 4. Add event
event BatchCreated(uint256 indexed batchId, address indexed creator);
```

### Upgrading Contracts

**Using Proxy Pattern (Advanced)**

```solidity
// Step 1: Create new implementation
contract PrivacyTraceabilityV2 is PrivacyTraceability {
    // New functions and updated functions
}

// Step 2: Update proxy
// (Requires proxy contract setup)

// Step 3: Test extensively
```

### Custom Extensions

**Example: Add Encryption for More Fields**

```solidity
// 1. Import additional types
import { euint32, euint64 } from "@fhevm/solidity/lib/FHE.sol";

// 2. Add encrypted fields
struct AdvancedProduct {
    string productId;
    ebool isAuthentic;
    euint32 encryptedCost;           // NEW
    euint64 encryptedProductionTime; // NEW
}

// 3. Update functions
function addAdvancedProduct(
    string memory _productId,
    bool _isAuthentic,
    uint32 _cost,
    uint64 _prodTime
) external onlyAuthorized {
    // Encrypt additional fields
    euint32 encryptedCost = FHE.asEuint32(_cost);
    euint64 encryptedTime = FHE.asEuint64(_prodTime);

    // Set permissions
    FHE.allowThis(encryptedCost);
    FHE.allow(encryptedCost, msg.sender);
    FHE.allowThis(encryptedTime);
    FHE.allow(encryptedTime, msg.sender);

    // Store
    advancedProducts[_productId] = AdvancedProduct({
        productId: _productId,
        isAuthentic: FHE.asEbool(_isAuthentic),
        encryptedCost: encryptedCost,
        encryptedProductionTime: encryptedTime
    });
}
```

---

## Best Practices

### Smart Contract Development

✅ **Do**
- Write clear, documented code
- Use events for off-chain indexing
- Implement role-based access control
- Validate all inputs
- Test extensively

❌ **Don't**
- Over-complicate logic
- Encrypt unnecessary data
- Forget permission management
- Hardcode addresses
- Skip testing

### Frontend Development

✅ **Do**
- Show loading states
- Handle errors gracefully
- Validate inputs before sending
- Provide clear feedback
- Use async/await properly

❌ **Don't**
- Block UI during transactions
- Show raw error messages
- Accept invalid inputs
- Ignore failed transactions
- Make unhandled async calls

### Security Practices

✅ **Do**
- Never commit private keys
- Use environment variables
- Implement access control
- Validate inputs at boundaries
- Test security scenarios

❌ **Don't**
- Store secrets in code
- Trust user input
- Skip authorization checks
- Send sensitive data in clear
- Deploy without testing

---

## Troubleshooting

### Common Issues

**Problem**: "Not authorized" error
```
Solution:
1. Check if your address is authorized
2. Call setManufacturerAuthorization()
3. Verify you're using correct account in MetaMask
```

**Problem**: Compilation errors
```
Solution:
1. Check Solidity version matches hardhat.config.ts
2. Verify all imports are correct
3. Clear artifacts: rm -rf artifacts/
4. Recompile: npx hardhat compile --force
```

**Problem**: High gas fees
```
Solution:
1. Minimize encrypted operations
2. Batch similar operations
3. Use testnet first
4. Optimize contract size
```

**Problem**: Transaction reverted
```
Solution:
1. Check error message
2. Verify authorization
3. Check contract pause status
4. Simulate transaction first
```

### Debug Checklist

- [ ] MetaMask connected to correct network?
- [ ] Have you got test ETH?
- [ ] Is contract deployed to current network?
- [ ] Are you authorized to call function?
- [ ] Is contract paused?
- [ ] Do you have sufficient gas?
- [ ] Are function parameters correct?

---

## Contributing

### Development Workflow

**Step 1: Fork Repository**
```bash
git clone https://github.com/YOUR_USERNAME/PrivacyTraceability.git
cd PrivacyTraceability
```

**Step 2: Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

**Step 3: Make Changes**
```bash
# Make your changes
# Write tests
# Update documentation
```

**Step 4: Test**
```bash
npm run test
npm run coverage
```

**Step 5: Commit**
```bash
git add .
git commit -m "feat: description of your feature"
git push origin feature/your-feature-name
```

**Step 6: Submit Pull Request**
- Describe changes
- Reference related issues
- Include test coverage

### Code Style

**Solidity**
- Use 4-space indentation
- Follow OpenZeppelin style guide
- Add NatSpec comments

**JavaScript**
- Use 4-space indentation
- Use ES6+ syntax
- Add JSDoc comments

### Documentation Updates

When adding features:
1. Update README if needed
2. Add comments in code
3. Update API reference
4. Add examples if applicable
5. Update tutorial if relevant

---

## Resources

### Official Documentation
- [Hardhat Documentation](https://hardhat.org)
- [Zama FHEVM Docs](https://docs.zama.ai)
- [Ethers.js Documentation](https://docs.ethers.org)
- [Solidity Docs](https://docs.soliditylang.org)

### Learning Resources
- [Solidity by Example](https://solidity-by-example.org)
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Ethereum Development Documentation](https://ethereum.org/en/developers)

### Tools
- [Remix IDE](https://remix.ethereum.org)
- [Etherscan](https://sepolia.etherscan.io) (Sepolia testnet)
- [MetaMask](https://metamask.io)
- [Hardhat Console](https://hardhat.org/hardhat-runner/docs/guides/hardhat-console)

---

## Support

For questions and support:
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and discuss
- **Email**: Contact repository maintainers
- **Community**: Join Zama Discord and forums

---

*Developer Guide v1.0 - Confidential Product Traceability System*
*Last Updated: December 2025*
