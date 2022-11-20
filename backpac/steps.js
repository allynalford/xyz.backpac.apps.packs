'use strict';
const log = require('lambda-log');
const dateFormat = require('dateformat');


function CustomError(name, message) {
    this.name = name;
    this.message = message;
}
CustomError.prototype = new Error();


module.exports.packStart = async (event) => {
  let req, dt, issuer, userUUID, name, chain, developeruuid;
  try {
    //req = event.body !== "" ? JSON.parse(event.body) : event;
    req = event;
    log.options.tags = ["log", "<<level>>"];
    dt = dateFormat(new Date(), "isoUtcDateTime");

    developeruuid = req.developeruuid;

    chain = req.chain;

    if (typeof chain === "undefined") throw new Error("chain is undefined");

    if (typeof developeruuid === "undefined") {
      issuer = req.issuer;
      userUUID = req.userUUID;
      name = req.name;

      if (typeof issuer === "undefined") throw new Error("issuer is undefined");
      if (typeof userUUID === "undefined")
        throw new Error("userUUID is undefined");
      if (typeof name === "undefined") throw new Error("name is undefined");
    }
  } catch (e) {
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

  try {
    console.log();

    if (typeof developeruuid === "undefined") {
      console.log("Response", { chain, issuer, userUUID, name, type: "user" });
      return { chain, issuer, userUUID, name, type: "user" };
    } else {
      console.log("Response", { chain, developeruuid, type: "developer" });
      return { chain, developeruuid, type: "developer" };
    }
  } catch (e) {
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }
};


module.exports.createDeveloperWallet = async (event) => {
  let req, dt, chain, developeruuid, name;
  try {
    //req = event.body !== "" ? JSON.parse(event.body) : event;
    req = event;
    dt = dateFormat(new Date(), "isoUtcDateTime");
    developeruuid = req.developeruuid;
    chain = req.chain;

    if (typeof developeruuid === "undefined") throw new Error("developeruuid is undefined");
    if (typeof chain === "undefined") throw new Error("chain is undefined");

  } catch (e){
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

  try {
   
    const DeveloperPack = require('../model/DeveloperPack');

    console.log('Creating Backpac for:', {chain, developeruuid});

    const _DeveloperPack = new DeveloperPack(chain, developeruuid);

    const wallet = await _DeveloperPack.createWallet();

    //console.log('_DeveloperPack', _DeveloperPack);

    console.log('wallet Address', wallet.address);


    return { error: false, success: true, dt};

  }catch (e) {
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

};



module.exports.stop = async (event) => {
    log.options.tags = ['log', '<<level>>'];
    log.info('event', event);

    try {



        return { stop: true };
    } catch (e) {
        log.error(e);
        return e;
    }
};
// {
//     "version":"0",
//     "id":"dd8f2f53-3c6e-43b6-d5b5-312ec08a2e1a",
//     "detail-type":"Step Functions Execution Status Change",
//     "source":"aws.states",
//     "account":"177038571739",
//     "time":"2022-05-18T01:25:09Z",
//     "region":"us-east-1",
//     "resources":[
//        "arn:aws:states:us-east-1:177038571739:execution:shopifySetupStateMachine-remediation-dev:defbf3a9-4962-440a-90a3-7011a5b3944f"
//     ],
//     "detail":{
//        "executionArn":"arn:aws:states:us-east-1:177038571739:execution:shopifySetupStateMachine-remediation-dev:defbf3a9-4962-440a-90a3-7011a5b3944f",
//        "stateMachineArn":"arn:aws:states:us-east-1:177038571739:stateMachine:shopifySetupStateMachine-remediation-dev",
//        "name":"defbf3a9-4962-440a-90a3-7011a5b3944f",
//        "status":"FAILED",
//        "startDate":1652837103848,
//        "stopDate":1652837109161,
//        "input":"{\"domainglobaluuid\":\"2951ef5c-2e98-4f41-8cda-1b091e61301e\",\"companyglobaluuid\":\"7e36dba0-3a3a-11ea-95f7-c5b273ab0a92\"}",
//        "output":null,
//        "inputDetails":{
//           "included":true
//        },
//        "outputDetails":null
//     }
//  }
module.exports.notification = async event => {

    log.options.tags = ['log', '<<level>>'];
    log.info(event);

    //const input = JSON.parse(event.detail.input);

    //log.info(input);




    return { event }
};



