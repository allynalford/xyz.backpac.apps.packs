'use strict';
const dateFormat = require('dateformat');
const log = require('lambda-log');
const ipfsClient = require('ipfs-http-client'); 


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

    const http = require('http');
    const Agent = new http.Agent({ });

    this.client = ipfsClient.create({
        host: process.env.IPFS_GATEWAY_HOST,
        port: process.env.IPFS_PORT,
        protocol: 'http',
        agent: Agent,
        headers: {
            authorization: 'Basic ' + Buffer.from(process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_PROJECT_KEY).toString('base64'),
        },
    });
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
  const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
  const Axios = require("axios");
  const response = await Axios({
    url,
    decompress: false,
    method: "GET",
    responseType: "arraybuffer",
  });

  this.key = Key;

  const s3 = new S3Client({
    region: process.env.REGION,
    apiVersion: process.env.S3_API_VERSION,
  });
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.ASSET_UPLOAD_BUCKET,
      Key,
      Body: response.data,
    })
  );

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
    const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

    this.key = Key;
  
    const s3 = new S3Client({
      region: process.env.REGION,
      apiVersion: process.env.S3_API_VERSION,
    });

    var buf = Buffer.from(JSON.stringify(metadata));

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.ASSET_UPLOAD_BUCKET,
        Key,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: 'application/json',
      })
    );
  
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
 IPFS.prototype.addKey = async function () {
   const Axios = require("axios");
   const AWS = require("aws-sdk");


   const s3 = new AWS.S3({
     region: process.env.REGION,
     apiVersion: process.env.S3_API_VERSION,
   });

   const readStream = s3
     .getObject({
       Key: this.key,
       Bucket: process.env.ASSET_UPLOAD_BUCKET,
     })
     .createReadStream();

   const FormData = require("form-data");
   const formData = new FormData();

   formData.append("content", readStream);

   let headers = formData.getHeaders();

   headers.authorization =
     "Basic " +
     Buffer.from(
       process.env.IPFS_PROJECT_ID + ":" + process.env.IPFS_PROJECT_KEY
     ).toString("base64");


   headers["User-Agent"] = "xyz.backpac.apps.packs";

   const ipfsUpload = await Axios.post(
     `${process.env.IPFS_GATEWAY}/api/v0/add`,
     formData,
     {
       headers,
     }
   );

   this.name = ipfsUpload.data.Name;
   this.hash = ipfsUpload.data.Hash
   this.size = ipfsUpload.data.Size;

   return await ipfsUpload.data;
 };



/**
 * get a IPFS Basic Auth
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function getAuth
 * @requires module:Buffer
 * @example <caption>Example usage of getAuth.</caption>
 * @return {Promise<String>} Automation Object
 */
 IPFS.prototype.getAuth = async function() {
    return 'Basic ' + Buffer.from(this.IPFS_PROJECT_ID + ':' + this.IPFS_PROJECT_KEY).toString('base64');
};

/**
 * get a IPFS Basic Auth
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function getAuth
 * @requires module:Buffer
 * @example <caption>Example usage of getAuth.</caption>
 * @return {Promise<String>} Automation Object
 */
 IPFS.prototype.client = async function() {
    return this.client;
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