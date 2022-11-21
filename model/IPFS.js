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
 * get an image by URL
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function getImageByUrl
 * @requires module:Buffer
 * @example <caption>Example usage of getAuth.</caption>
 * @return {Promise<String>} Automation Object
 */
IPFS.prototype.getImageByUrl = async function (url, Key) {
  const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
  } = require("@aws-sdk/client-s3");
  const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
  const Axios = require('axios')
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

//   return await getSignedUrl(
//     s3,
//     new GetObjectCommand({ Bucket: process.env.ASSET_UPLOAD_BUCKET, Key }),
//     { expiresIn: 120 * 60 }
//   ); // expires in seconds

return Key;
};;



/**
 * add Image to IPFS by URL
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function getAuth
 * @requires module:Buffer
 * @example <caption>Example usage of addByUrl.</caption>
 * @return {Promise<Array>} Array Object 
 * {
  path: 'ipfs-logo.svg',
  cid: CID('QmTqZhR6f7jzdhLgPArDPnsbZpvvgxzCZycXK7ywkLxSyU'),
  size: 3243
  }
 */
 IPFS.prototype.addKey = async function (Key) {
    const Axios = require('axios')
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({region: process.env.REGION, apiVersion: process.env.S3_API_VERSION});

    const readStream =  s3.getObject({
        Key,
        Bucket: process.env.ASSET_UPLOAD_BUCKET,
      }).createReadStream();


//    const httpResp = await Axios({
//     baseURL: `${process.env.IPFS_GATEWAY_HOST}:${process.env.IPFS_PORT}`,
//     url: `/api/v0/add`,
//     method: "POST",
//     headers: {
//         authorization: 'Basic ' + Buffer.from(process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_PROJECT_KEY).toString('base64'),
//     },
// });

  // const stream = await response.Body;



   //console.log(stream)
    const http = require('http');
    const Agent = new http.Agent({ });
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('content', readStream);
    let headers = formData.getHeaders();
        headers.authorization = 'Basic ' + Buffer.from(process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_PROJECT_KEY).toString('base64');
        headers['User-Agent'] = 'xyz.backpac.apps.packs';
      console.log(headers);
        
    const res = await Axios.post(`${process.env.IPFS_GATEWAY}/api/v0/add`, formData, {
        // You need to use `getHeaders()` in Node.js because Axios doesn't
        // automatically set the multipart form boundary in Node.
        headers
    });


   return await res;
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