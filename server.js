var express = require('express');
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const ffprobeStatic = require('ffprobe-static');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
var ExifImage = require('exif').ExifImage;
const fs = require('fs');
var ejs =require('ejs');
var path = require('path');
var Promise = require('promise');
	ffmpeg.setFfmpegPath(ffmpegPath);
	ffmpeg.setFfprobePath(ffprobeStatic.path)
var timemark = null;
var AWS = require('aws-sdk');
var S3Client = new AWS.S3({apiVersion: '2006-03-01'});
var https = require('https');
var twitterAPI = require('node-twitter-api');
	var consumerKey= 'itx3ZlcAf50t6EeBAMYIZoYVP',
	consumerSecret= 'Azv7FBLx6oBrC2ioYZNoJnSg9BDZy8oHVTVtPDjFAVJdTILCyB';
var http = require('http');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var app = express();
var https_options = {
 ca: fs.readFileSync("stronger.ca-bundle"),
 key: fs.readFileSync("stronger.key"),
 cert: fs.readFileSync("stronger.crt")
};

app.get('/', function(req,res){
	res.send('Site Ready');
})
app.use(session({saveUninitialized:true,resave:true, store: new FileStore({}),secret:'stg'}));
app.get('/dev', function(req,res){

	if(req.session.url == null){
		req.session.url = null;
		req.session.type = null;
	}
	fs.readFile('dist/index.html','utf-8', function(err,content){
		res.set('Content-Type','text/html');
		var rendered = ejs.render(content, {at:null,ats:null,shareModal:false,url:req.session.url,type:req.session.type,videoW:req.session.videoW,videoH:req.session.videoH});
		res.end(rendered);
	})
});


