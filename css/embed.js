/**
 * Version: 1.9.2 - Pro
 */

"use strict";                           /** DO NOT EDIT !!! */

var defaultPlayerParameters = {
    "vq" : "hd1080",                    /** DEFAULT VIDEO QUALITY. POSSIBLE OPTIONS: highres, hd1080, hd720, large, medium and small */
    "loop" : "1",                       /** LOOP VIDEO */
    "controls" : "1",                   /** SHOW PLAYER CONTROLS */
    "showinfo" : "1",                   /** SHOW VIDEO DETAILS */
    "autohide" : "1",                   /** AUTOHIDE PLAYER COMMANDS AND VIDEO DETAILS */
    "modestbranding" : "1",             /** SHOW ONLY MINIMAL YOUTUBE BRANDING */
    "rel" : "0",                        /** SHOW RELATED VIDEOS AT THE END OF PLAYED VIDEO */
    "cc_load_policy" : "1",             /** Setting the parameter"s value to 1 causes closed captions to be shown by default, even if the user has turned captions off. */
    "color" : "red",                    /** This parameter specifies the color that will be used in the player"s video progress bar to highlight the amount of the video that the viewer has already seen. Valid parameter values are red and white. */
    "disablekb" : "1",                  /** Setting the parameter"s value to 1 causes the player to not respond to keyboard controls. */
    "fs" : "1",                         /** Setting this parameter to 0 prevents the fullscreen button from displaying in the player. */
    "hl" : "en",                        /** Sets the player"s interface language. See http://www.loc.gov/standards/iso639-2/php/code_list.php for full language code list. */
    "iv_load_policy" : "1",             /** Setting the parameter"s value to 1 causes video annotations to be shown by default, whereas setting to 3 causes video annotations to not be shown by default. */
    "playsinline" : "1",                /** This parameter controls whether videos play inline or fullscreen in an HTML5 player on iOS. */
    "mute" : "1",                       /** Prevents autoplay issue - https://www.reddit.com/r/youtube/comments/8ksool/embedded_autoplay_youtube_videos_stopped_playing/ */
    "allow" : "autoplay"
    };

/**
 * Define error messages
 * in your language here.
 */
var errorMessages = {
    0:"Service unavailable",
    1:"Unregistered video",  
    2:"Unregistered client",  
    3:"No client ID",  
    4:"Video unavailable",
    5:"OK",
    6:"Processing video"
};

/** --------------------------------------------------------------------- DON NOT EDIT ANYTHING BELLOW ---------------------------------------------------------------------- */


var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

var embedURL = 'https://api.embedprivatevideo.com/embed.php?v=5&video=%s&client=' + location.hostname;

var loadedURL = 'https://api.embedprivatevideo.com/loaded.php?video=%s';

var lockedVideos = [];

var players = [];

var autoPlayVideos = [];

var embedabble = [];

var releaseAttemptsLimit = 3;

var statusChecksLimit = 20;

var releaseAttempts = [];

var initialPrivacyStatus = [];

var playerParameters = [];

var videoDurationChecks = [];

var playerCounter = [];

var statusChecks = [];

var videoStatusTimeOutInterval = 2000;

var createPlayerTimeOutInterval = 7000;

var playVideoTimeOutInterval = 5000;

var currentCounterValue = [];

var countdownIntervals = [];

var bufferTime = [];


function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}

r(function(){
    if(!document.getElementsByClassName) {
        // IE8 support
        var getElementsByClassName = function(node, classname) {
            var a = [];
            var re = new RegExp('(^| )'+classname+'( |$)');
            var els = node.getElementsByTagName("*");
            for(var i=0,j=els.length; i<j; i++)
                if(re.test(els[i].className))a.push(els[i]);
            return a;
        }
        var videos = getElementsByClassName(document.body,"epyv-video-player");
    }
    else {
        var videos = document.getElementsByClassName("epyv-video-player");
    }

    var videosCount = videos.length;
    
    var hardcodedPlayerParameters = {
        "origin" : location.hostname,
        "widget_referrer" : location.hostname,
        "autoplay" : "1"
    };
    
    if(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) === true)    {
        defaultPlayerParameters["vq"] = "small"; 
    }

    
    for (var i=0; i<videosCount; i++) {
        
        var div = document.getElementById(videos[i].id);

        var individualPlayerParameters = {};

        if (div.getAttribute("data-params"))    {
            individualPlayerParameters = stringToJSON(div.getAttribute("data-params"));
        }

        if (div.getAttribute("data-privacy"))    {
            initialPrivacyStatus[videos[i].id] = div.getAttribute("data-privacy");
        }
        
        playerParameters[videos[i].id] = jsonConcat(defaultPlayerParameters, individualPlayerParameters, hardcodedPlayerParameters);
        
        setTimeout(getVideoStatus, videoStatusTimeOutInterval, videos[i].id);
        
        if(individualPlayerParameters["autoplay"] == 1) {
            autoPlayVideos.push(videos[i].id);
        }
    }
});


