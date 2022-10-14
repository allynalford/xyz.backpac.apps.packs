module.exports.respond = (b, statusCode) => {
    return {
      statusCode,
      body: JSON.stringify(b),
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "POST,GET"
      }
    };
  };
  module.exports.respondWithCookie = (b, statusCode, headerz) => {
    let headers = headerz;
    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Content-Type"] = "application/json"
    headers["Access-Control-Allow-Methods"] = "POST,GET"
    return {
      statusCode,
      body: JSON.stringify(b),
      headers
    };
  };
  module.exports.respondpure = (b, statusCode) => {
    return {
      statusCode,
      body: b,
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "POST,GET"
      }
    };
  };