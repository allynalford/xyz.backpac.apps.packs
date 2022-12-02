
'use strict';
const log = require('lambda-log');
const AWS = require('aws-sdk');
const Handlebars = require("handlebars");
//const emailHTML = require('../templates/email-inlined.html');
var SES = new AWS.SES({apiVersion: '2010-12-01'});



/**
 * constructor for Assets Object
 *
 * @author Allyn j. Alford <Allyn@backpac.xyz>
 * @constructs Assets
 * @class
 * @param {String} issuer - did:ethr:0x76f65345F81011eC2d76A15761Ba3f3638646DA1
 * @param {String} chain - ETHEREUM|FLOW|TEZOS|POLYGON|SOLANA
 * @param {Array} addresses list of contract addresses [test@test.com,test@xyz.com]
 * @example Example usage of Assets Object.
 * @return {Assets} Assets Instance Object
 */
function Email(Source, ToAddresses, subject,  data) { 
    this.Source  = Source;
    this.Destination = { 
        ToAddresses
    };
    this.subject = subject;
    this.data = data || {};
    this.emailHTML = "";
    this.Message =  {
        Body: {
            Html: {
                Charset: "UTF-8",
                Data: this.emailHTML
            }
        },
        Subject: {
            Charset: 'UTF-8',
            Data: subject
        }
    }

};


/**
 * get the unique contract Id name
 *
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of getId.</caption>
 * @return {String} contractUUID
 */
 Email.prototype.BuildEmail = async function () {
   try {
     Handlebars.registerHelper("print_person", function () {
       return this.data.firstname + " " + this.data.lastname;
     });

     Handlebars.registerHelper("uppercase", function (aString) {
       return aString.toUpperCase();
     });

     Handlebars.registerHelper("isPassed", function (value) {
       return value === 0;
     });

     Handlebars.registerHelper("per", function (value, total) {
       return Math.floor((value / total) * 100);
     });

     const s3Utils = require("../common/s3Utils.js");
     //Grab the template from S3
     const BodyHtml = await s3Utils._get({
       Bucket: process.env.EMAIL_TEMPLATES_BUCKET,
       Key: process.env.S3_CLAIM_EMAIL_TEMPLATE_KEY,
     });

     if (!BodyHtml) {
       log.error(process.env.S3_CLAIM_EMAIL_TEMPLATE_KEY, BodyHtml);
       throw new Error("S3 Error");
     }

     //var source = document.getElementById("entry-template").innerHTML;
     var template = Handlebars.compile(BodyHtml.toString());
     const emailHTML = template(this.data);

     this.emailHTML = emailHTML;

     return emailHTML;

   } catch (e) {
     console.error(e);
     throw e;
   }
 };


 Email.prototype.SendEmail = async function(emailHTML) {
    
    if (typeof this.Source !== 'string') {
        return Promise.reject(new Error('Missing from email in config.json'));
    }
    
    if (typeof this.Destination.ToAddresses !== 'object') {
        return Promise.reject(new Error('Missing recipient(s)'));
    }


    if (typeof this.Destination.ToAddresses.length === 0) {
        return Promise.reject(new Error(`Missing to email(s) for recipient(s)`));
    }

    if (typeof this.Message.Subject.Data !== 'string') {
        return Promise.reject(new Error(`Missing subject`));
    }

    this.Message = {
        Source: this.Source,
        Destination: this.Destination,
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: emailHTML
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: this.subject
            }
        }
    };
    
    return new Promise((resolve, reject) => {
        SES.sendEmail(this.Message, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
}

/**
 * get the unique contract Id name
 *
 * @requires module:./dynamo.js
 * @requires module:lambda-log
 * @requires module:dateformat
 * @example <caption>Example usage of getId.</caption>
 * @return {String} contractUUID
 */
Email.prototype.getId = function() {
    return this.Source + this.Message;
};

/**
 * check contract against contract
 *
 * @example <caption>Example usage of equals.</caption>
 * @return {Boolean} true | false
 */
Email.prototype.equals = function(otherSolution) {
    return otherSolution.getId() == this.getId();
};
/**
 * fill contract with additional fields
 *
 * @example <caption>Example usage of fill.</caption>
 * @return {Void}
 */
 Email.prototype.fill = function(newFields) {
    for (var field in newFields) {
        if (this.hasOwnProperty(field) && newFields.hasOwnProperty(field)) {
            if (this[field] !== 'undefined') {
                this[field] = newFields[field];
            }
        }
    }
};







const resolveIpAddress = function (event) {
    const X_FORWARDED_FOR = 'X-Forwarded-For';
    if (!event || !event.headers) {
        return;
    }

    var result = event.headers[X_FORWARDED_FOR];
    if (!result) {
        return;
    }

    var index = result.indexOf(',');
    if (index === -1) {
        return result;
    }

    return result.substring(0, index);
}

const formatObject = function(data) {
    return Object.keys(data).filter(key => {
        return !!data[key];
    }).map((key) => {
        return `${key}: ${data[key]}`;
    }).join('\r\n');
}

const sendEmail = async function(body, event) {
    var ses = new aws.SES({apiVersion: '2010-12-01'});

    if (typeof config.from !== 'string') {
        return Promise.reject(new Error('Missing from email in config.json'));
    }
    
    if (typeof body.recipient !== 'string') {
        return Promise.reject(new Error('Missing recipient from request'));
    }

    var recipient = config.recipients[body.recipient];
    if (!recipient) {
        return Promise.reject(new Error(`Missing recipient from config matching ${body.recipient}`));
    }

    if (typeof recipient.to !== 'string') {
        return Promise.reject(new Error(`Missing to email from recipient ${body.recipient}`));
    }

    if (typeof recipient.subject !== 'string') {
        return Promise.reject(new Error(`Missing subject from recipient ${body.recipient}`));
    }

    var data = body.data;
    if (!data) {
        data = {};
    }

    data['IP Address'] = resolveIpAddress(event);



    var emailRequest = new SES.Types.SendEmailRequest({
        Source: config.from,
        Destination: { 
            ToAddresses: [ recipient.to ]
        },
        Message: {
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: formatObject(data)
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: recipient.subject
            }
        }
    })
    
    return new Promise((resolve, reject) => {
        ses.sendEmail(emailRequest, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
}

// const parseRequestBody = function (event) {
//     try {
//         return JSON.parse(event.body);
//     } catch (err) {
//         console.error('Error parsing request', err);
//         return undefined;
//     }
// }

// export const handler = function (event, context, callback) {
//     var body = parseRequestBody(event);
    
//     if (!body) {
//         return callback(null, {
//             statusCode: 400,
//             headers: {
//                 "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
//                 "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
//               },
//             body: JSON.stringify({ message: 'Error parsing request' }),
//         });
//     }

//     sendEmail(body, event).then(() => {
//         callback(null, {
//             statusCode: 200,
//             headers: {
//                 "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
//                 "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
//               },
//             body: JSON.stringify({ message: 'Success' })
//         });
//     }, err => {
//         console.error('Error sending email', err.message);
//         callback(null, {
//             statusCode: 500,
//             headers: {
//                 "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
//                 "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
//               },
//             body: JSON.stringify({ message: 'Server error' })
//         });
//     });
// }

module.exports = Email;