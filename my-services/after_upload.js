'use strict';
const aws = require('aws-sdk');
aws.config.region = 'us-west-2';
const dynamoDB = new aws.DynamoDB({region: 'us-west-2'});

module.exports.store_metadata_for_dynamo = (event, context, callback) => {
  console.log(JSON.stringify(event, undefined, 1));
  console.log(JSON.stringify(context, undefined, 1));
  
  event.Records.forEach(function(record) {
    const params = {
      TableName: 'sample-items',
      Item: {
        'bucket':      { 'S': record.s3.bucket.name },
        'file_name':   { 'S': record.s3.object.key },
        'size':        { 'N': record.s3.object.size.toString() },
        'uploaded_at': { 'N': (new Date()).getTime().toString() }
      }
    };
    dynamoDB.putItem(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        callback(null, generateResponse(event, err.statusCode, err.message));
      } else {
        console.log(data);
        callback(null, generateResponse(event, 200, 'Upload Success!!'));
      }
    });
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
