if (API_KEY == undefined || API_KEY == '') {
  alert("API_KEY not configured. App will not work.");
}

var ASPECT = 16 / 9;

const MAX_RESULTS = 50;
const REFILL_THRESHOLD = 20;

var fetching = false;
var unwatchedVideoIds = [];

$(window).resize(() => resizePlayers());

function onYouTubeIframeAPIReady() {
  Promise.all([setupPlayers(), fetchNewVideos()]).then(() => playNewVideos());
}

var players = [];
function setupPlayers() {
  const promises = [];
  for (var i = 0; i < 4; i++) {
    promises.push(new Promise((resolve, reject) => {
      players[i] = new YT.Player('player' + i, {
        playerVars: {
          autoplay: 1,
          controls: 0,
          showinfo: 0,
          mute: 1,
        },
        events: {
          onReady: (event) => {
            onPlayerReady(event);
            resolve(players[i]);
          },
          onStateChange: onPlayerStateChange
        }
      });
    }));
  }
  return Promise.all(promises);
}

function onPlayerReady(event) {
  var player = event.target;

  // Bind the Mute / Unmute handler
  $(player.a).hover(
    /* handlerIn */ () => player.unMute(),
    /* handlerOut */ () => player.mute());

  resizePlayer(player);
  playNewVideo(player);
}

function onPlayerStateChange(event) {
  const state = event.data;
  const player = event.target;
  switch (state) {
    case YT.PlayerState.PAUSED:
      // Prevent pausing
      player.playVideo();
      break;
    case YT.PlayerState.ENDED:
      // If video ended, play another
      playNewVideo(player);
      break;
  }
}

function playNewVideosByQuery(query) {
  unwatchedVideoIds = []
  fetchNewVideosByQuery(query).done(() => playNewVideos());
}

function playNewVideosByCategory(category) {
  unwatchedVideoIds = []
  fetchNewVideosByCategory(category).done(() => playNewVideos());
}

const COMMON_QUERY_PARAMS = {
  'part': 'snippet',
  'videoEmbeddable': 'true',
  'type': 'video',
  'maxResults': MAX_RESULTS,
  'key': API_KEY,
};
var fetchNextVideos = () => {}; // Do nothing

function fetchNewVideos(params = {}) {
  const query_params = Object.assign(params, COMMON_QUERY_PARAMS);
  const url = 'https://www.googleapis.com/youtube/v3/search?' + $.param(query_params);

  // Check to see if we are already fetching videos
  if (!fetching && unwatchedVideoIds.length < REFILL_THRESHOLD) {
    fetching = true;
    return $.get(url).done((data) => {
      // Process Video IDs
      processVideos(data);

      // Set up fetchNextVideos() with pageToken
      const pageToken = data.pageToken;
      fetchNextVideos = () => {
        fetchNewVideos(Object.assign(query_params, {'pageToken': data.pageToken}));
      }
    }).always(() => {fetching = false});
  }
}

function fetchNewVideosByQuery(query) {
  // Fetch videos for the search query
  return fetchNewVideos({'q': encodeURIComponent(query)});
}

function fetchNewVideosByCategory(category) {
  // Fetch videos for the video category
  return fetchNewVideos({'videoCategoryId': encodeURIComponent(category)});
}

function processVideos(data) {
  // Process video IDs from API response
  var videoIds = shuffle(data["items"].map((video) => video.id.videoId));
  unwatchedVideoIds = unwatchedVideoIds.concat(videoIds); // append to unwatched
}

function shuffle(videoList) {
  // Shuffle list of video IDs to make things more random
  for (var i = 0; i < videoList; i++) {
    var random = Math.floor(Math.random() * videoList.length);

    // Swap
    var temp = videoList[i];
    videoList[i] = videoList[random];
    videoList[random] = temp;
  }

  return videoList;
}

function playNewVideos() {
  // Play new video on all players
  for(var i = 0; i < players.length; i++) {
    playNewVideo(players[i]);
  }
}

function playNewVideo(player) {
  // If we are running out of videos, request more
  if (unwatchedVideoIds.length < REFILL_THRESHOLD) {
    fetchNextVideos();
  }

  // Consume an unwatched video ID
  const videoId = unwatchedVideoIds.shift();
  player.loadVideoById(videoId);
}

function resizePlayers() {
  // Resize all players
  for (var i = 0; i < players.length; i++) {
    resizePlayer(players[i]);
  }
}

function resizePlayer(player) {
  // Resize player according to the container width
  const videoContainerWidth = $("#players").width();
  const targetVideoWidth = Math.floor(videoContainerWidth / 2);
  const targetVideoHeight = Math.floor(targetVideoWidth / ASPECT);
  $(player.a).width(targetVideoWidth);
  $(player.a).height(targetVideoHeight);
}
