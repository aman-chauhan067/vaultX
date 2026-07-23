// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title VaultXVault
/// @notice Example native-asset protocol vault. This contract is not a browser wallet
///         and does not manage user private keys or seed phrases.
contract VaultXVault is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    mapping(address account => uint256 amount) public credits;

    error InvalidAdmin();
    error InvalidRecipient();
    error InsufficientCredit(uint256 available, uint256 requested);
    error NativeTransferFailed();
    error ZeroAmount();

    event Deposited(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, address indexed recipient, uint256 amount);

    constructor(address admin) {
        if (admin == address(0)) revert InvalidAdmin();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    receive() external payable {
        deposit();
    }

    /// @notice Credits the caller with native tokens held by this contract.
    function deposit() public payable whenNotPaused nonReentrant {
        if (msg.value == 0) revert ZeroAmount();

        credits[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Withdraws the caller's credited native tokens to a recipient address.
    function withdraw(uint256 amount, address payable recipient) external whenNotPaused nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (recipient == address(0)) revert InvalidRecipient();

        uint256 available = credits[msg.sender];
        if (amount > available) revert InsufficientCredit(available, amount);

        // Checks-effects-interactions: reduce credit before the external transfer.
        credits[msg.sender] = available - amount;

        (bool sent,) = recipient.call{value: amount}("");
        if (!sent) revert NativeTransferFailed();

        emit Withdrawn(msg.sender, recipient, amount);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
