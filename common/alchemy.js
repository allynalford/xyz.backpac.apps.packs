/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";

const endpoint = require('./endpoint');
const alchemySDK = require('@alch/alchemy-sdk');

// replace with your Alchemy api key
const baseURL = `${process.env.ALCHEMY_BASE_API_URL}/nft/v2/${process.env.ALCHEMY_API_KEY}`;
//const baseURL = process.env.ALCHEMY_HTTP;


// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, 
  network:
    process.env.ETH_NETWORK === "goerli"
      ? alchemySDK.Network.ETH_GOERLI
      : alchemySDK.Network.ETH_MAINNET, 
  maxRetries: 10,
};


const alchemy = alchemySDK.initializeAlchemy(settings);

function expired(date) {
  const today = new Date();
  var Christmas = new Date(date);
  var diffMs = (today - Christmas); // milliseconds between now & Christmas
  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
  console.log(diffMins);
  return (diffMins < 3 ? false : true);
}


/**
* Gets all NFTs currently owned by a given address
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet, Rinkeby, Kovan, Goerli, Ropsten
* Polygon: Mainnet and Mumbai
* Flow: Mainnet and Testnet (see docs here)
*
* @author Allyn j. Alford <Allyn@backpac.xyz>
* @async
* @function getAssetTransfers
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} address -  address for NFT owner (can be in ENS format!)
* @param {Array} contractAddresses -  address for NFT owner (can be in ENS format!)
* @return {Promise<Array>} Response Array
*/
module.exports.getAssetTransfers = async (toAddress, contractAddresses) => {
  try {

    const { Alchemy, Network } = require("alchemy-sdk");
    const _alchemy = new Alchemy({
      apiKey: process.env.ALCHEMY_API_KEY, 
      network: Network.ETH_GOERLI 
    });

    const latestBlock = await _alchemy.core.getBlockNumber();
    console.log("The latest block number is", latestBlock);


    return await _alchemy.core.getAssetTransfers({
      toAddress,
      contractAddresses,
      excludeZeroValue: true,
      category: ["erc721", "erc1155", "specialnft"],
    });

  } catch (e) {
      console.error(e);
      throw e;
  }
};


/**
* Gets all NFTs currently owned by a given address
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet, Rinkeby, Kovan, Goerli, Ropsten
* Polygon: Mainnet and Mumbai
* Flow: Mainnet and Testnet (see docs here)
*
* @author Allyn j. Alford <Allyn@backpac.xyz>
* @async
* @function getNFTs
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} address -  address for NFT owner (can be in ENS format!)
* @return {Promise<Array>} Response Array
*/
module.exports.getCollections = async (chain, address) => {
  try {
    //let expired = false;
    let addresses;
    //const walletUtils = require('../wallet/utils');
    const _ = require("lodash");

    // let addressesResp = await walletUtils._getAlchemyWalletCollectionFromCache(chain, address);

    // console.log('Alchemy Wallet Collection Cache: ',addressesResp);

    //   if (typeof addressesResp !== "undefined") {
    //       addresses = addressesResp.addresses;
    //   }

    // if (typeof addresses === "undefined" | expired === true) {
    //   //Lets process the wallet list
    //   // Print total NFT count returned in the response:
    //   const nfts = await this.getNFTs(chain, address);
    //   console.log('API First Pull FULL', nfts);
    //   //Add the wallet
    //   var wallet = [...nfts.ownedNfts];

    //   console.log("API First Pull", {
    //     length: wallet.length,
    //     key: nfts.pageKey,
    //   });

    //   //Check if the list has more NFTs
    //   if (typeof nfts.pageKey !== "undefined") {
    //     const page = await this.getNFTsByPageKey(
    //       chain,
    //       address,
    //       nfts.pageKey
    //     );
    //     //console.log("Next Page", page);
    //     wallet.push(...page.ownedNfts);
    //   }



    //   //Filter out the addresses for collections
    //   addresses = _.uniq(_.map(wallet, "contract.address"));

    //   //await walletUtils._addAlchemyWalletCollectionToCache(chain, address, addresses);
    // }

    const nfts = await this.getNFTs(chain, address);

    //console.log('API First Pull FULL', typeof nfts === "undefined");
    
    var wallet = [];

    if(typeof nfts !== "undefined"){
      //Add the wallet
     wallet = [...nfts.ownedNfts];
    }

    // console.log("API First Pull", {
    //   length: wallet.length,
    //   key: nfts.pageKey,
    // });

    //Check if the list has more NFTs
    if (typeof nfts.pageKey !== "undefined") {
      const page = await this.getNFTsByPageKey(
        chain,
        address,
        nfts.pageKey
      );
      //console.log("Next Page", page);
      wallet.push(...page.ownedNfts);
    }



    //Filter out the addresses for collections
    addresses = _.uniq(_.map(wallet, "contract.address"));

    //Responses object
    let resp = [];

    //Loop the addresses and produce a NFT count
    for (const address of addresses) {

      //Count the amount of NFTs with the same contract address
      const obj = _.countBy(wallet, (rec) => {
        return rec.contract.address === address;
      });

      //Add the address tot he response with the count
      resp.push({ address, count: obj.true });

    };

    return resp;
  } catch (e) {
    console.error(e);
    throw e;
  }
};


