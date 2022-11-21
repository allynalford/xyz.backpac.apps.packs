'use strict';
const log = require('lambda-log');
const dateFormat = require('dateformat');


function CustomError(name, message) {
    this.name = name;
    this.message = message;
}
CustomError.prototype = new Error();


module.exports.collectionStart = async (event) => {
  let req, chainDeveloperuuid, contractId, developeruuid, username, dt;
  try {
    //req = event.body !== "" ? JSON.parse(event.body) : event;
    req = event;
    log.options.tags = ["log", "<<level>>"];
    dt = dateFormat(new Date(), "isoUtcDateTime");

    developeruuid = req.developeruuid;
    contractId = req.contractId;
    chainDeveloperuuid = req.chainDeveloperuuid;
    username = req.username;

    if (typeof developeruuid === "undefined")
      throw new Error("developeruuid is undefined");

    if (typeof contractId === "undefined")
      throw new Error("contractId is undefined");
    if (typeof chainDeveloperuuid === "undefined")
      throw new Error("chainDeveloperuuid is undefined");
    if (typeof username === "undefined")
      throw new Error("username is undefined");

  } catch (e) {
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

  try {
    console.log("Checking Wallet Exists", { chainDeveloperuuid, contractId, developeruuid });

    const chain = chainDeveloperuuid.split(":")[0];

    //Let's make sure we have a wallet
    const DeveloperPack = require('../model/DeveloperPack');

    const _DeveloperPack = new DeveloperPack(chain, developeruuid);
    await _DeveloperPack.setHash();
    const exists = await _DeveloperPack.exists();

    if(typeof exists === "undefined"){
      console.info("No Wallet Exists", { chainDeveloperuuid, contractId, developeruuid });
      return { hasWallet: "false", chainDeveloperuuid, contractId, developeruuid };
    }

    return {hasWallet: "true", chainDeveloperuuid, contractId, developeruuid, hash: exists.hash };

  } catch (e) {
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }
};


module.exports.estimateFees = async (event) => {
  let req, dt, chainDeveloperuuid, contractId, developeruuid;
  try {
    //req = event.body !== "" ? JSON.parse(event.body) : event;
    req = event;
    dt = dateFormat(new Date(), "isoUtcDateTime");
    developeruuid = req.developeruuid;
    contractId = req.contractId;
    chainDeveloperuuid = req.chainDeveloperuuid;

    if (typeof developeruuid === "undefined") throw new Error("developeruuid is undefined");
    if (typeof chainDeveloperuuid === "undefined") throw new Error("chainDeveloperuuid is undefined");
    if (typeof contractId === "undefined") throw new Error("contractId is undefined");

  } catch (e){
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

  try {
   
    const DeveloperPack = require('../model/DeveloperPack');
    const chain = chainDeveloperuuid.split(":")[0];

    console.log('Getting Backpac for:', {chain, developeruuid});

    const _DeveloperPack = new DeveloperPack(chain, developeruuid);

    await _DeveloperPack.setHash();
    await _DeveloperPack.get();

    //console.log('_DeveloperPack', _DeveloperPack);

    const DeveloperContract = require('../model/DeveloperContract');
    const _DeveloperContract = new DeveloperContract(developeruuid, chain, contractId);
    await _DeveloperContract.get();

    console.log('_DeveloperContract', _DeveloperContract);

    //check the wallet balanace
    const ethers = require('ethers');
    const ContractFactory = ethers.ContractFactory;


    let provider =  new ethers.providers.AlchemyProvider(process.env.STAGE, process.env.ALCHEMY_API_KEY);
    const balance = await provider.getBalance(_DeveloperPack.as);

    const addressBalance = ethers.utils.formatEther(balance)
    

    console.info(`Address Balance( ${_DeveloperPack.as}):`, addressBalance);


    const contractData =  require("../contracts/Backpac.json");

    const contract = new ContractFactory(contractData.abi, contractData.data.bytecode);


    const deploymentData = contract.interface.encodeDeploy([_DeveloperContract.name, _DeveloperContract.symbol, _DeveloperContract.total_supply, 0, "https://ipfs.filebase.io/ipfs/"]);

    const estimatedGas = await provider.estimateGas({ data: deploymentData });

    const gasEstimate = ethers.utils.formatEther(estimatedGas);

    console.info('gasEstimate', gasEstimate);

    //if user wallet has less then the gas Estimate, top them up
    if (addressBalance <= gasEstimate) {
      //Grab a Packmaster and transfer the whats needed
      const PackMaster = require("../model/PackMaster");

      const _PackMaster = new PackMaster(chain);

      await _PackMaster.current();

      let wallet = new ethers.Wallet(_PackMaster.pv);

      let walletSigner = wallet.connect(provider);

      const gas_price = await provider.getGasPrice(); // gasPrice

      console.log(gas_price);

      let gas_limit = "0x100000";

      const tx = {
        from: _PackMaster.as,
        to: _DeveloperPack.as,
        value: ethers.utils.parseEther(gasEstimate),
        nonce: await provider.getTransactionCount(_PackMaster.as, "latest"),
        gasLimit: ethers.utils.hexlify(gas_limit), // 100000
        gasPrice: gas_price,
      };

      const sent = await walletSigner.sendTransaction(tx);

      console.log(sent);
    }else{
      console.info("User can cover deployment", {addressBalance, gasEstimate})
    }
   

    return {hasGas: "true", dt, chainDeveloperuuid, contractId, developeruuid};

  }catch (e) {
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

};


module.exports.deployContract = async (event) => {
  let req, dt, chainDeveloperuuid, contractId, developeruuid;
  try {
    //req = event.body !== "" ? JSON.parse(event.body) : event;
    req = event;
    dt = dateFormat(new Date(), "isoUtcDateTime");
    developeruuid = req.developeruuid;
    contractId = req.contractId;
    chainDeveloperuuid = req.chainDeveloperuuid;

    if (typeof developeruuid === "undefined") throw new Error("developeruuid is undefined");
    if (typeof chainDeveloperuuid === "undefined") throw new Error("chainDeveloperuuid is undefined");
    if (typeof contractId === "undefined") throw new Error("contractId is undefined");

  } catch (e){
    console.error(e);
    const error = new CustomError("HandledError", e.message);
    return error;
  }

  try {
   
    const DeveloperPack = require('../model/DeveloperPack');
    const chain = chainDeveloperuuid.split(":")[0];

    console.log('Getting Backpac for:', {chain, developeruuid});

    const _DeveloperPack = new DeveloperPack(chain, developeruuid);

    await _DeveloperPack.setHash();
    await _DeveloperPack.get();


    const DeveloperContract = require('../model/DeveloperContract');
    const _DeveloperContract = new DeveloperContract(developeruuid, chain, contractId);
    await _DeveloperContract.get();


    //check the wallet balanace
    const ethers = require('ethers');
    const ContractFactory = ethers.ContractFactory;

    console.log('Address:', _DeveloperPack.as);

    let provider =  new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_API_KEY);

  

    const contractData =  require("../contracts/Backpac.json");

    let wallet = new ethers.Wallet(_DeveloperPack.pv, provider);
    let walletSigner = wallet.connect(provider);

    const factory = new ContractFactory(contractData.abi, contractData.data.bytecode, walletSigner);
    const price = "0";

    console.log('Deploying......');

    const gas_price = await provider.getGasPrice();

    const _gas_price = ethers.utils.formatEther(gas_price);

    console.info('_gas_price', _gas_price);

    const balance = await provider.getBalance(_DeveloperPack.as);

    const addressBalance = ethers.utils.formatEther(balance);

    const deploymentData = factory.interface.encodeDeploy([_DeveloperContract.name, _DeveloperContract.symbol, _DeveloperContract.total_supply, 0, "https://ipfs.filebase.io/ipfs/"]);

    const estimatedGas = await provider.estimateGas({ data: deploymentData });

    const gasEstimate = ethers.utils.formatEther(estimatedGas);

    console.info('gasEstimate', gasEstimate);
    

    let contract = await factory.deploy(
      _DeveloperContract.name,
      _DeveloperContract.symbol,
      _DeveloperContract.total_supply,
      price,
      "https://ipfs.filebase.io/ipfs/",
      {
        gasPrice: gas_price,
        gasLimit: 9995000,
        nonce: await provider.getTransactionCount(_DeveloperPack.as, "latest"),
        value: 0
      }
    );
   

  
        // The address the Contract WILL have once mined
    // See: https://ropsten.etherscan.io/address/0x2bd9aaa2953f988153c8629926d22a6a5f69b14e
    console.log('Contract Address: ',contract.address);
    // "0x2bD9aAa2953F988153c8629926D22A6a5F69b14E"

    // The transaction that was sent to the network to deploy the Contract
    // See: https://ropsten.etherscan.io/tx/0x159b76843662a15bd67e482dcfbee55e8e44efad26c5a614245e12a00d4b1a51
    console.log('Contract hash: ',contract.deployTransaction.hash);
    // "0x159b76843662a15bd67e482dcfbee55e8e44efad26c5a614245e12a00d4b1a51"

    // The contract is NOT deployed yet; we must wait until it is mined
    await contract.deployed();
    
    const update = await _DeveloperContract._updateFields(_DeveloperContract.chainDeveloperuuid, _DeveloperContract.contractId, [
      { name: "contractAddress", value: contract.address },
      { name: "txHash", value: contract.deployTransaction.hash },
      { name: "owner", value: _DeveloperPack.as },
      { name: "stage", value: "DEPLOYED" },
      { name: "status", value: true },
      { name: "schema_name", value: "ERC721" },
      { name: "category", value: ["DEFAULT"] },
      { name: "privacy", value: ["PUBLIC"] },
    ]);


    console.log('Update', update)

    return { error: false, success: true, dt, gasEstimate, addressBalance};

  }catch (e) {
    console.error(e.message);
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



