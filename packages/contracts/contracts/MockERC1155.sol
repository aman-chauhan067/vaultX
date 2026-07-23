// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC1155 is ERC1155, Ownable {
    string public name = "Mock ERC1155";
    string public symbol = "M1155";

    constructor(string memory baseURI) ERC1155(baseURI) Ownable(msg.sender) {}

    function mint(address account, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        _mint(account, id, amount, data);
    }
}
