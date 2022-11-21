'use strict';
/**
 * constructor for Metadata Object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @constructs Metadata
 * @class
 * @param {String} image - image URL
 * @param {Bytes} image_data - image data
 * @param {String} external_url - external URL for collection
 * @param {String} description description of asset
 * @param {String} name name of asset
 * @param {String} attributes - attributes of asset
 * @param {String} background_color - background color of asset display
 * @param {String} animation_url - animation url
 * @param {String} youtube_url - youtube video or channel url
 * @example <caption>Example usage of User Object.</caption>
 * @return {Metadata} Metadata Instance Object
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
 Metadata.prototype.getId = function() {
    return this.image;
};

Metadata.prototype.equals = function(otherSolution) {
    return otherSolution.getId() == this.getId();
};

Metadata.prototype.fill = function(newFields) {
    for (var field in newFields) {
        if (this.hasOwnProperty(field) && newFields.hasOwnProperty(field)) {
            if (this[field] !== 'undefined') {
                this[field] = newFields[field];
            }
        }
    }
};

module.exports = Metadata;