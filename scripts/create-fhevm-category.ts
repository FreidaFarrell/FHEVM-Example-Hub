#!/usr/bin/env node

/**
 * @title FHEVM Category Generator
 * @description Creates category-based FHEVM example projects
 * @chapter: scaffold
 */

import fs from 'fs';
import path from 'path';

interface CategoryConfig {
  name: string;
  description: string;
  examples: {
    name: string;
    description: string;
  }[];
}

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  'basic': {
    name: 'Basic Examples',
    description: 'Foundational FHEVM concepts and operations',
    examples: [
      { name: 'counter', description: 'Simple FHE counter contract' },
      { name: 'arithmetic', description: 'Arithmetic operations on encrypted values' },
      { name: 'comparison', description: 'Comparison operations on encrypted data' },
    ],
  },
  'encryption': {
    name: 'Encryption Examples',
    description: 'Data encryption and decryption patterns',
    examples: [
      { name: 'single-encrypt', description: 'Encrypt single values' },
      { name: 'multi-encrypt', description: 'Encrypt multiple values' },
      { name: 'user-decrypt', description: 'User-initiated decryption' },
      { name: 'public-decrypt', description: 'Public decryption with verification' },
    ],
  },
  'access-control': {
    name: 'Access Control Examples',
    description: 'Permission management and authorization patterns',
    examples: [
      { name: 'role-based', description: 'Role-based access control' },
      { name: 'allow-transient', description: 'Transient permission model' },
      { name: 'input-proof', description: 'Input proof verification' },
    ],
  },
  'advanced': {
    name: 'Advanced Examples',
    description: 'Complex patterns and real-world applications',
    examples: [
      { name: 'blind-auction', description: 'Privacy-preserving auction system' },
      { name: 'confidential-voting', description: 'Secure voting mechanism' },
      { name: 'privacy-pool', description: 'Confidential fund pooling' },
    ],
  },
};

/**
 * Creates a category with multiple example projects
 * @param categoryName - Name of the category
 * @param outputDir - Base output directory
 */
function createCategory(categoryName: string, outputDir: string): void {
  const categoryConfig = CATEGORY_CONFIGS[categoryName];

  if (!categoryConfig) {
    console.error(`Unknown category: ${categoryName}`);
    console.error(`Available categories: ${Object.keys(CATEGORY_CONFIGS).join(', ')}`);
    process.exit(1);
  }

  console.log(`Creating category: ${categoryConfig.name}`);

  const categoryDir = path.join(outputDir, categoryName);

  // Create category directory
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  // Create README for category
  const categoryReadme = generateCategoryReadme(categoryConfig);
  fs.writeFileSync(path.join(categoryDir, 'README.md'), categoryReadme);

  // Create example subdirectories
  categoryConfig.examples.forEach(example => {
    const exampleDir = path.join(categoryDir, example.name);
    createExampleStructure(exampleDir, example.name, example.description);
  });

  console.log(`✓ Category created at: ${categoryDir}`);
  console.log(`✓ Created ${categoryConfig.examples.length} example projects`);
}

/**
 * Creates structure for a single example project
 * @param exampleDir - Example directory path
 * @param exampleName - Example name
 * @param description - Example description
 */
function createExampleStructure(
  exampleDir: string,
  exampleName: string,
  description: string
): void {
  // Create directories
  ['contracts', 'test', 'scripts'].forEach(dir => {
    const dirPath = path.join(exampleDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Create package.json
  const packageJson = {
    name: `fhevm-example-${exampleName}`,
    version: '1.0.0',
    description: description,
    scripts: {
      compile: 'hardhat compile',
      test: 'hardhat test',
      deploy: 'hardhat run scripts/deploy.ts',
      'deploy:sepolia': 'hardhat run scripts/deploy.ts --network sepolia',
    },
    dependencies: {
      '@fhevm/solidity': '^1.0.0',
      'ethers': '^6.8.0',
    },
    devDependencies: {
      '@nomicfoundation/hardhat-toolbox': '^3.0.0',
      'hardhat': '^2.17.0',
      'typescript': '^5.2.0',
    },
  };
  fs.writeFileSync(
    path.join(exampleDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create .env.example
  const envExample = `SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
`;
  fs.writeFileSync(path.join(exampleDir, '.env.example'), envExample);

  // Create README
  const exampleReadme = `# ${exampleName.charAt(0).toUpperCase() + exampleName.slice(1).replace(/-/g, ' ')}

${description}

## Setup

\`\`\`bash
npm install
npm run compile
npm run test
\`\`\`

## Key Concepts

This example demonstrates:
- FHEVM encryption
- Smart contract patterns
- Test-driven development

## Deployment

\`\`\`bash
npm run deploy:sepolia
\`\`\`

## Documentation

See parent directory README for category overview.
`;
  fs.writeFileSync(path.join(exampleDir, 'README.md'), exampleReadme);
}

/**
 * Generates README for a category
 * @param config - Category configuration
 * @returns Markdown content
 */
function generateCategoryReadme(config: CategoryConfig): string {
  let markdown = `# ${config.name}\n\n`;
  markdown += `${config.description}\n\n`;
  markdown += `## Examples\n\n`;

  config.examples.forEach(example => {
    markdown += `### ${example.name}\n`;
    markdown += `${example.description}\n\n`;
    markdown += `\`\`\`bash\n`;
    markdown += `cd ${example.name}\n`;
    markdown += `npm install\n`;
    markdown += `npm run test\n`;
    markdown += `\`\`\`\n\n`;
  });

  markdown += `## Resources\n\n`;
  markdown += `- [Zama FHEVM Docs](https://docs.zama.ai/)\n`;
  markdown += `- [Solidity Docs](https://docs.soliditylang.org/)\n`;

  return markdown;
}

/**
 * Creates all categories
 * @param outputDir - Base output directory
 */
function createAllCategories(outputDir: string): void {
  console.log('Creating all FHEVM example categories...');

  Object.keys(CATEGORY_CONFIGS).forEach(categoryName => {
    createCategory(categoryName, outputDir);
  });

  console.log('\n✓ All categories created successfully!');
}

/**
 * Main execution
 */
function main(): void {
  const args = process.argv.slice(2);
  const outputDir = path.join(__dirname, '..', 'examples');

  if (args.length === 0) {
    createAllCategories(outputDir);
  } else if (args[0] === 'list') {
    console.log('Available categories:');
    Object.keys(CATEGORY_CONFIGS).forEach(cat => {
      console.log(`  - ${cat}: ${CATEGORY_CONFIGS[cat].name}`);
    });
  } else if (args[0]) {
    createCategory(args[0], outputDir);
  }
}

main();
