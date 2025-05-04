# Solana Development Guide

This guide provides comprehensive information for Solana blockchain development using the Bedrock environment. It covers program development, testing, deployment, and best practices.

## Table of Contents

1. [Getting Started with Solana Development](#getting-started-with-solana-development)
2. [Understanding Solana Architecture](#understanding-solana-architecture)
3. [Program Development](#program-development)
4. [Testing Programs](#testing-programs)
5. [Program Deployment](#program-deployment)
6. [Program Verification](#program-verification)
7. [Security Best Practices](#security-best-practices)
8. [Performance Optimization](#performance-optimization)
9. [Client Integration](#client-integration)
10. [Advanced Topics](#advanced-topics)
11. [Resources](#resources)

## Getting Started with Solana Development

### Prerequisites

Before starting Solana development, ensure you have:

- Rust toolchain installed (via rustup)
- Solana CLI tools
- Node.js v20+ for client development
- Basic understanding of Rust and Solana concepts

### Environment Setup

The Bedrock environment provides a pre-configured Solana development setup. Key components include:

- `solana-program` - Core libraries for Solana programs
- `anchor` - Framework for simplified Solana development
- Solana CLI tools for deployment and interaction
- JS client libraries for building frontends

### Installation

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WebAssembly target (required for Solana programs)
rustup target add wasm32-unknown-unknown

# Install Solana CLI tools
sh -c "$(curl -sSfL https://release.solana.com/v1.16.6/install)"

# Install Anchor (optional, but recommended)
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest
```

### Solana Concepts Overview

Solana differs from Ethereum with its unique programming model:

- **Programs** (not contracts): Immutable code deployed on-chain
- **Accounts**: Data-storing entities owned by programs
- **Instructions**: Requests to execute a program with specific accounts
- **Transactions**: One or more instructions executed atomically
- **PDAs (Program Derived Addresses)**: Accounts whose address is derived from a program ID
- **Rent Economics**: Pay for storage based on size and time

## Understanding Solana Architecture

### Account Model

Accounts in Solana are fundamental building blocks:

```
┌─────────────────────────┐
│       Account           │
├─────────────────────────┤
│ - Public Key (address)  │
│ - Owner (program ID)    │
│ - Lamports (SOL)        │
│ - Data (binary)         │
│ - Executable flag       │
│ - Rent epoch            │
└─────────────────────────┘
```

Each account:
- Has a public key address
- Is owned by a program
- Contains SOL balance (lamports)
- Stores arbitrary data
- May be executable (if it's a program)

### Program Execution Flow

Transactions execution follows this pattern:

1. Client sends a Transaction with Instructions
2. Each Instruction specifies:
   - The program to execute
   - Accounts to read/write
   - Instruction data (parameters)
3. Runtime loads the program
4. Program processes instruction data and accounts
5. Program updates account data

### Cross-Program Invocation (CPI)

Programs can call other programs using CPIs:

```rust
// Calling the token program from your program
let cpi_accounts = Transfer {
    from: ctx.accounts.from.to_account_info(),
    to: ctx.accounts.to.to_account_info(),
    authority: ctx.accounts.authority.to_account_info(),
};

let cpi_program = ctx.accounts.token_program.to_account_info();
let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

token::transfer(cpi_ctx, amount)?;
```

## Program Development

### Structure of a Native Solana Program

A basic Solana program structure:

```rust
// cargo.toml
[package]
name = "basic-program"
version = "0.1.0"
edition = "2021"

[dependencies]
solana-program = "1.16.6"

[lib]
crate-type = ["cdylib", "lib"]

// src/lib.rs
use solana-program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint implementation
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Program entry");
    
    // Get account iterator
    let accounts_iter = &mut accounts.iter();
    
    // Get accounts
    let account = next_account_info(accounts_iter)?;
    
    // Ensure the account is owned by the program
    if account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Add program logic here
    msg!("Instruction data: {:?}", instruction_data);
    
    Ok(())
}

#[cfg(test)]
mod test {
    use super::*;
    // Tests here
}
```

### Using Anchor Framework

Anchor provides a more ergonomic development experience:

```bash
# Create new Anchor project
anchor init my_project
cd my_project
```

```rust
// programs/my_project/src/lib.rs
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod my_project {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        let my_account = &mut ctx.accounts.my_account;
        my_account.data = data;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct MyAccount {
    pub data: u64,
}
```

### Data Serialization

Solana programs use Borsh for efficient serialization:

```rust
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct TokenInstruction {
    pub amount: u64,
    pub recipient: Pubkey,
}

// Serialize for instruction data
let instruction = TokenInstruction {
    amount: 100,
    recipient: recipient_pubkey,
};
let instruction_data = instruction.try_to_vec()?;

// Deserialize in the program
let instruction = TokenInstruction::try_from_slice(instruction_data)?;
```

In Anchor, this is handled automatically with:

```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TokenParams {
    pub amount: u64,
}

// In the instruction
pub fn transfer(ctx: Context<Transfer>, params: TokenParams) -> Result<()> {
    // params.amount is available here
}
```

## Testing Programs

### Unit Testing

Solana programs can be unit tested with the `solana-program-test` crate:

```rust
use solana_program_test::*;
use solana_sdk::{account::Account, signature::Signer, transaction::Transaction};

#[tokio::test]
async fn test_my_program() {
    // Create program test
    let program_id = Pubkey::new_unique();
    let mut program_test = ProgramTest::new(
        "my_program", // Program name
        program_id,   // Program ID
        processor!(process_instruction), // Program entrypoint
    );
    
    // Add an account
    let account = Account {
        lamports: 5,
        data: vec![0; 32],
        owner: program_id,
        ..Account::default()
    };
    let account_pubkey = Pubkey::new_unique();
    program_test.add_account(account_pubkey, account);
    
    // Start the test environment
    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;
    
    // Create a transaction
    let mut transaction = Transaction::new_with_payer(
        &[instruction::create_instruction(
            program_id,
            account_pubkey,
            payer.pubkey(),
        )],
        Some(&payer.pubkey()),
    );
    transaction.sign(&[&payer], recent_blockhash);
    
    // Process the transaction
    banks_client.process_transaction(transaction).await.unwrap();
    
    // Verify account state
    let account = banks_client.get_account(account_pubkey).await.unwrap().unwrap();
    assert_eq!(account.data.len(), 32);
}
```

### Testing with Anchor

Anchor provides a simpler testing framework:

```typescript
// tests/my-project.ts
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { MyProject } from '../target/types/my_project';
import { expect } from 'chai';

describe('my-project', () => {
  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.MyProject as Program<MyProject>;
  const myAccount = anchor.web3.Keypair.generate();
  
  it('Initializes with the correct data', async () => {
    // Call initialize with a data value of 42
    await program.methods
      .initialize(new anchor.BN(42))
      .accounts({
        myAccount: myAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([myAccount])
      .rpc();
      
    // Fetch the account and verify data
    const account = await program.account.myAccount.fetch(myAccount.publicKey);
    expect(account.data.toNumber()).to.equal(42);
  });
});
```

## Program Deployment

### Deploying Native Programs

Deploy a native Solana program using the CLI:

```bash
# Build the program
cargo build-bpf

# Deploy to devnet
solana program deploy \
  --keypair ~/.config/solana/id.json \
  --url devnet \
  --program-id program_keypair.json \
  target/deploy/my_program.so
```

### Deploying Anchor Programs

Deploy an Anchor program:

```bash
# Build and deploy to devnet
anchor build
anchor deploy --provider.cluster devnet
```

### Program Upgrade

Solana programs are immutable after deployment, but can be replaced if the program was deployed using an upgradeable BPF loader:

```bash
# Check which loader is used
solana program show <PROGRAM_ID>

# Deploy upgrade
solana program deploy \
  --keypair program_authority.json \
  --program-id <PROGRAM_ID> \
  target/deploy/my_program.so
```

## Program Verification

Solana doesn't have a built-in verification service like Etherscan, but you can:

1. Publish your source code in a public repository
2. Document the build process and compiler versions
3. Use Anchor's verification process

```bash
# For Anchor programs
anchor verify <PROGRAM_ID> \
  --provider.cluster mainnet \
  --detached
```

## Security Best Practices

### Common Vulnerabilities

1. **Account Validation**
   - Always validate account ownership
   - Ensure PDAs are derived correctly
   - Verify all account constraints

```rust
// Validate account ownership
if account.owner != program_id {
    return Err(ProgramError::IncorrectProgramId);
}

// Validate PDA address
let (expected_pda, bump) = Pubkey::find_program_address(
    &[b"storage", user.key.as_ref()],
    program_id
);
if expected_pda != *storage_account.key {
    return Err(ProgramError::InvalidArgument);
}
```

2. **Privilege Escalation**
   - Check signers properly
   - Validate authority on sensitive operations

```rust
if !authority_account.is_signer {
    return Err(ProgramError::MissingRequiredSignature);
}
```

3. **Integer Overflow/Underflow**
   - Use checked math operations

```rust
// Use checked math
let new_balance = account.balance.checked_add(amount)
    .ok_or(ProgramError::ArithmeticOverflow)?;
```

4. **Lamport Leakage**
   - Track lamport balances when transferring between accounts

### Secure Coding Patterns

1. **Modular Program Design**
   - Split complex logic into smaller, testable modules
   - Use clear state transitions and validation barriers

2. **Comprehensive Input Validation**
   - Validate all inputs at program entry
   - Re-validate after Cross-Program Invocations

3. **Minimal CPI Permissions**
   - Only pass necessary accounts to CPIs
   - Use the minimum required permissions for CPI contexts

## Performance Optimization

### Account Size Optimization

Each byte costs rent, so optimize account sizes:

```rust
// Define exact account size
#[account(
    init,
    payer = user,
    space = 8 + // Discriminator
            4 + // Vector length prefix for name (u32)
            32 + // Max name length
            8 + // u64 for balance
            1, // bool for active status
)]
pub my_account: Account<'info, MyAccount>,
```

### Computation Budget

Solana has a strict computation budget per transaction:

1. **Minimize Program Size**: Smaller programs load faster
2. **Reduce Instruction Count**: Batch operations when possible
3. **Optimize Expensive Operations**:
   - Avoid nested loops
   - Minimize heap allocations
   - Use efficient algorithms

### Transaction Size Optimization

Transaction size affects fees and throughput:

1. Use compact data structures
2. Batch related operations
3. Use recent blockhash efficiently

## Client Integration

### JavaScript/TypeScript Integration

Integrate with frontend using the Solana Web3.js library:

```typescript
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Connect to cluster
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Create an instruction
const instruction = new TransactionInstruction({
  keys: [
    { pubkey: accountPubkey, isSigner: false, isWritable: true },
    { pubkey: payerPubkey, isSigner: true, isWritable: true },
  ],
  programId: new PublicKey(programId),
  data: Buffer.from([/* instruction data */]),
});

// Add instruction to transaction
const transaction = new Transaction().add(instruction);

// Send transaction
const signature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [payer],
  { commitment: 'confirmed' }
);
console.log('Transaction signature:', signature);
```

### Using Anchor Client

The Anchor client library provides a more ergonomic API:

```typescript
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { MyProgram } from '../target/types/my_program';

// Set up provider
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// Load the program
const program = anchor.workspace.MyProgram as Program<MyProgram>;

// Call a program method
const tx = await program.methods
  .initialize(new anchor.BN(42))
  .accounts({
    myAccount: myAccountPubkey,
    user: provider.wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .rpc();

console.log('Transaction signature:', tx);
```

### Rust Client Integration

Use the Bedrock Rust blockchain library for Solana integration:

```rust
use bedrock_blockchain::{
    solana::SolanaClient,
    common::BlockchainClient,
    common::Address,
};
use anyhow::Result;

fn main() -> Result<()> {
    // Initialize a Solana client
    let client = SolanaClient::new(
        "https://api.devnet.solana.com",
        "devnet",
    )?;
    
    // Get account balance
    let address = Address::new("HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH");
    let balance = client.get_balance(&address)?;
    
    println!("Account balance: {} SOL", balance);
    
    Ok(())
}
```

## Advanced Topics

### Token Creation with SPL

Create and manage tokens with the SPL Token program:

```typescript
import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} from '@solana/spl-token';

// Connection to devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Create a new token mint
const mint = await createMint(
  connection,
  payer,
  mintAuthority.publicKey,
  freezeAuthority.publicKey,
  9 // 9 decimals
);

// Create a token account
const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  payer,
  mint,
  owner.publicKey
);

// Mint tokens
await mintTo(
  connection,
  payer,
  mint,
  tokenAccount.address,
  mintAuthority,
  1000000000 // 1 token with 9 decimals
);

// Transfer tokens
await transfer(
  connection,
  payer,
  sourceTokenAccount.address,
  destinationTokenAccount.address,
  owner,
  500000000 // 0.5 tokens with 9 decimals
);
```

### NFT Creation

Create NFTs with the Metaplex standard:

```typescript
import { 
  Metaplex, 
  keypairIdentity,
  bundlrStorage,
} from '@metaplex-foundation/js';

// Set up Metaplex
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(wallet))
  .use(bundlrStorage());

// Upload metadata
const { uri } = await metaplex
  .nfts()
  .uploadMetadata({
    name: 'My NFT',
    description: 'My NFT description',
    image: 'https://example.com/image.png',
  });

// Create NFT
const { nft } = await metaplex
  .nfts()
  .create({
    uri,
    name: 'My NFT',
    sellerFeeBasisPoints: 500, // 5%
  });

console.log('NFT created with address:', nft.address.toBase58());
```

### Program Derived Addresses (PDAs)

PDAs are a powerful Solana concept for deterministic account creation:

```rust
// In your program, derive a PDA
let seeds = &[b"user-stats", user.key.as_ref()];
let (pda, bump) = Pubkey::find_program_address(seeds, program_id);

// Create the account
invoke_signed(
    &system_instruction::create_account(
        payer.key,
        &pda,
        rent_lamports,
        data_len as u64,
        program_id,
    ),
    &[
        payer.clone(),
        account.clone(),
        system_program.clone(),
    ],
    &[&[b"user-stats", user.key.as_ref(), &[bump]]],
)?;
```

### Asynchronous Processing with Clocks

Implementing time-based logic with Solana's block time:

```rust
use solana_program::sysvar::{clock::Clock, Sysvar};

// Get current timestamp
let clock = Clock::get()?;
let current_time = clock.unix_timestamp;

// Check if enough time has passed
if current_time < account.last_update + 86400 { // 24 hours
    return Err(ProgramError::Custom(1)); // Custom error code
}

// Update timestamp
account.last_update = current_time;
```

## Resources

### Documentation

- [Solana Developer Documentation](https://docs.solana.com/developers)
- [Anchor Framework Documentation](https://book.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [SPL Token Documentation](https://spl.solana.com/token)

### Learning Resources

- [Solana Bootcamp](https://github.com/solana-developers/bootcamp)
- [Solana Program Library](https://github.com/solana-labs/solana-program-library)
- [Anchor Examples](https://github.com/coral-xyz/anchor/tree/master/examples)
- [Buildspace Solana Projects](https://buildspace.so/solana)

### Development Tools

- [Solana Playground](https://beta.solpg.io/) - Online IDE
- [Phantom Wallet](https://phantom.app/) - Browser extension wallet
- [Solana Explorer](https://explorer.solana.com/) - Block explorer
- [Solscan](https://solscan.io/) - Alternative block explorer