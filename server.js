var express = require('express');
var bodyParser = require('body-parser');
var expressStaticGzip = require("express-static-gzip");
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
var cors = require('cors')
var app = express();
var https_options = {
 ca: fs.readFileSync("stronger.ca-bundle"),
 key: fs.readFileSync("stronger.key"),
 cert: fs.readFileSync("stronger.crt")
};
var request = require('request');
var cookieParser = require('cookie-parser')
var browser = require('browser-detect');
var rimraf = require('rimraf');
setInterval(function(){
	console.log('Emptying tmp folders')
	var uploadsDir = __dirname + '/uploads';

	fs.readdir(uploadsDir, function(err, files) {
	  files.forEach(function(file, index) {
	    fs.stat(path.join(uploadsDir, file), function(err, stat) {
	      var endTime, now;
	      if (err) {
	        return console.error(err);
	      }
	      now = new Date().getTime();
	      endTime = new Date(stat.ctime).getTime() + 5600000;
	      if (now > endTime) {
	        return rimraf(path.join(uploadsDir, file), function(err) {
	          if (err) {
	            return console.error(err);
	          }
	          
	        });
	      }
	    });
	  });
	});
	fs.readdir(__dirname + '/tmp_files', function(err, files) {
	  files.forEach(function(file, index) {
	    fs.stat(path.join(__dirname + '/tmp_files', file), function(err, stat) {
	      var endTime, now;
	      if (err) {
	        return console.error(err);
	      }
	      now = new Date().getTime();
	      endTime = new Date(stat.ctime).getTime() + 5600000;
	      if (now > endTime) {
	        return rimraf(path.join(__dirname + '/tmp_files', file), function(err) {
	          if (err) {
	            return console.error(err);
	          }
	        });
	      }
	    });
	  });
	});
},600000);
var uid = require('uid-safe').sync;
app.use(cors());
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
var Store =  new FileStore({retries:1})

app.use(['/','/*.html','/upload','/iframe','/authTwitter','/postToTwitter','/twitterPost','/twtWindow','/twtAuth','/shareWindow'], session({genid: function(req) {
	//console.log(req.body)
	//console.log('query:',req.query, req.body)
	if(req.query.session_token)
		return req.query.session_token;
	else if(req.body.session_token){
		return req.body.session_token;
	}else{
		return uid(24);// use UUIDs for session IDs 
	}
  },saveUninitialized:false,resave:false, store: Store,secret:'stg'}));

app.get('/', function(req,res){
	//var liveTime = Date.parse("08:00 August 28, 2017");
	var result = browser(req.headers['user-agent']);
	if(result.mobile == true)
		req.session.mobile = true;
	else
		req.session.mobile = false;
	if(req.session.url == null){
		req.session.url = null;
		req.session.type = null;
		req.session.portrait = null;
		req.session.aws = null;
	}
	if(typeof(req.session.shareModal) == 'undefined'){
		req.session.shareModal = null;
	}
	fs.readFile('dist/index.html','utf-8', function(err,content){
		res.set('Content-Type','text/html');
		var rendered = ejs.render(content, {portrait:req.session.portrait,aws:req.session.aws,mobile:req.session.mobile, at:req.session.at,shareModal:req.session.shareModal,url:req.session.url,type:req.session.type,videoW:req.session.videoW,videoH:req.session.videoH});
		res.end(rendered);
	});
	
})