app.use(express.static(__dirname+'/dist'));
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/upload', function(req,res){
	console.log(req.body)
	/*  WORKS! File is uploaded to tmp server, encoded, saved, then uploaded to S3 Bucket, returns the url that loads the move into page */
	console.log('Request received');
	if (!req.files)
     	return res.status(400).send({message:'No files were uploaded.'});

    var video = {
    	name:req.files.video.name.slice(0,req.files.video.name.lastIndexOf('.')).split(' ').join('_'), //split name from ext and remove spaces
    	ext:req.files.video.name.slice(req.files.video.name.lastIndexOf('.')+1,req.files.video.name.length).toLowerCase()
    }
    console.log(video.name + '.'+video.ext)
    var acceptedExt = ['jpg','gif','png','mp4','mov','avi','webm','flv','m4v','.ogg'];
    if(acceptedExt.indexOf(video.ext) == -1)
    	return res.status(200).send({error:true, message:'File type is invalid.'});

    //ADD Timestamp
  	var timestamp = Date.now();
    var tmpName = video.name+'_'+timestamp;
    var isVideo = true;
    if(acceptedExt.indexOf(video.ext) < 3)
    	isVideo = false;
    //Move validated files to tmp directory
    req.files.video.mv('tmp_files/'+tmpName+'.'+video.ext);
    var videoW = null;
    var videoH = null;
    var orientation = 1;
  	
  
  	if(video.ext == 'jpg' || video.ext == 'jpeg'){
  		try {
		    new ExifImage({ image : 'tmp_files/'+tmpName+'.'+video.ext }, function (error, exifData) {
		        if (error)
		            console.log('Error: '+error.message);
		        else{
		        	orientation = exifData.image.Orientation;
		        }
		        probe();
		    });
		} catch (error) {
		    console.log('Error: ' + error.message);
		    probe();
		}
  	}else{
  		probe();
  	}
    function probe(){
    	var command = ffmpeg('tmp_files/'+tmpName+'.'+video.ext);
    	command.ffprobe(function(err,data){
	    	if(err){
	    		console.log(err);
	    		//res.send(err)
	    	}else{
	    		//res.send(data);
	    		
				var videoStream = (data.streams.length > 1) ? data.streams[1]:data.streams[0];
	  			console.log(videoStream);
		  		var landscape = true;
		  		videoW = videoStream.width;
		  		videoH = videoStream.height;

		  		//CHECK DIMENSIONS AGAINST MINIMUM
		  		if(videoW <300 || videoH < 300)
		  			return res.status(200).send({error:true, message:'File must be at least 300x300 pixels.'});
		  		var constrainWidth = (videoW > videoH) ? true:false;
		  		if(!constrainWidth || videoStream.rotation == '-90' || videoStream.rotation == '90') {
		  			landscape = false;
		  		}
		  		// Route type to function
		  		if(!isVideo)
		  			addOverlayToImage(videoW,videoH);
		  		else
		  			addOverlayToVideo(videoW,videoH,landscape);
		    	}
	    })
    }
	

	function addOverlayToVideo(w,h,landscape){
		//var scale = 'iw:iw*0.5625';
		var overlayHashtag = 'overlay_hashtag.png';
		var scale = '-1:720';
		if(w > 1000) var scale = '1280:-1';
		switch(req.body.color) {
			case 'steel':
				var overlayText = 'overlay_text.png';
			break;
			case 'white':
				var overlayText = 'overlay_textw.png';
			break;
			case 'black':
				var overlayText = 'overlay_textb.png';
			break;
			default:
			break;
		}
		// switch(req.body.color) {
		// 	case 'steel':
		// 		var overlay = 'overlay_1920.png';
		// 	break;
		// 	case 'white':
		// 		var overlay = 'overlay_1920w.png';
		// 	break;
		// 	case 'black':
		// 		var overlay = 'overlay_1920b.png';
		// 	break;
		// 	default:
		// 	break;
		// }
		
		// if(!landscape){
		// 	scale = 'iw:ih';
		// 	switch(req.body.color) {
		// 		case 'steel':
		// 			overlay = 'overlay_1080.png';
		// 		break;
		// 		case 'white':
		// 			overlay = 'overlay_1080w.png';
		// 		break;
		// 		case 'black':
		// 			overlay = 'overlay_1080b.png';
		// 		break;
		// 		default:
		// 		break;
		// 	}
		// }
		var command = ffmpeg();
		command.on('end', onEnd)
		.on('progress', onProgress)
		.on('error', onError)
		.input('tmp_files/'+tmpName+'.'+video.ext)
		.input(overlayText)
		.input(overlayHashtag)
		//.complexFilter(["[1][0]scale2ref="+scale+"[overlay][base];[base][overlay]overlay[v]"])
		.complexFilter(["[0]scale="+scale+":force_original_aspect_ratio=decrease [scaled0];[1][scaled0]scale2ref=iw/2:'min(500\,ow*0.40706126687435)'[overlay][base];[base][overlay]overlay=main_w-overlay_w:0[v];[v][2]overlay=10:main_h-overlay_h-5[out]"])
		.outputOptions(['-map [out]'])
		.output('uploads/'+tmpName+'.mp4')
		.run();
	}
	function addOverlayToImage(w,h){
		switch(req.body.color) {
			case 'steel':
				var overlayText = 'overlay_text.png';
			break;
			case 'white':
				var overlayText = 'overlay_textw.png';
			break;
			case 'black':
				var overlayText = 'overlay_textb.png';
			break;
			default:
			break;
		}
		var flip = null;
		switch(orientation){
			case 3: //upside  down
				flip = '[0]transpose=2, transpose=2:none[in];[in]';
				break;
			case 6: // vertical flipped; selfie mode on iphone
				flip = '[0]transpose=1:none[in];[in]';
				break;
			case 8: //vertical normal
				flip = '[0]transpose=2:none[in];[in]';
				break;
			default:
				flip = '[0]';
				break;

		}
		var overlayHashtag = 'overlay_hashtag.png';
		var scale = '-1:1000';
		if(w > 1000) var scale = '1000:-1';
		
		var command = ffmpeg();
		command.on('end', onEnd)
		.on('progress', onProgress)
		.on('error', onError)
		.input('tmp_files/'+tmpName+'.'+video.ext)
		.input(overlayText)
		.input(overlayHashtag)
		.complexFilter([flip+"scale="+scale+":force_original_aspect_ratio=decrease [scaled0];[1][scaled0]scale2ref=iw/2:ow*0.40706126687435[overlay][base];[base][overlay]overlay=main_w-overlay_w:0[v];[v][2]overlay=10:main_h-overlay_h-5[out]"])
		//.complexFilter(["[v][2]overlay[out]"])
		.outputOptions(['-map [out]'])
		.output('uploads/'+tmpName+'.'+video.ext)
		.run();
	}
	function onEnd() {
		console.log('Finished processing');
		//res.send('uploads/'+tmpName);
		var timestamp2 = Date.now();
		var timeElapsed = (timestamp2-timestamp)/1000;
		req.session.url = 'uploads/'+tmpName+((isVideo) ? '.mp4':'.'+video.ext);
		req.session.type = (isVideo) ? 'video':'image';
		req.session.videoW = videoW;
		req.session.videoH = videoH;
		var params = {ACL:'public-read', Bucket: 'strengthdefinesus', Key: 'uploads/'+tmpName+((isVideo) ? '.mp4':'.'+video.ext), Body: fs.createReadStream('uploads/'+tmpName+((isVideo) ? '.mp4':'.'+video.ext))};
		
		var uploadPromise = S3Client.upload(params).promise();
		uploadPromise.then(function(data){
			//console.log(data);
			var timestamp2 = Date.now();
			var timeElapsed = (timestamp2-timestamp)/1000;
			res.send({error:false, videoW:videoW,videoH:videoH, type: (isVideo) ? 'video':'image', aws_url:data.Location, server_url:'uploads/'+tmpName+((isVideo) ? '.mp4':'.'+video.ext), timeElapsed:timeElapsed});
		}).catch(function(error){
			//console.log(error);
			var timestamp2 = Date.now();
			var timeElapsed = (timestamp2-timestamp)/1000;
			res.send({error:false, videoW:videoW,videoH:videoH, type: (isVideo) ? 'video':'image', aws_url:'uploads/'+tmpName+((isVideo) ? '.mp4':'.'+video.ext), server_url:'uploads/'+tmpName+((isVideo) ? '.mp4':'.'+video.ext), timeElapsed:timeElapsed});
		});
		
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


var twitter = new twitterAPI({
	consumerKey: consumerKey,
	consumerSecret:consumerSecret,
	callback:'https://strengthdefinesus.com/twitter'
});
app.get('/twitter', function(req,res){
	twitter.getAccessToken(req.query.oauth_token, requestTokenSecret, req.query.oauth_verifier, function(error,accessToken,accessTokenSecret, results){
		if(error){
			console.log(error);
			return res.send({err: error});
		}
		accessToken = accessToken;
		accessTokenSecret = accessTokenSecret;
		fs.readFile('dist/index.html','utf-8', function(err,content){
			var rendered = ejs.render(content, {at:accessToken, ats:accessTokenSecret, url:req.session.url,type:req.session.type,videoW:req.session.videoW,videoH:req.session.videoH, shareModal:true});
			res.end(rendered);
		})
	})
	
});

var requestToken = null;
var requestTokenSecret = null;
var accessToken = null;
var accessTokenSecret = null;

//client posts to this
app.post('/authTwitter', function(req,res){
	twitter.getRequestToken(function(error,requestToken,requestTokenSecret,results){
		if(error){
			console.log('error getting OAuth request token: ',error)
		}else{
			console.log(requestToken, requestTokenSecret);
			requestToken = requestToken;
			requestTokenSecret = requestTokenSecret;
			res.send({requestToken:requestToken});
			res.end();
		}
	})
});
app.post('/postToTwitter', function(req,res){
	console.log(req.body);
	if(req.body.type=='image'){
		twitter.uploadMedia({media:req.body.url},req.body.at,req.body.ats, function(error,data){
			if(error) 
				res.send({status:'fail',error:error})
			twitter.statuses("update", {
				status:req.body.status,
				media_ids:data.media_id_string
			},req.body.at,req.body.ats, function(error,data,results){
				
				if(error) 
					res.send({status:'fail',error:error})
				res.send({status:'success'})
			})
		});
	}else{
		twitter.uploadVideo({media:req.body.url},req.body.at,req.body.ats, function(error,data){
			console.log(data);
			if(error) 
				res.send({status:'fail',error:error})
			twitter.statuses("update", {
				status:req.body.status,
				media_ids:data.media_id_string
			},req.body.at,req.body.ats, function(error,data,results){
				
				if(error) 
					res.send({status:'fail', error:error})
				res.send({status:'success'})
			})
		});
	}
	

})
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
      error: err,
      test:'test'
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
// app.use(enforce.HTTPS());

https.createServer(https_options,app).listen(8443,function(){
	console.log('Listenening on 8443 too!')
})
// http.createServer(function(req,res){
// 	res.writeHead(301,{"Location": "https://"+req.headers['host']+req.url});
// 	res.end();
// }).listen(8000, function(){
// 	console.log('App listening on port 8000!');
// });
http.createServer(app).listen(8000, function(){
	console.log('Listening on 8000');
})
