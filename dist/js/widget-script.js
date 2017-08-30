(function() {
 var jQuery;

 if (window.jQuery === undefined || window.jQuery.fn.jquery !== '2.2.4') {
   var script_tag = document.createElement('script');
   script_tag.setAttribute("type","text/javascript");
   script_tag.setAttribute("src",
       "https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js");
   if (script_tag.readyState) {
     script_tag.onreadystatechange = function () { // For old versions of IE
         if (this.readyState == 'complete' || this.readyState == 'loaded') {
             scriptLoadHandler();
         }
     };
   } else { // Other browsers
     script_tag.onload = scriptLoadHandler;
   }
   (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);    
 } else {    
   jQuery = window.jQuery;
   main(); //our main JS functionality
 }


 function scriptLoadHandler() {
   jQuery = window.jQuery.noConflict(true);

   main(); //our main JS functionality
 }

 function main() {     
   jQuery(document).ready(function($) {
     var homeURL = "https://strengthdefinesus.com/";
      var css_link = $("<link>", { 
       rel: "stylesheet", 
       type: "text/css", 
       href: homeURL + "css/widget.css" 
     });
     css_link.appendTo('head'); 
     function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    var session_token = getCookie('session_token');
    console.log('st: '+session_token)
       var $container = $('#widget-container');
     //  $.ajax('https://strengthdefinesus.com/js/widget-data.js?callback=?', {dataType:'jsonp', jsonpCallback:'callback'}).success(function(data){
     //    console.log(data)
     //    $container.html(data.html);
     //      $.ajaxSetup({ cache: true });
     //      $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
     //          FB.init({
     //            appId: '1956267324660722',
     //            version: 'v2.10'
     //          });     
     //      });
     //      var chosenColor = 'steel';
     //      var event = (session.mobile=='true') ? 'touchstart':'click';
     //  });
     $.get('https://strengthdefinesus.com/widget.html?session_token='+session_token).done(function(data){
        //console.log(data);
        $container.html(data);
     });
   });

}
})();