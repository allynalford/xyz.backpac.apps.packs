const AWS = require('aws-sdk');



/**
 * delete an item from dynamoDB
 * @async
 * @private
 * @requires module:aws-sdk
 * @return {Array}
 */
module.exports.deleteItemFromDB = async (params) =>{
  try {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();
    return dynamoDB
      .delete(params)
      .promise()
      .then(res => res)
      .catch(err => err);
  } catch (err) {
    return {error: true, message: err.message, e: err};
  }
}
/**
 * Save the item in dynamoDB
 * @async
 * @private
 * @requires module:aws-sdk
 * @return {Array}
 */
module.exports.saveItemInDB =(params) => {
    try {
      const dynamoDB = new AWS.DynamoDB.DocumentClient();
      return dynamoDB
        .put(params)
        .promise()
        .then(res => res)
        .catch(err => err);
    } catch (err) {
      return {error: true, message: err.message, e: err};
    }
};
/**
 * get an item from dynamoDB
 * @async
 * @private
 * @requires module:aws-sdk
 * @return {Array}
 */
module.exports.qetFromDB = (params) => {
    try {
      const dynamoDB = new AWS.DynamoDB.DocumentClient();
      return dynamoDB
        .get(params)
        .promise()
        .then(res => res.Item)
        .catch(err => err);
    } catch (err) {
        return {error: true, message: err.message, e: err};
    }
};
/**
 * get an item from dynamoDB
 * @async
 * @private
 * @requires module:aws-sdk
 * @return {Array}
 */
 module.exports.qetFromDBRegion = (params, region) => {
  try {
    console.info('table_region', region);

    const dynamoDB = new AWS.DynamoDB.DocumentClient({region});
    return dynamoDB
      .get(params)
      .promise()
      .then(res => res.Item)
      .catch(err => err);
  } catch (err) {
      return {error: true, message: err.message, e: err};
  }
};
/**
 * update an item in dynamoDB
 * @async
 * @private
 * @requires module:aws-sdk
 * @return {Array}
 */
module.exports.updateDB = (params) =>{
    try {
      const dynamoDB = new AWS.DynamoDB.DocumentClient();
      return dynamoDB
        .update(params)
        .promise()
        .then(res => res.Items)
        .catch(err => err);
    } catch (err) {
        return {error: true, message: err.message, e: err};
    }
};
/**
 * update an item in dynamoDB
 * @async
 * @private
 * @requires module:aws-sdk
 * @return {Array}
 */
 module.exports.updateDBRegion = (params, region) =>{
  try {
    const dynamoDB = new AWS.DynamoDB.DocumentClient({region});
    return dynamoDB
      .update(params)
      .promise()
      .then(res => res.Items)
      .catch(err => err);
  } catch (err) {
      return {error: true, message: err.message, e: err};
  }
};
//Query DB
module.exports.queryDB = (params) =>{
    try {
      const dynamoDB = new AWS.DynamoDB.DocumentClient();
      return dynamoDB
        .query(params)
        .promise()
        .then(res => res.Items)
        .catch(err => err);
    } catch (err) {
        return {error: true, message: err.message, e: err};
    }
};

//Scan DB
module.exports.scanDB = (params) => {
  try {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();
    return dynamoDB
      .scan(params)
      .promise()
      .then(res => res.Items)
      .catch(err => err);
  } catch (err) {
      return {error: true, message: err.message, e: err};
  }
};