'use strict';
const aws = require("aws-sdk");
aws.config.region = 'us-west-2';

module.exports.handle = (event, context, callback) => {
  const json = JSON.parse(JSON.stringify(event, undefined, 1));
  console.log(json);
  console.log(JSON.stringify(context, undefined, 1));
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };
  const buffer = new Buffer(json.body.replace(/^data.+,/,""), 'base64'); // ファイルのbase64データ以外の情報を消す。
  var params = {
    Key: json.headers.file_name,
    ContentType: "image/jpg",
    Body: buffer
  };
  var options = {
    params: {
      apiVersion: '2006-03-01',
      Bucket: "sample-uploads"
    }
  };
  var bucket = new aws.S3(options);
  bucket.putObject(params, function(err, data) {
    if (err) {
      //resultMsg = "Error uploading data";
      //statusCode = 500;
      //console.log(resultMsg, err);
    } else {
      //console.log(resultMsg, data);
    }
    context.done(null, 'Finished UploadObjectOnS3');
  });

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
