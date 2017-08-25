    var fileReady = false;
    var twtShared = false;
    var fbShared = false;
$(document).ready(function(){
    //LOAD FB SDK

    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
        FB.init({
          appId: '1956267324660722',
          version: 'v2.10'
        });     
    });
    var chosenColor = 'steel';
    var event = (session.mobile=='true') ? 'touchstart':'click';

    if(session.url && session.type){
        $('#create').hide();
        if(session.mobile == 'true' && session.type=="video")
            $('#instagram-btn').hide();
        $('#share').show();
        if(session.type == 'video'){
            var vid = document.createElement('VIDEO');
            vid.setAttribute('controls','controls');
            vid.setAttribute('autoplay','autoplay');
            vid.setAttribute('muted','muted');
            vid.setAttribute('loop','loop');
            vid.setAttribute('playsinline','true')
            vid.setAttribute('src',session.aws);
            $('#preview').html('').append(vid);
            vid.addEventListener('canplay',function(){
                 if($('#preview').find('video').height() <= $('#preview').find('video').width()*0.5625){
                    $('#preview').find('video').addClass('landscape');
                }else{
                    $('#preview').find('video').addClass('portrait');
                }
            });
            vid.load();
            vid.play();
        }else{
            var img = new Image();
            img.onload = function(){
               // console.log(img.width,img.height)
                if(img.height <= img.width*0.5625){
                    img.setAttribute('class','landscape');
                }else{
                    //portrait or square
                      img.setAttribute('class','portrait');
                }
            }
            img.src = session.url;
            $('#preview').html('').append(img);
        }
        //$('#instagram-btn').find('a').attr('href', aws);
        $('#facebook-btn').attr('data-url',session.aws);
        $('#twitter-btn').attr('data-url',session.url);
    }
    if(session.shareModal=='true'){
        $('#share-modal').show().find('#share-btn').addClass('twitter');
        //$('#instagram-btn').find('a').attr('href', aws);
        $('#facebook-btn').attr('data-url', session.aws);
        $('#twitter-btn').attr('data-url', session.url);
    }
    $('.square').on('click touchstart tap', function(e){
        e.preventDefault();e.stopPropagation();
        var id= $(this).attr('id');
        $('.square').removeClass('active');
        $(this).addClass('active');
        chosenColor = id;
        switch(id){
            case 'steel':
                $('#preview-overlay').find('.upper').attr('src','img/overlay_text.png?'+Date.now());
            break;
            case 'black':
             $('#preview-overlay').find('.upper').attr('src','img/overlay_textb.png?'+Date.now());
            break;
            case 'white':
             $('#preview-overlay').find('.upper').attr('src','img/overlay_textw.png?'+Date.now());
            default:
            break;
        }
    })
    
    $('#save-btn').on('click', function(e){
        e.preventDefault();
        $('progress').show();
        $('#save-btn').addClass('disabled');
        $('.options').css({visibility:'hidden'})
        var formData = new FormData($('#video-upload')[0])
        formData.append('color',chosenColor);
       
        $.ajax({
            url:'/upload',
            type: 'POST',
            contentType: false,
            data:formData,  // The form with the file inputs.
            processData: false,  // Using FormData, don't process data.
            xhr: function() {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    // For handling the progress of the upload
                    myXhr.upload.addEventListener('progress', function(e) {
                        if (e.lengthComputable) {
                            $('progress').attr({
                                value: e.loaded,
                                max: e.total,
                            });
                            if(e.loaded >= e.total){
                                $('progress').hide();
                                 $('#spinner').show();
                                $('.error').html('Filed uploaded. Now encoding...')
                            }
                        }
                    } , false);
                }
                return myXhr;
            }
        }).done(function(data){
            fileReady = false;
            console.log(data);
            //File was successfull
            if(!data.error){
                $('#spinner').hide();
                $('progress').hide();
                $('#preview-overlay').hide();
                if(data.type=='video'){
                    // $('#preview').html('<video autoplay preload muted loop controls><source src="'+data.aws_url+'"/></video>');
                    // $('#preview').find('video')[0].load();
                    var vid = document.createElement('VIDEO');
                    vid.setAttribute('controls','controls');
                    vid.setAttribute('autoplay','autoplay');
                    vid.setAttribute('muted','muted');
                    vid.setAttribute('loop','loop');
                    vid.setAttribute('playsinline','true')
                    vid.setAttribute('src',data.aws_url);
                    $('#preview').html('').append(vid);
                    vid.addEventListener('canplay',function(){
                         if($('#preview').find('video').height() <= $('#preview').find('video').width()*0.5625){
                            $('#preview').find('video').addClass('landscape');
                            $('#preview-overlay').css({width:100+'%'})
                        }else{
                            $('#preview').find('video').addClass('portrait');
                            $('#preview-overlay').css({width:$('#preview').find('video').width()})
                        }
                       $('.options').css({left:($('#preview').width()-$('#preview').find('video').width())/2});
                    });
                    vid.load();
                    vid.play();
                    if(session.mobile == 'true')
                        $('#instagram-btn').hide();
                }else{
                    var img = new Image();
                    img.onload = function(){
                       
                        if(img.height <= img.width*0.5625){
                            //landscape
                            img.setAttribute('class','landscape');
                        }else{
                            //portrait or square
                            img.setAttribute('class','portrait');
                        }
                    }
                    img.src = data.server_url;
                    $('#preview').html('').append(img);
                    
                }
                $('#create').hide();
                $('#share').show();
                 
                //Add S3 url to download button
                $('#instagram-btn').find('a').attr('href', data.aws_url);
                $('#facebook-btn').attr('data-url',data.aws_url);
                $('#twitter-btn').attr('data-url', data.server_url);
                console.log('Time Elapsed: '+data.timeElapsed+' seconds');
            }else{
                $('#spinner').hide();
                $('.error').html(data.message);
                resetUpload();
            }
        });
    });
    $('#video').on('change', uploadVideo);

    function uploadVideo(e){
        e.preventDefault();
        if(!fileReady) {
            $('.error').html('');
            var file = this.files[0];
            console.log(this.files[0]);
            var contW = $('#preview').width();
            //FILE TOO BIG
            if((this.files[0].size/1000)/1024 > 150) {
                $('.error').html('File size must be under 150mb.')
                resetUpload();
                return false;
            }
            //WRONG FILE TYPE
            if(file.type.match('image/*') || file.type.match('video/*')){
                var fileURL = URL.createObjectURL(file);
                $('.options').css({visibility:'visible'})
                if(file.type.match('video/*')){
                   var vid = document.createElement('VIDEO');
                    vid.setAttribute('controls','controls');
                    vid.setAttribute('autoplay','autoplay');
                    vid.setAttribute('muted','muted');
                    vid.setAttribute('loop','loop');
                    vid.setAttribute('playsinline','true')
                    vid.setAttribute('src',fileURL);
                    $('#preview').html('').append(vid);
                    vid.addEventListener('canplay',function(){
                         if($('#preview').find('video').height() <= $('#preview').find('video').width()*0.5625){
                            $('#preview').find('video').addClass('landscape');
                            $('#preview-overlay').css({width:100+'%'})
                        }else{
                            $('#preview').find('video').addClass('portrait');
                            $('#preview-overlay').css({width:$('#preview').find('video').width()})
                        }
                       $('.options').css({left:($('#preview').width()-$('#preview').find('video').width())/2});
                    });
                    vid.load();
                    vid.play();
                }else{
                    var img = new Image();
                    img.onload = function(){
                       // console.log(img.width,img.height)
                        if(img.height <= img.width*0.5625){
                            //landscape

                            img.setAttribute('class','landscape');
                   
                        }else{
                            //portrait or square
                              img.setAttribute('class','portrait');
                            $('#preview-overlay').css({width:img.width})
                            $('.options').css({left:($('#preview').width()-img.width)/2});
                        }
                    }
                    img.src = fileURL;
                    $('#preview').html('').append(img);
                    //console.log($('#preview').find('img').width());
                }
                $('#preview-overlay').show();
                fileReady = true;
                $('#create').find('label').hide();
                $('#save-btn').css({display:'inline-block'})
            }else{
                $('.error').html('Invalid file type.');
                resetUpload();
                return false;
            }
        }else{
            
        }
        
    }
    // EVENTS 
    $('#restart-btn').on('click touchstart tap', function(e){
        e.preventDefault();e.stopPropagation();
        resetUpload()
    });
    function resetUpload(){
        fileReady =false;
        $('#save-btn').hide().removeClass('disabled');
        $('#create').find('label').show();
        $('#share').hide();
        $('#video').val('')
        $('#create-btn').removeClass('disabled');
        $('progress').hide();
        $('#spinner').hide();
        $('#create').show();
        $('.error').html('');
    }
    $('#facebook-btn').on(event, function(e){
        e.preventDefault();e.stopPropagation();
        if(FB){
            FB.getLoginStatus(function(res){
                statusChangeCallback(res);
            });
        }  
    });
    function statusChangeCallback(res){
        console.log(res);
        if(res.status == 'connected') {
            $('#share-modal').show().find('h2').html('Share to Facebook');
            $('#share-btn').html('SHARE TO FACEBOOK<img class="share-spinner" src="img/spinner.svg" alt="Processing"/>').removeClass('twitter').addClass('facebook');
        }else {
            console.log('test');
            if(session.mobile == "true"){
                location.href="https://www.facebook.com/v2.10/dialog/oauth?client_id=1956267324660722&redirect_uri=https://strengthdefinesus.com/dev&response_type=token&scope=publish_actions,user_videos,user_photos"
            }else{
                FB.login(function(res){
                    console.log(res);
                    if(res.status == 'connected'){
                        $('#share-modal').show().find('h2').html('Share to Facebook');
                        $('#share-btn').html('SHARE TO FACEBOOK<img class="share-spinner" src="img/spinner.svg" alt="Processing"/>').removeClass('twitter').addClass('facebook');
                    }
                }, {scope:'public_profile, user_videos,user_photos,publish_actions'});
            }
        }
    }
    //Authorizes and Logs in User
    $('#twitter-btn').on(event, function(e){
        e.preventDefault();e.stopPropagation();
        if(!session.at){
            $.post('/authTwitter', {url:$(this).attr('data-url')})
            .done(function(data){
                location.href = 'https://twitter.com/oauth/authenticate?oauth_token='+data.requestToken;
            });
        }else{
             $('#share-modal').find('h2').html('Share to Twitter').show();
             $('#share-btn').html('SHARE').removeClass('facebook').addClass('twitter');
        }
        

    });
    //Actually shares the video or image to twitter
   $('#share-btn').on(event, function(e){
        e.preventDefault();
        $('.share-spinner').show();
        $('#share-btn').addClass('disabled');
        if($(this).hasClass('twitter')) {
            if(!twtShared) {
                twtShared = true;
                $.ajax({
                    url:'/postToTwitter', 
                    type:'POST', 
                    data:{
                        status:$('#share-modal').find('textarea').val(),
                        url:session.url,
                        type:session.type
                    }
                }).done(function(data){
                    console.log(data);
                    if(data.status=='success'){
                        $('#share-modal').find('.pre').hide().next().show();
                        $('#twitter-btn').addClass('disabled');
                        setTimeout(function(){
                            $('#share-modal').hide();
                             $('#share-btn').removeClass('disabled');
                            $('#share-modal').find('.pre').show().next().hide();
                        },2000);
                    }else{
                        twtShared = false;
                         $('#share-modal').find('.pre').hide().next().html('<h2>There was an error:</h2><p>'+data.errors+'</p>').show();
                    }
                });
            }
        }else if($(this).hasClass('facebook')){
             if(!fbShared){
                fbShared = true;
                if(session.type == 'video' || session.url.indexOf('.gif') != -1) {
                    FB.api('/me/videos', 'post', {
                        file_url:session.aws,
                        description:$('#share-modal').find('textarea').val(),
                        title:'Strength Defines Us #strongermovie',
                    }, function(res, err){
                        console.log(res, err)
                        $('.share-spinner').hide();
                        if(err){
                            console.log(err);
                            fbShared = false;
                            $('#share-btn').removeClass('disabled');
                            $('#share-modal').find('.pre').hide().next().html('<h3>There was an error:</h3><p>'+data.err.code+'</p>').show();
                        }else{
                            fbShared = true;
                            $('#share-modal').find('.pre').hide().next().html('<h3>Posted to Facebook.</h3><p>For videos, please allow up to a few minutes for it to show.</p>').show();
                            setTimeout(function(){
                                $('#share-modal').hide();
                                $('#share-modal').find('.pre').show().next().hide();
                                $('#facebook-btn').addClass('disabled');
                                $('#share-btn').removeClass('disabled');
                            },2500);
                        }
                    })
                }else if(session.type=='image' && session.url.indexOf('.gif') == -1){
                     FB.api('/me/photos', 'post', {
                        caption:$('#share-modal').find('textarea').val(),
                        url:session.aws
                    }, function(res,err){
                        $('.share-spinner').hide();
                        console.log(res, err)
                        if(err){
                            console.log(err);
                            fbShared = false;
                            $('#share-btn').removeClass('disabled');
                            $('#share-modal').find('.pre').hide().next().html('<h3>There was an error:</h3><p>'+err.message+'</p>').show();
                        }else{
                             fbShared = true;
                            $('#share-modal').find('.pre').hide().next().html('<h3>Posted to Facebook.</h3><p>For videos, please allow up to a few minutes for it to show.</p>').show();
                            setTimeout(function(){
                                $('#share-modal').hide();
                                $('#facebook-btn').addClass('disabled');
                                $('#share-btn').removeClass('disabled');
                            },2500);
                        }
                    })
                }
            }
        }
    });
    $('.close-btn').on('click touchstart tap', function(e){
        e.preventDefault();e.stopPropagation();
        $('#share-modal').hide();
    })
});