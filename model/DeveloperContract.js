'use strict';
const dateFormat = require('dateformat');
const log = require('lambda-log');
const dynamo = require('../common/dynamo');

/**
 * constructor for Contract Object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @constructs DeveloperContract
 * @class
 * @param {String} developeruuid - blockchain (REQUIRED)
 * @param {String} chain - blockchain (REQUIRED)
 * @example <caption>Example usage of DeveloperContract Object.</caption>
 * @return {DeveloperContract} Contract Instance Object
 */
function DeveloperContract(developeruuid, chain, contractId) { 
    this.chainDeveloperuuid = chain + ":" + developeruuid;
    this.contractId = contractId;
    this.developeruuid = developeruuid;
    this.metadata = null;
    this.symbol = null;
    this.total_supply =  null;
    this.chain  = chain;
    this.contractAddress =  null;
    this.type = null;
    this.schema_name = null;
    this.status = false;
    this.name = null;
    this.stage = 'PENDING'
    this.category = null;
    this.description = null;
    this.external_link =  null;
    this.image_url = null;
    this.contractUUID = null;
    this.privacy = null;
    this.dt = dateFormat(new Date(), "isoUtcDateTime");
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
 DeveloperContract.prototype.get = async function() {
    log.options.tags = ['log', '<<level>>'];
    try {
        const contract = await dynamo.qetFromDBRegion({
            TableName: process.env.DYNAMODB_TABLE_DEVELOPER_CONTRACT,
            Key: {
                chainDeveloperuuid: this.chainDeveloperuuid,
                contractId: this.contractId
            }
        }, process.env.table_region);

        this.fill(contract);

        this.timeStamp = contract.timeStamp || null;
        this.isoDate = contract.isodate || null;
        this.week = contract.week || null;
        this.created = contract.createdatetime || null;
        this.updatedAt = contract.updatedat || null;

    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    };
};

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
 DeveloperContract.prototype.setContractAddress = async function (
   contractAddress
 ) {
   log.options.tags = ["log", "<<level>>"];
   try {
     return await dynamo.updateDBRegion(
       {
        TableName: process.env.DYNAMODB_TABLE_DEVELOPER_CONTRACT,
        Key: {
            chainDeveloperuuid: this.chainDeveloperuuid,
            contractId: this.contractId
        },
         UpdateExpression: "set #contractAddress = :contractAddress",
         ExpressionAttributeNames: {
           "#contractAddress": "contractAddress",
         },
         ExpressionAttributeValues: {
           ":contractAddress": contractAddress,
         },
         ReturnValues: "UPDATED_NEW",
       },
       process.env.table_region
     );
   } catch (e) {
     console.error(e);
     log.error(e);
     throw e;
   }
 };

 DeveloperContract.prototype._updateFields = async (chainDeveloperuuid, contractId, fields) => {
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
        TableName: process.env.DYNAMODB_TABLE_DEVELOPER_CONTRACT,
        Key: {
            chainDeveloperuuid,
            contractId
        },
       UpdateExpression,
       ExpressionAttributeValues,
       ExpressionAttributeNames,
       ReturnValues: "UPDATED_NEW",
     },process.env.table_region);
   } catch (err) {
     console.error(JSON.stringify(err));
     log.error(err);
     throw err;
   }
 };



/**
 * get the unique contract Id name
 *
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of getId.</caption>
 * @return {String} contractId
 */
 DeveloperContract.prototype.getId = function() {
    return this.contractId;
};

/**
 * get the type of WalletTransaction
 *
 * @this Contract
 * @example <caption>Example usage of get.</caption>
 * @return {String} type
 */
DeveloperContract.prototype.getType = function() {
    return this.type;
};
/**
 * get the type of WalletTransaction
 * @constant type
 * @type {string}
 * @this Contract
 * @example <caption>Example usage of type.</caption>
 * @return {Contract.type} type
 */
 DeveloperContract.prototype.type = Object.freeze({
    ERC721 : "ERC721",
    ERC1155: "ERC1155"
});

/**
 * check contract against contract
 *
 * @example <caption>Example usage of equals.</caption>
 * @return {Boolean} true | false
 */
 DeveloperContract.prototype.equals = function(otherSolution) {
    return otherSolution.getId() == this.getId();
};
/**
 * fill contract with additional fields
 *
 * @example <caption>Example usage of fill.</caption>
 * @return {Void}
 */
 DeveloperContract.prototype.fill = function(newFields) {
    for (var field in newFields) {
        if (this.hasOwnProperty(field) && newFields.hasOwnProperty(field)) {
            if (this[field] !== 'undefined') {
                this[field] = newFields[field];
            }
        }
    }
};

module.exports = DeveloperContract;