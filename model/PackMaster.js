'use strict';
const dateFormat = require('dateformat');
const log = require('lambda-log');
const dynamo = require('../common/dynamo');
const fs   = require('fs');
const privateKEY  = fs.readFileSync('pri.key', 'utf8');

/**
 * constructor for PackMaster Object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function PackMaster
 * @param {String} chain blockchain for the master
 * @param {String} hash unique identifier fir the master
 * @param {String} requires filter for masters within get
 * @example <caption>Example usage of PackMaster Object.</caption>
 * @return {PackMaster} Pack Instance Object
 */
function PackMaster(chain, hash, requires) { 
    this.chain = chain;
    this.hash = hash || null;
    this.requires = requires || null;
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
 * @return {Promise<Void>} Automation Object
 */
 PackMaster.prototype.createWallet = async function () {
   log.options.tags = ["log", "<<level>>"];
   try {
    const CryptoJS = require("crypto-js");
    const backpac = require("../backpac/utils");
    const wallet = await backpac._createWallet();

    const generateApiKey = require('generate-api-key').default;

    this.hash = generateApiKey({ method: 'bytes', min: 12, max: 25 }); // ⇨ 'fae27c801b5092bc'


     this.as = CryptoJS.AES.encrypt(wallet.address, privateKEY).toString();

     this.pv = CryptoJS.AES.encrypt(wallet.privateKey, privateKEY).toString();

     this.ph = CryptoJS.AES.encrypt(
       wallet.mnemonic.phrase,
       privateKEY
     ).toString();

     await this.save();

     return {hash: this.hash, address: wallet.address}

   } catch (e) {
     console.error(e);
     log.error(e);
     throw e;
   }
 };


 /**
 * get a PackMaster object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function current
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * @return {Promise<Void>} PackMaster Object
 */
  PackMaster.prototype.current = async function() {
    log.options.tags = ['log', '<<level>>'];
    try {


        const packs = await dynamo.queryDB({
            TableName: process.env.DYNAMODB_TABLE_PACKSMASTER,
            KeyConditionExpression: "#chain = :chain",
            ExpressionAttributeNames: {
                "#chain": "chain"
            },
            ExpressionAttributeValues: {
                ":chain": this.chain
            },
        });

        console.log(packs);

        const pack = packs[0];

        const CryptoJS = require("crypto-js");

        var asBytes = CryptoJS.AES.decrypt(pack.as, privateKEY);
        var pvBytes = CryptoJS.AES.decrypt(pack.pv, privateKEY);

        this.as  = asBytes.toString(CryptoJS.enc.Utf8);
        this.pv = pvBytes.toString(CryptoJS.enc.Utf8);
        this.packmasteruuid = pack.packmasteruuid,
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
 * get a User from the database and build the object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function get
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * @return {Promise<Void>} PackMaster Object
 */
 PackMaster.prototype.get = async function() {
    log.options.tags = ['log', '<<level>>'];
    try {
        const packs = await dynamo.queryDB({
            TableName: process.env.DYNAMODB_TABLE_PACKSMASTER,
            KeyConditionExpression: "#chain = :chain",
            ExpressionAttributeNames: {
                "#chain": "chain"
            },
            ExpressionAttributeValues: {
                ":chain": this.chain
            },
        });

        console.log('Packs',packs);

        const pack = packs[0];

        const CryptoJS = require("crypto-js");

        var asBytes = CryptoJS.AES.decrypt(pack.as, privateKEY);
        var pvBytes = CryptoJS.AES.decrypt(pack.pv, privateKEY);

        this.as  = asBytes.toString(CryptoJS.enc.Utf8);
        this.pv = pvBytes.toString(CryptoJS.enc.Utf8);
        this.packmasteruuid = pack.packmasteruuid,
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
 PackMaster.prototype.save = async function() {
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
            TableName: process.env.DDYNAMODB_TABLE_PACKSMASTER_MAN,
            Item:{
                chain: this.chain,
                hash: this.hash,
                ph: this.ph,
                packmastermanuuid: uuid.v4(),
                timeStamp: this.timeStamp,
                isoDate: this.isodate,
                week: this.week,
                created: this.createdatetime,
                updatedAt: this.updatedat
            }
        });

        return await dynamo.saveItemInDB({
            TableName: process.env.DYNAMODB_TABLE_PACKSMASTER,
            Item:{
                chain: this.chain,
                hash: this.hash,
                as: this.as,
                pv: this.pv,
                status: false,
                packmasteruuid: uuid.v4(),
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


module.exports = PackMaster;