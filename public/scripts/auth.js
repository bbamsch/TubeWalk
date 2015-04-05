 	var OAUTH2_CLIENT_ID = '***REMOVED***';
        var OAUTH2_SCOPES = [
                'https://www.googleapis.com/auth/youtube'
        ];
	var API_KEY = '***REMOVED***';
	var ASPECT = 16 / 9;

	var videoPerList = 50;
	var loadFactor = 0.25;
	var numwatched = videoPerList;

	var displays = [];

	var videoList = [];
	var unwatched = [];

	var tag = document.createElement('script');
	tag.src = "http://www.youtube.com/player_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        googleApiClientReady = function() {
		initDisplays();
                gapi.auth.init(function() {
                        window.setTimeout(checkAuth, 1);
                });
        }

	var players = []
	function initDisplays() {
		displays[0] = $("#disp1");
		displays[1] = $("#disp2");
		displays[2] = $("#disp3");
		displays[3] = $("#disp4");
	}

	function onYoutubePlayerAPIReady() {
		players[0] = new YT.Player('player1', {
			height: '390',
			width: '640',
			videoId: 'M7lc1UVf-VE',
			events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange
			}
		});
	}

	function onPlayerReady(event) {
		alert("Ready");
	}

	function onPlayerStateChange(event) {
		alert("State Change");
	}

        function checkAuth() {
                gapi.auth.authorize({
                        client_id: OAUTH2_CLIENT_ID,
                        scope: OAUTH2_SCOPES,
                        immediate: true
                }, handleAuthResult);
        }

        function handleAuthResult(authResult) {
                if (authResult && !authResult.error) {
                        // Authorization was successful. Hide authorization prompts and show
                        // content that should be visible after authorization succeeds.
                        $('.pre-auth').hide();
                        $('.post-auth').show();
                        loadAPIClientInterfaces();
                } else {
                        // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
                        // client flow. The current function is called when that flow completes.
                        $('#login-link').click(function() {
                                        gapi.auth.authorize({
                                        client_id: OAUTH2_CLIENT_ID,
                                        scope: OAUTH2_SCOPES,
                                        immediate: false
                                }, handleAuthResult);
                        });
                }
        }


        function loadAPIClientInterfaces() {
                gapi.client.load('youtube', 'v3', function() {
                        handleAPILoaded();
                });
        }

        function handleAPILoaded() {
        	loadNewVideos();
	}

	function loadNewVideos() {
		$.get("https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=" + videoPerList + "&key=" + API_KEY,
			processVideos);
	}

	function processVideos(data) {
		var vids = data["items"];
		//var newhtml = "<ul>";
		unwatched = [];
		for(var i = 0; i < vids.length; i++) {
			var vid = vids[i];
			//newhtml += "<li><a href='http://www.youtube.com/watch?v=" + vid.id.videoId + "'>" + vid.snippet.title + "</a></li>";
			videoList[i] = vid.id.videoId;
			unwatched[i] = i;
		}
		numwatched = 0;
		console.log(videoList);
		console.log(unwatched);
		//newhtml += "</ul>";
		//$("#thestuff").html(newhtml);
		displayFour();
	}

	function refresh() {
		if(numwatched <= loadFactor * videoPerList) {
			// Get New List
			loadNewVideos();
		} else {
			// Display 4 New
			displayFour();
		}
	}

	function displayFour() {
		for(var i = 0; i < 4; i++) {
			var index = Math.floor(Math.random() * unwatched.length);
			var videoIndex = unwatched.splice(index, 1);
			//displays[i].html(embedHTML(i, videoList[videoIndex]));
		}
		resizeVids();
	}

	function embedHTML(displayindex, video_id) {
		//return "<a href='http://www.youtube.com/watch?v=" + video_id + "'>" + video_id + "</a>";
		var html = "<object id='video"+displayindex+"' style='width:100%;height:100%;width:100%;height:100%; float:left; clear: both; margin: auto;' data='http://www.youtube.com/v/" + video_id + "?autoplay=1&controls=1&enablejsapi=1&playerapiid=player" + displayindex + "&showinfo=1'></object>";
 
		return html;
	}

	$(window).resize(resizeVids);

	function resizeVids() {
		for(var i = 0; i < 4; i++) {
			var video = $("#video" + i);
			var wid = video.width();
			video.height(wid / ASPECT);
		}
	}

	function muteAll() {
		for(var i = 0; i < 4; i++) {
			var video = $("#video" + i);
			video.prop('muted', true);
		}
	}
