import { ethers } from "hardhat";

async function main() {
  console.info("Deploying BedrockToken...");
  
  const [deployer] = await ethers.getSigners();
  
  console.info(`Deploying with account: ${deployer.address}`);
  
  // Deploy BedrockToken with initial parameters
  const BedrockToken = await ethers.getContractFactory("BedrockToken");
  const token = await BedrockToken.deploy(
    deployer.address,       // initial owner
    "Bedrock Token",        // name
    "BDR",                  // symbol
    18,                     // decimals
    ethers.parseEther("1000000000"),  // 1 billion max supply
    ethers.parseEther("100000000")    // 100 million initial supply
  );
  
  await token.deployed();
  
  console.info(`BedrockToken deployed to: ${token.address}`);
  console.info(`Owner: ${deployer.address}`);
  console.info(`Initial supply: 100,000,000 BDR`);
  console.info(`Max supply: 1,000,000,000 BDR`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });