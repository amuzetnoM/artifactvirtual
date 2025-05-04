// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BedrockToken
 * @dev ERC20 Token for the Bedrock platform
 */
contract BedrockToken is ERC20, ERC20Burnable, Ownable {
    // Token decimals (default is 18)
    uint8 private _decimals;

    // Maximum supply cap
    uint256 public immutable maxSupply;
    
    /**
     * @dev Constructor that initializes the token with name, symbol, decimals, and maximum supply
     * @param initialOwner The initial owner of the token
     * @param name Token name
     * @param symbol Token symbol
     * @param decimalsValue Number of decimals
     * @param maxSupplyValue Maximum token supply
     * @param initialMint Amount to mint to the initial owner
     */
    constructor(
        address initialOwner,
        string memory name,
        string memory symbol,
        uint8 decimalsValue,
        uint256 maxSupplyValue,
        uint256 initialMint
    ) ERC20(name, symbol) Ownable(initialOwner) {
        require(initialMint <= maxSupplyValue, "Initial mint exceeds max supply");
        
        _decimals = decimalsValue;
        maxSupply = maxSupplyValue;
        
        // Mint initial supply to the deployer if specified
        if (initialMint > 0) {
            _mint(initialOwner, initialMint);
        }
    }

    /**
     * @dev Returns the number of decimals used for token amounts
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mint new tokens to a specified address
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= maxSupply, "Mint would exceed max supply");
        _mint(to, amount);
    }
}