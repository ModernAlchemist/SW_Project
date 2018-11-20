
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
// Set token
let _token = hash.access_token;

const authEndpoint = 'https://accounts.spotify.com/authorize';

var taskCategory = getParameterByName("taskCategory");
console.log(taskCategory);
// Replace with your app's client ID, redirect URI and desired scopes
const clientId = 'bb1b05baf47b473280d9fc3e8af8da6c';
const redirectUri = 'https://accurate-education.glitch.me/playlists';
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
else if(!userExists)
{
    
    var pLists = [];
    var tracks = [];
    var trackNames = [];
    var audioFeatures = [];
    var numpLists;
    var numTracks;
    var offset = 10;
    var userName;
    var userExists;

    $.ajax({
       url: "https://api.spotify.com/v1/me",
       type: "GET",
       async: false,
       beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + _token );},
       success: function(data) {  
         console.log("Got id!");
         userName = data.id;
       }
      }); 
  $.ajax({
     url: "https://accurate-education.glitch.me/userexists?user="+userName,
     type: "GET",
     async: false,
     success: function(data) { 
       console.log(data);
       userExists = data.userExists;
     }
  });
  console.log("USERExists: ",userExists);
  

  
  if(!userExists)
  {
  console.log("Not sorting");
    getPlaylists(0);

    while(numpLists == 50)
    {
       getPlaylists(offset); 
       offset += 50;
    }


    for(var i = 0; i < pLists.length; i++)
    {
        offset = 0;
        getTracks(pLists[i],offset);

        while(numTracks == 100)
        {
            offset += 100;
            getTracks(pLists[i],offset);  
        }
    }

    for(var i = 0; i < tracks.length; i+=100)
    {
        if(tracks[i+100])
        {
          getAudioAnalysis(tracks.slice(i,i+100)); 
        }
        else
        {
          getAudioAnalysis(tracks.slice(i,tracks.length)); 
        }
    }



    
  audioFeatures = audioFeatures[0].audio_features;
   console.log(audioFeatures);
   var audioLength = audioFeatures.length;
  for(var i = 0; i < audioLength; i += 50)
  {
    if(i+ 50 > audioLength)
    {
        $.ajax({
           url: "https://accurate-education.glitch.me/sort",
           type: "POST",
           async: false,
           data: JSON.stringify({"audio": audioFeatures.slice(i,audioLength),"user": userName}),
           dataType: 'json',
           contentType: "application/json; charset=utf-8",
           success: function(data) {  
             console.log("Sent to sort!");
           },
           error: function(e) {
             console.log(e);
           }
        });
    }
    else
    {
        $.ajax({
           url: "https://accurate-education.glitch.me/sort",
           type: "POST",
           async: false,
           data: JSON.stringify({"audio": audioFeatures.slice(i,i+50),"user": userName}),
           dataType: 'json',
           contentType: "application/json; charset=utf-8",
           success: function(data) {  
             console.log("Sent to sort!");
           },
           error: function(e) {
             console.log(e);
           }
        });
    }
  }
  }
}

function getPlaylists(offset)
{
   $.ajax({
   url: "https://api.spotify.com/v1/me/playlists?limit=50&offset="+offset,
   type: "GET",
   async: false,
   beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + _token );},
   success: function(data) { 
     console.log(data);
     for(var i = 0; i < data.items.length; i++)
     {
         pLists.push(data.items[i].id);
     }
     numpLists = data.total;
   }
  });
}

function getTracks(playlist,offset)
{
   $.ajax({
   url: "https://api.spotify.com/v1/playlists/"+playlist+"/"+
      "tracks?market=ES&fields=items(added_by.id%2Ctrack(name%2Cid%2Chref%2Calbum(name%2Chref)))"+
      "&limit=100&offset="+offset,
   type: "GET",
   async: false,
   beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + _token );},
   success: function(data) {  
     console.log(data);
      for(var i = 0; i < data.items.length; i++)
      {
        tracks.push(data.items[i].track.id);
        trackNames.push(data.items[i].track.name);
      }
      numTracks = data.items.length;
   }
  }); 
}

function getAudioAnalysis(subsetTracks)
{
   var ids = "";
   for(var i = 0; i < subsetTracks.length; i++)
   {
      ids += subsetTracks[i] + "%2C";
   }
  $.ajax({
   url: "https://api.spotify.com/v1/audio-features?ids=" + ids,
   type: "GET",
   async: false,
   beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + _token );},
   success: function(data) {  
     console.log("Got audio features!");
     audioFeatures.push(data);
   }
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

