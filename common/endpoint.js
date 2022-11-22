/*jshint esversion: 8 */
/* jshint -W117 */
/* jshint -W097 */
"use strict";
const axios = require('axios');

module.exports._get = (path) => {
    try {
        return axios.get(path);
    } catch (e) {
        console.error(e.message);
        return { error: true, message: e.message, e: e };
    }
};

module.exports._getMulti = (paths) => {
  try {
    let request = [];
    for (const path of paths) {
      request.push(axios.get(path));
    }
    return axios.all(request).then(
      axios.spread((...data) => {
        return data;
      })
    );
  } catch (e) {
    console.error(e.message);
    return { error: true, message: e.message, e: e };
  }
};



module.exports._getWithOptions = (options) => {
    try {
        return axios.request(options);
    } catch (e) {
        console.error(e.message);
        return { error: true, message: e.message, e: e };
    }
};

module.exports._getBasicAuth = (path, username, password) => {
    try {
        return axios.get(path, {
            // Axios looks for the `auth` option, and, if it is set, formats a
            // basic auth header for you automatically.
            auth: {username,password}
          });
    } catch (e) {
        console.error(e.message);
        return { error: true, message: e.message, e: e };
    }
};

module.exports._post = (path, req) => {
    try {
        return axios.post(path, req);
    } catch (e) {
        console.error(e.message);
        return { error: true, message: e.message, e: e };
    }
};
module.exports._postOptions = (path, req, options) => {
    try {
        return axios.post(path, req, options);
    } catch (e) {
        console.error(e.message);
        return { error: true, message: e.message, e: e };
    }
};
module.exports._putBasicAuth = (path, req, auth) => {
    try {
        return axios.put(path, req, {
            // Axios looks for the `auth` option, and, if it is set, formats a
            // basic auth header for you automatically.
            auth
          });
    } catch (e) {
        console.error(e.message);
        return { error: true, message: e.message, e: e };
    }
};
module.exports._putOptions = (path, req, options) => {
    try {
        return axios.put(path, req, options);
    } catch (e) {
        console.error(e.message);
        return { error: true, message: e.message, e: e };
    }
};









