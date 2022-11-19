// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract Backpac is ERC721, Ownable, ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    uint256 MAX_SUPPLY = 50000;
    uint256 public mintPrice = 0.006 ether;

    constructor() ERC721("Exotics at Dania Pointe 2022", "EADP") {}

     function withdrawBalance() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://ipfs.filebase.io/ipfs/";
    }

    function setMintPrice(uint256 _mintPrice) public {
        mintPrice = _mintPrice;
    }

    function safeMint(address to) public payable {
        require(
            _tokenIdCounter.current() <= MAX_SUPPLY,
            "I'm sorry we reached the cap"
        );
        require(msg.value >= mintPrice, "Not enough ETH to mint");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(
            tokenId,
            "QmafR5kXAMLzyUTvov1mT3MRbwN9BQgwvwYnXR8eon28xq"
        );
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function maxSupply() public view returns (uint256) {
        return MAX_SUPPLY;
    }

    function balanceOf() public view returns (uint256) {
        return address(this).balance;
    }
}