app.get('/dev', function(req,res){
	var result = browser(req.headers['user-agent']);
	if(result.mobile == true)
		req.session.mobile = true;
	else
		req.session.mobile = false;
	if(req.session.url == null){
		req.session.url = null;
		req.session.type = null;
		req.session.portrait = null;
		req.session.aws = null;
	}
	if(typeof(req.session.shareModal) == 'undefined'){
		req.session.shareModal = null;
	}
	fs.readFile('dist/dev-index.html','utf-8', function(err,content){
		res.set('Content-Type','text/html');
		var rendered = ejs.render(content, {portrait:req.session.portrait,aws:req.session.aws,mobile:req.session.mobile, at:req.session.at,shareModal:req.session.shareModal,url:req.session.url,type:req.session.type,videoW:req.session.videoW,videoH:req.session.videoH});
		res.end(rendered);
	})
});
app.get('/iframe', function(req,res){
	var result = browser(req.headers['user-agent']);
	if(result.mobile == true)
		req.session.mobile = true;
	else
		req.session.mobile = false;
	if(req.session.url == null){
		req.session.url = null;
		req.session.type = null;
		req.session.portrait = null;
		req.session.aws = null;
	}
	if(typeof(req.session.shareModal) == 'undefined'){
		req.session.shareModal = null;
	}
	fs.readFile('dist/iframe.html','utf-8', function(err,content){
		res.set('Content-Type','text/html');
		var rendered = ejs.render(content, {portrait:req.session.portrait,aws:req.session.aws,mobile:req.session.mobile, at:req.session.at,shareModal:req.session.shareModal,url:req.session.url,type:req.session.type,videoW:req.session.videoW,videoH:req.session.videoH});
		res.end(rendered);
	})
});
app.get('/widget.html', function(req,res){
	var result = browser(req.headers['user-agent']);
	//console.log('onload sessionID: '+req.sessionID)
	//console.log(req.body)
	if(result.mobile == true)
		req.session.mobile = true;
	else
		req.session.mobile = false;
	if(req.session.url == null){
		req.session.url = null;
		req.session.type = null;
		req.session.portrait = null;
		req.session.aws = null;
	}
	if(typeof(req.session.shareModal) == 'undefined'){
		req.session.shareModal = null;
	}
	//console.log('session:',req.session)
	fs.readFile('dist/widget.html','utf-8', function(err,content){
		res.set('Content-Type','text/html');
		var rendered = ejs.render(content, {session_token:req.sessionID,portrait:req.session.portrait,aws:req.session.aws,mobile:req.session.mobile, at:req.session.at,shareModal:req.session.shareModal,url:req.session.url,type:req.session.type,videoW:req.session.videoW,videoH:req.session.videoH});
		res.end(rendered);
	})
});
//app.use("/", expressStaticGzip("dist/"));
app.use(express.static(__dirname+'/dist'));
app.use(fileUpload());


app.post('/upload', function(req,res){
	console.log('Request received');
	//console.log(req.body.session_token)
	
	//console.log('upload sessionid: '+req.sessionID);
	if (!req.files)
     	return res.status(400).send({message:'No files were uploaded.'});

    var video = {
    	name:req.files.video.name.slice(0,req.files.video.name.lastIndexOf('.')).split(' ').join('_'), //split name from ext and remove spaces
    	ext:req.files.video.name.slice(req.files.video.name.lastIndexOf('.')+1,req.files.video.name.length).toLowerCase()
    }
    console.log(video.name + '.'+video.ext)
    var acceptedExt = ['jpg','jpeg','gif','png','mp4','mov','avi','webm','flv','m4v','.ogg'];
    if(acceptedExt.indexOf(video.ext) == -1)
    	return res.status(200).send({error:true, message:'File type is invalid.'});

    //ADD Timestamp
  	var timestamp = Date.now();
    var tmpName = video.name+'_'+timestamp;
    var isVideo = true;
    if(acceptedExt.indexOf(video.ext) < 4)
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
				var videoStream = (data.streams[0].codec_type=='video') ? data.streams[0]:data.streams[1];
	  			//console.log(videoStream);
		  		var landscape = true;
		  		videoW = videoStream.width;
		  		videoH = videoStream.height;

		  		//CHECK DIMENSIONS AGAINST MINIMUM
		  		if(videoW <300 || videoH < 300)
		  			return res.status(200).send({error:true, message:'File must be at least 300x300 pixels.'});

		  	
		  		if(videoStream.rotation === '-90' || videoStream.rotation === '90') 
		  			req.session.portrait = true;
		  		else
		  			req.session.portrait = false;

		  		// Route type to function
		  		if(!isVideo)
		  			addOverlayToImage(videoW,videoH);
		  		else
		  			addOverlayToVideo(videoW,videoH,landscape);
		    }	
	    })
    }
	function addOverlayToVideo(w,h,landscape){

		var overlayHashtag = 'overlay_hashtag.png';
		var scale = (req.session.portrait) ? '720:-1':'1280:-1';

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
		.duration(30)
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
		//console.log('upload ID: ',req.sessionID)
		var uploadPromise = S3Client.upload(params).promise();
		uploadPromise.then(function(data,error){
			//console.log(data);
			//console.log(data,error)
			var timestamp2 = Date.now();
			var timeElapsed = (timestamp2-timestamp)/1000;
			req.session.aws = data.Location;
			Store.set(req.body.session_token,req.session,function(err){
				console.log(err)
			})
			res.set('Content-Type','text/json');

			res.write(JSON.stringify({session_token:req.sessionID,error:false, videoW:videoW,videoH:videoH, type: (isVideo) ? 'video':'image', aws_url:data.Location, server_url:'https://strengthdefinesus.com/uploads/'+tmpName+((isVideo) ? '.mp4':'.'+video.ext), timeElapsed:timeElapsed}));
			res.end();
		}).catch(function(error){
			//console.log(error);
			req.session.aws = 'uploads/'+tmpName+((isVideo) ? '.mp4':'.'+video.ext);
			var timestamp2 = Date.now();
			var timeElapsed = (timestamp2-timestamp)/1000;
			res.set('Content-Type','text/json');
			res.write(JSON.stringify({session_token:req.sessionID, error:false, videoW:videoW,videoH:videoH, type: (isVideo) ? 'video':'image', aws_url:'uploads/'+tmpName+((isVideo) ? '.mp4':'.'+video.ext), server_url:'https://strengthdefinesus.com/uploads/'+tmpName+((isVideo) ? '.mp4':'.'+video.ext), timeElapsed:timeElapsed}));
			res.end();
		});
		
	}
	function onError(err, stdout, stderr) {
		console.log(err, stdout,stderr)
		console.log('Cannot process video: ' + err.message);
		res.send(stderr);
	}
	function onProgress(progress){
	 // if (progress.timemark != timemark) {
	 // timemark = progress.timemark;
	 //console.log('Progress: ' + progress.percent + '% done');
		//console.log(progress.percent);
		// res.set('Content-Type', 'text/json');
		// res.write(progress.percent.toString());
	}
});
app.get('/sessions/:id',function(req,res){
	fs.readFile('sessions/'+req.params.id+'.json', function(err, content){
		
		if(content)
			res.status(200).send(content);
		else
			res.status(404).send({})
	});
})
var twitter = new twitterAPI({
	consumerKey: consumerKey,
	consumerSecret:consumerSecret,
	callback:'https://strengthdefinesus.com/twitterPost'
});
// app.get('/twitter', function(req,res){
// 	console.log('test')
// 	twitter.getAccessToken(req.query.oauth_token, requestTokenSecret, req.query.oauth_verifier, function(error,accessToken,accessTokenSecret, results){
// 		if(error){
// 			console.log(error);
// 			return res.send({err: error});
// 		}
// 		req.session.at = accessToken;
// 		req.session.ats = accessTokenSecret;
// 		req.session.shareModal = true;
// 		console.log(req.session.ats)
// 		res.redirect(301,'/');
// 	})
	
