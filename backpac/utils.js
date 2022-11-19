"use strict";
const ethers = require("ethers");

/**
 * returns transaction data about the purchase of the NFT
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function _createWallet
 * @return {Promise<Array>} Response Array OF Wallet details
 */
 module.exports._createWallet = async () => {
    try {
        //const wallet = ethers.Wallet.createRandom();
        return ethers.Wallet.createRandom();
    } catch (e) {
        console.error(e);
    }
};

/**
 * returns transaction data about the purchase of the NFT
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function _createWallet
 * @param {String} address - ethereum wallet address. the string representing the address to check for balance
 * @param {String} page - the integer page number, if pagination is enabled
 * @param {String} offset - the number of transactions displayed per page
 * @return {Promise<Array>} Response Array for next step to process.
 */
module.exports._estimateAssetTransfer = async (contractAddress, tokenId, originAddress, destinationAddress) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_API_URL);

        //Use the Origin address to lookup the pri_va_te K_E_Y
        const PRI_K = "";

        //Use the contract Address to lookup the ABI
        const contract = {};

        const wallet = new ethers.Wallet(PRI_K, provider);
        //Get gas price
        const gasPrice = await provider.getGasPrice();
        //Grab contract ABI and create an instance
        const nftContract = new ethers.Contract(
            contractAddress,
            contract.abi,
            wallet
        );
        //Estimate gas limit
        return await nftContract.estimateGas["safeTransferFrom(address,address,uint256)"](originAddress, destinationAddress, tokenId, { gasPrice });
    } catch (e) {
        console.error(e);
    }
};

/**
 * returns transaction data about the purchase of the NFT
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function _estimateMint
 * @param {String} address - ethereum wallet address. the string representing the address to check for balance
 * @param {String} page - the integer page number, if pagination is enabled
 * @param {String} offset - the number of transactions displayed per page
 * @return {Promise<Array>} Response Array for next step to process.
 */
 module.exports._estimateMint = async (contractAddress, destinationAddress, quantity) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_API_URL);

        //Use the Origin address to lookup the pri_va_te K_E_Y
        const PRI_K = "";

        //Use the contract Address to lookup the ABI
        const contract = {};

        const wallet = new ethers.Wallet(PRI_K, provider);
        //Get gas price
        const gasPrice = await provider.getGasPrice();
        //Grab contract ABI and create an instance
        const nftContract = new ethers.Contract(
            contractAddress,
            contract.abi,
            wallet
        );
        //Estimate gas limit
        return await nftContract.estimateGas["mint(address,address, uint256)"](contractAddress, destinationAddress, quantity, { gasPrice });
    } catch (e) {
        console.error(e);
    }
};

/**
 * returns transaction data about the purchase of the NFT
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function _createWallet
 * @param {String} address - ethereum wallet address. the string representing the address to check for balance
 * @param {String} page - the integer page number, if pagination is enabled
 * @param {String} offset - the number of transactions displayed per page
 * @return {Promise<Array>} Response Array for next step to process.
 */
 module.exports._AssetTransfer = async (contractAddress, tokenId, originAddress, destinationAddress) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_API_URL);

        //Use the Origin address to lookup the pri_va_te K_E_Y
        const PRI_K = "";

        //Use the contract Address to lookup the ABI
        const contract = {};

        const wallet = new ethers.Wallet(PRI_K, provider);
        //Get gas price
        const gasPrice = await provider.getGasPrice();
        //Grab contract ABI and create an instance
        const nftContract = new ethers.Contract(
            contractAddress,
            contract.abi,
            wallet
        );
        //Estimate gas limit
        const gasLimit = await nftContract.estimateGas["safeTransferFrom(address,address,uint256)"](originAddress, destinationAddress, tokenId, { gasPrice });

        //Call the safetransfer method
        const transaction = await nftContract["safeTransferFrom(address,address,uint256)"](originAddress, destinationAddress, tokenId, { gasLimit });
       
        //Wait for the transaction to complete
        return await transaction.wait();
   
    } catch (e) {
        console.error(e);
    }
};


/**
 * returns transaction data about the purchase of the NFT
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function _createWallet
 * @param {String} address - ethereum wallet address. the string representing the address to check for balance
 * @param {String} page - the integer page number, if pagination is enabled
 * @param {String} offset - the number of transactions displayed per page
 * @return {Promise<Array>} Response Array for next step to process.
 */
 module.exports._transferNFT = async (address, page, offset) => {
    try {
        const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=account&action=addresstokenbalance&address=${address}&page=${page}&offset=${offset}apikey=${process.env.API_KEY_TOKEN}`);
        return response.data;
    } catch (e) {
        console.error(e);
    }
};


/**
 * returns transaction data about the purchase of the NFT
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function _createWallet
 * @param {String} address - ethereum wallet address. the string representing the address to check for balance
 * @param {String} page - the integer page number, if pagination is enabled
 * @param {String} offset - the number of transactions displayed per page
 * @return {Promise<Array>} Response Array for next step to process.
 */
 module.exports._createWallet2 = async (address, page, offset) => {
    try {
        const response = await endpoint._get(`${process.env.ETHERSCAN_API_URL}?module=account&action=addresstokenbalance&address=${address}&page=${page}&offset=${offset}apikey=${process.env.API_KEY_TOKEN}`);
        return response.data;
    } catch (e) {
        console.error(e);
    }
};