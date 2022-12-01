'use strict';
const dateFormat = require('dateformat');
const log = require('lambda-log');
 


/**
 * constructor for IPFS Object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function IPFS
 * @param {String} IPFS_PROJECT_ID - eth | poly
 * @param {String} IPFS_PROJECT_KEY - did:ethr:0x76f65345F81011eC2d76A15761Ba3f3638646DA1
 * @param {String} name - 
 * @param {String} userUUID 
 * @example <caption>Example usage of Contract Object.</caption>
 * @return {Pack} Pack Instance Object
 */
function IPFS(_IPFS_PROJECT_ID, _IPFS_PROJECT_KEY) { 

    this.IPFS_PROJECT_ID = _IPFS_PROJECT_ID || process.env.IPFS_PROJECT_ID;
    this.IPFS_PROJECT_KEY = _IPFS_PROJECT_KEY || process.env.IPFS_PROJECT_KEY;

    this.dt =  dateFormat(new Date(), "isoUtcDateTime");

    // const ipfsClient = require('ipfs-http-client');
    // const http = require('http');
    // const Agent = new http.Agent({ });

    // this.client = ipfsClient.create({
    //     host: process.env.IPFS_GATEWAY_HOST,
    //     port: process.env.IPFS_PORT,
    //     protocol: 'http',
    //     agent: Agent,
    //     headers: {
    //         authorization: 'Basic ' + Buffer.from(process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_PROJECT_KEY).toString('base64'),
    //     },
    // });
}

/**
 * get an image by URL and add it to S3
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @param {String} url - URL of the image or file
 * @param {String} Key Key to store the file in S3 under 
 * @function getImageByUrl
 * @requires module:axios
 * @requires module:aws-sdk/client-s3
 * @example <caption>Example usage of getAuth.</caption>
 * @return {Promise<String>} Automation Object
 */
IPFS.prototype.getImageByUrl = async function (url, Key) {
  try {
    const Axios = require("axios");
    const response = await Axios({
      url,
      decompress: false,
      method: "GET",
      responseType: "arraybuffer",
    });

    this.key = Key;
    this.url = url;

    const s3Utils = require("../common/s3Utils");

    await s3Utils._put({
      Bucket: process.env.ASSET_UPLOAD_BUCKET,
      Key,
      Body: response.data,
    });
  } catch (e) {
    log.error(e);
    throw e;
  }

  return Key;
};

/**
 * get an image by URL and add it to S3
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @param {NFTMetadata} metadata - URL of the image or file
 * @function getImageByUrl
 * @requires module:aws-sdk/client-s3
 * @example <caption>Example usage of getAuth.</caption>
 * @return {Promise<String>} Automation Object
 */
 IPFS.prototype.addMetadata = async function (metadata, Key) {
   
    this.key = Key;
  
    // const s3 = new S3Client({
    //   region: process.env.REGION,
    //   apiVersion: process.env.S3_API_VERSION,
    // });

    var buf = Buffer.from(JSON.stringify(metadata));

    // await s3.send(
    //   new PutObjectCommand({
    //     Bucket: process.env.ASSET_UPLOAD_BUCKET,
    //     Key,
    //     Body: buf,
    //     ContentEncoding: 'base64',
    //     ContentType: 'application/json',
    //   })
    // );

    const s3Utils = require('../common/s3Utils');

    await s3Utils._put({
      Bucket: process.env.ASSET_UPLOAD_BUCKET,
      Key,
      Body: buf,
      ContentEncoding: 'base64',
      ContentType: 'application/json',
    });


  
    return Key;
  };



