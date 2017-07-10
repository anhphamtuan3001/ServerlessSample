'use strict';
const aws = require("aws-sdk");
aws.config.region = 'us-west-2';
const dynamoDB = new aws.DynamoDB({region: 'us-west-2'});

module.exports.store_metadata_for_dynamo = (event, context, callback) => {
  console.log(JSON.stringify(event, undefined, 1));
  console.log(JSON.stringify(context, undefined, 1));
  
  event.Records.forEach(function(record){
    var params = {
      TableName: 'sample-items',
      Item: {
        'bucket':    { "S": record.s3.bucket.name },
        'file_name': { "S": record.s3.object.key },
        'size':      { "N": record.s3.object.size.toString() }
      }
    };
    dynamoDB.putItem(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log(data);
      }
    });
  });

  const response = {
    statusCode: 200,
    body: "{\"status\": \"seikou\"}"
  };
  callback(null, response);
};
