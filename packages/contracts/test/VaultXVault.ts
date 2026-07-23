import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import type { VaultXVault } from '../typechain-types';

describe('VaultXVault', () => {
  async function deployVault() {
    const signers = await ethers.getSigners();
    const admin = signers[0] as HardhatEthersSigner;
    const depositor = signers[1] as HardhatEthersSigner;
    const recipient = signers[2] as HardhatEthersSigner;
    const outsider = signers[3] as HardhatEthersSigner;
    const vault = (await ethers.deployContract('VaultXVault', [
      admin.address
    ])) as unknown as VaultXVault;

    return { admin, depositor, outsider, recipient, vault };
  }

  it('assigns administrative and pausing roles to the deployment admin', async () => {
    const { admin, vault } = await deployVault();

    expect(await vault.hasRole(await vault.DEFAULT_ADMIN_ROLE(), admin.address)).to.equal(true);
    expect(await vault.hasRole(await vault.PAUSER_ROLE(), admin.address)).to.equal(true);
  });

  it('credits a depositor for native asset deposits', async () => {
    const { depositor, vault } = await deployVault();
    const amount = ethers.parseEther('1');

    await expect(vault.connect(depositor).deposit({ value: amount }))
      .to.emit(vault, 'Deposited')
      .withArgs(depositor.address, amount);

    expect(await vault.credits(depositor.address)).to.equal(amount);
  });

  it('withdraws only the caller credit after a successful transfer', async () => {
    const { depositor, recipient, vault } = await deployVault();
    const depositAmount = ethers.parseEther('1');
    const withdrawalAmount = ethers.parseEther('0.4');

    await vault.connect(depositor).deposit({ value: depositAmount });

    const tx = vault.connect(depositor).withdraw(withdrawalAmount, recipient.address);

    await expect(tx).to.changeEtherBalances(
      [vault, recipient],
      [-withdrawalAmount, withdrawalAmount]
    );
    await expect(tx)
      .to.emit(vault, 'Withdrawn')
      .withArgs(depositor.address, recipient.address, withdrawalAmount);

    expect(await vault.credits(depositor.address)).to.equal(depositAmount - withdrawalAmount);
  });

  it('rejects invalid deposit and withdrawal operations', async () => {
    const { depositor, recipient, vault } = await deployVault();
    const amount = ethers.parseEther('1');

    await expect(vault.connect(depositor).deposit()).to.be.revertedWithCustomError(
      vault,
      'ZeroAmount'
    );
    await vault.connect(depositor).deposit({ value: amount });

    await expect(vault.connect(depositor).withdraw(amount + 1n, recipient.address))
      .to.be.revertedWithCustomError(vault, 'InsufficientCredit')
      .withArgs(amount, amount + 1n);
    await expect(
      vault.connect(depositor).withdraw(amount, ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(vault, 'InvalidRecipient');
  });

  it('allows only pausers to halt and resume operations', async () => {
    const { admin, depositor, outsider, vault } = await deployVault();

    await expect(vault.connect(outsider).pause())
      .to.be.revertedWithCustomError(vault, 'AccessControlUnauthorizedAccount')
      .withArgs(outsider.address, await vault.PAUSER_ROLE());

    await vault.connect(admin).pause();
    await expect(vault.connect(depositor).deposit({ value: 1n })).to.be.revertedWithCustomError(
      vault,
      'EnforcedPause'
    );

    await vault.connect(admin).unpause();
    await expect(vault.connect(depositor).deposit({ value: 1n })).to.emit(vault, 'Deposited');
  });
});