/**
 * add Image to IPFS by from S3
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function getAuth
 * @requires module:aws-sdk
 * @requires module:axios
 * @example <caption>Example usage of addByUrl.</caption>
 * @return {Promise<Array>} Array Object 
 * {
  Name: 'ipfs-logo.svg',
  Hash: CID('QmTqZhR6f7jzdhLgPArDPnsbZpvvgxzCZycXK7ywkLxSyU'),
  size: 3243
  }
 */
 IPFS.prototype.addKey = async function (mintId) {
   try {


    console.log("Uploading to IPFS", this.key);


    const ipfsUpload = await pinFileToIPFS(
      {
        Key: this.key,
        Bucket: process.env.ASSET_UPLOAD_BUCKET,
      },
      mintId
    );

     console.log("Uploaded to IPFS", ipfsUpload.IpfsHash);

     console.log("Updating Object");

     this.hash = ipfsUpload.IpfsHash;
     this.size = ipfsUpload.PinSize;

     return ipfsUpload;
     
   } catch (e) {
     console.error(e);
     throw e;
   }
 };

 /**
 * add Image to IPFS by from S3
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function getAuth
 * @requires module:aws-sdk
 * @requires module:axios
 * @example <caption>Example usage of addByUrl.</caption>
 * @return {Promise<Array>} Array Object 
 * {
  Name: 'ipfs-logo.svg',
  Hash: CID('QmTqZhR6f7jzdhLgPArDPnsbZpvvgxzCZycXK7ywkLxSyU'),
  size: 3243
  }
 */
  IPFS.prototype.addMetadataKey = async function (mintId) {
    try {
 
 
     console.log("Uploading to Metadata IPFS", this.key);
 
 
     const ipfsUpload = await pinJsonToIPFS(
       {
         Key: this.key,
         Bucket: process.env.ASSET_UPLOAD_BUCKET,
       },
       mintId
     );
 
      console.log("Uploaded to metadata to IPFS", ipfsUpload.IpfsHash);
 
      console.log("Updating Object");
 
      this.hash = ipfsUpload.IpfsHash;
      this.size = ipfsUpload.PinSize;
 
      return ipfsUpload;
      
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
 




 const pinFileToIPFS = async (params, mintId) => {
  const s3Utils = require('../common/s3Utils');
  const FormData = require("form-data");
  const fs = require('fs');
  var path = require('path');

  //Need a form for submission
  const formData = new FormData();
  
  //Need a new file name for TMP folder
  const ext = path.extname(params.Key);
  const fileName = mintId + ext;

  console.log('Writing File to: ', "/tmp/" + fileName);
  const writtenFileKey = await s3Utils._writeFileToTmp(params, fileName);

  console.log('written File Key:', writtenFileKey);

  console.log('Creating Stream From:', writtenFileKey);
  const file = fs.createReadStream(writtenFileKey);

  console.log('Appending file to form', writtenFileKey);
  formData.append('file', file)

  
  const metadata = JSON.stringify({
    name: params.Key,
  });

  console.log('Appending metadata to form', metadata);
  formData.append('pinataMetadata', metadata);
  
  const options = JSON.stringify({
    cidVersion: 0,
  })
  formData.append('pinataOptions', options);

  try{
    const Axios = require("axios");
    const res = await Axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxBodyLength: "Infinity",
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        Authorization: `Bearer ${process.env.PINATA_TK}`
      }
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const pinJsonToIPFS = async (params, mintId) => {
  const s3Utils = require("../common/s3Utils");
  const Axios = require("axios");
  const fs = require("fs");

  try {
    //Need a new file name for TMP folder
    const fileName = mintId + ".json";

    console.log("Writing File JSON metadata file to ./tmp/", fileName);

    const writtenFileKey = await s3Utils._writeFileToTmp(params, fileName);

    console.log("written File Key:", writtenFileKey);

    console.log("Reading File From:", writtenFileKey);

    let data = fs.readFileSync(writtenFileKey, "utf8");

    const res = await Axios({
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_TK}`,
      },
      data: data,
    });
    
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


/**
 * get a IPFS Basic Auth
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function getAuth
 * @requires module:Buffer
 * @example <caption>Example usage of getAuth.</caption>
 * @return {Promise<String>} Automation Object
 */
 IPFS.prototype.getAuth = function() {
    return 'Basic ' + Buffer.from(this.IPFS_PROJECT_ID + ':' + this.IPFS_PROJECT_KEY).toString('base64');
};

/**
 * get a IPFS Basic Auth
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function getAuth
 * @requires module:Buffer
 * @example <caption>Example usage of getAuth.</caption>
 * @return {Promise<String>} Automation Object
 */
 IPFS.prototype.client = function() {
    return this.client;
};

/**
 * get object s3 key
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function getKey
 * @requires module:Buffer
 * @example <caption>Example usage of getAuth.</caption>
 * @return {Promise<String>}
 */
 IPFS.prototype.getKey = function() {
  return this.key;
};

/**
 * get a IPFS Public URL
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function getPublicURL
 * @example <caption>Example usage of getAuth.</caption>
 * @return {Promise<String>} Automation Object
 */
 IPFS.prototype.getPublicURL = function() {
    return process.env.IPFS_PUBLIC_URL + this.hash;
};



/**
 * get a IPFS Public URL
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function getIPFSURL
 * @example <caption>Example usage of getAuth.</caption>
 * @return {Promise<String>} Automation Object
 */
 IPFS.prototype.getIPFSURL = function() {
  return "ipfs://" + this.hash;
};


/**
 * get a IPFS CID
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function getHash
 * @example <caption>Example usage of getHash.</caption>
 * @return {Promise<String>} IPFS CID
 */
 IPFS.prototype.getHash = function() {
  return this.hash;
};


/**
 * get a IPFS object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function get
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * // const Contract = new Contract(chain, contractAddress, status, schema_name, type);
 * // await Contract.get();
 * //@return {Promise<Automation>} Automation Object
 */
 IPFS.prototype.get = async function() {
    log.options.tags = ['log', '<<level>>'];
    try {


    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    };
};


/**
 * save object to IPFS
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function save
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 */
 IPFS.prototype.save = async function() {
    log.options.tags = ['log', '<<level>>']; 
    try {
        const dt = this.dt;
        const uuid = require('uuid');
        this.isodate = dateFormat(dt, "isoDate"),
        this.week = dateFormat(dt, "W"),
        this.createdatetime = dateFormat(dt, "isoUtcDateTime"),
        this.updatedat = dateFormat(dt, "isoUtcDateTime")
        //Make sure the instance doesn't already exists

    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    }
};


module.exports = IPFS;