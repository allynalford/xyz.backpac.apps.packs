'use strict';
const dateFormat = require('dateformat');
const log = require('lambda-log');
const dynamo = require('../common/dynamo');
const fs   = require('fs');
const privateKEY  = fs.readFileSync('pri.key', 'utf8');
const hashKEY  = fs.readFileSync('pri.h.key', 'utf8');
/**
 * constructor for Pack Object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function Pack
 * @param {String} chain - eth | poly
 * @param {String} issuer - did:ethr:0x76f65345F81011eC2d76A15761Ba3f3638646DA1
 * @param {String} name - 
 * @param {String} userUUID 
 * @example <caption>Example usage of Contract Object.</caption>
 * @return {Pack} Pack Instance Object
 */
function Pack(chain, issuer, name, userUUID) { 
    this.chainIssuer = chain + ":" + issuer;
    this.chain = chain;
    this.issuer = issuer;
    this.name  = name;
    this.userUUID  = userUUID;
    this.dt =  dateFormat(new Date(), "isoUtcDateTime");
}

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
 * // const Contract = new Contract(chain, contractAddress, status, schema_name, type);
 * // await Contract.get();
 * //@return {Promise<Automation>} Automation Object
 */
 Pack.prototype.createWallet = async function () {
   log.options.tags = ["log", "<<level>>"];
   try {

    const backpac = require("../backpac/utils");
    const wallet = await backpac._createWallet();

     this.hash = CryptoJS.AES.encrypt(
       this.issuer + ":" + this.userUUID + ":" + this.name,
       hashKEY
     ).toString();

     this.as = CryptoJS.AES.encrypt(wallet.address, privateKEY).toString();

     this.pv = CryptoJS.AES.encrypt(wallet.privateKey, privateKEY).toString();

     this.ph = CryptoJS.AES.encrypt(
       wallet.mnemonic.phrase,
       privateKEY
     ).toString();

     await this.save();

     return {chainIssuer: this.chainIssuer, hash: this.hash}

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
 Pack.prototype.get = async function() {
    log.options.tags = ['log', '<<level>>'];
    try {
        const pack = await dynamo.qetFromDB({
            TableName: process.env.DYNAMODB_TABLE_PACKS,
            Key: {
                chainIssuer: this.chainIssuer,
                hash: this.hash
            }
        });

        this.as  = pack.as;
        this.pv = pack.pv;
        this.packUUID = pack.packUUID,
        this.timeStamp = pack.timeStamp,
        this.isoDate = pack.isodate,
        this.week = pack.week,
        this.created = pack.createdatetime,
        this.updatedAt = pack.updatedat

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
 Pack.prototype.save = async function() {
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

        return await dynamo.saveItemInDB({
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
    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    }
};


module.exports = Pack;