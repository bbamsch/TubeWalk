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
                gapi.auth.init(function() {
                        window.setTimeout(checkAuth, 1);
                });
        }

	function onYouTubeIframeAPIReady() {
		setUpShit();
		setInterval(resizeVids, 100);
	}

	var players = []
	function setUpShit() {
		for(var i = 0; i < 4; i++) {
		players[i] = new YT.Player(('disp' + (i+1)),
					   {playerVars: {
						'autoplay': 1,
						'controls': 0,
						'showinfo': 0
					},
						events: {
						'onReady': onPlayerReady,
						'onStateChange': onPlayerStateChange
					  }});
			if(i == 0) {
				$("#disp" + (i+1)).hover(function() {unMuteMe(0);});
			} else if(i == 1) {
				$("#disp" + (i+1)).hover(function() {unMuteMe(1);});
			} else if(i == 2) {
				$("#disp" + (i+1)).hover(function() {unMuteMe(2);});
			} else {
				$("#disp" + (i+1)).hover(function() {unMuteMe(3);});
			}
		}
	}

	var counting = 0;
	function onPlayerReady(event) {
		if(++counting == 4) {
			counting = 0;
		}
		resizeVids();
	}

	function firstTimeSetup() {
		refresh();
	}

	function onPlayerStateChange(event) {
		if(event.data == 2) {
			event.target.playVideo();
		}
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

	var getNextVideos;
	var PAGE_TOKEN = null;

	function loadNewVideos(blank) {
		getNextVideos = loadNewVideos;
		var yquery = "https://www.googleapis.com/youtube/v3/search?part=snippet&videoEmbeddable=true&type=video&maxResults=" + videoPerList + "&key=" + API_KEY;
		if(PAGE_TOKEN != null) {
			yquery += "&pageToken=" + PAGE_TOKEN;
		}
		$.get(yquery, processVideos);
	}

	function loadNewVideosQuery(query) {
		getNewVideos = loadNewVideosQuery;
		var yquery = "https://www.googleapis.com/youtube/v3/search?part=snippet&videoEmbeddable=true&type=video&maxResults=" + videoPerList + "&key=" + API_KEY + "&q=" + encodeURIComponent(query);
		if(PAGE_TOKEN != null) {
			yquery += "&pageToken=" + PAGE_TOKEN;
		}
		$.get(yquery, processVideos);
	}

	function loadNewVideosCategory(category) {
		getNewVideos = loadNewVideosCategory;
		var yquery = "https://www.googleapis.com/youtube/v3/search?part=snippet&videoEmbeddable=true&type=video&maxResults=" + videoPerList + "&key=" + API_KEY + "&videoCategoryId=" + category;
		if(PAGE_TOKEN != null) {
			yquery += "&pageToken=" + PAGE_TOKEN;
		}
		$.get(yquery, processVideos);
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
		//newhtml += "</ul>";
		//$("#thestuff").html(newhtml);
		displayFour();
	}

	function refresh() {
		if(numwatched >= loadFactor * videoPerList) {
			// Get New List
			getNextVideos();
		} else {
			// Display 4 New
			displayFour();
		}
	}

	function displayFour() {
		
		console.log(players);
		for(var i = 0; i < 4; i++) {
			var index = Math.floor(Math.random() * unwatched.length);
			var videoIndex = unwatched.splice(index, 1);
			var videoId = videoList[videoIndex];
			players[i].loadVideoById(videoId);
		}
		unMuteMe(0);
		resizeVids();
	}

	/*function embedHTML(displayindex, video_id) {
		//return "<a href='http://www.youtube.com/watch?v=" + video_id + "'>" + video_id + "</a>";
		var html = "<object id='video"+displayindex+"' style='width:100%;height:100%;width:100%;height:100%; float:left; clear: both; margin: auto;' data='http://www.youtube.com/v/" + video_id + "?autoplay=1&controls=1&enablejsapi=1&playerapiid=player" + displayindex + "&showinfo=1'></object>";
 
		return html;
	}*/

	$(window).resize(resizeVids);

	function resizeVids() {
		for(var i = 1; i <= 4; i++) {
			var video = $("#disp" + i);
			var wid = video.width();
			var hei = Math.floor(wid / ASPECT);
			video.height(hei);
		}
	}

	function unMuteMe(index) {
		muteAll();
		players[index].unMute();
	}

	function muteAll() {
		for(var i = 0; i < 4; i++) {
			players[i].mute();
		}
	}
