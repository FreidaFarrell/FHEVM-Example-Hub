/**
 * @title Generic Deployment Script
 * @description Template for deploying FHEVM example contracts
 * @chapter: deployment
 *
 * Usage:
 * 1. Copy to your example: scripts/deploy.ts
 * 2. Update CONTRACT_NAME to match your contract
 * 3. Run: npx hardhat run scripts/deploy.ts --network sepolia
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Main deployment function
 */
async function main() {
    console.log("=".repeat(60));
    console.log("FHEVM Contract Deployment");
    console.log("=".repeat(60));

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("\n📝 Deployer Account:", deployer.address);

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("🌍 Network:", network.name, `(ChainID: ${network.chainId})`);

    // Get account balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account Balance:", ethers.utils.formatEther(balance), "ETH");

    // TODO: Update CONTRACT_NAME to your contract
    const CONTRACT_NAME = "ContractName";

    try {
        console.log("\n📦 Compiling contract...");
        const Contract = await ethers.getContractFactory(CONTRACT_NAME);
        console.log("✓ Contract compiled successfully");

        console.log("\n🚀 Deploying contract...");
        const contract = await Contract.deploy();
        console.log("✓ Contract deployment transaction sent");
        console.log("  Transaction Hash:", contract.deployTransaction.hash);

        // Wait for deployment to complete
        console.log("\n⏳ Waiting for deployment confirmation...");
        await contract.deployed();
        console.log("✓ Contract deployed successfully");

        // Display deployment info
        console.log("\n" + "=".repeat(60));
        console.log("Deployment Summary");
        console.log("=".repeat(60));
        console.log("Contract Name:     ", CONTRACT_NAME);
        console.log("Contract Address:  ", contract.address);
        console.log("Deployer:          ", deployer.address);
        console.log("Network:           ", network.name);
        console.log("Block Number:      ", await ethers.provider.getBlockNumber());

        // Get deployment gas used
        const receipt = await ethers.provider.getTransactionReceipt(
            contract.deployTransaction.hash
        );
        if (receipt) {
            console.log("Gas Used:          ", receipt.gasUsed.toString());
            console.log("Gas Price:         ", ethers.utils.formatUnits(receipt.gasPrice, "gwei"), "gwei");
            const totalCost = receipt.gasUsed.mul(receipt.gasPrice);
            console.log("Deployment Cost:   ", ethers.utils.formatEther(totalCost), "ETH");
        }

        // Save deployment info
        const deploymentInfo = {
            contract: CONTRACT_NAME,
            address: contract.address,
            deployer: deployer.address,
            network: network.name,
            chainId: network.chainId,
            blockNumber: await ethers.provider.getBlockNumber(),
            timestamp: new Date().toISOString(),
            transactionHash: contract.deployTransaction.hash,
        };

        const deploymentPath = path.join(__dirname, "../.deployment.json");
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        console.log("\n💾 Deployment info saved to .deployment.json");

        // Verify on Etherscan (optional)
        if (network.name === "sepolia") {
            console.log("\n" + "=".repeat(60));
            console.log("Verification Info");
            console.log("=".repeat(60));
            console.log("To verify on Etherscan, run:");
            console.log(`npx hardhat verify ${contract.address} --network sepolia`);
            console.log("\nEtherscan URL:");
            console.log(`https://sepolia.etherscan.io/address/${contract.address}`);
        }

        console.log("\n✅ Deployment complete!");
        console.log("=".repeat(60));

        return contract.address;
    } catch (error) {
        console.error("\n❌ Deployment failed!");
        console.error("Error:", error);
        process.exit(1);
    }
}

// Execute deployment
main()
    .then((address) => {
        console.log("\nContract deployed at:", address);
        process.exit(0);
    })
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
