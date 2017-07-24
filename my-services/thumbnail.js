const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
const gm = require('gm').subClass({ imageMagick: true });
const s3 = new AWS.S3();

module.exports.create = (event, context, callback) => {
  console.log(JSON.stringify(event, undefined, 1));
  console.log(JSON.stringify(context, undefined, 1));
  const originalBucket = 'sample-uploads';
  const thumbnailBucket = 'sample-thumbnails';
  const objectKey = 'pixta.jpg';

  s3.getObject({Bucket: originalBucket, Key: objectKey}, function(err, data) {
    // 画像処理
    gm(data.Body)
    .resize('450', '350')
    .borderColor('gray')
    .border('245', '245')
    .gravity('Center')
    .crop('450', '350')
    .stream(function(err,stdout,stderr) { // ストリームで出力する
      if(err) {
        console.log('gm process error');
        console.log(err, err.stack);
        callback(null, generateResponse(event, err.statusCode, err.message));
      }
      var chunks = []; // ストリームのチャンクを溜め込むための配列
      stdout.on('data',function(chunk) {
        console.log('pushed');
        chunks.push(chunk); // チャンクを溜め込む
      });
      stdout.on('end',function() {
        console.log('end');
        var buffer = Buffer.concat(chunks); // 最後まで溜め込んだら結合してバッファに書き出す
        var params = {
          Bucket: thumbnailBucket,
          Key: 'thumb_' + objectKey,
          ContentType: 'image/jpg',
          Body: buffer
        };
        s3.putObject(params, function(err, data) { // S3に書き出す
          if(err) {
            console.log(err, err.stack);
            callback(null, generateResponse(event, err.statusCode, err.message));
          } else {
            console.log(data);
            callback(null, generateResponse(event, 200, 'Upload Success!!'));
          }
        });
      });
      stderr.on('data',function(data) {
        console.log('stderr data: ' +  data);
      });
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
