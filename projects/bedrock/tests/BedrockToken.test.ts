import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("BedrockToken", function () {
  let bedrockToken: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  
  const TOKEN_NAME = "Bedrock Token";
  const TOKEN_SYMBOL = "BDR";
  const DECIMALS = 18;
  const MAX_SUPPLY = ethers.parseEther("1000000000"); // 1 billion
  const INITIAL_SUPPLY = ethers.parseEther("100000000"); // 100 million
  
  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy token
    const BedrockToken = await ethers.getContractFactory("BedrockToken");
    bedrockToken = await BedrockToken.deploy(
      owner.address,
      TOKEN_NAME,
      TOKEN_SYMBOL,
      DECIMALS,
      MAX_SUPPLY,
      INITIAL_SUPPLY
    );
    await bedrockToken.deployed();
  });
  
  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await bedrockToken.name()).to.equal(TOKEN_NAME);
      expect(await bedrockToken.symbol()).to.equal(TOKEN_SYMBOL);
    });
    
    it("Should set the right decimals", async function () {
      expect(await bedrockToken.decimals()).to.equal(DECIMALS);
    });
    
    it("Should set the right maxSupply", async function () {
      expect(await bedrockToken.maxSupply()).to.equal(MAX_SUPPLY);
    });
    
    it("Should assign the initial supply to the owner", async function () {
      const ownerBalance = await bedrockToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(INITIAL_SUPPLY);
    });
  });
  
  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      const transferAmount = ethers.parseEther("50");
      await bedrockToken.transfer(addr1.address, transferAmount);
      
      // Check balances
      expect(await bedrockToken.balanceOf(addr1.address)).to.equal(transferAmount);
      expect(await bedrockToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY.sub(transferAmount));
    });
    
    it("Should fail if sender doesn't have enough tokens", async function () {
      // Get initial balance of owner and addr1
      const initialOwnerBalance = await bedrockToken.balanceOf(owner.address);
      
      // Try to transfer more tokens than available
      await expect(
        bedrockToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      
      // Check that balances didn't change
      expect(await bedrockToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });
  });
  
  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await bedrockToken.mint(addr1.address, mintAmount);
      
      expect(await bedrockToken.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await bedrockToken.totalSupply()).to.equal(INITIAL_SUPPLY.add(mintAmount));
    });
    
    it("Should prevent non-owners from minting tokens", async function () {
      await expect(
        bedrockToken.connect(addr1).mint(addr2.address, 100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Should prevent minting beyond max supply", async function () {
      // Try to mint more than max supply allows
      const remainingSupply = MAX_SUPPLY.sub(INITIAL_SUPPLY);
      const excessiveAmount = remainingSupply.add(1);
      
      await expect(
        bedrockToken.mint(addr1.address, excessiveAmount)
      ).to.be.revertedWith("Mint would exceed max supply");
    });
  });
});