function createPlayer(videoID) {

    players[videoID] = new YT.Player(videoID, {
        videoId: videoID,
        playerVars: playerParameters[videoID],
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
    });
    
    players[videoID].mute();
}


function onPlayerReady(event) {
    
    var videoID = event.target.b.b.videoId;

    var buttonID  = 'epytvPlayButton['+videoID+']';
    
    var imageID  = 'epytvImage['+videoID+']';

    var playerCounterID  = 'epytvPlayerCounter['+videoID+']';
    
    players[videoID].mute();
        
    document.getElementById(videoID).style.opacity = 0;
    
    document.getElementById(videoID).style.visibility = 'visible';

    players[videoID].playVideo();
    playVideo(videoID);
    
    if(autoPlayVideos.indexOf(videoID) !== -1 && isMobile !== true)    {
        
        clearInterval(countdownIntervals[videoID]);

    	players[videoID].unMute();
        
        document.getElementById(imageID).style.visibility = 'hidden';
        
        document.getElementById(playerCounterID).style.display = 'none';
        
        document.getElementById(videoID).style.opacity = 1;
    }
    else    {
    
        document.getElementById(playerCounterID).style.visibility = 'visible';
    }

}



function getVideoStatus(videoID) {

    var formatedEmbedURL = embedURL.replace("%s", videoID);

    var buttonID = 'epytvPlayButton['+videoID+']';
    
    var imageID = 'epytvImage['+videoID+']';
    
    var playerCounterID  = 'epytvPlayerCounter['+videoID+']';
    
    if(typeof statusChecks[videoID] == 'undefined')    {
        statusChecks[videoID] = 1;
    }    
    else    {
        statusChecks[videoID]++;
    }

    if(typeof currentCounterValue[videoID] == 'undefined')    {
        currentCounterValue[videoID] = 10;
    }    
    else    {
        currentCounterValue[videoID]++;
    }

    jQuery.ajax({
       url: formatedEmbedURL,
       cache: false,
       dataType: 'json',
       crossDomain: true,
       success: function(data) {

            initialPrivacyStatus[videoID] = data.privacyStatus;

            if(data.responseCode == 6)   {

                setTimeout(getVideoStatus, videoStatusTimeOutInterval, videoID);
            }
            else if(data.responseCode == 5)   {

                embedabble[videoID] = true;

                countdownIntervals[videoID] = setInterval(countdown, videoStatusTimeOutInterval, playerCounterID, videoID);

                setTimeout(createPlayer, createPlayerTimeOutInterval, videoID);

                document.getElementById(imageID).style.top = "-16.84%";

                document.getElementById(imageID).src = 'https://img.youtube.com/vi/'+videoID+'/hqdefault.jpg';
                
                document.getElementById(playerCounterID).style.textShadow = "#FFFFFF 0.02em 0.02em 0.2em;";
            }
            else    {
                displayErrorMSG(videoID, data.responseCode);
            }

       },
       error: function(result) {

            if(statusChecks[videoID] < statusChecksLimit) {
                getVideoStatus(videoID);
            }

            displayErrorMSG(videoID, 0);

       }
    });

    document.getElementById(playerCounterID).style.left = "44%";

    currentCounterValue[videoID] = currentCounterValue[videoID] - statusChecks[videoID];

    document.getElementById(playerCounterID).innerHTML = currentCounterValue[videoID];
    
}


