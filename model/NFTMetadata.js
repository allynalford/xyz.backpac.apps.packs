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
function Metadata(image, image_data, external_url, description, name, attributes, background_color, animation_url, youtube_url) { 
    this.description = description || null;
    this.external_url  = external_url || null;
    this.image_data = image_data || null;
    this.image  = image;
    this.name = name || null;
    this.attributes = attributes || [];
    this.background_color = background_color || null;
    this.animation_url = animation_url || null;
    this.youtube_url = youtube_url || null;
}

/**
 * get the unique contract Id name
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @example <caption>Example usage of getId.</caption>
 * @return {String}
 */
 User.prototype.getId = function() {
    return this.image;
};
/**
 * set the status of Automation
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function setStatus
 * @param {String} type - the type of transaction
 * @example <caption>Example usage of get.</caption>
 * // const contract = new Contract(chain, contractAddress, status, schema_name, type);
 * // await contract.get();
 * // contract.setType(User.TYPE.ERC721);
 */
 User.prototype.setStatus = function(status) {
    this.status = status;
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
 * set the username of uSER
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function setUsername
 * @param {String} type - the type of transaction
 * @example <caption>Example usage of get.</caption>
 */
 User.prototype.setUsername = function(username) {
    this.username = username;
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
/**
 * delete a User
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @async
 * @function delete
 * @requires module:./dynamo
 * @throws Will throw an error from dynamoDB.
 * @example <caption>Example usage of _StoreProcessStart.</caption>
 * // returns Promise with DynamoDB response Array of empty of successful or an error response.
 * @return {Promise<Array>} Response Array of actions.
 */
 User.prototype.delete = async () =>{
    log.options.tags = ['log', '<<level>>']; 
    try {
        return await dynamo.deleteItemFromDB({
            TableName: process.env.DYNAMODB_TABLE_USER,
            Key: {
                issuer: this.userId,
                did: this.did
            }
        });
    } catch (e) {
        log.error(e);
        throw e;
    };
};
module.exports = User;