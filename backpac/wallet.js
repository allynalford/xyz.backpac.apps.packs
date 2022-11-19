/*jshint esversion: 6 */
/* jshint -W117 */
'use strict';
const dateFormat = require('dateformat');
const responses = require('../common/responses.js');
const CryptoJS = require("crypto-js");
const s3 = require('../common/s3Utils');
const Pack = require('../model/Pack');
const DeveloperPack = require('../model/DeveloperPack');


module.exports.createDeveloperWallet = async (event) => {
  let req, dt, chain, developerUUID, name;
  try {
    req = JSON.parse(event.body);
    dt = dateFormat(new Date(), "isoUtcDateTime");
    developeruuid = req.developeruuid;
    chain = req.chain;

    if (typeof developeruuid === "undefined") throw new Error("developeruuid is undefined");
    if (typeof chain === "undefined") throw new Error("chain is undefined");

  } catch (e) {
    console.error(e);
    return respond(
      {
        success: false,
        error: true,
        message: e.message,
        e,
      },
      416
    );
  }

  try {
   


    const _DeveloperPack = new DeveloperPack(chain, developeruuid);

    console.log(_DeveloperPack);


    return responses.respond({ error: false, success: true, dt }, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.getMetadatav2", err.response.data);

    if(typeof err.response.data !== "undefined"){
      return responses.respond({metaData: err.response.data, error: true, success: false}, 200);
    }
    return responses.respond(res, 201);
  }

};

module.exports.createWallet = async (event) => {
  let req, dt, issuer, userUUID, name;
  try {
    req = JSON.parse(event.body);
    dt = dateFormat(new Date(), "isoUtcDateTime");
    issuer = req.issuer;
    userUUID = req.userUUID;
    name = req.name;

    if (typeof issuer === "undefined") throw new Error("issuer is undefined");
    if (typeof userUUID === "undefined") throw new Error("userUUID is undefined");
    if (typeof name === "undefined") throw new Error("name is undefined");

  } catch (e) {
    console.error(e);
    return respond(
      {
        success: false,
        error: true,
        message: e.message,
        e,
      },
      416
    );
  }

  try {
    const fs   = require('fs');
    const privateKEY  = fs.readFileSync('pri.key', 'utf8');
    const hashKEY  = fs.readFileSync('pri.h.key', 'utf8');
    const backpac = require("./utils");
    const wallet = await backpac._createWallet();

    console.log(wallet);
    console.log("address:", wallet.address);
    console.log("mnemonic:", wallet.mnemonic.phrase);
    console.log("privateKey:", wallet.privateKey);


    //Create hash
    const hash = CryptoJS.AES.encrypt(
      issuer+":"+userUUID+":"+name,
      hashKEY
    ).toString();

    console.log('hash',hash); 

    // Encrypt

    var address = CryptoJS.AES.encrypt(
      wallet.address,
      privateKEY
    ).toString();


    var privateKey = CryptoJS.AES.encrypt(
      wallet.privateKey,
      privateKEY
    ).toString();

    var phrase = CryptoJS.AES.encrypt(
      wallet.mnemonic.phrase,
      hashKEY
    ).toString();

    console.log({address, privateKEY, phrase}); // 'my message'


    // Decrypt
    var bytes = CryptoJS.AES.decrypt(mnem, privateKEY);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);

    console.log(originalText); // 'my message'

    var bytes2 = CryptoJS.AES.decrypt(hash, hashKEY);
    var originalText2 = bytes2.toString(CryptoJS.enc.Utf8);

    console.log(originalText2); // 'my message'

    return responses.respond({ error: false, success: true, dt }, 200);
  } catch (err) {
    console.error(err);
    const res = {
      error: true,
      success: false,
      message: err.message,
      e: err,
      code: 201,
    };
    console.error("module.exports.getMetadatav2", err.response.data);

    if(typeof err.response.data !== "undefined"){
      return responses.respond({metaData: err.response.data, error: true, success: false}, 200);
    }
    return responses.respond(res, 201);
  }

};