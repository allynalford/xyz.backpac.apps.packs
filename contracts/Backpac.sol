// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract BackpacV1 is ERC721, Ownable, ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    uint256 MAX_SUPPLY = 10000;
    uint256 public mintPrice = 0.000 ether;
    string BASE_URI = "https://ipfs.filebase.io/ipfs/";

    constructor(string memory name_, string memory symbol_, uint256 supply_, uint256 mintPrice_, string memory baseURI_) ERC721(name_, symbol_) {
        MAX_SUPPLY = supply_;
        mintPrice = mintPrice_;
        BASE_URI = baseURI_;
    }

     function withdrawBalance() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function _baseURI() internal view override returns (string memory) {
        return BASE_URI;
    }

    function setMintPrice(uint256 _mintPrice) public {
        mintPrice = _mintPrice;
    }

    function safeMint(address to, string memory cid) public payable {
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
            cid
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
