$(document).ready(function(){
    //LOAD FB SDK
    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
        FB.init({
          appId: '1956267324660722',
          version: 'v2.7' // or v2.1, v2.2, v2.3, ...
        });     
       // $('#loginbutton,#feedbutton').removeAttr('disabled');
        //FB.getLoginStatus(updateStatusCallback);
    });


	$('#fileupload').one('change', uploadVideo);
    function uploadVideo(e){
        e.preventDefault();
        $('progress').show();
        $('#create-btn').find('img').addClass('disabled');
        $('#spinner').show();
            $.ajax({
            url:'/upload',
            type: 'POST',
            contentType: false,
            data: new FormData($('#video-upload')[0]),  // The form with the file inputs.
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
            $('#spinner').hide();
            $('#preview').find('source').attr('src', data.video_url);
            $('#preview')[0].load();
            $('#create').hide();
            $('#share').show();

            //Add S3 url to download button
            $('#download-btn').find('a').attr('href', data.video_url);
            $('#facebook-btn').attr('data-url',data.video_url);
            console.log('Time Elapsed: '+data.timeElapsed+' seconds');
        });
    }
    $('#restart-btn').click(function(){
        $('#share').hide();
        $('#create-btn').find('img').removeClass('disabled');
        $('progress').hide();
        $('#spinner').hide();
        $('#create').show();
    });
    $('#facebook-btn').click(function(){
        if(FB){
            FB.ui({
              method: 'share',
              href: $('#facebook-btn').attr('data-url')
            }, function(response){

                console.log('shared');
            });
        }
    })
});