#!/usr/bin/env node

/**
 * @title Documentation Generator
 * @description Automated script for generating documentation from code annotations
 * @chapter: documentation
 */

import fs from 'fs';
import path from 'path';

interface DocumentationConfig {
  title: string;
  description: string;
  category?: string;
  chapter?: string;
}

interface ParsedExample {
  name: string;
  path: string;
  title: string;
  description: string;
  category: string;
  chapter: string;
  functions: string[];
}

/**
 * Parses JSDoc comments from contract files
 * @param filePath - Path to the contract file
 * @returns Parsed documentation
 */
function parseContractDocs(filePath: string): DocumentationConfig {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract JSDoc comments
  const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
  const jsdocs = content.match(jsdocRegex) || [];

  // Extract title
  const titleMatch = content.match(/@title\s+(.+)/);
  const title = titleMatch ? titleMatch[1] : path.basename(filePath);

  // Extract description
  const descMatch = content.match(/@description\s+(.+)/);
  const description = descMatch ? descMatch[1] : '';

  // Extract chapter
  const chapterMatch = content.match(/@chapter:\s*(\w+)/);
  const chapter = chapterMatch ? chapterMatch[1] : 'general';

  return {
    title,
    description,
    chapter,
  };
}

/**
 * Generates markdown documentation for examples
 * @param examplesDir - Directory containing example projects
 * @param outputFile - Output markdown file
 */
function generateExampleDocs(examplesDir: string, outputFile: string): void {
  console.log('Generating documentation for examples...');

  const examples: ParsedExample[] = [];

  if (!fs.existsSync(examplesDir)) {
    console.log(`No examples directory found at ${examplesDir}`);
    return;
  }

  // Scan examples directory
  const dirs = fs.readdirSync(examplesDir).filter(f => {
    const fullPath = path.join(examplesDir, f);
    return fs.statSync(fullPath).isDirectory();
  });

  dirs.forEach(dir => {
    const examplePath = path.join(examplesDir, dir);
    const contractsDir = path.join(examplePath, 'contracts');

    if (fs.existsSync(contractsDir)) {
      const contracts = fs.readdirSync(contractsDir).filter(f => f.endsWith('.sol'));

      contracts.forEach(contract => {
        const contractPath = path.join(contractsDir, contract);
        const docs = parseContractDocs(contractPath);

        examples.push({
          name: dir,
          path: contractPath,
          title: docs.title,
          description: docs.description,
          category: dir.split('-')[0] || 'uncategorized',
          chapter: docs.chapter,
          functions: [],
        });
      });
    }
  });

  // Generate markdown
  let markdown = '# FHEVM Examples Documentation\n\n';
  markdown += 'Auto-generated documentation for FHEVM example projects.\n\n';

  // Group by category
  const categories = [...new Set(examples.map(e => e.category))];

  categories.forEach(category => {
    markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Examples\n\n`;

    const categoryExamples = examples.filter(e => e.category === category);

    categoryExamples.forEach(example => {
      markdown += `### ${example.title}\n\n`;
      markdown += `**Location**: \`examples/${example.name}/\`\n\n`;
      markdown += `**Description**: ${example.description}\n\n`;
      markdown += `**Chapter**: ${example.chapter}\n\n`;

      markdown += '#### Setup\n\n';
      markdown += '```bash\n';
      markdown += `cd examples/${example.name}\n`;
      markdown += 'npm install\n';
      markdown += 'npm run test\n';
      markdown += '```\n\n';

      markdown += '#### Files\n\n';
      markdown += `- \`contracts/\` - Smart contract source code\n`;
      markdown += `- \`test/\` - Test suite\n`;
      markdown += `- \`README.md\` - Example-specific documentation\n\n`;
    });
  });

  // Write to file
  fs.writeFileSync(outputFile, markdown);
  console.log(`✓ Documentation generated: ${outputFile}`);
}

/**
 * Generates README for an example project
 * @param exampleDir - Example project directory
 */
function generateExampleReadme(exampleDir: string): void {
  const readmePath = path.join(exampleDir, 'README.md');

  if (fs.existsSync(readmePath)) {
    return; // Don't overwrite existing README
  }

  const contractsDir = path.join(exampleDir, 'contracts');
  const contractName = fs.readdirSync(contractsDir).find(f => f.endsWith('.sol'));

  if (!contractName) {
    console.error(`No Solidity files found in ${contractsDir}`);
    return;
  }

  const contractPath = path.join(contractsDir, contractName);
  const docs = parseContractDocs(contractPath);

  let readme = `# ${docs.title}\n\n`;
  readme += `${docs.description}\n\n`;
  readme += `## Overview\n\n`;
  readme += `This example demonstrates FHEVM concepts in the "${docs.chapter}" category.\n\n`;
  readme += `## Setup\n\n`;
  readme += '```bash\n';
  readme += 'npm install\n';
  readme += 'npm run compile\n';
  readme += 'npm run test\n';
  readme += '```\n\n';
  readme += `## Contract Details\n\n`;
  readme += `Main contract: \`${contractName}\`\n\n`;
  readme += `## Key Concepts\n\n`;
  readme += `- FHEVM encryption and operations\n`;
  readme += `- Secure smart contract development\n`;
  readme += `- Privacy-preserving logic\n\n`;
  readme += `## Testing\n\n`;
  readme += '```bash\n';
  readme += 'npm run test\n';
  readme += 'npm run test:coverage\n';
  readme += '```\n\n';
  readme += `## References\n\n`;
  readme += `- [Zama FHEVM Documentation](https://docs.zama.ai/)\n`;
  readme += `- [Solidity Documentation](https://docs.soliditylang.org/)\n`;

  fs.writeFileSync(readmePath, readme);
  console.log(`✓ README generated: ${readmePath}`);
}

/**
 * Main execution
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args[0] === 'examples') {
    const examplesDir = path.join(__dirname, '..', 'examples');
    const outputFile = path.join(__dirname, '..', 'EXAMPLES_DOCS.md');
    generateExampleDocs(examplesDir, outputFile);
  } else if (args[0] === 'single' && args[1]) {
    const exampleDir = path.join(__dirname, '..', 'examples', args[1]);
    generateExampleReadme(exampleDir);
  } else {
    console.log('Usage:');
    console.log('  npx ts-node generate-docs.ts examples');
    console.log('  npx ts-node generate-docs.ts single <example-name>');
  }
}

main();
