// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC721 is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("Mock NFT", "MNFT") Ownable(msg.sender) {}

    function mint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
}
