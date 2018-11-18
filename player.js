
// Get the hash of the url
const hash = window.location.hash
.substring(1)
.split('&')
.reduce(function (initial, item) {
  if (item) {
    var parts = item.split('=');
    initial[parts[0]] = decodeURIComponent(parts[1]);
  }
  return initial;
}, {});
window.location.hash = '';
console.log(window.location);
// Set token
let _token = hash.access_token;

const authEndpoint = 'https://accounts.spotify.com/authorize';


//**************************AZAEL***********************************//
//**********************Get proper playlist from DB*******************//
//*******************************************************************//
//Query by user and then by playlist
var taskCategory = getParameterByName("taskCategory"); //The category of the playlist we need to fetch

$('.playlistCategory').html(taskCategory.toUpperCase());//taskCategory.toUpperCase());


//Do stuff here





//Retrieve playlist in array form like below. Of course it'll probably be longer than this.
//Using this as a dummy for right now.
var playlist = ["7sqii6BhIDpJChYpU3WjwS","6wMTeVootJ8RdCLNOZy5Km","0LtOwyZoSNZKJWHqjzADpW","5lfp2QjgatdihCll6tFlMA","7KRQoq9GeWeCm0ZAXg5XMb","5h27GYpKZWWhFov8fOunF6","70We9AqHenA4jcmXmKzJnZ","43QhrhgRrH9NWy6eoUro4X","7L59A2cUZOx5IVuGnrhRkA"];

var playlistString = "[";
var trackInfo = "";
for(var i = 0; i < playlist.length; i++)
{
   trackInfo += playlist[i] + "%2C";
   playlistString += '"spotify:track:'+playlist[i]+'",'; 
}
playlistString = playlistString.substring(0,playlistString.length -1);
playlistString += "]";
trackInfo = trackInfo.substring(0,trackInfo.length - 3);
console.log(playlistString);
getTrackInfo(trackInfo);
// Replace with your app's client ID, redirect URI and desired scopes
const clientId = 'bb1b05baf47b473280d9fc3e8af8da6c';
const redirectUri = 'https://accurate-education.glitch.me/player?taskCategory='+taskCategory;
const scopes = [
  'streaming',
  'user-read-birthdate',
  'user-read-private',
  'user-modify-playback-state'
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
}

// Set up the Web Playback SDK
var player;
var hours = 0;
var minutes = 0;
var seconds = 0;
var sCount = 0;
var trackPaused = false;
var totalProgress = 0;
var deviceId;
var tonePlaying = false;

window.onSpotifyPlayerAPIReady = () => {
  player = new Spotify.Player({
    name: 'Web Playback SDK Template',
    getOAuthToken: cb => { cb(_token); }
  });

  // Error handling
  player.on('initialization_error', e => console.error(e));
  player.on('authentication_error', e => console.error(e));
  player.on('account_error', e => console.error(e));
  player.on('playback_error', e => console.error(e));

  // Playback status updates
  var lastTrack = "start";
  var newTrack;
  var trackDuration;

  player.on('player_state_changed', state => {
    console.log(state);
    $('#current-track').attr('src', state.track_window.current_track.album.images[0].url);
    $('#current-track-name').text(state.track_window.current_track.name);
    newTrack = state.track_window.current_track.id;
    
    if(lastTrack != newTrack)
    {
      clearInterval(trackDuration);
      totalProgress = (state.duration/1000);
      setIsotone(2,220);
      var seconds = Math.round((state.duration/1000)%60);
      var minutes = Math.round((state.duration/1000)/60);
      var hours = Math.round((state.duration/1000)/3600);
      console.log(hours +':'+minutes+':'+seconds);
      document.getElementById("playedDuration").innerHTML = '00:00:00';
      document.getElementById("leftDuration").innerHTML = ("0" + hours).slice(-2) +':'+
        ("0" + minutes).slice(-2) +':'+ ("0" + seconds).slice(-2);
      lastTrack = state.track_window.current_track.id;
      
      sCount = 0;
      trackDuration = setInterval(progressUpdate, 1000);
    }
    if(state.paused == true)
    {
      trackPaused = true;
      pauseTone();
      tonePlaying=false;
    }
    else
    {
      if(!tonePlaying)
      {
        playTone();
      }
      tonePlaying = true;
      trackPaused = false;
    }
  });

  // Ready
  player.on('ready', data => {
    console.log('Ready with Device ID', data.device_id);
    
    // Play a track using our new device ID
    play(data.device_id);
    deviceId = data.device_id;
    player.setVolume(0.5).then(() => {
  console.log('Volume updated!');
});
  });

  // Connect to the player!
  player.connect();
  
  // ****************************************************************************
  var volume = .5;
  //Volume WIP
  /*

  */
  // ***************************************************************************
  
}

// Play a specified track on the Web Playback SDK's device ID
function play(device_id) {
  $.ajax({
   url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
   type: "PUT",
   data: '{"uris": '+playlistString+'}',
   beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + _token );},
   success: function(data) { 
     console.log(data);
   }
  });
}

function getTrackInfo(tracks)
{
    $.ajax({
     url: "https://api.spotify.com/v1/tracks?ids="+tracks+"&market=ES",
     type: "GET",
     beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + _token );},
     success: function(data) { 
       console.log("Got track info");
       for(var i = 0; i < data.tracks.length; i++)
       {
           $('#playlistInfo').append(
          '<div class="row"><div class="track col s12  flow-text" id="track'+i+'" onclick="seekTrack(event)">'+
          data.tracks[i].name+ ' - ' +  data.tracks[i].album.artists[0].name +              
          '</div></div></div>');
       }
     }
    });
}
function pausePlayer() {

  player.togglePlay().then(() => {
    console.log('Toggled playback!');
  });
  
}; 

function nextPlayer() {

player.nextTrack().then(() => {
  console.log('Skipped to next track!');
});
}

function backPlayer() {
  player.previousTrack().then(() => {
  console.log('Set to previous track!');
});
}


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


window.SetVolume = function(val)
{
    player.setVolume(val/100).then(() => {
      console.log('Volume updated!');
    });
}


    
var elem = document.getElementById("myBar");
function progressUpdate(){
  if(!trackPaused)
  {
    sCount++;
  }

  seconds = Math.round(sCount%60);
  hours = Math.floor(sCount/3600);
  minutes = Math.floor(sCount/60);

  document.getElementById("playedDuration").innerHTML = ("0" + hours).slice(-2) +':'+
    ("0" + minutes).slice(-2) +':'+ ("0" + seconds).slice(-2);
  elem.style.width = (sCount/totalProgress)*100 + '%'; 
}

function seekTrack(event){
  var id = $(event.target).attr('id');
  id = id.substring(5,id.length);
   
  var reorderedPlaylist = 
    (playlist.slice(id,playlist.length)).concat(
    playlist.slice(0,id));

  playlistString = "[";
  for(var i = 0; i < reorderedPlaylist.length; i++)
  {
     playlistString += '"spotify:track:'+reorderedPlaylist[i]+'",'; 
  }
  playlistString = playlistString.substring(0,playlistString.length -1);
  playlistString += "]";
  
  play(deviceId);
}


$(window).bind('scroll', function() {
     if ($(window).scrollTop() > 50) {
         $('#playlistReminder').hide();
     }
     else {
         $('#playlistReminder').show();
     }
});

