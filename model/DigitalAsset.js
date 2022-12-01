'use strict';
const dateFormat = require('dateformat');
const log = require('lambda-log');
const dynamo = require('../common/dynamo');
/**
 * constructor for Asset Object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @constructs DigitalAsset
 * @class
 * @param {String} chain - eth | poly | flow
 * @param {String} address - 0x68fc6ddb2f1adcd39f4b6d8d0c0187359ddbc812
 * @param {String} schema_name - ERC721 | ERC1155
 * @param {String} tokenId - 0-99999~
 * @param {String} tokenUri
 * @param {String} description A human readable description of the item. 
 * @param {String} name Name of the item.
 * @param {String} image This is the URL to the image of the item. Can be just about any type of image
 * @param {String} external_url This is the URL that will appear below the asset's image on OpenSea and will allow users to leave OpenSea and view the item on your site.
 * @param {Array}  attributes These are the attributes for the item, which will show up on the OpenSea page for the item.
 * @param {String} animation_url A URL to a multi-media attachment for the item.
 * @param {String} youtube_url A URL to a YouTube video.
 * @example <caption>Example usage of DigitalAsset Object.</caption>
 * @return {DigitalAsset} DigitalAsset Instance Object
 */
function DigitalAsset(chain, address, schema_name, tokenId, tokenUri, description, name, image, external_url, attributes, animation_url, youtube_url) { 
    this.chainSchemaAddress  = chain + ":" + schema_name  + ":" + address;
    this.tokenId = tokenId;
    this.chain  = chain;
    this.address  = address;
    this.schema_name = schema_name;
    this.tokenUri = tokenUri || null;
    this.description = description || null;
    this.name = name || "Testnet Asset";
    this.image = image || "https://testnets.opensea.io/static/images/placeholder.png";
    this.external_url = external_url || null;
    this.attributes = attributes || null;
    this.animation_url = animation_url || null;
    this.youtube_url = youtube_url || null;
    this.dt = dateFormat(new Date(), "isoUtcDateTime");
}
/**
 * get a Asset from the database and build the object
 * @async
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @example <caption>Example usage of get.</caption>
 * @return {Promise<Void>}
 */
 DigitalAsset.prototype.get = async function() {
    log.options.tags = ['log', '<<level>>'];
    try {


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
 DigitalAsset.prototype.save = async function() {
    log.options.tags = ['log', '<<level>>']; 
    try {
        this.isoDate = dateFormat(this.dt, "isoDate"),
        this.week = dateFormat(this.dt, "W"),
        this.created = dateFormat(this.dt, "isoUtcDateTime"),
        this.updatedAt = dateFormat(this.dt, "isoUtcDateTime")

        const generateApiKey = require('generate-api-key').default;

        //Generate a MintId
        this.assetuuid = generateApiKey({ method: 'bytes', min: 36, max: 36 }); // ⇨ 'fae27c801b5092bc'

        let Item = this;
        return await dynamo.saveItemInDBRegion({
            TableName: process.env.DYNAMODB_TABLE_DIGITAL_ASSET,
            Item
        }, process.env.table_region);
    } catch (e) {
        console.error(e);
        log.error(e);
        throw e;
    }
};


/**
 * get the unique DigitalAsset Id
 * @this Asset
 * @example <caption>Example usage of get.</caption>
 * @return {String} this.contractAddress + ':' + this.tokenId
 */
DigitalAsset.prototype.getId = function() {
    return this.chainSchemaAddress + ':' + this.tokenId;
};
/**
 * set the image of DigitalAsset
 * @this Asset
 * @param {String} image_url - the type of transaction
 * @example <caption>Example usage of setImageUrl.</caption>
 */
 DigitalAsset.prototype.setImage= function(image_url) {
    this.image = image_url;
};
/**
 * get the image of DigitalAsset
 * @this Asset
 * @example <caption>Example usage of getImage.</caption>
 * @return {String} image
 */
 DigitalAsset.prototype.getImage = function() {
    return this.image;
};
/**
 * compare to DigitalAsset objects
 * @example <caption>Example usage of equals.</caption>
 * @return {String} image_url
 */
 DigitalAsset.prototype.equals = function(otherSolution) {
    return otherSolution.getId() == this.getId();
};
/**
 * fill DigitalAsset object with additional fields
 * @return {void}
 */
DigitalAsset.prototype.fill = function(newFields) {
    for (var field in newFields) {
        if (this.hasOwnProperty(field) && newFields.hasOwnProperty(field)) {
            if (this[field] !== 'undefined') {
                this[field] = newFields[field];
            }
        }
    }
};
module.exports = DigitalAsset;