# FHEVM Example Template

Base template for Hardhat-based FHEVM example projects.

## Project Structure

```
├── contracts/          # Solidity contracts
├── test/              # Test files
├── scripts/           # Deployment scripts
├── artifacts/         # Compiled artifacts
├── hardhat.config.ts  # Hardhat configuration
└── package.json       # Project dependencies
```

## Setup

```bash
npm install
npm run compile
npm run test
npm run deploy:sepolia
```

## Features

- Fully Homomorphic Encryption (FHEVM) integration
- Hardhat development environment
- TypeScript support
- Comprehensive test framework
- Deployment scripts for Sepolia testnet

## Documentation

This template includes:
- Clean contract structure
- Example tests
- Deployment automation
- Development guidelines

## Next Steps

1. Add your FHEVM contracts to `contracts/`
2. Write tests in `test/`
3. Configure network settings in `.env`
4. Deploy to Sepolia with `npm run deploy:sepolia`

## Support

For FHEVM documentation, visit: https://docs.zama.ai/
