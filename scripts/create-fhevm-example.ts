#!/usr/bin/env node

/**
 * @title FHEVM Example Generator
 * @description Automated script for creating new FHEVM example projects
 * @chapter: scaffold
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface ExampleConfig {
  name: string;
  description: string;
  category: 'basic' | 'encryption' | 'access-control' | 'advanced';
  contractName: string;
  testFile: string;
}

/**
 * Creates a new FHEVM example project with scaffolding
 * @param config - Example configuration
 * @param outputDir - Output directory for the example
 */
function createFHEVMExample(config: ExampleConfig, outputDir: string): void {
  console.log(`Creating FHEVM example: ${config.name}`);

  const projectDir = path.join(outputDir, config.name);

  // Create directory structure
  const directories = [
    'contracts',
    'test',
    'scripts',
    'artifacts',
  ];

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create project directory
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  // Create subdirectories
  directories.forEach(dir => {
    const dirPath = path.join(projectDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Copy base template files
  const templateDir = path.join(__dirname, '..', 'base-template');

  // Copy hardhat.config.ts
  if (fs.existsSync(path.join(templateDir, 'hardhat.config.ts'))) {
    fs.copyFileSync(
      path.join(templateDir, 'hardhat.config.ts'),
      path.join(projectDir, 'hardhat.config.ts')
    );
  }

  // Copy package.json
  if (fs.existsSync(path.join(templateDir, 'package.json'))) {
    fs.copyFileSync(
      path.join(templateDir, 'package.json'),
      path.join(projectDir, 'package.json')
    );
  }

  // Create .env.example
  const envExample = `SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
`;
  fs.writeFileSync(path.join(projectDir, '.env.example'), envExample);

  // Create .gitignore
  const gitignore = `node_modules/
dist/
build/
artifacts/
cache/
.env
.env.local
*.log
`;
  fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore);

  // Create README.md
  const readme = `# ${config.name}

**Category**: ${config.category}
**Description**: ${config.description}

## Setup

\`\`\`bash
npm install
npm run compile
npm run test
\`\`\`

## Example

This example demonstrates:
- ${config.description}

## Key Concepts

- FHEVM encryption
- Smart contract functions
- Test-driven development

## Files

- \`contracts/${config.contractName}.sol\` - Main contract
- \`test/${config.contractName}.test.ts\` - Test suite

## Next Steps

1. Review the contract implementation
2. Run tests to verify functionality
3. Deploy to Sepolia testnet
4. Extend with your own features

## References

- Zama FHEVM Documentation: https://docs.zama.ai/
- Solidity Docs: https://docs.soliditylang.org/
`;
  fs.writeFileSync(path.join(projectDir, 'README.md'), readme);

  // Create tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      lib: ['ES2020'],
      outDir: './dist',
      rootDir: './',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ['scripts/**/*.ts', 'test/**/*.ts'],
    exclude: ['node_modules'],
  };
  fs.writeFileSync(
    path.join(projectDir, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2)
  );

  console.log(`✓ Project created at: ${projectDir}`);
  console.log(`\nNext steps:`);
  console.log(`1. cd ${config.name}`);
  console.log(`2. npm install`);
  console.log(`3. npm run test`);
}

/**
 * Main execution
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx ts-node create-fhevm-example.ts <example-name> [category]');
    console.error('Categories: basic, encryption, access-control, advanced');
    process.exit(1);
  }

  const exampleName = args[0];
  const category = (args[1] || 'basic') as ExampleConfig['category'];
  const outputDir = path.join(__dirname, '..', 'examples');

  const config: ExampleConfig = {
    name: exampleName,
    description: `FHEVM example demonstrating ${category} concepts`,
    category,
    contractName: exampleName.charAt(0).toUpperCase() + exampleName.slice(1),
    testFile: `${exampleName}.test.ts`,
  };

  createFHEVMExample(config, outputDir);
}

main();
