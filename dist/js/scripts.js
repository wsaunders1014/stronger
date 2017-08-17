$(document).ready(function(){
	$('#fileupload').one('change', uploadVideo);
    function uploadVideo(e){
        e.preventDefault();
        $('progress').show();
        $('#create-btn').addClass('disabled').find('input');
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
            $('#preview').find('source').attr('src', data.video_url);
            $('#preview')[0].load();
            // $('#preview')[0].play();
            $('#instruct').hide();
            $('#share').show();
            console.log('Time Elapsed: '+data.timeElapsed+' seconds');
        });
    }
});