/**
* Gets all NFTs currently owned by a given address
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet, Rinkeby, Kovan, Goerli, Ropsten
* Polygon: Mainnet and Mumbai
* Flow: Mainnet and Testnet (see docs here)
*
* @author Allyn j. Alford <Allyn@backpac.xyz>
* @async
* @function getCollectionsAndTokenIds
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} address -  address for NFT owner (can be in ENS format!)
* @return {Promise<Array>} Response Array
*/
module.exports.getCollectionsAndTokenIds = async (chain, address) => {
    try {
      //const results = await endpoint._get(`${baseURL}/getNFTs/?owner=${address}`);

      // Print total NFT count returned in the response:
      const nfts = await this.getNFTs(chain, address);
      //console.log('API First Pull FULL',nfts);
      //Add the wallet
      var wallet = [...nfts.ownedNfts];
      console.log('API First Pull',{length: wallet.length, key: nfts.pageKey});

      //Check if the list has more NFTs
      if (typeof nfts.pageKey !== "undefined") {
        const page = await this.getNFTsByPageKey(
          chain,
          address,
          nfts.pageKey
        );
        //console.log("Next Page", page);
        wallet.push(...page.ownedNfts);
      }

      const _ = require('lodash');

      //Filter out the addresses for collections
      const addresses = _.uniq(_.map(wallet, 'contract.address'));




      //Responses object
      let resp = [];

      //Loop the addresses and produce a NFT count
      for(const address of addresses){
        //Count the amount of NFTs with the same contract address
        const obj = _.countBy(wallet, (rec) => {
            return rec.contract.address === address;
        });

        const nfts = _.find(wallet, function (o) { return o.contract.address === address;  });

        console.log('nfts', nfts);

        const tokenIds = _.uniq(_.map(nfts, 'tokenId'));

        //Add the address tot he response with the count
        resp.push({address, count: obj.true});

      };

      return resp;
    } catch (e) {
        console.error(e);
        throw e;
    }
};


/**
* Gets all NFTs currently owned by a given address
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet, Rinkeby, Kovan, Goerli, Ropsten
* Polygon: Mainnet and Mumbai
* Flow: Mainnet and Testnet (see docs here)
*
* @author Allyn j. Alford <Allyn@backpac.xyz>
* @async
* @function getNFTs
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} address -  address for NFT owner (can be in ENS format!)
* @param {Array} contractAddresses -  address for NFT owner (can be in ENS format!)
* @return {Promise<Array>} Response Array
*/
module.exports.confirmNFTs = async (chain, address, contractAddresses) => {
  try {
    
   
      // Print total NFT count returned in the response:
      const results = await alchemySDK.getNftsForOwner({
        owner: address,
        'contractAddresses[]': contractAddresses,
        withMetadata: 'false',
        apiKey: alchemy
      });
     
      console.log(results);

    return results;
  } catch (e) {
      console.error(e);
      throw e;
  }
};


