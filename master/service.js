/*jshint esversion: 6 */
/* jshint -W117 */
'use strict';
const responses = require('../common/responses');
const Response = require('../model/Response');
const dateFormat = require('dateformat');
const Boom = require('@hapi/boom');
const _ = require('lodash');
const PackMaster = require("../model/PackMaster");

/**
 * creates a new master
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @function view
 * @module collections
 * @param {Header} Header
 * @param {String} Header.Authorization - user auth credentials
 * @public
 * @throws Boom.badData
 * @throws Boom.expectationFailed
 * @description creates a contract ERC721 contract
 * @version 1.0
 * @example Example usage of view function.
 * POST REQUEST: https://{service}.backpac.xyz/master
 * @return {Response} 
 */
module.exports.create = async event => {
   const dt =  dateFormat(new Date(), "isoUtcDateTime");
    try {

        const _PackMaster = new PackMaster('eth');
        const wallet = await _PackMaster.createWallet();

        return responses.respond(new Response(true, dt, wallet), 200);

    } catch (err) {
      console.error(err);
      const boom = Boom.expectationFailed(err.message);
      const response = new Response(
        false,
        dt,
        undefined,
        boom
      );
      return responses.respond(
        response,
        boom.output.statusCode
      );
    }
};