'use strict';
const aws = require('aws-sdk');
aws.config.region = 'us-west-2';

module.exports.handle = (event, context, callback) => {
  const json = JSON.parse(JSON.stringify(event, undefined, 1));
  console.log(json);
  console.log(JSON.stringify(context, undefined, 1));
  
  const buffer = new Buffer(json.body.replace(/^data.+,/,''), 'base64');
  const params = {
    Key:         json.headers.file_name,
    ContentType: 'image/jpg',
    Body:        buffer
  };
  const options = {
    params: {
      apiVersion: '2006-03-01',
      Bucket:     'sample-uploads'
    }
  };

  var bucket = new aws.S3(options);
  bucket.putObject(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      callback(null, generateResponse(event, err.statusCode, err.message));
    } else {
      console.log(data);
      callback(null, generateResponse(event, err.statusCode, err.message));
    }
  });
};

function generateResponse(event, statusCode, resultMsg) {
  const response = {
    statusCode: statusCode,
    body: JSON.stringify({
      message: resultMsg,
      input: event,
    }),
  };
  return response;
}
