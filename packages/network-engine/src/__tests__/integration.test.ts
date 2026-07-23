import { describe, it, expect, beforeAll } from 'vitest';
import { ethers } from 'ethers';
import { ProviderManager } from '../providers/index.js';
import fs from 'fs';
import path from 'path';

// Skipped by default because it requires a local Anvil/Hardhat node running on 127.0.0.1:8545
describe.skip('VaultX Blockchain Connectivity Integration', () => {
  let providerManager: ProviderManager;
  let hardhatAccount: string;
  let hardhatSigner: ethers.JsonRpcSigner;
  let hardhatProvider: ethers.JsonRpcProvider;

  let mockTokenAddress: string;

  beforeAll(async () => {
    providerManager = new ProviderManager();
    providerManager.switchChain(31337); // Local Hardhat

    // Use vanilla ethers for deployment to decouple from Hardhat runtime
    hardhatProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    hardhatSigner = await hardhatProvider.getSigner(0);
    hardhatAccount = await hardhatSigner.getAddress();
  });

  it('should connect to RPC and fetch latest block', async () => {
    const block = await providerManager.execute((provider) => provider.getBlock('latest'));
    expect(block).toBeDefined();
    expect(block?.number).toBeGreaterThanOrEqual(0);
  });

  it('should retrieve native ETH balance', async () => {
    const balance = await providerManager.execute((provider) =>
      provider.getBalance(hardhatAccount)
    );
    // Hardhat accounts start with 10000 ETH
    expect(balance).toBeGreaterThan(0n);
  });

  it('should broadcast a transaction and confirm receipt', async () => {
    const receiver = ethers.Wallet.createRandom().address;

    const tx = await hardhatSigner.sendTransaction({
      to: receiver,
      value: ethers.parseEther('1.0')
    });

    const receipt = await tx.wait();
    expect(receipt).toBeDefined();
    expect(receipt?.status).toBe(1);

    const balance = await providerManager.execute((provider) => provider.getBalance(receiver));
    expect(balance).toBe(ethers.parseEther('1.0'));
  });

  it('should switch networks and verify chain ID', async () => {
    // Switch to Sepolia (since we don't have the RPC URL here, this might just change the internal state)
    // We'll skip making an actual RPC call to Sepolia in the test unless we mock it,
    // but the getActiveChainId should update correctly.
    providerManager.switchChain(11155111);
    expect(providerManager.getActiveChainId()).toBe(11155111);

    // Switch back to Hardhat
    providerManager.switchChain(31337);
    const network = await providerManager.execute((provider) => provider.getNetwork());
    expect(network.chainId).toBe(31337n);
  });

  it('should deploy ERC20 token', async () => {
    const artifactPath = path.resolve(
      __dirname,
      '../../../contracts/artifacts/contracts/MockToken.sol/MockToken.json'
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, hardhatSigner);
    const token = await factory.deploy('VaultX Token', 'VTX', hardhatAccount);
    await token.waitForDeployment();

    mockTokenAddress = await token.getAddress();
    expect(mockTokenAddress).toBeDefined();
  });

  it('should read ERC20 contract state successfully', async () => {
    const artifactPath = path.resolve(
      __dirname,
      '../../../contracts/artifacts/contracts/MockToken.sol/MockToken.json'
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    const token = new ethers.Contract(mockTokenAddress, artifact.abi, hardhatProvider);

    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    const totalSupply = await token.totalSupply();
    const balance = await token.balanceOf(hardhatAccount);

    expect(name).toBe('VaultX Token');
    expect(symbol).toBe('VTX');
    expect(decimals).toBe(18n);
    expect(totalSupply).toBe(ethers.parseUnits('1000000', 18));
    expect(balance).toBe(ethers.parseUnits('1000000', 18));
  });
});
