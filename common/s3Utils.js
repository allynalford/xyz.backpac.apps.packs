const AWS = require('aws-sdk');
const s3 = new AWS.S3({region: process.env.REGION, apiVersion: process.env.S3_API_VERSION});
const log = require('lambda-log');
const fs = require('fs');


module.exports._writeFileToTmp = async (params, name) =>{
  try {
      //const images = ["./test/samples/file1.png", "./test/samples/file2.png"]
      

      const Key = "/tmp/" + name;
      const Data = await this._get(params);
      const file = await this._writeFile(Key, Data);

      console.log('file', file);

      return Key;



  } catch (e) {
      console.error(e);
      throw e;
  };
};

module.exports._writeFile = async (Key, Data) => {
  try {

    const writeFile = (Key, Data) => {
      return new Promise((resolve, reject) => {
        fs.writeFile(Key, Data.Body, function (err) {
          if (err) {
            console.log(err, err.stack); // if an error occurred
            return reject(err);
          } else {
            resolve(true);
          }
        });
      });
    }

    return await writeFile(Key, Data);

  } catch (e) {
    console.error(e);
    throw e;
  };
};


module.exports._getUrl = (bucket, key, expires, contenttype) =>{
      try {
        return s3.getSignedUrl('putObject', {
            Bucket: bucket,
            Key: key,
            Expires: expires,
            ContentType: contenttype,
            ACL: 'public-read'
          });
    } catch (err) {
        console.error(err);
        return { error: true, message: err.message, e: err };
    }
};

// module.exports._generateGetUrl =(bucket, key, expires) =>{
//   try {
//     return s3.getSignedUrl('getObject', {
//       Bucket: bucket,
//       Key: key,
//       Expires: expires
//     });
//   } catch (err) {
//     console.error(err);
//     return { error: true, message: err.message, e: err };
//   }
// };

module.exports._generateGetUrl = (bucket, key, expires) =>{
  try {
    //const s3 = new AWS.S3({region: process.env.REGION, apiVersion: process.env.S3_API_VERSION, endpoint, s3BucketEndpoint: true});
    return s3.getSignedUrl('getObject', {
      Bucket: bucket,
      Key: key,
      Expires: expires,
      //ResponseContentType,
      //ResponseContentDisposition: 'inline',
    });
  } catch (err) {
    console.error(err);
    return { error: true, message: err.message, e: err };
  }
};

module.exports._getUrlFull = (bucket, key, expires, contenttype) =>{
  try {
    return s3.getSignedUrl('putObject', {
        Bucket: bucket,
        Key: key,
        Expires: expires,
        ContentType: contenttype,
        ACL: 'public-read'
        });
} catch (err) {
  console.error(err);
    return { error: true, message: err.message, e: err };
}
};

module.exports._put = (params) =>{
    try {
        return s3.putObject(params, function (err, data) {
            if (err)
            return { error: true, message: err.message, e: err };
            else
            return data;
        });
    } catch (err) {
      console.error(err);
        return { error: true, message: err.message, e: err };
    }
};

module.exports._get = (params) =>{
  try {
    // set some optional metadata to be included in all logs (this is an overkill example)
    log.options.meta.params = params;

   return s3.getObject(params)
        .promise()
        .then(res => res.Body)
        .catch(err => err);

  } catch (err) {
    console.error(err);
    return { error: true, message: err.message, e: err };
  }
};

module.exports._getEncrypted = (params) =>{
  try {
    // set some optional metadata to be included in all logs (this is an overkill example)
    log.options.meta.params = params;

   return s3.getBucketEncryption()

  } catch (err) {
    console.error(err);
    return { error: true, message: err.message, e: err };
  }
};

module.exports._getBucketEncryption = async (Bucket) =>{
  try {
    // set some optional metadata to be included in all logs (this is an overkill example)
    log.options.meta.params = {Bucket};

    return await s3.getBucketEncryption({Bucket}).promise()
    .then(res => res.data)
    .catch(err => err);

  } catch (err) {
    console.error(err);
    return { error: true, message: err.message, e: err };
  }
};

module.exports._delete = (params) =>{
  try {
    // set some optional metadata to be included in all logs (this is an overkill example)
    log.options.meta.params = params;
   return s3.deleteObject(params)
        .promise()
        .then(res => res.Body)
        .catch(err => err);

  } catch (err) {
    console.error(err);
    return { error: true, message: err.message, e: err };
  }
}

module.exports._upload = (params) =>{
    try {
        return s3.upload(params, function (err, data) {
            if (err) {
                return { error: true, message: err.message, e: err };
            } if (data) {
                return data;
            }
        });
    } catch (err) {
      console.error(err);
        return { error: true, message: err.message, e: err };
    }
};

module.exports.generateGetUrl = (Key) =>{
    return new Promise((resolve, reject) => {
      const params = {
        Bucket,
        Key,
        Expires: 120 // 2 minutes
      };
      // Note operation in this case is getObject
      s3.getSignedUrl('getObject', params, (err, url) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          // If there is no errors we will send back the pre-signed GET URL
          resolve(url);
        }
      });
    });
  }
  
  // PUT URL Generator
  module.exports.generatePutUrl = (Bucket, Key, Expires, ContentType) =>{
    return new Promise((resolve, reject) => {
      // Note Bucket is retrieved from the env variable above.
      const params = { Bucket, Key, Expires, ContentType, ACL: "public-read"};
      // Note operation in this case is putObject
      s3.getSignedUrl('putObject', params, function(err, url) {
        if (err) {
          console.error(err);
          reject(err);
        }
        // If there is no errors we can send back the pre-signed PUT URL
        resolve(url);
      });
    });
  }