// });
app.get('/twtAuth',function(req,res){
	// var twitter = new twitterAPI({
	// 	consumerKey: consumerKey,
	// 	consumerSecret:consumerSecret,
	// 	callback:'https://strengthdefinesus.com/twtWindow'
	// });
	//console.log(req.query);
	req.session.url = req.query.url;
	req.session.type = req.query.type;
	twitter.getRequestToken(function(error,requestToken,requestTokenSecret,results){
		if(error){
			console.log('error getting OAuth request token: ',error)
		}else{
			//console.log(requestToken, requestTokenSecret);
			requestToken = requestToken;
			requestTokenSecret = requestTokenSecret;
			//res.send({requestToken:requestToken});
			req.session.loadedOnce = true;
			req.session.save();
			res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+requestToken)
		}
	});
});
app.get('/shareWindow', function(req,res){
	//console.log(req.cookies)
	//console.log(req.query);
	if(req.query.url){
		req.session.url = req.query.url;
	}
	if(req.query.aws)
		req.session.aws = req.query.aws;
	if(req.query.type)
		req.session.type = req.query.type;
	if(req.session.url == null){
		req.session.url = null;
		req.session.type = null;
		req.session.portrait = null;
		req.session.aws = null;
	}
	if(req.query.mode){
		req.session.mode = req.query.mode;
	}else{
		req.session.mode = null;
	}
	if(typeof(req.session.shareModal) == 'undefined'){
		req.session.shareModal = null;
	}

	fs.readFile('dist/shareWindow.html','utf-8', function(err,content){
		res.set('Content-Type','text/html');
		var rendered = ejs.render(content, {mode:req.session.mode,portrait:req.session.portrait,aws:req.session.aws,mobile:req.session.mobile, at:req.session.at,shareModal:req.session.shareModal,url:req.session.url,type:req.session.type,videoW:req.session.videoW,videoH:req.session.videoH});
		res.end(rendered);
	});
})
app.get('/twitterPost', function(req,res){
	//console.log('session 3:',req.sessionID)
	//console.log('query: ',req.query)
	//console.log(req.cookies)
	twitter.getAccessToken(req.query.oauth_token, requestTokenSecret, req.query.oauth_verifier, function(error,accessToken,accessTokenSecret, results){
		if(error){
			console.log(error);
			return res.send({err: error});
		}
		req.session.at = accessToken;
		req.session.ats = accessTokenSecret;
		//req.session.shareModal = true;
	//	console.log('session 5:',req.sessionID)
		res.redirect(301,'/shareWindow');
	})
	
});

