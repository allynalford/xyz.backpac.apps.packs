'use strict';
const dateFormat = require('dateformat');
const log = require('lambda-log');
const dynamo = require('../common/dynamo');
/**
 * constructor for User Object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @constructs User
 * @class
 * @param {String} issuer - did:{network}:{blockchain address}
 * @param {String} address - blockchain address of user
 * @param {String} email - email address of user
 * @param {Boolean} isMfaEnabled is multi factor auth enabled
 * @param {String} phoneNumber phone number of user
 * @param {User.STATUS} status - status of user
 * @example <caption>Example usage of User Object.</caption>
 * @return {User} User Instance Object
 */
function User(issuer, address, email, isMfaEnabled, phoneNumber, status) { 
    this.did  = issuer.split(':')[0] + ':' + issuer.split(':')[1];
    this.userId  = issuer;
    this.address  = address;
    this.email = email || null;
    this.isMfaEnabled = isMfaEnabled || null;
    this.phoneNumber = phoneNumber || null;
    this.status = status || null;
    this.name = null;
    this.external_link = null;
    this.image_url = null;
}


/**
 * get a User by email address from the database and build the object
 * @async
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * @return {Promise<User>} User Object
 */
 User.prototype.getByEmail = async function() {
    log.options.tags = ['log', '<<level>>'];
    try {


        let user = await dynamo.queryDBRegion({
            TableName: process.env.DYNAMODB_TABLE_USER,
            IndexName: process.env.DYNAMODB_TABLE_USER_EMAIL_ISSUER_INDEX,
            KeyConditionExpression: "#email = :email",
            ExpressionAttributeNames: {
                "#email": "email"
            },
            ExpressionAttributeValues: {
                ":email": this.email
            },
        }, process.env.table_region);

        console.log(user)

        user = user[0];


        try{
            const venue = await this.getActiveVenue();
            this.venue = Object.keys(venue).length === 0 ? null : venue;
        }catch(e){
            console.warn(e.message)
        }

        this.address = user.address;
        this.userUUID = user.userUUID;
        this.email = user.email;
        this.isMfaEnabled = user.isMfaEnabled;
        this.phoneNumber = user.phoneNumber;
        this.status = user.status;
        this.username = user.username;
        this.external_link = user.external_link;
        this.image_url = user.image_url;
        this.timeStamp = user.timeStamp;
        this.isoDate = user.isodate;
        this.week = user.week;
        this.created = user.createdatetime;
        this.updatedAt = user.updatedat;

    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    };
};


/**
 * get a User from the database and build the object
 * @async
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * @return {Promise<User>} User Object
 */
 User.prototype.get = async function() {
    log.options.tags = ['log', '<<level>>'];
    try {

        const user = await dynamo.qetFromDBRegion({
            TableName: process.env.DYNAMODB_TABLE_USER,
            IndexName: process.env.DYNAMODB_TABLE_USER_EMAIL_ISSUER_INDEX,
            Key: {
                did: this.email,
                issuer: this.userId
            }
        }, process.env.table_region);


        try{
            const venue = await this.getActiveVenue();
            this.venue = Object.keys(venue).length === 0 ? null : venue;
        }catch(e){
            console.warn(e.message)
        }

        this.address = user.address;
        this.userUUID = user.userUUID;
        this.email = user.email;
        this.isMfaEnabled = user.isMfaEnabled;
        this.phoneNumber = user.phoneNumber;
        this.status = user.status;
        this.username = user.username;
        this.external_link = user.external_link;
        this.image_url = user.image_url;
        this.timeStamp = user.timeStamp;
        this.isoDate = user.isodate;
        this.week = user.week;
        this.created = user.createdatetime;
        this.updatedAt = user.updatedat;

    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    };
};

/**
 * get active user Venue from the database and return it
 * @async
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * @return {Promise<Automation>} Automation Object
 */
 User.prototype.getActiveVenue = async function () {
   log.options.tags = ["log", "<<level>>"];
   try {
     const venues = await dynamo.queryDB({
       TableName: process.env.DYNAMODB_TABLE_USER_VENUE,
       KeyConditionExpression: "#issuer = :issuer ",
       FilterExpression: "#status = :status",
       ExpressionAttributeNames: {
         "#issuer": "issuer",
         "#status": "status",
       },
       ExpressionAttributeValues: {
         ":issuer": this.userId,
         ":status": true,
       },
     });

     if (Array.isArray(venues) && venues.length > 0) {
       //Load the Venue
       const Venue = require("../model/Venue");

       return new Venue(venues[0].companyId, venues[0].venueId);
     } else {
       return {};
     }
   } catch (e) {
     console.error(e);
     log.error(e);
     throw e;
   }
 };

 /**
 * get active user Assets from the blockchain and return it
 * @async
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * @return {Promise<Automation>} Automation Object
 */
  User.prototype.getAssets = async function () {
    log.options.tags = ["log", "<<level>>"];
    try {
        //Need an Assets object
        const Assets = require('../model/Assets');
        //Load the assets object for the user
        const assets = new Assets(this.userId, 'ETHEREUM');
        //load the users Assets
        await assets.get();
        //Return them
        return assets;
    } catch (e) {
      console.error(e);
      log.error(e);
      throw e;
    }
  };

 /**
 * get active user Assets from the blockchain and return it
 * @async
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * @return {Promise<Automation>} Automation Object
 */
  User.prototype.getAssetsByAddresses = async function (addresses) {
    log.options.tags = ["log", "<<level>>"];
    try {
        //Need an Assets object
        const Assets = require('../model/Assets');
        //Load the assets object for the user
        const assets = new Assets(this.userId, 'ETHEREUM');
        //load the users Assets
        await assets.get();
        //Return them
        return assets;
    } catch (e) {
      console.error(e);
      log.error(e);
      throw e;
    }
  };



/**
 * get the unique contract Id name
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function getId
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of get.</caption>
 * // const contract = new Contract(chain, contractAddress, status, schema_name, type);
 * // await automation.get();
 * // contract.getId();
 * @return {String} contractUUID
 */
 User.prototype.getId = function() {
    return this.userId;
};

/**
 * get the type of WalletTransaction
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function getStatus
 * @example <caption>Example usage of get.</caption>
 * // User.getStatus();
 * @return {String} User status
 */
 User.prototype.getStatus = function() {
    return this.status;
};


/**
 * get the username for User
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function getUsername
 * @example <caption>Example usage of get.</caption>
 * // User.getUsername();
 * @return {String} User Name
 */
User.prototype.getUsername = function() {
    return this.username;
};
/**
 * status types for a User
 * @constant status
 * @type {string}
 * @this User
 * @example <caption>Example usage of status.</caption>
 * @return {User.status} status
 */
User.prototype.status = Object.freeze({
    VALID : "VALID",
    INVALID: "INVALID"
});


User.prototype.equals = function(otherSolution) {
    return otherSolution.getId() == this.getId();
};

User.prototype.fill = function(newFields) {
    for (var field in newFields) {
        if (this.hasOwnProperty(field) && newFields.hasOwnProperty(field)) {
            if (this[field] !== 'undefined') {
                this[field] = newFields[field];
            }
        }
    }
};
module.exports = User;