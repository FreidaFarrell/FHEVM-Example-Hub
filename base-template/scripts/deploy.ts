import { ethers } from "hardhat";

async function main() {
  console.log("Deploying FHECounter contract...");

  // Get the contract factory
  const FHECounter = await ethers.getContractFactory("FHECounter");

  // Deploy the contract
  const fheCounter = await FHECounter.deploy();
  await fheCounter.waitForDeployment();

  const contractAddress = await fheCounter.getAddress();
  console.log(`✓ FHECounter deployed successfully at: ${contractAddress}`);

  // Verify deployment
  const count = await fheCounter.getCount();
  console.log(`Initial count (encrypted): ${count}`);

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
