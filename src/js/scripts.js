$(document).ready(function(){
    //LOAD FB SDK
    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
        FB.init({
          appId: '1956267324660722',
          version: 'v2.7'
        });     
    });
    if(location.query){
        console.log(location.pathname);
    }

	$('#video').one('change', uploadVideo);
    function uploadVideo(e){
        e.preventDefault();
        $('.error').html('');

        if((this.files[0].size/1000)/1024 > 150) {
            $('.error').html('File size must be under 150mb.')
            resetUpload();
            return false;
        }
        $('progress').show();
        $('#create-btn').find('img').addClass('disabled');
        var formData = new FormData($('#video-upload')[0])
        $('#spinner').show();
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
                        }
                    } , false);
                }
                return myXhr;
            }
        }).done(function(data){
            console.log(data);
            //File was successfull
            if(!data.error){
                $('#spinner').hide();
                if(data.type=='video'){
                    $('#preview').html('<video autoplay preload loop controls><source src="'+data.video_url+'"/></video>');
                    $('#preview').find('video')[0].load();
                }else{
                    $('#preview').html('<img src="'+data.video_url+'"/>')
                    if(data.videoH < data.videoW * 0.5625)
                        $('#preview').find('img').addClass('landscape');
                }
                $('#create').hide();
                $('#share').show();
                 
                //Add S3 url to download button
                $('#download-btn').find('a').attr('href', data.video_url);
                $('#facebook-btn').attr('data-url',data.video_url);
                $('#twitter-btn').attr('data-url', data.video_url);
                console.log('Time Elapsed: '+data.timeElapsed+' seconds');
            }else{
                $('#spinner').hide();
                $('.error').html(data.message);
                resetUpload();
            }
        });
    }
    // EVENTS 
    $('#restart-btn').click(resetUpload);
    function resetUpload(){
        $('#share').hide();
        $('#create-btn').find('img').removeClass('disabled');
        $('progress').hide();
        $('#spinner').hide();
        $('#create').show();
        $('#video').one('change', uploadVideo);
    }
    $('#facebook-btn').click(function(){
        if(FB){
            FB.ui({
              method: 'share',
              hashtag:'#strongermovie',
              href: $('#facebook-btn').attr('data-url')
            }, function(response){

                console.log('shared');
            });
        }
    });
    $('#twitter-btn').click(function(){
        $.post('/authTwitter', {url:$(this).attr('data-url')})
        .done(function(data){
           //var x = window.open('https://twitter.com/oauth/authenticate?oauth_token='+data.requestToken, 'height=400,width=400');
         location.href = 'https://twitter.com/oauth/authenticate?oauth_token='+data.requestToken;
        });
        //$.post()
       // window.open('/twitter/connect');
    })
});