/**
* Gets all NFTs currently owned by a given address
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet, Rinkeby, Kovan, Goerli, Ropsten
* Polygon: Mainnet and Mumbai
* Flow: Mainnet and Testnet (see docs here)
*
* @author Allyn j. Alford <Allyn@backpac.xyz>
* @async
* @function getNFTs
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} address -  address for NFT owner (can be in ENS format!)
* @return {Promise<Array>} Response Array
*/
module.exports.getNFTs = async (chain, address) => {
    try {
      //const results = await endpoint._get(`${baseURL}/getNFTs/?owner=${address}`);
      //const walletUtils = require("../wallet/utils");

      //Call the cache to check if we have NFTs
      // let results = await walletUtils._getAlchemyWalletCollectionFromCache(
      //   chain,
      //   address
      // );

    
      // if (typeof results !== "undefined") {

      //   console.log('Alchemy Wallet NFT Cache: ', results);
      //   results = results.nfts;

      // } else {
      //   // Print total NFT count returned in the response:
      //   results = await alchemySDK.getNftsForOwner(alchemy, address);
       
      //   //Add the NFTs to the cache
      //   walletUtils._addAlchemyWalleNFTsToCache(chain, address, results);
      // }

        // Print total NFT count returned in the response:
        const results = await alchemySDK.getNftsForOwner(alchemy, address);

       
        //Add the NFTs to the cache
        //walletUtils._addAlchemyWalleNFTsToCache(chain, address, results);

      return results;
    } catch (e) {
        console.error(e);
        throw e;
    }
};


