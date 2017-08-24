$(document).ready(function(){
    //LOAD FB SDK
    var fileReady = false;
    var twtShared = false;
    var fbShared = false;
    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
        FB.init({
          appId: '1956267324660722',
          version: 'v2.7'
        });     
    });
    var chosenColor = 'steel';
    if(url && type){
        $('#create').hide();
        $('#share').show();
        if(type == 'video'){
            $('#preview').html('<video autoplay preload loop muted controls><source src="'+url+'"/></video>');
            $('#preview').find('video')[0].load();
            if(videoH <= videoW * 0.5625)
                $('#preview').find('video').addClass('landscape');
            else
                $('#preview').find('video').addClass('portrait');
        }else{
            $('#preview').html('<img src="'+url+'"/>')
            if(videoH < videoW * 0.5625)
                $('#preview').find('img').addClass('landscape');
            else{
                 $('#preview').find('img').addClass('portrait');
            }
        }
        $('#instagram-btn').find('a').attr('href', url);
        $('#facebook-btn').attr('data-url',url);
        $('#twitter-btn').attr('data-url', url);
    }
    if(shareModal=='true'){

        $('#share-modal').show();
        $('#instagram-btn').find('a').attr('href', url);
        $('#facebook-btn').attr('data-url',url);
        $('#twitter-btn').attr('data-url', url);
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
	
    $('#save-btn').on('click touchstart tap', function(e){
        e.preventDefault();e.stopPropagation();
        $('progress').show();
        $('#create-btn').addClass('disabled');
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
                }else{
                    $('#preview').html('<img src="'+data.aws_url+'"/>')
                    if(data.videoH < data.videoW * 0.5625)
                        $('#preview').find('img').addClass('landscape');
                    else{
                        $('#preview').find('img').addClass('portrait');
                    }
                }
                $('#create').hide();
                $('#share').show();
                 
                //Add S3 url to download button
                $('#instagram-btn').find('a').attr('href', data.aws_url);
                $('#facebook-btn').attr('data-url',data.server_url);
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
    // $('#create-btn').on('touchstart tap', function(e){
    //     e.preventDefault();e.stopPropagation();
    //     console.log('touch')
    //     $('#video').click();
    // });
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
        $('#save-btn').hide();
        $('#create').find('label').show();
        $('#share').hide();
        $('#video').val('')
        $('#create-btn').removeClass('disabled');
        $('progress').hide();
        $('#spinner').hide();
        $('#create').show();
        $('.error').html('');
    }
    $('#facebook-btn').on('click mousestart tap', function(e){
        e.preventDefault();e.stopPropagation();
        if(FB){
            FB.ui({
              method: 'share',
              hashtag:'#strongermovie',
              href: location.href+$('#facebook-btn').attr('data-url')
            }, function(response){

                console.log('shared');
            });
        }
    });
    //Authorizes and Logs in User
    $('#twitter-btn').on('click touchstart tap', function(e){
        e.preventDefault();e.stopPropagation();
        $.post('/authTwitter', {url:$(this).attr('data-url')})
        .done(function(data){
            location.href = 'https://twitter.com/oauth/authenticate?oauth_token='+data.requestToken;
        });

    });
    //Actually shares the video or image to twitter
    $('#share-btn').on('click touchstart tap', function(e){
        e.preventDefault();e.stopPropagation();
        $.ajax({
            url:'/postToTwitter', 
            type:'POST', 
            data:{
                status:$('#share-modal').find('textarea').val(),
                url:url,
                at:at,
                ats:ats,
                type:type
            }
        }).done(function(data){
            console.log(data);
            if(data.status=='success'){
                $('#share-modal').find('.pre').hide().next().show();
                setTimeout(function(){
                    $('#share-modal').hide();
                },1500);
            }
        });

    });
    $('.close-btn').on('click touchstart tap', function(e){
        e.preventDefault();e.stopPropagation();
        $('#share-modal').hide();
    })
});