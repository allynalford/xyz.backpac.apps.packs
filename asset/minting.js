'use strict';
const log = require('lambda-log');
const dateFormat = require('dateformat');

function CustomError(name, message) {
    this.name = name;
    this.message = message;
}
CustomError.prototype = new Error();

module.exports.mintStart = async (event) => {
  let req, chainDeveloperuuid, mintId, developeruuid, username, dt;

  try {
    //req = event.body !== "" ? JSON.parse(event.body) : event;
    req = event;
    log.options.tags = ["log", "<<level>>"];
    dt = dateFormat(new Date(), "isoUtcDateTime");

    developeruuid = req.developeruuid;
    mintId = req.mintId;
    chainDeveloperuuid = req.chainDeveloperuuid;
    username = req.username;

    if (typeof developeruuid === "undefined")
      throw new Error("developeruuid is undefined");

    if (typeof mintId === "undefined")
      throw new Error("mintId is undefined");

    if (typeof chainDeveloperuuid === "undefined")
      throw new Error("chainDeveloperuuid is undefined");

    if (typeof username === "undefined")
      throw new Error("username is undefined");

  } catch (e) {
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

  try {
    console.log("Checking Wallet Exists", { chainDeveloperuuid, mintId, developeruuid });

    const chain = chainDeveloperuuid.split(":")[0];

    //Let's make sure we have a wallet
    const DeveloperPack = require('../model/DeveloperPack');

    const _DeveloperPack = new DeveloperPack(chain, developeruuid);
    await _DeveloperPack.setHash();
    const exists = await _DeveloperPack.exists();

    if(typeof exists === "undefined"){
      console.info("No Wallet Exists", { chainDeveloperuuid, mintId, developeruuid, username });
      return { hasWallet: "false", chainDeveloperuuid, mintId, developeruuid, username };
    }

    console.info("Wallet Exists", { chainDeveloperuuid, mintId, developeruuid, username });

    return {hasWallet: "true", chainDeveloperuuid, mintId, developeruuid, username };

  } catch (e) {
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }
};

module.exports.assetMetaData = async (event) => {
  let req, dt, chainDeveloperuuid, mintId, developeruuid, username;
  try {
    //req = event.body !== "" ? JSON.parse(event.body) : event;
    req = event;
    log.options.tags = ["log", "<<level>>"];
    dt = dateFormat(new Date(), "isoUtcDateTime");

    //Required
    developeruuid = req.developeruuid;
    mintId = req.mintId;
    chainDeveloperuuid = req.chainDeveloperuuid; //Public URL of image for NFT
    username = req.username;


    if (typeof developeruuid === "undefined") throw new Error("developeruuid is undefined");
    if (typeof mintId === "undefined") throw new Error("mintId is undefined");
    if (typeof chainDeveloperuuid === "undefined") throw new Error("chainDeveloperuuid is undefined");
    if (typeof username === "undefined") throw new Error("username is undefined");


  } catch (e) {
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

  try {

    //Let's grab the mint we are processing

    //Extract the chain
    const chain = chainDeveloperuuid.split(":")[0];

    //init module
    const Mint = require('../model/Mint');

    //init object
    const mint = new Mint(developeruuid, chain, null, null, mintId);

    console.info('Getting Mint');
    //fill object from database
    await mint.get();

    //console.log(mint);

    await mint._updateFields(mint, [
      { name: "stage", value: "META_DATA"},
    ]);

    //Set values from mint
    const {
      contractId,
      image,
      external_url,
      description,
      name,
      attributes,
      background_color,
      animation_url,
      youtube_url,
    } = mint;

    //need ipfs module
    const IPFS = require('../model/IPFS');

    //IPFS object for the image
    const ipfs = new IPFS();

    //Use the name as the file name for the JSON and image file
    //Replace all spaces with a hyphen
    const fileName = name.replace(/\s+/g, '-');

    //need the path module to get the file ext
    var path = require('path');
    console.info('Building Keys');
    //Image
    const imageKey = `${developeruuid}/${contractId}/${fileName}${path.extname(image)}`;

    //Metadata
    const metaDataKey = `${developeruuid}/${contractId}/${fileName}.json`;

    //Down the file from the URL and add it to S3
    console.info('Downloading image to s3', image);
    await ipfs.getImageByUrl(image, imageKey);

    //Upload the file image from s3 to IPFS
    console.info('Uploading image from s3 to IPFS', imageKey);
    await ipfs.addKey(mintId);

    //Build the metadata for the NFT
    const NFTMetadata = require('../model/NFTMetadata');

    //Build the URL for the image within the metadata
    const nftImage = ipfs.getPublicURL();

    //Pass all info to the object for creation
    console.info('Building metadata for image:', nftImage);
    let metadata = new NFTMetadata(nftImage, null, external_url, description, name, attributes, background_color, animation_url, youtube_url);
    
    console.info('metadata', metadata);

    //Build the IPFS object for the metadata
    const metedataIPFS = new IPFS();

    //Add the metadata to S3 for the image
    console.info('Saving metadata to s3..');
    await metedataIPFS.addMetadata(metadata, metaDataKey);

    //Add the metadata to IPFS from s3
    console.info('Uploading metadata from s3 to IPFS...');
    await metedataIPFS.addMetadataKey(mintId);


    //Update the mint
    console.info('Updating mint.....');

    await mint._updateFields(mint, [
      { name: "imageURL", value: ipfs.getPublicURL() },
      { name: "imageKey", value: ipfs.getKey() },
      { name: "imageCID", value: ipfs.getHash() },
      { name: "metadata", value: metadata },
      { name: "metadataURL", value: metedataIPFS.getPublicURL() },
      { name: "metadataKey", value: metedataIPFS.getKey()},
      { name: "metadataCID", value: metedataIPFS.getHash()}
    ]);


    console.log('Response: ', {chainDeveloperuuid, mintId, developeruuid, username, ready: "true", dt});


    return {chainDeveloperuuid, mintId, developeruuid, username, ready: "true", dt}

  } catch (e) {
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }
};


module.exports.estimateFees = async (event) => {
  let req, dt, chainDeveloperuuid, mintId, developeruuid, username;
  try {
    //req = event.body !== "" ? JSON.parse(event.body) : event;
    req = event;
    dt = dateFormat(new Date(), "isoUtcDateTime");
    developeruuid = req.developeruuid;
    mintId = req.mintId;
    chainDeveloperuuid = req.chainDeveloperuuid;
    username = req.username;

    if (typeof developeruuid === "undefined") throw new Error("developeruuid is undefined");
    if (typeof chainDeveloperuuid === "undefined") throw new Error("chainDeveloperuuid is undefined");
    if (typeof mintId === "undefined") throw new Error("mintId is undefined");
    if (typeof username === "undefined") throw new Error("username is undefined");

  } catch (e){
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

  try {
   
    const DeveloperPack = require('../model/DeveloperPack');
    const chain = chainDeveloperuuid.split(":")[0];

    console.log('Getting Backpac for:', {chain, developeruuid});

    const _DeveloperPack = new DeveloperPack(chain, developeruuid);

    await _DeveloperPack.setHash();
    await _DeveloperPack.get();

    //console.log('_DeveloperPack', _DeveloperPack);

    //check the wallet balanace
    const ethers = require('ethers');

    console.info('Creating Signer');
    const signer = new ethers.Wallet(_DeveloperPack.pv); 
    


    //Let's grab the mint we are processing

    //init module
    const Mint = require('../model/Mint');

    //init object
    const mint = new Mint(developeruuid, chain, null, null, mintId);

    //fill object from database
    console.info('Filling Mint Object');
    await mint.get();

    console.info('Updating Mint STAGE');
    await mint._updateFields(mint, [
      { name: "stage", value: "ESTIMATING"},
    ]);

    //console.log(mint)

    //Set values from mint
    const { contractId } = mint;



    const DeveloperContract = require('../model/DeveloperContract');
    const _DeveloperContract = new DeveloperContract(developeruuid, chain, contractId);
    console.info('fIlling Developer Contract');
    await _DeveloperContract.get();

    //console.log('_DeveloperContract', _DeveloperContract);



    const User = require('../model/User');

    let user = {};

    console.info('Checking Recipient Type');
    //Check if the process is by email or wallet
    if(mint.recipientType === "email"){
      //Build the object
      user = new User(undefined, undefined, mint.recipient, undefined, undefined, undefined);
      //Fill will data
      await user.getByEmail();
    }else{
      user = new User(undefined, null, mint.recipient);
    }

    console.log('recipient address', user.address);

    //Update the mint to the address of the user
    await mint._updateFields(mint, [
      { name: "recipientAddress", value: user.address },
    ]);
    
    
    //Build a connection to the chain
    let provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_HTTP,)
    //let provider =  new ethers.providers.AlchemyProvider(process.env.STAGE, process.env.ALCHEMY_API_KEY);

    //Get the balance of the minting wallet
    const balance = await provider.getBalance(_DeveloperPack.as);

    //Convert the balance to be readable
    const addressBalance = ethers.utils.formatEther(balance)
    
    //Print the balance
    console.info(`Address Balance( ${_DeveloperPack.as}):`, addressBalance);

    //We need the data for the contract we are interacting with
    const contractData =  require("../contracts/Backpac.json");

    //Connect the wallet to the chain
    const account = signer.connect(provider);

    //Build the contract interface
    const contract = new ethers.Contract(_DeveloperContract.contractAddress, contractData.abi, account);

    //Set the gas limit for the transaction
    
    const gas_price = await provider.getGasPrice();

    //let gas_limit = gas_price * 2;
    let gas_limit = "0x500000";
    //Print the gas
    console.info('gas_price', ethers.utils.formatEther(gas_price));

    //Start the estimate
    console.info('Estimating.....');

    const estimatedGas = await contract.estimateGas.safeMint(
      user.address,
      mint.metadataCID,
      {
        gasLimit: ethers.utils.hexlify(gas_limit),
        nonce: await provider.getTransactionCount(_DeveloperPack.as, "latest"),
        value: 0,
        gasPrice: gas_price,
      }
    );


    await mint._updateFields(mint, [
      { name: "estimatedGas", value: estimatedGas},
    ]);

    const gasEstimate = ethers.utils.formatEther(estimatedGas);

    await mint._updateFields(mint, [
      { name: "estimatedGas", value: gasEstimate},
    ]);
   
    console.info('Gas Estimate vs Balance', {gasEstimate, addressBalance});
    //console.info('Gas Balance Needed', {gasNeeded: (gasEstimate * gas_limit), addressBalance});

    let transferred = "false";

    //if user wallet has less then the gas Estimate, top them up
    if (addressBalance <= gasEstimate) {
      //Grab a Packmaster and transfer the whats needed
      const PackMaster = require("../model/PackMaster");

      const _PackMaster = new PackMaster(chain);

      await _PackMaster.current();

      let wallet = new ethers.Wallet(_PackMaster.pv);

      let walletSigner = wallet.connect(provider);

      const gas_price = await provider.getGasPrice(); // gasPrice

      console.log(gas_price);

  

      const tx = await walletSigner.sendTransaction({
        from: _PackMaster.as,
        to: _DeveloperPack.as,
        value: ethers.utils.parseEther(gasEstimate + 0.001),
        nonce: await provider.getTransactionCount(_PackMaster.as, "latest"),
        gasLimit: ethers.utils.hexlify(gas_limit), // 100000
        gasPrice: gas_price,
      });

      console.log(tx);

      transferred = "true";
    }else{
      console.info("User can cover deployment", {addressBalance, gasEstimate})
    }
   

    return {hasGas: "true", transferred, dt, chainDeveloperuuid, contractId, developeruuid};

  }catch (e) {
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

};


module.exports.mint = async (event) => {
  let req, dt, chainDeveloperuuid, mintId, developeruuid, username;
  try {
    //req = event.body !== "" ? JSON.parse(event.body) : event;
    req = event;
    dt = dateFormat(new Date(), "isoUtcDateTime");
    developeruuid = req.developeruuid;
    mintId = req.mintId;
    chainDeveloperuuid = req.chainDeveloperuuid;
    username = req.username;

    if (typeof developeruuid === "undefined") throw new Error("developeruuid is undefined");
    if (typeof chainDeveloperuuid === "undefined") throw new Error("chainDeveloperuuid is undefined");
    if (typeof mintId === "undefined") throw new Error("mintId is undefined");
    if (typeof username === "undefined") throw new Error("username is undefined");

  } catch (e){
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

  try {
    const DeveloperPack = require("../model/DeveloperPack");
    const chain = chainDeveloperuuid.split(":")[0];

    console.log("Getting Backpac for:", { chain, developeruuid });

    const _DeveloperPack = new DeveloperPack(chain, developeruuid);

    await _DeveloperPack.setHash();
    await _DeveloperPack.get();

    //console.log('_DeveloperPack', _DeveloperPack);

    //check the wallet balanace
    const ethers = require("ethers");

    //Create a signer from the wallet
    const signer = new ethers.Wallet(_DeveloperPack.pv);

    //Let's grab the mint we are processing

    //init module
    const Mint = require("../model/Mint");

    //init object
    const mint = new Mint(developeruuid, chain, null, null, mintId);

    //fill object from database
    await mint.get();

    //console.log(mint);

    await mint._updateFields(mint, [
      { name: "stage", value: "MINTING"},
    ]);

    //Set values from mint
    const { contractId } = mint;

    const DeveloperContract = require("../model/DeveloperContract");
    const _DeveloperContract = new DeveloperContract(
      developeruuid,
      chain,
      contractId
    );
    await _DeveloperContract.get();

    //console.log('_DeveloperContract', _DeveloperContract);

    let provider = new ethers.providers.AlchemyProvider(
      process.env.STAGE,
      process.env.ALCHEMY_API_KEY
    );
    const balance = await provider.getBalance(_DeveloperPack.as);

    const addressBalance = ethers.utils.formatEther(balance);

    console.info(`Address Balance( ${_DeveloperPack.as}):`, addressBalance);

    const contractData = require("../contracts/Backpac.json");

    const account = signer.connect(provider);

    const contract = new ethers.Contract(
      _DeveloperContract.contractAddress,
      contractData.abi,
      account
    );

    let gas_limit = "0x500000";
    const gas_price = await provider.getGasPrice();

    console.info("gasEstimate", mint.estimatedGas);

    //let gas_limit = gas_price.mul(1);
    //let gas_limit = gas_price;

    console.info("gas_price", ethers.utils.formatEther(gas_price));
    console.info("gas_limit", ethers.utils.formatEther(gas_limit));

    console.info("Minting Asset..... to: ", mint.recipientAddress);

    const mintAssetTx = await contract.safeMint(
      mint.recipientAddress,
      mint.metadataCID,
      {
        gasLimit: ethers.utils.hexlify(gas_limit),
        nonce: await provider.getTransactionCount(_DeveloperPack.as, "latest"),
        value: 0,
        gasPrice: gas_price,
      }
    );

    console.log('Mint Asset Tx', mintAssetTx);

    //Update the mint to the address of the user
    await mint._updateFields(mint, [
      { name: "txHash", value: mintAssetTx.hash },
    ]);

    const receipt = await mintAssetTx.wait();

    console.info("receipt", receipt);
    console.info("transactionHash", receipt.transactionHash);

    // //Update the mint to the address of the user
    await mint._updateFields(mint, [
      { name: "stage", value: "MINTED" },
      { name: "receiptTxHash", value: receipt.transactionHash },
    ]);

    

     const alchemy = require("../common/alchemy");
     const _ = require("lodash");

     const transfers = await alchemy.getAssetTransfers(mint.recipientAddress, [_DeveloperContract.contractAddress]);

     const transferTx = _.find(transfers.transfers, { 'hash': mintAssetTx.hash });

     

     const tokenId = BigInt(transferTx.tokenId).toString();

     console.log('tokenId:', tokenId);

     await mint._updateFields(mint, [
      { name: "tokenId", value: tokenId },
     ]);

     const DigitalAsset = require("../model/DigitalAsset");
     const asset = new DigitalAsset(
       chain,
       _DeveloperContract.contractAddress,
       typeof erc721TokenId !== "undefined" ? "erc721" : "erc1155",
       tokenId,
       null,
       mint.description,
       mint.name,
       mint.hash,
       mint.external_url,
       mint.attributes,
       mint.animation_url,
       mint.youtube_url
     );

     console.log(asset);

     await asset.save();

     const minted = true;


    return {
      minted,
      dt,
      chainDeveloperuuid,
      mintId,
      developeruuid,
    };
  }catch (e) {
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

};

module.exports.mintTxWait = async (event) => {
  let req, dt, chainDeveloperuuid, mintId, developeruuid;
  try {
    //req = event.body !== "" ? JSON.parse(event.body) : event;
    req = event;
    dt = dateFormat(new Date(), "isoUtcDateTime");
    developeruuid = req.developeruuid;
    mintId = req.mintId;
    chainDeveloperuuid = req.chainDeveloperuuid;

    if (typeof developeruuid === "undefined") throw new Error("developeruuid is undefined");
    if (typeof chainDeveloperuuid === "undefined") throw new Error("chainDeveloperuuid is undefined");
    if (typeof mintId === "undefined") throw new Error("mintId is undefined");
   

  } catch (e){
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

  try {
  
    //Needs to be passed in o pulled from mint
    const chain = chainDeveloperuuid.split(":")[0];

    console.log("Checking Mint State for:", { mintId, chain, developeruuid });


    //Let's grab the mint we are processing

    //init module
    const Mint = require("../model/Mint");

    //init object
    const mint = new Mint(developeruuid, chain, null, null, mintId);

    //fill object from database
    await mint.get();


    //Set values from mint
    const { contractId } = mint;

    const DeveloperContract = require("../model/DeveloperContract");
    const _DeveloperContract = new DeveloperContract(
      developeruuid,
      chain,
      contractId
    );
    await _DeveloperContract.get();


     const alchemy = require("../common/alchemy");
     const _ = require("lodash");

     const transfers = await alchemy.getAssetTransfers(mint.recipientAddress, [_DeveloperContract.contractAddress]);

     const transferTx = _.find(transfers.transfers, { 'hash': mint.txHash });

     

     const tokenId = BigInt(transferTx.tokenId).toString();

     console.log('tokenId:', tokenId);

     await mint._updateFields(mint, [
      { name: "tokenId", value: tokenId },
     ]);

     const DigitalAsset = require("../model/DigitalAsset");
     const asset = new DigitalAsset(
       chain,
       _DeveloperContract.contractAddress,
       typeof erc721TokenId !== "undefined" ? "erc721" : "erc1155",
       tokenId,
       null,
       mint.description,
       mint.name,
       mint.hash,
       mint.external_url,
       mint.attributes,
       mint.animation_url,
       mint.youtube_url
     );

     console.log(asset);

     await asset.save();

     const minted = true;


    return {
      dt,
      chainDeveloperuuid,
      mintId,
      developeruuid,
    };
  }catch (e) {
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

};

module.exports.stop = async (event) => {
    log.options.tags = ['log', '<<level>>'];
    log.info('event', event);

    try {



        return { stop: true };
    } catch (e) {
        log.error(e);
        return e;
    }
};
// {
//     "version":"0",
//     "id":"dd8f2f53-3c6e-43b6-d5b5-312ec08a2e1a",
//     "detail-type":"Step Functions Execution Status Change",
//     "source":"aws.states",
//     "account":"177038571739",
//     "time":"2022-05-18T01:25:09Z",
//     "region":"us-east-1",
//     "resources":[
//        "arn:aws:states:us-east-1:177038571739:execution:shopifySetupStateMachine-remediation-dev:defbf3a9-4962-440a-90a3-7011a5b3944f"
//     ],
//     "detail":{
//        "executionArn":"arn:aws:states:us-east-1:177038571739:execution:shopifySetupStateMachine-remediation-dev:defbf3a9-4962-440a-90a3-7011a5b3944f",
//        "stateMachineArn":"arn:aws:states:us-east-1:177038571739:stateMachine:shopifySetupStateMachine-remediation-dev",
//        "name":"defbf3a9-4962-440a-90a3-7011a5b3944f",
//        "status":"FAILED",
//        "startDate":1652837103848,
//        "stopDate":1652837109161,
//        "input":"{\"domainglobaluuid\":\"2951ef5c-2e98-4f41-8cda-1b091e61301e\",\"companyglobaluuid\":\"7e36dba0-3a3a-11ea-95f7-c5b273ab0a92\"}",
//        "output":null,
//        "inputDetails":{
//           "included":true
//        },
//        "outputDetails":null
//     }
//  }
module.exports.notification = async event => {

    log.options.tags = ['log', '<<level>>'];
    log.info(event);

    //const input = JSON.parse(event.detail.input);

    //log.info(input);




    return { event }
};