var requestToken = null;
var requestTokenSecret = null;
//client posts to this
app.post('/authTwitter', function(req,res){
	//console.log('token: '+req.body.session_token)
	//console.log('session 1: ',req.sessionID)
	//console.log(req.cookies)
	if(req.body.session_token){
		Store.get(req.body.session_token, function(err,session){
			if(session){
				//console.log('session 2: ',req.sessionID)
				//req.session= session;
				req.session.url = session.url;
				req.session.type = session.type;
				req.session.aws = session.aws;
				//console.log('loadedsession:',req.sessionID)
				twitter.getRequestToken(function(error,requestToken,requestTokenSecret,results){
					if(error){
						console.log('error getting OAuth request token: ',error)
					}else{
						//console.log(requestToken, requestTokenSecret);
						requestToken = requestToken;
						requestTokenSecret = requestTokenSecret;
						res.send({requestToken:requestToken});
					}
				})
			}
		})
	}else{
		twitter.getRequestToken(function(error,requestToken,requestTokenSecret,results){
			if(error){
				console.log('error getting OAuth request token: ',error)
			}else{
				//console.log(requestToken, requestTokenSecret);
				requestToken = requestToken;
				requestTokenSecret = requestTokenSecret;
				res.send({requestToken:requestToken});
			}
		})
	}
	
});
app.get('/authTwitter', function(req,res){
	twitter.getRequestToken(function(error,requestToken,requestTokenSecret,results){
		if(error){
			console.log('error getting OAuth request token: ',error)
		}else{
			//console.log(requestToken, requestTokenSecret);
			requestToken = requestToken;
			requestTokenSecret = requestTokenSecret;
			//res.send({requestToken:requestToken});
			res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+requestToken)
		}
	})
});
app.post('/postToTwitter', function(req,res){
	//console.log(req.body);
	req.session.shareModal = false;
	//console.log(req.session)
	//console.log('body url:'+req.body.url,req.body.type)
	if(req.body.type=='image'){
		twitter.uploadMedia({media:req.body.url},req.session.at,req.session.ats, function(error,data){
			//console.log(data.error)
			if(error) {
				//res.status(200).send({status:'fail',error:error})
				console.log('MediaError:',error)
			}else if(data.error == null || data.error ==''){
				//console.log(data)
				twitter.statuses("update", {
					status:req.body.status,
					media_ids:data.media_id_string
				},req.session.at,req.session.ats, function(error,data,results){
					if(error) {
						console.log('TweetError:',error)
						//res.status(200).send({status:'fail',error:error})
					}
					//console.log(data)
					res.status(200).send({status:'success'})
				})
			}
			
		});
	}else{

		twitter.uploadVideo({media:req.body.url},req.session.at,req.session.ats, function(error,data){
			//console.log(data);
			if(error) 
				res.send({status:'fail',error:error})
			twitter.statuses("update", {
				status:req.body.status,
				media_ids:data.media_id_string
			},req.session.at,req.session.ats, function(error,data,results){
				
				if(error) 
					res.send({status:'fail', error:error})
				res.send({status:'success'})
			})
		});
	}
	

});
app.get('/download', function(req, res) {
  //res.download(req.session.aws);
  var file = __dirname + '/'+req.session.url;
   res.set('Content-disposition','attachment; filename='+file);
  // if(req.session.type =='video')
  // 	res.append('Content-Type','video/mp4');
 
  // var filestream = fs.createReadStream(file);
  // filestream.pipe(res);
  res.download(file)
  //res.attachment([file])
});
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
  	console.log(err)
    res.status(err.status || 500).json({
      message: err.message,
      error: err,
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
http.createServer(function(req,res){
	res.writeHead(301,{"Location": "https://"+req.headers['host']+req.url});
	res.end();
}).listen(8000, function(){
	console.log('App listening on port 8000!');
});
// http.createServer(app).listen(8000, function(){
// 	console.log('Listening on 8000');
// })
