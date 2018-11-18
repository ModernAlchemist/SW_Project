// server.js
// where your node app starts
// Get the hash of the url

// init project
const express = require('express');
const app = express();
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html


// init sqlite db
var fs = require('fs');
var dbFile = './.data/Brain.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

//**************************AZAEL***************************//
//**********************************************************//
//Here is where we initialize the DB, if does not exist.
//So You can replace/alter the code to set up our DB.
//This is from an template from this website.
//You may not need all this. Or you may need more code to initialize
//(most likely since we will have more than one table).
//You can look at the small example here:
//https://glitch.com/edit/#!/striped-parent


// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  // db.run('DROP TABLE if exists SONG');
  // console.log("Table SONG dropped");
  // db.run('CREATE TABLE SONG (Song_ID TEXT PRIMARY KEY, Title TEXT, Artist TEXT, Album TEXT)');
  // console.log("New table SONG created!");
  // db.run('INSERT INTO SONG VALUES( "1001" , "Wasted Times" , "The Weeknd" , "My Dear Melancholy" )');
  if (!exists) {
    db.run('CREATE TABLE Dreams (dream TEXT)');
    console.log('New table Dreams created!');
    
//    db.run('drop TABLE if exists SONG');
    console.log("DNE");
    db.run("CREATE TABLE SONG (Song_ID TEXT, Title TEXT, Artist TEXT, Album TEXT)");
    console.log("New table SONG created!");
    
    db.run("INSERT INTO SONG VALUES( '1001' ),( 'Wasted Times' ),( 'The Weeknd' ),( 'My Dear Melancholy' )");
    
    
  
  }else{
//  console.log('Database "SONG" ready to go!');
  db.all('SELECT * from SONG', function(err, rows) {
    //Do stuff with response here. 
    //probably won't use this here since we are solely inserting
    console.log('Record: ' + rows);
  });  
  }
});



//Middleware
app.use(express.static(__dirname + '/'));//Attach static files(CSS,SCSS,etc)
app.use(bodyParser.json());              //Used for parsing incoming data from requests

//Routing to our different pages. 
//Links placed in page that correspond to each of these
app.get('/playlists', function(request, response) {
  response.sendFile(__dirname + '/playlists.html');
});
app.get('/player', function(request, response) {
  response.sendFile(__dirname + '/player.html');
});
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/home.html');
});

app.get('/sort', function(request, response) {
  response.send("seen");
});

