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
    req = event.body !== "" ? JSON.parse(event.body) : event;
    //req = event;
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
    const chain = chainDeveloperuuid.split(":")[0];
    const Mint = require('../model/Mint');
    const mint = new Mint(developeruuid, chain, mintId);
    await mint.get();

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


    const IPFS = require('../model/IPFS');

    //IPFS object for the image
    const ipfs = new IPFS();

    //We need a unqiuekey for the image and the JSON file
    //We use the dev uuid and the contractId as the folders
    const key = `${developeruuid}/${contractId}`;

    //Use the name as the file name for the JSON and image file
    const fileName = name.replace(/\s+/g, '-');
    var path = require('path');

    //Image
    const imageKey = `${key}/${fileName}${path.extname(image)}`;

    //Metadata
    const metaDataKey = `${key}/${fileName}.json`;

    //Down the file from the URL and add it to S3
    await ipfs.getImageByUrl(image, imageKey);

    //Upload the file image from s3 to IPFS
    await ipfs.addKey();

    //Build the metadata for the NFT
    const NFTMetadata = require('../model/NFTMetadata');

    //Build the URL for the image within the metadata
    const nftImage = ipfs.getPublicURL();

    //Pass all info to the object for creation
    let metadata = new NFTMetadata(nftImage, null, external_url, description, name, attributes, background_color, animation_url, youtube_url);
    
    //Build the IPFS object for the metadata
    const metedataIPFS = new IPFS();

    //Add the metadata to S3 for the image
    await metedataIPFS.addMetadata(metadata, metaDataKey);

    //Add the metadata to IPFS from s3
    await metedataIPFS.addKey();


    await mint._updateFields(mint, [
      { name: "imageURL", value: ipfs.getPublicURL() },
      { name: "imageKey", value: ipfs.getKey() },
      { name: "imageCID", value: ipfs.getHash() },
      { name: "metadata", value: metadata },
      { name: "metadataURL", value: metedataIPFS.getPublicURL() },
      { name: "metadataKey", value: metedataIPFS.getKey()},
      { name: "metadataCID", value: metedataIPFS.getHash()},
    ]);



    console.log('Response: ', {chainDeveloperuuid, mintId, developeruuid, username, ready: "true", dt});


    return {chainDeveloperuuid, mintId, developeruuid, username, ready: "true", dt}

  } catch (e) {
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }
};


module.exports.createDeveloperWallet = async (event) => {
  let req, dt, chain, developeruuid, name;
  try {
    //req = event.body !== "" ? JSON.parse(event.body) : event;
    req = event;
    dt = dateFormat(new Date(), "isoUtcDateTime");
    developeruuid = req.developeruuid;
    chain = req.chain;

    if (typeof developeruuid === "undefined") throw new Error("developeruuid is undefined");
    if (typeof chain === "undefined") throw new Error("chain is undefined");

  } catch (e){
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

  try {
   
    const DeveloperPack = require('../model/DeveloperPack');

    console.log('Creating Backpac for:', {chain, developeruuid});

    const _DeveloperPack = new DeveloperPack(chain, developeruuid);

    const wallet = await _DeveloperPack.createWallet();

    //console.log('_DeveloperPack', _DeveloperPack);

    console.log('wallet Address', wallet.address);


    return { error: false, success: true, dt};

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



