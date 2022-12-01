'use strict';
const dateFormat = require('dateformat');
const log = require('lambda-log');
const dynamo = require('../common/dynamo');

//developeruuid, contractAddress, image, external_url, description, name, attributes, background_color, animation_url, youtube_url

/**
 * constructor for Mint Object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @constructs Mint
 * @class
 * @param {String} developeruuid - developer identifier (REQUIRED)
 * @param {String} chain - blockchain (REQUIRED)
 * @param {String} mintId - minttId | created on save()
 * @param {String} contractId -  (SOFT REQUIRED)
 * @param {String} image - url of image to download (SOFT REQUIRED)
 * @param {String} description - description from contract (SOFT REQUIRED)
 * @param {String} name - symbol for collection (SOFT REQUIRED)
 * @param {String} external_url - website address
 * @param {String} attributes - attributes of NFT
 * @param {String} background_color - background color for display
 * @param {String} animation_url - 
 * @param {String} youtube_url - Youtube video or channel URL
 * @example <caption>Example usage of Mint Object.</caption>
 * @return {Mint} Contract Instance Object
 */
function Mint(developeruuid, chain, recipient, recipientType, mintId, contractId, image, description, name, external_url, attributes, background_color, animation_url, youtube_url) {
    this.chainDeveloperuuid = chain + ":" + developeruuid;
    this.recipient = recipient || null,
    this.recipientType = recipientType || null,
    this.recipientAddress = null;
    this.mintId = mintId || null;
    this.developeruuid = developeruuid;
    this.contractId = contractId || null;
    this.image = image || null;

    this.attributes = attributes || null;
    this.background_color = background_color || null;
    this.animation_url = animation_url || null;
    this.youtube_url = youtube_url || null;


    this.status = false;
    this.name = name || null;
    this.stage = 'PENDING'
    this.description = description || null;
    this.external_link = external_url || null;
    this.dt = dateFormat(new Date(), "isoUtcDateTime");

    this.imageURL = null;
    this.imageKey = null;
    this.imageCID = null;
    this.metadata = null;
    this.metadataURL = null;
    this.metadataKey = null;
    this.metadataCID = null;
    this.estimatedGas = null;

}


/**
 * get a Contract from the database and build the object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @example <caption>Example usage of get.</caption>
 * @return {Promise<Void>} 
 */
Mint.prototype.get = async function () {
    log.options.tags = ['log', '<<level>>'];
    try {
        const mint = await dynamo.qetFromDBRegion({
            TableName: process.env.DYNAMODB_TABLE_DEVELOPER_MINT,
            Key: {
                chainDeveloperuuid: this.chainDeveloperuuid,
                mintId: this.mintId
            }
        }, process.env.table_region);

        log.info('qetFromDBRegion:mint', mint)

        this.fill(mint);


        this.timeStamp = mint.timeStamp || null;
        this.isoDate = mint.isodate || null;
        this.week = mint.week || null;
        this.created = mint.createdatetime || null;
        this.updatedAt = mint.updatedat || null;

    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    };
};

/**
 * save Contract to the database
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of save.</caption>
 */
Mint.prototype._updateFields = async (mint, fields) => {
    try {
        const dateFormat = require("dateformat");
        var ExpressionAttributeValues = {},
            ExpressionAttributeNames = {};
        var UpdateExpression = "set #dt = :dt";

        for (const f of fields) {
            ExpressionAttributeValues[`:${f.name}`] = f.value;
            ExpressionAttributeNames[`#${f.name}`] = f.name;
            UpdateExpression = UpdateExpression + `, #${f.name} = :${f.name}`;
        }

        ExpressionAttributeNames["#dt"] = "updatedAt";
        ExpressionAttributeValues[":dt"] = dateFormat(
            new Date(),
            "isoUtcDateTime"
        );

        //Save the profile to dynamoDB
        return await dynamo.updateDBRegion({
            TableName: process.env.DYNAMODB_TABLE_DEVELOPER_MINT,
            Key: {
                chainDeveloperuuid: mint.chainDeveloperuuid,
                mintId: mint.mintId
            },
            UpdateExpression,
            ExpressionAttributeValues,
            ExpressionAttributeNames,
            ReturnValues: "UPDATED_NEW",
        }, process.env.table_region);
    } catch (err) {
        console.error(JSON.stringify(err));
        log.error(err);
        throw err;
    }
};

/**
 * get the unique Mint Id name
 *
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of getId.</caption>
 * @return {String} contractUUID
 */
Mint.prototype.getId = function () {
    return this.mintId;
};

/**
 * check Mint against Mint
 *
 * @example <caption>Example usage of equals.</caption>
 * @return {Boolean} true | false
 */
Mint.prototype.equals = function (otherSolution) {
    return otherSolution.getId() == this.getId();
};
/**
 * fill contract with additional fields
 *
 * @example <caption>Example usage of fill.</caption>
 * @return {Void}
 */
Mint.prototype.fill = function (newFields) {
    for (var field in newFields) {
        if (this.hasOwnProperty(field) && newFields.hasOwnProperty(field)) {
            if (this[field] !== 'undefined') {
                this[field] = newFields[field];
            }
        }
    }
};

/**
 * delete a Mint
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function delete
 * @requires module:./dynamo
 * @throws Will throw an error from dynamoDB.
 * @example <caption>Example usage of delete.</caption>
 * @return {Promise<Array>} Response Array
 */
Mint.prototype.delete = async (proces) => {
    log.options.tags = ['log', '<<level>>'];
    try {
        return await dynamo.deleteItemFromDB({
            TableName: process.env.DYNAMODB_TABLE_CONTRACT,
            Key: {
                chain: this.chain,
                contractAddress: this.contractAddress
            }
        });
    } catch (e) {
        log.error(e);
        throw e;
    };
};
module.exports = Mint;