//Used to Post data from client side to here for sorting. I placed the link
//in playlists.html so that when the user reaches that page their playlist
//(if new user) will posted here for processing. The processed playlists will
//be placed in our SQL DB and will be fetched when they click on any of the
//playlists. After initial processing, all playlists will be gathered from 
//the DB and no further processing(this code below) will be done.
app.post('/sort', function(request, response) {
   console.log("Received request to sort");
   

  //*************ZACH***************************//
  //********************************************//
  //Parse JSON object and sort based on characteristics
  /*
  { danceability: 0.717,
  energy: 0.46,
  key: 11,
  loudness: -11.326,
  mode: 0,
  speechiness: 0.0372,
  acousticness: 0.0287,
  instrumentalness: 0.785,
  liveness: 0.0661,
  valence: 0.0961,
  tempo: 110.993,
  type: 'audio_features',
  id: '1fmoCZ6mtMiqA5GHWPcZz9',
  uri: 'spotify:track:1fmoCZ6mtMiqA5GHWPcZz9',
  track_href: 'https://api.spotify.com/v1/tracks/1fmoCZ6mtMiqA5GHWPcZz9',
  analysis_url: 'https://api.spotify.com/v1/audio-analysis/1fmoCZ6mtMiqA5GHWPcZz9',
  duration_ms: 367307,
  time_signature: 4 }
  
  Example:
  var keyOfSong = request.body.audio[0].audio_features[0].key
  
  Gets the key of the first song in the array. Change index of audio_features to 
  get the next and so on.
  
  You can use console.log("Hello"); in debugging. It'll appear if you click 
  'Status' over to the left at the top.
  
  We want to group the 'id's into arrays based on the sort. I'll use those to load
  the playlist. 
  Another component of this portion is researching parameters. I totally can't find the original paper that gave me the idea.
  So, I'll leave to you to figure out how to sort them. 
  */
  //k ill look for parameters 
  //where are the GET functions that call the API? -> script.js
  
  
  
  
  
  console.log("sorted"); 
  
  
  //************************AZAEL***************************//
  //********************************************************//
  //Store sorted playlists in DB for user
  var keyOfSong = request.body.audio[0].audio_features[0].key;
  var meditationPlaylist = 
                  [{"id":request.body.audio[0].audio_features[0].id,
                    "key":request.body.audio[0].audio_features[0].key,
                    "tempo":request.body.audio[0].audio_features[0].temp,
                    "energy":request.body.audio[0].audio_features[0].energy,
                    "loudness":request.body.audio[0].audio_features[0].loudness,
                    "speechiness":request.body.audio[0].audio_features[0].speechiness,
                    "time_signature":request.body.audio[0].audio_features[0].time_signature}
                   ,
                   {"id":request.body.audio[0].audio_features[1].id,
                    "key":request.body.audio[0].audio_features[1].key,
                    "tempo":request.body.audio[0].audio_features[1].temp,
                    "energy":request.body.audio[0].audio_features[1].energy,
                    "loudness":request.body.audio[0].audio_features[1].loudness,
                    "speechiness":request.body.audio[0].audio_features[1].speechiness,
                    "time_signature":request.body.audio[0].audio_features[1].time_signature}
                   ,
                   {"id":request.body.audio[0].audio_features[2].id,
                    "key":request.body.audio[0].audio_features[2].key,
                    "tempo":request.body.audio[0].audio_features[2].temp,
                    "energy":request.body.audio[0].audio_features[2].energy,
                    "loudness":request.body.audio[0].audio_features[2].loudness,
                    "speechiness":request.body.audio[0].audio_features[2].speechiness,
                    "time_signature":request.body.audio[0].audio_features[2].time_signature}
                  ];
  var exercisePlaylist = 
                  [{"id":request.body.audio[0].audio_features[0].id,
                    "key":request.body.audio[0].audio_features[0].key,
                    "tempo":request.body.audio[0].audio_features[0].temp,
                    "energy":request.body.audio[0].audio_features[0].energy,
                    "loudness":request.body.audio[0].audio_features[0].loudness,
                    "speechiness":request.body.audio[0].audio_features[0].speechiness,
                    "time_signature":request.body.audio[0].audio_features[0].time_signature}
                   ,
                   {"id":request.body.audio[0].audio_features[1].id,
                    "key":request.body.audio[0].audio_features[1].key,
                    "tempo":request.body.audio[0].audio_features[1].temp,
                    "energy":request.body.audio[0].audio_features[1].energy,
                    "loudness":request.body.audio[0].audio_features[1].loudness,
                    "speechiness":request.body.audio[0].audio_features[1].speechiness,
                    "time_signature":request.body.audio[0].audio_features[1].time_signature}
                   ,
                   {"id":request.body.audio[0].audio_features[2].id,
                    "key":request.body.audio[0].audio_features[2].key,
                    "tempo":request.body.audio[0].audio_features[2].temp,
                    "energy":request.body.audio[0].audio_features[2].energy,
                    "loudness":request.body.audio[0].audio_features[2].loudness,
                    "speechiness":request.body.audio[0].audio_features[2].speechiness,
                    "time_signature":request.body.audio[0].audio_features[2].time_signature}
                  ];
  var userName = request.body.user; //Use for user
  //Above are examples of what will be passed to you. Don't get daunted, as
  //I had to enter it manually. It won't exactly look like that. 
  //But the way you call it and the values you get will be the same.
  //So this is an array of JSON objects. Each JSON object represents a song
  //and it's attributes. In order to access say for example the id attribute of
  //the second song you do "exercisePlaylist[1].id" Or to get the tempo of the third
  //song in the meditation playlist you do "meditationPlaylist[2].tempo".
  //Check it out below in the insert 
  
  db.all('SELECT * from Dreams', function(err, rows) {
    //Do stuff with response here. 
    //probably won't use this here since we are solely inserting
  });
  // insert default dreams
  // Serialize makes this function synchronous I think. Either way,
  // Place regular SQL into the the parentheses.
  db.serialize(function() {
    
    
    //Here you might have to loop through the songs and playlists
    //using meditationPlaylist[i].id, meditationPlaylist[i].tempo,etc.
    //of course you can delete this code and do it as you see fit
    //This is just for example purposes.
    db.run('INSERT INTO Dreams (songID) VALUES ("'+meditationPlaylist[0].id+'"), ("'
           +meditationPlaylist[0].tempo+'"), ("Wash the dishes")');
  });
  
  
  
  
  
  
  
  
  console.log(request.body.audio[0].audio_features.length);
  
  console.log("stored in database"); 
  
  response.send("Sorted and Stored Playlists!");
});
        
console.log('Listening on 8888');
app.listen(8888);

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