/**
* Gets all NFTs currently owned by a given address
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet, Rinkeby, Kovan, Goerli, Ropsten
* Polygon: Mainnet and Mumbai
* Flow: Mainnet and Testnet (see docs here)
*
* @author Allyn j. Alford <Allyn@backpac.xyz>
* @async
* @function getNFTsByPageKey
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} address - address for NFT owner (can be in ENS format!)
* @param {String} pageKey - UUID for pagination. If more results are available, a UUID pageKey will be returned in the response. Pass that UUID into pageKey to fetch the next 100 NFTs. NOTE: pageKeys expire after 10 minutes.
* @return {Promise<Array>} Response Array
*/
module.exports.getNFTsByPageKey = async (chain, address, pageKey) => {
    try {

        //const results = await endpoint._get(`${baseURL}/getNFTs/?owner=${address}&pageKey=${pageKey}`);
        const results = await alchemySDK.getNftsForOwner(alchemy, address, {pageKey});

        return results;

    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Gets all NFTs currently owned by a given address
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet, Rinkeby, Kovan, Goerli, Ropsten
* Polygon: Mainnet and Mumbai
* Flow: Mainnet and Testnet (see docs here)
*
* @author Allyn j. Alford <Allyn@backpac.xyz>
* @async
* @function getNFTsByContract
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} address - address for NFT owner (can be in ENS format!)
* @param {Array} contractAddresses - array of contract addresses to filter the responses with. Max limit 20 contracts
* @return {Promise<Array>} Response Array
*/
module.exports.getNFTsByContract = async (chain, address, contractAddresses) => {
    try {

        //We need to call the cache to check if we have data, then filter out the NFTs
        // const alchemy = alchemySDK.initializeAlchemy(settings);
        //const alchemy = new Alchemy(settings);

        // alchemy
        //     .getNftsForOwner("0xC33881b8FD07d71098b440fA8A3797886D831061", {
        //         contractAddresses: [
        //             "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85",
        //             "0x76be3b62873462d2142405439777e971754e8e77",
        //         ],
        //     })
        //     .then(console.log);
        
        console.log('getNFTsByContract',{contractAddresses})
        const results = await alchemySDK.getNftsForOwner(alchemy, address, {contractAddresses});

        return results;

    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Gets the metadata associated with a given NFT.
*
* @author Allyn j. Alford <Allyn@backpac.xyz>
* @async
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress - NFT Contract Address
* @param {String} tokenId - the id of the NFT token
* @param {String} tokenType - erc721 | erc1155
* @return {Promise<Array>} Response Array
*/
module.exports.isHolderOfCollection = async (chain, wallet, contractAddress) => {
  try {
    alchemySDK.isHolderOfCollection()

      //const results = await endpoint._get(`${baseURL}/getNFTMetadata/?contractAddress=${contractAddress}&tokenId=${tokenId}&tokenType=${tokenType}`);
      const holder = await alchemySDK.isHolderOfCollection(
          alchemy,
          wallet,
          contractAddress
      );

      return holder;

  } catch (e) {
      console.error(e);
      throw e;
  }
};

/**
* Gets the metadata associated with a given NFT.
*
* @author Allyn j. Alford <Allyn@backpac.xyz>
* @async
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress - NFT Contract Address
* @param {String} tokenId - the id of the NFT token
* @param {String} tokenType - erc721 | erc1155
* @return {Promise<Array>} Response Array
*/
module.exports.getNFTMetadata = async (chain, contractAddress, tokenId, tokenType) => {
    try {

        //const results = await endpoint._get(`${baseURL}/getNFTMetadata/?contractAddress=${contractAddress}&tokenId=${tokenId}&tokenType=${tokenType}`);
        const results = await alchemySDK.getNftMetadata(
            alchemy,
            contractAddress,
            tokenId,
            tokenType
        );

        return results;

    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Queries NFT high-level collection/contract level information
*
* @author Allyn j. Alford <Allyn@backpac.xyz>
* @async
* @function getContractMetadata
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress - NFT Contract Address
* @return {Promise<Array>} Response Array
*/
module.exports.getContractMetadata = async (chain, contractAddress) => {
    try {
        const results = await endpoint._get(`${baseURL}/getContractMetadata/?contractAddress=${contractAddress}`);

        // {
        //     "address": "0x004dd1904b75b7e8a46711dde8a0c608578e0302",
        //     "contractMetadata": {
        //         "name": "JetPack420",
        //         "symbol": "DCL-JTPCK420",
        //         "totalSupply": "307",
        //         "tokenType": "erc721"
        //     }
        // }

        return results.data;

    } catch (e) {
        console.error(e.message);
        throw e;
    }
};


/**
* Returns whether a contract is marked as spam or not by Alchemy
*
* @author Allyn j. Alford <Allyn@backpac.xyz>
* @async
* @function isSpamContract
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress - NFT Contract Address
* @return {Promise<Array>} Response Array
*/
module.exports.isSpamContract = async (chain, contractAddress) => {
    try {

        const results = await endpoint._get(`${baseURL}/isSpamContract/?contractAddress=${contractAddress}`);

        return results;

    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Returns the floor prices of a NFT collection by marketplace
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet
*
* @author Allyn j. Alford <Allyn@backpac.xyz>
* @async
* @function getFloorPrice
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress - NFT Contract Address
* @return {Promise<Array>} Response Array
*/
module.exports.getFloorPrice = async (chain, contractAddress) => {
    try {
        const results = await endpoint._get(`${baseURL}/getFloorPrice/?contractAddress=${contractAddress}`);
        return results.data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Get the owner(s) for a token.
* This endpoint is supported on the following chains and networks:
* Ethereum: Mainnet, Goerli
* Polygon: Mainnet and Mumbai
* https://docs.alchemy.com/alchemy/enhanced-apis/nft-api/getOwnersForToken
* @author Allyn j. Alford <Allyn@backpac.xyz>
* @async
* @function getOwnersForToken
* @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
* @param {String} contractAddress - The address of the contract that the token belongs to. We currently support both ERC721 and ERC1155 contracts.
* @param {String} tokenId The ID of the token. Can be in hex or decimal format.
* @return {Promise<Array>} Response Array
*/
module.exports.getOwnersForToken = async (chain, contractAddress, tokenId) => {
    try {

        //const results = await endpoint._get(`${baseURL}/getOwnersForToken/?contractAddress=${contractAddress}&tokenId=${tokenId}`);
        const results = await alchemySDK.getOwnersForNft(
            alchemy,
            contractAddress,
            tokenId
          );
        return results;

    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
* Returns the current price per gas in wei.
* @author Allyn j. Alford <Allyn@backpac.xyz>
* @async
* @function gasPrice
* @return {Promise<BigInt>} integer of the current gas price in wei.
* // {
        //   "jsonrpc": "2.0",
        //   "id": 0,
        //   "result": "0x98bca5a00"
        // }
*/
module.exports.gasPrice = async () => {
  try {
      //const ethers = require('ethers');

      //const provider = new ethers.providers.AlchemyProvider("homestead", process.env.ALCHEMY_API_KEY);

	    // Query the blockchain (replace example parameters)
    	//const gasPrice = await provider.gasPrice(); 

      //const gasPrice = await alchemySDK.gasPrice();
        // {
        //   "jsonrpc": "2.0",
        //   "id": 0,
        //   "result": "0x98bca5a00"
        // }

     //const gasPrice = BigInt(gasPrice.result).toString();

     const gasPrice = await endpoint._post(`https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`, {
       jsonrpc: "2.0",
       method: "eth_gasPrice",
       params: [],
       id: 0,
     });

     console.log('gasPrice', gasPrice);

      return gasPrice.data.result;
  } catch (e) {
      console.error(e);
      throw e;
  }
};