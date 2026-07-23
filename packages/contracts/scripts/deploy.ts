import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const Token = await ethers.getContractFactory('MockToken');
  const token = await Token.deploy('VaultX Token', 'VTX', deployer.address);
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log('MockToken deployed to:', address);

  const balance = await token.balanceOf(deployer.address);
  console.log('Deployer balance:', ethers.formatEther(balance), 'VTX');

  // Deploy MockERC721
  const MockERC721 = await ethers.getContractFactory('MockERC721');
  const nft721 = await MockERC721.deploy();
  await nft721.waitForDeployment();
  const nft721Address = await nft721.getAddress();
  console.log('MockERC721 deployed to:', nft721Address);

  // Mint a few ERC721 tokens
  await nft721.mint(deployer.address, 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/1');
  await nft721.mint(deployer.address, 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/2');
  console.log('Minted ERC721 tokens to deployer');

  // Deploy MockERC1155
  const MockERC1155 = await ethers.getContractFactory('MockERC1155');
  const nft1155 = await MockERC1155.deploy(
    'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/{id}.json'
  );
  await nft1155.waitForDeployment();
  const nft1155Address = await nft1155.getAddress();
  console.log('MockERC1155 deployed to:', nft1155Address);

  // Mint ERC1155 tokens
  await nft1155.mint(deployer.address, 1, 10, '0x');
  await nft1155.mint(deployer.address, 2, 5, '0x');
  console.log('Minted ERC1155 tokens to deployer');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
