const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
const gm = require('gm').subClass({ imageMagick: true });
const s3 = new AWS.S3();

module.exports.create = (event, context, callback) => {
  console.log(JSON.stringify(event, undefined, 1));
  console.log(JSON.stringify(context, undefined, 1));
  const originalBucket = "sample-uploads";
  const thumbnailBucket = "sample-thumbnails";
  const objectKey = "pixta.jpg";

  // S3の画像にアクセス
  s3.getObject({Bucket: originalBucket, Key: objectKey}, function(err, data){
    if (err) { context.done('error!!!!!!!!!!!', err); }
    if (data === null) { context.done('error getting object', err); }

    // 画像処理 (http://qiita.com/komakomako/items/a33ff4e610e378d986ff と同じ)
    gm(data.Body)
    .resize('450', '350')
    .borderColor('gray')
    .border('245', '245')
    .gravity('Center')
    .crop('450', '350')
    .stream(function(err,stdout,stderr){ // ストリームで出力する
      if(err){
        console.log("gm process error");
        console.log(err,stdout,stderr);
        context.fail(err);
      }
      var chunks = []; // ストリームのチャンクを溜め込むための配列
      stdout.on('data',function(chunk){
        console.log('pushed');
        chunks.push(chunk); // チャンクを溜め込む
      });
      stdout.on('end',function(){
        console.log('end');
        var buffer = Buffer.concat(chunks); // 最後まで溜め込んだら結合してバッファに書き出す
        var params = {
          Bucket: thumbnailBucket,
          Key: "thumb_" + objectKey,
          ContentType: "image/jpg",
          Body: buffer
        };
        s3.putObject(params, function(err, data) { // S3に書き出す
          if(err){
            console.log("gm upload error");
            context.fail(err);
          }
          context.succeed({
            "error":false
          });
        });
        console.log("success!!!!");
      });

      stderr.on('data',function(data){
        console.log('stderr data: ' +  data);
      });
    });
  });
  const response = {
    statusCode: 200,
    body: "{\"status\": \"seikou\"}"
  };
  callback(null, response);
};
