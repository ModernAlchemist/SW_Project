/***************************************Sort.js***************************************/
// This script is responsible for detecting users and determing if they exist in our database.
// If the user does not exist, then their library is scraped and sorted, and stored in our 
// database. This allows us to only have to process the users library once, on initialization.
// Since the data and porcessing is quite sizeable, this is important.
// Due to restrictions on calls to the Spotify API we must break calls into pages in order
// to get the full playlist list/track list for playlists.
/*************************************************************************************/


// Get the hash of the url
// This allows us to get the token passed from the authorization flow
// If it exists
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

//Redirect to authorization
const authEndpoint = 'https://accounts.spotify.com/authorize';


// These are used to gain access to the Spotify API
// The redirect URI is the url to be redirected to after authorization
// Scopes are the areas that the user will give us access to
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
else
{
    
    var pLists = [];        //User's playlists(unique IDs)
    var tracks = [];        //User's songs from all playlists(uniqueIDs)
    var trackNames = [];    //Name of tracks
    var audioFeatures = []; //JSON object of all songs in the users library(probably quite large)
    var numpLists;          //Number of playlists
    var numTracks;          //Number of tracks
    var offset = 0;         //Used for paging
    var userName;           //User name obtained from spotify API
    var userExists;         //If the user is in our DB as having been processed

    //Using the Spotify API to get the current user's username
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
  
    //Using the acquired id to see if the user is in our database
    $.ajax({
          url: "https://accurate-education.glitch.me/userexists?user="+userName,
          type: "GET",
          async: false,
          success: function(data) { 
              console.log(data);
              userExists = data.userExists;
          }
    });
  

    //If the user is in the database then we'll have to sort the song
    //This is only done once. After that their data will be stored in our DB.
    if(!userExists)
    {
        //Get the first playlist
        getPlaylists(0);

        //Get subsequent playlists
        //We have to loop through like this because there is a limit on the API
        while(numpLists == 50)
        {
           getPlaylists(offset); 
           offset += 50;
        }

        //We must loop through each playlist and all tracks in each playlist
        //We are compiling all these tracks in order to be processed
        //There is a limit on tracks read from each API call
        //This is the reason for having to process like this
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

        //We are now taking all the tracks and passing them to
        //The spotify API endpoint that returns audio analysis of 
        //the given tracks.
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
      
        //There is a limit on the amount of data passed to our
        //express framework(our backend) therefore we must
        //break up the data into packets.
        //There is also a limit on the number of asynchronous threads
        //for each tab in Google Chrome. For this reason
        //we are making the ajax calls synchronous.
        for(var i = 0; i < audioLength; i += 50)
        {
            if(i+ 50 > audioLength)
            {
                //We are sending the data to our backend to be sorted and placed into our DB.
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

//Calls Spotify API in order to get the playlists of the given user
//These are always in the same order, thus allowing paging with the offset
//variable. We are solely gathering the unique ids of each of these playlists.
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

//We take a unique playlist id, gathered from the above function, and offset(for paging),
//and gather tracks for the playlists.
//We parse the data and obtain the unique track ids 
//These will be stored in our database and used to gather audio analysis.
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

//This function takes an array of unique trackIDs and outputs the audio analysis
//for all of the tracks. This data will be used for sorting into playlists in our
//backend.
function getAudioAnalysis(subsetTracks)
{
     //We must convert the tracks into a string for the API
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

