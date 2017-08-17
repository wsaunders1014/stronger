var express = require('express');
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

var Promise = require('promise');
ffmpeg.setFfmpegPath(ffmpegPath);
var timemark = null;
var AWS = require('aws-sdk');
var S3Client = new AWS.S3({apiVersion: '2006-03-01'});

var app = express();
var overlay = 'STR_TT_3.png';
app.use(express.static(__dirname));
app.use(fileUpload());
app.post('/upload', function(req,res){
	/*  WORKS! File is uploaded to tmp server, encoded, saved, then uploaded to S3 Bucket, returns the url that loads the move into page */
	console.log('Request received');
	if (!req.files)
     	return res.status(400).send('No files were uploaded.');
    var video = {name:req.files.video.name.slice(0,req.files.video.name.lastIndexOf('.')), ext:req.files.video.name.slice(req.files.video.name.lastIndexOf('.')+1,req.files.video.name.length)}
    console.log(video)
    var timestamp = Date.now();
    var tmpName = video.name+'_'+timestamp;
    console.log(tmpName)
    req.files.video.mv('tmp/'+tmpName+'.'+video.ext);
    
	var command = ffmpeg();
	command.on('end', onEnd)
	.on('progress', onProgress)
	.on('error', onError)
	.input('tmp/'+tmpName+'.'+video.ext)
	.input(overlay)
	.complexFilter(["[1][0]scale2ref=iw:iw*0.5625[overlay][base];[base][overlay]overlay[v]"])
	.outputOptions(['-map [v]'])
	.output('uploads/'+tmpName+'.mp4')
	.run();
	function onEnd() {
		console.log('Finished processing');
		//res.send('uploads/'+tmpName);
		var timestamp2 = Date.now();
		var timeElapsed = (timestamp2-timestamp)/1000;
		//res.send({video_url:'uploads/'+tmpName, timeElapsed:timeElapsed});
		var params = {ACL:'public-read', Bucket: 'wsaunders1014-test', Key: 'uploads/'+tmpName+'.mp4', Body: fs.createReadStream('uploads/'+tmpName+'.mp4')};
		
		var uploadPromise = S3Client.upload(params).promise();
		uploadPromise.then(function(data){
			console.log(data.Location);
			var timestamp2 = Date.now();
			var timeElapsed = (timestamp2-timestamp)/1000;
			res.send({video_url:data.Location, timeElapsed:timeElapsed});
		})
		
	}
	function onError(err, stdout, stderr) {
		console.log(err, stdout,stderr)
		console.log('Cannot process video: ' + err.message);
		res.send(stderr);
}
	/* Attempting to send stream to AWS Encoder instead of using ffmpeg  */
});
function onProgress(progress){
 // if (progress.timemark != timemark) {
 // timemark = progress.timemark;
 //console.log('Progress: ' + progress.percent + '% done');
 console.log('Processing...');
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

app.listen(3000, function(){
	console.log('App listening on port 3000!');
});
//module.exports = app;