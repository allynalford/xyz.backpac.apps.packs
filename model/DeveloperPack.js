'use strict';
const dateFormat = require('dateformat');
const log = require('lambda-log');
const dynamo = require('../common/dynamo');
const fs   = require('fs');
const privateKEY  = fs.readFileSync('pri.key', 'utf8');
const hashKEY  = fs.readFileSync('pri.h.key', 'utf8');
/**
 * constructor for DeveloperPack Object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function Pack
 * @param {String} chain - eth | poly
 * @param {String} developeruuid -
 * @param {String} name - Name of the Account
 * @example <caption>Example usage of Contract Object.</caption>
 * @return {DeveloperPack} Pack Instance Object
 */
function DeveloperPack(chain, developeruuid) { 
    this.chainIssuer = chain + ":" + developeruuid;
    this.chain = chain;
    this.issuer = developeruuid;
    this.dt =  dateFormat(new Date(), "isoUtcDateTime");
}

/**
 * set the hash for the Developer Pack
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function setHash
 * @requires module:lambda-log
 * @requires module:uuid-by-string
 * @example <caption>Example usage of setHash.</caption>
 */
 DeveloperPack.prototype.setHash = async function () {
    log.options.tags = ["log", "<<level>>"];
    try {
     const getUuid = require('uuid-by-string');
 
     this.hash = getUuid(this.chainIssuer);
 
    } catch (e) {
      console.error(e);
      log.error(e);
      throw e;
    }
  };

/**
 * create a Wallet
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function createWallet
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 */
 DeveloperPack.prototype.createWallet = async function () {
   log.options.tags = ["log", "<<level>>"];
   try {
    const CryptoJS = require("crypto-js");
    const getUuid = require('uuid-by-string');
    
    this.hash = getUuid(this.chainIssuer);


    const exists = await this.exists();

    console.log('Exists', exists);

    if(typeof exists !== "undefined"){
        return {exists: true};
    }


    const backpac = require("../backpac/utils");
    const wallet = await backpac._createWallet();

    this.address = wallet.address;

     this.as = CryptoJS.AES.encrypt(wallet.address, privateKEY).toString();

     this.pv = CryptoJS.AES.encrypt(wallet.privateKey, privateKEY).toString();

     this.ph = CryptoJS.AES.encrypt(
       wallet.mnemonic.phrase,
       privateKEY
     ).toString();

     await this.save();

     return {exists: false, chainIssuer: this.chainIssuer, hash: this.hash, address: this.address}

   } catch (e) {
     console.error(e);
     log.error(e);
     throw e;
   }
 };



/**
 * get a User from the database and build the object
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
 DeveloperPack.prototype.exists = async function() {
    log.options.tags = ['log', '<<level>>'];
    try {
        return await dynamo.qetFromDB({
            TableName: process.env.DYNAMODB_TABLE_PACKS,
            ProjectExpression: "chainIssuer, hash",
            Key: {
                chainIssuer: this.chainIssuer,
                hash: this.hash
            }
        });
    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    };
};


/**
 * get a User from the database and build the object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function get
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @requires module:crypto-js
 * @example <caption>Example usage of get.</caption>
 * @return {Promise<Void>} Automation Object
 */
 DeveloperPack.prototype.get = async function() {
    log.options.tags = ['log', '<<level>>'];

    try {
        const pack = await dynamo.qetFromDB({
            TableName: process.env.DYNAMODB_TABLE_PACKS,
            Key: {
                chainIssuer: this.chainIssuer,
                hash: this.hash
            }
        });

        //console.log('Pack:', pack)

        const CryptoJS = require("crypto-js");

        var asBytes = CryptoJS.AES.decrypt(pack.as, privateKEY);
        var pvBytes = CryptoJS.AES.decrypt(pack.pv, privateKEY);
        

        this.as  = asBytes.toString(CryptoJS.enc.Utf8);
        this.pv = pvBytes.toString(CryptoJS.enc.Utf8);
        this.packUUID = pack.packUUID,
        this.isoDate = pack.isoDate,
        this.week = pack.week,
        this.created = pack.created,
        this.updatedAt = pack.updatedAt

    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    };
};


/**
 * save pack to the database
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function save
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 */
 DeveloperPack.prototype.save = async function() {
    log.options.tags = ['log', '<<level>>']; 
    try {
        const dt = this.dt;
        const uuid = require('uuid');
        this.isodate = dateFormat(dt, "isoDate"),
        this.week = dateFormat(dt, "W"),
        this.createdatetime = dateFormat(dt, "isoUtcDateTime"),
        this.updatedat = dateFormat(dt, "isoUtcDateTime")
        //Make sure the instance doesn't already exists

        await dynamo.saveItemInDB({
            TableName: process.env.DYNAMODB_TABLE_PACK_MAN,
            Item:{
                chainIssuer: this.chainIssuer,
                hash: this.hash,
                ph: this.ph,
                packmanUUID: uuid.v4(),
                timeStamp: this.timeStamp,
                isoDate: this.isodate,
                week: this.week,
                created: this.createdatetime,
                updatedAt: this.updatedat
            }
        });

        await dynamo.saveItemInDB({
            TableName: process.env.DYNAMODB_TABLE_PACKS,
            Item:{
                chainIssuer: this.chainIssuer,
                hash: this.hash,
                as: this.as,
                pv: this.pv,
                packUUID: uuid.v4(),
                timeStamp: this.timeStamp,
                isoDate: this.isodate,
                week: this.week,
                created: this.createdatetime,
                updatedAt: this.updatedat
            }
        });

        return await dynamo.saveItemInDB({
            TableName: process.env.DYNAMODB_TABLE_BACKPAC,
            Item:{
                chainIssuer: this.chainIssuer,
                hash: this.hash,
                address: this.address,
                backpacUUID: uuid.v4(),
                timeStamp: this.timeStamp,
                isoDate: this.isodate,
                week: this.week,
                created: this.createdatetime,
                updatedAt: this.updatedat
            }
        });


    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    }
};


module.exports = DeveloperPack;