function onPlayerStateChange(event)   {
    
    var videoID = event.target.b.b.videoId;

    var buttonID = 'epytvPlayButton['+videoID+']';
    
    var imageID = 'epytvImage['+videoID+']';
    
    var playerCounterID  = 'epytvPlayerCounter['+videoID+']';
    
    if(event.data == 1 && typeof lockedVideos[videoID] == 'undefined') {
    
        if(autoPlayVideos.indexOf(videoID) == -1)  {
    
            players[videoID].pauseVideo();

            players[videoID].seekTo(0, true);

            document.getElementById(videoID).style.visibility = 'hidden';
            
            document.getElementById(imageID).style.visibility = 'visible';
            
        	document.getElementById(buttonID).style.visibility = 'visible';
            
        }

        var formatedLoadedURL = loadedURL.replace("%s", videoID);

        jQuery.ajax({
           url: formatedLoadedURL,
           cache: false,
           dataType: 'json',
           crossDomain: true,
           success: function(data) {
                bufferTime[videoID] = 0;
                countdownIntervals[videoID] = setInterval(countdown, videoStatusTimeOutInterval, playerCounterID, videoID);
           },
           error: function(result) {
           }
        });
        
        lockedVideos[videoID] = 1;
    }
    
    if(event.data == 0) {
        
        document.getElementById(buttonID).style.visibility = 'visible';
        
        document.getElementById(imageID).style.visibility = 'visible';
        
        document.getElementById(videoID).style.visibility = 'hidden';
    }

}


function stringToJSON(stringData) {

    var jsonObject = {};
    
    var arrayData = stringData.split(',');
    
    for(var i = 0; i < arrayData.length; i++)   {

       var dataPairs = arrayData[i].split('=');
       
       jsonObject[dataPairs[0]] = dataPairs[1];
    }
    
    return jsonObject;
}


function jsonConcat(defaultPlayerParameters, individualPlayerParameters, hardcodedPlayerParameters) {

    var PlayerParameters = {};

    for (var key in defaultPlayerParameters) {
        PlayerParameters[key] = defaultPlayerParameters[key];
    }

    for (var key in individualPlayerParameters) {
        PlayerParameters[key] = individualPlayerParameters[key];
    }

    for (var key in hardcodedPlayerParameters) {
        PlayerParameters[key] = hardcodedPlayerParameters[key];
    }

    return PlayerParameters;
}

  
function clickToPlay(videoID)    {

    players[videoID].unMute()

    var buttonID  = 'epytvPlayButton['+videoID+']';
    
    var imageID  = 'epytvImage['+videoID+']';

    document.getElementById(buttonID).style.visibility = 'hidden';
    
    document.getElementById(imageID).style.visibility = 'hidden';
    
    document.getElementById(videoID).style.position = null;
    
    document.getElementById(videoID).style.visibility = 'visible';
    
    document.getElementById(videoID).style.opacity = 1;
    
    players[videoID].playVideo();
    
}

  
function playVideo(videoID)    {

    var buttonID  = 'epytvPlayButton['+videoID+']';
    
    var imageID  = 'epytvImage['+videoID+']';
    
    var playerCounterID  = 'epytvPlayerCounter['+videoID+']';

    clearInterval(countdownIntervals[videoID]);

    document.getElementById(playerCounterID).style.display = 'none';
    
    if(autoPlayVideos.indexOf(videoID) == -1)  {

    	document.getElementById(buttonID).style.visibility = 'visible';
        
    }
    else    {
    
        document.getElementById(buttonID).style.visibility = 'hidden';
        
        document.getElementById(imageID).style.visibility = 'hidden';
        
        document.getElementById(videoID).style.position = null;
        
        document.getElementById(videoID).style.visibility = 'visible';
    
        document.getElementById(videoID).style.opacity = 1;
        
        players[videoID].playVideo();
    }
    
}


function getQueryString( field ) {

    var href = window.location.href;

    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );

    var string = reg.exec(href);

    return string ? string[1] : null;

};


function displayErrorMSG(videoID, responseCode)  {
    
    embedabble[videoID] = false;

    var buttonID  = 'playButton['+videoID+']';
    
    var imageID  = 'image['+videoID+']';
    
    var containerID = 'epyv-container['+videoID+']';
    
    var div = document.getElementById(containerID);
    
    div.innerHTML = '<div class="errorMessageDiv">' + errorMessages[responseCode] + '</div>';
    
}


function countdown(playerCounterID, videoID)    {
    
    if(currentCounterValue[videoID] > 0)    {
    
        currentCounterValue[videoID] = currentCounterValue[videoID] - 1;
        
        document.getElementById(playerCounterID).style.visibility = 'visible';
        
        document.getElementById(playerCounterID).innerHTML = currentCounterValue[videoID];
        
        bufferTime[videoID] = bufferTime[videoID] + 1;
        
        if(currentCounterValue[videoID] == 0)    {
            clearInterval(countdownIntervals[videoID]);
            document.getElementById(playerCounterID).style.visibility = 'hidden';
        }
        
    }
    else    {
        clearInterval(countdownIntervals[videoID]);
    }
    
}
