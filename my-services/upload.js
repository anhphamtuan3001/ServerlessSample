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
  var statusCode = 200;
  var resultMsg  = 'Upload success!!';
  bucket.putObject(params, function(err, data) {
    if (err) {
      statusCode = err.statusCode;
      resultMsg  = err.message;
      console.log(err, err.stack);
    } else {
      console.log(data);
    }
  });

  const response = {
    statusCode: statusCode,
    body: JSON.stringify({
      message: resultMsg,
      input: event,
    }),
  };
  callback(null, response);
};
