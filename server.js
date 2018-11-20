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
var http = require('http');
var engine = require('consolidate')

app.engine('html', engine.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname );
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
  // Working on the route at the bottom
  // 
 if(!exists)
 {
    db.run('Drop Table SONG');
    db.run('Create Table SONG (Song_ID TEXT Primary Key, Key INTEGER, Danceability REAL, Energy REAL, Speechiness REAL, Acousticness REAL, Instrumentalness REAL, Liveness REAL, Tempo REAL, Meditation NUMERIC, Exercise NUMERIC, Sleep NUMERIC, Memory NUMERIC, Writing NUMERIC, Problem NUMERIC, Creativity NUMERIC, Abstract NUMERIC )');
    console.log("SONG Table created");
    
    db.run('Drop Table USER');
	  db.run('create TABLE USER (Username TEXT PRIMARY KEY)');
    
    db.run('Drop Table USER_LIBRARY');
	  db.run('create TABLE USER_LIBRARY (Username TEXT, Song_ID TEXT UNIQUE)');

    db.run('Drop Table PLAYLIST');
	  db.run('create TABLE PLAYLIST (Username TEXT , Task_ID INTEGER, Song_ID TEXT)');
    
 }
});
	  // db.run('drop TABLE if exists TASK');
	  // db.run('create TABLE TASK (Task_ID INTEGER PRIMARY KEY, Task_Name TEXT)');
	  // db.serialize(function() {
	  // db.run('INSERT INTO TASK VALUES (1 , "Meditation" ), (2 , "Exercise" ), ( 3 , "Sleep" ), ( 4 , "Memory" ), (5 , "Writing" ), ( 6 , "Problem Solving" ), ( 7 , "Creativity" ), ( 8 , "Abstract" );')
	  // });
    // db.each('select * from TASK', function(err, row) {
    //   if ( row ) {
    //     console.log('record:', row);
    //   }
    // });


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

app.get('/userexists',function(request,response) {
  
  console.log("Seeing if user exists...");
          
  db.serialize(function(){
      db.all('select Username from USER where Username = "'+request.query.user+'"', function(err, row){
        var userExists = false;
        if(row) { 
            console.log(row);
           if(row[0])
           {
             userExists = true; 
           }
        }
        response.send({userExists:userExists});
        
        console.log("userExists: " + userExists); 
        //We need to move this user exists to another route I'll make it right above

      });
  });
});


app.get('/fetchKey',function(request,response) {
  console.log("fetching key...");
  
  db.serialize(function(){
    var SongID = request.query.song;
    var songKey = null;
    db.all('select Key from SONG where SONG_ID = "'+SongID+'"' , function(err, row){
      if(row){
        songKey = row;
      }
      else{
        console.log("error in setting Key: " , err);
      }
      response.send({songKey:songKey});
      console.log ("Key: " + songKey);
      
    });
  });
  
});



//Used to Post data from client side to here for sorting. I placed the link
//in playlists.html so that when the user reaches that page their playlist
//(if new user) will posted here for processing. The processed playlists will
//be placed in our SQL DB and will be fetched when they click on any of the
//playlists. After initial processing, all playlists will be gathered from 
//the DB and no further processing(this code below) will be done.
app.post('/sort', function(request, response) {

  console.log("Received request to sort"); 
  
  db.run('INSERT INTO USER VALUES ("'+request.body.user+'")',function(err){
            if(err)
            {
              console.log("Error: Duplicate User. ");
            }
        });
  
  
  
  //So now we need to go back and drop and create all the tables lol Because of all the duplicates
  //*************ZACH***************************//
  //********************************************//
  //Parse JSON object and sort based on characteristics
  /*
  [{ danceability: 0.3536,
  energy: 0.412,
  speechiness: 0.0267,
  acousticness: 0.0267,
  instrumentalness: 0.785,
  liveness: 0.0603,
  tempo: 109.228,
  type: 'audio_features',
  id: '1fmoCZ6mtMiqA5GHWPcZz9'}
  ,
  { danceability: 0.3536,
  energy: 0.412,
  speechiness: 0.0267,
  acousticness: 0.0267,
  instrumentalness: 0.785,
  liveness: 0.0603,
  tempo: 109.228,
  type: 'audio_features',
  id: '1fmoCZ6mtMiqA5GHWPcZz9'}]
  
  //Example output
  userSortedSongs = [
  {
    id: "fasdfasdlkj",
    exercise: true,
    meditation: false,
    creativity: true,
    abstract: true,
    memory: false,
    problem: true,
    tempo: 180,
    key: 11
  },
  {
    id: "asdfasdfadf",
    exercise: false,
    meditation: true,
    creativity: false,
    tempo: 100,
    key: 4
  }
  ];
  */
  //~~~~~~~~~~~~~~~~~~~~~~~~~LOOP~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\\
  var userPlaylists = [];
  var lengthOfReq = request.body.audio.length;
  var i;
  var globDance = 0.3536;
  var globEnergy = 0.412;
  var globSpeech = 0.0267;
  var globAcoustic = 0.0267;
  var globInstrument = 0.785;
  var globLive = 0.0603;
  var globTempo = 109.228;
  var danceability, energy, speechiness, acousticness, instrumentalness, liveness, tempo;
  for (i=0; i<lengthOfReq; i++)
  {
    var song = {id: "", key: "", 
                key : request.body.audio[i].key,
                danceability : request.body.audio[i].danceability,
                energy : request.body.audio[i].energy,
                speechiness : request.body.audio[i].speechiness,
                acousticness : request.body.audio[i].acousticness,
                instrumentalness : request.body.audio[i].instrumentalness,
                liveness :request.body.audio[i].liveness,
                tempo : request.body.audio[i].tempo,
                exercise: false, meditation: false, creativity:false, abstract:false, memory:false, problem:false, sleep:false, writing: false};
    var exeNumTrue = 0;
    var medNumTrue = 0;
    var creNumTrue = 0;
    var sleNumTrue = 0;
    var memNumTrue = 0;
    var wriNumTrue = 0;
    var proNumTrue = 0;
    var absNumTrue = 0;
    
    
    song.id = request.body.audio[i].id;
    song.key = request.body.audio[i].key;
    
    
    danceability = request.body.audio[i].danceability; 
    energy = request.body.audio[i].energy;
    speechiness = request.body.audio[i].speechiness;
    acousticness = request.body.audio[i].acousticness;
    instrumentalness = request.body.audio[i].instrumentalness;
    liveness = request.body.audio[i].liveliness;
    tempo = request.body.audio[i].tempo;
    
    if (danceability>(globDance*.7)&&danceability<globDance*1.8)
    {
       exeNumTrue++; 
    }
    if (danceability>(globDance*.9) && danceability<(globDance*1.1))
    {
      absNumTrue++;
    }
    if(danceability>(globDance*.2)&&danceability<(globDance*.9))
    {
      medNumTrue++;
      creNumTrue++;
      wriNumTrue++;
      proNumTrue++;
    }
    if(energy>(globEnergy*.9)&&energy<(globEnergy*1.3))
    {
      exeNumTrue++;
      creNumTrue++;
      absNumTrue++;
    }
    if(energy<(globEnergy*.9)&&energy>(globEnergy*.4))
    {
      medNumTrue++;
      memNumTrue++;
      wriNumTrue++;
      proNumTrue++;
    }
    if(speechiness>(globSpeech*.5)&&speechiness<(globSpeech*1.9))
    {
      exeNumTrue++;
      sleNumTrue++;
      if(speechiness<(globSpeech*1.3))
      {
        absNumTrue++;
        creNumTrue++;
        if(speechiness>(globSpeech*.7))
        {proNumTrue++;}
        if(speechiness<(globSpeech*.7))
        {
          medNumTrue++;
          memNumTrue++;
          wriNumTrue++;
        }
      }
    }
    if(acousticness>(globAcoustic*.6)&&acousticness<(globAcoustic*1.5))
    {
      memNumTrue++;
      proNumTrue++;
      absNumTrue++;
      creNumTrue++;
      sleNumTrue++;
      if(acousticness<(globAcoustic*1.1))
      {medNumTrue++;}
    }
    if(instrumentalness>(globInstrument*.8)&&instrumentalness<(globInstrument*2))
    {
      wriNumTrue++;
      creNumTrue++;
      sleNumTrue++;
      medNumTrue++;
      proNumTrue++;
    }
    if(liveness>(globLive*.7)&&liveness<(globLive*1.7))
    {
      exeNumTrue++;
      absNumTrue++;
      if(liveness<(globLive*.9))
      {
        proNumTrue++;
        memNumTrue++;
        creNumTrue++;
      }
    }
    if(tempo>(globTempo*.6)&&tempo<(globTempo*1.4))
    {
      absNumTrue++;
      wriNumTrue++;
      if(tempo<(globTempo))
      {
        creNumTrue++;
        proNumTrue++;
      }
      if(tempo>(globTempo*.8))
      {
        exeNumTrue++;
        memNumTrue++;
      }
    }
    if(tempo<(globTempo*.8))
    {
      medNumTrue++;
      if(tempo<(globTempo*.6))
      {
        sleNumTrue++;
      }
    }
    
    if(exeNumTrue > 2)
    {
      song.exercise=true;
    }
    if(medNumTrue > 2)
    {
      song.meditation=true;
    }
    if(sleNumTrue > 2)
    {
      song.sleep=true;
    }
    if(memNumTrue > 1)
    {
      song.memory= true;
    }
    if(wriNumTrue > 2)
    {
      song.writing= true;
    }
    if(proNumTrue > 1)
    {
      song.problem= true;
    }
    if(absNumTrue > 2)
    {
      song.abstract= true;
    }
    if(creNumTrue > 1)
    {
      song.creativity= true;
    }
    userPlaylists.push(song)
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //~~~~Add save to DB statements here~~~~//
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  
  }
  //console.log(userPlaylists);
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~LOOP~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\\

  /*
  userPlaylist.append(song);
  
  Example:
  var keyOfSong = request.body.audio[0].audio_features[0].tempo
  for
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
  var userName = request.body.user; //Use for user
  //Above are examples of what will be passed to you. Don't get daunted, as
  //I had to enter it manually. It won't exactly look like that. 
  //But the way you call it and the values you get will be the same.
  //So this is an array of JSON objects. Each JSON object represents a song
  //and it's attributes. In order to access say for example the id attribute of
  //the second song you do "exercisePlaylist[1].id" Or to get the tempo of the third
  //song in the meditation playlist you do "meditationPlaylist[2].tempo".
  //Check it out below in the insert 
  
  
     //Now we need to store stuff in all the table....... lol
        // damn, you wanna do user next? Yea. What is the table and attributes? Table is USER, Username as attribute 
        /*
            	db.run('drop TABLE if exists USER');
	            db.run('create TABLE USER (Username TEXT PRIMARY KEY)');
              I don't think we need the TASK and Playlist 
              do we? 
              the whole tables? Yea
              Seems we just need to fetch the songs from the users library that are of each playlist
              We don't necesarily need them but it might make it run faster to get it from the database than to process it each time?
              Ok ya you are right. It wasn't clicking for me for a sec. So do you wanna implement those while I do user library?
              Yeah sure I'll go at it :/ lol 
              Trying to think of a way to let each other know we are going to test
              How about we test every five minutes starting at 12:10? k i'll try to remeber :) 
             So just put your console.logs in your code. I'll bing on the discord lol Ok cool
       */

  // db.run('INSERT INTO USER VALUES ("'+userName+'")',function(err){
  //         if(err)
  //         {
  //           console.log("Error: Duplicate in user");
  //         }
  //   });
  
  
  for(var i = 0; i < userPlaylists.length; i++)
  {
      var songExists = false;
	    db.run('select Song_ID from SONG where Song_ID = "'+userPlaylists[i].id+'"', function(err, row){
        if(row) {
            songExists = true;
            console.log("already exists");
        }
	    });
      if(!songExists)
      {
        
        db.run('INSERT INTO SONG VALUES ("'+userPlaylists[i].id+'","'+userPlaylists[i].key+
               '","'+userPlaylists[i].danceability+'","'+userPlaylists[i].energy+'","'+userPlaylists[i].speechiness+'","'+
               userPlaylists[i].acousticness+'","'+userPlaylists[i].instrumentalness+'","'+userPlaylists[i].liveness+'","'+
               userPlaylists[i].tempo+'","'+userPlaylists[i].meditation+'","'+userPlaylists[i].exercise+'","'+ userPlaylists[i].sleep+'","'+ 
               userPlaylists[i].memory+'","'+userPlaylists[i].writing+'","'+userPlaylists[i].problem+'","'+
               userPlaylists[i].creativity+'","'+userPlaylists[i].abstract+'")',function(err){
          if(err)
          {
            console.log("Error: Duplicate");
          }
        });
        console.log("Added Song");
      }
    
    
      var userSongExists = false;
	    db.run('select Song_ID from USER_LIBRARY where Song_ID = "'+userPlaylists[i].id+'"', function(err, row){
        if(row) {
            userSongExists = true;
            console.log("user song already exists");
        }
	    });
      if(!userSongExists)
      {
        
        db.run('INSERT INTO USER_LIBRARY VALUES ("'+userName+'","'+userPlaylists[i].id+'")',function(err){
          if(err)
          {
            console.log("Error: Duplicate in user library");
          }
        });
        console.log("Added Song to user library");
      }
/*Meditation NUMERIC, Exercise NUMERIC,
Sleep NUMERIC, Memory NUMERIC, Writing NUMERIC, Problem NUMERIC, Creativity NUMERIC, Abstract NUMERIC
*/

      if(!songExists)
      {

        if(userPlaylists[i].meditation == true)
        {
          db.run('INSERT INTO PLAYLIST VALUES ("'+userName+'",1,"'+userPlaylists[i].id+'")',function(err){
              if(err)
              {
                  console.log(err);
              }
          });
          console.log("Song added to meditation");
        }
        if(userPlaylists[i].exercise == true)
        {
          db.run('INSERT INTO PLAYLIST VALUES ("'+userName+'",2,"'+userPlaylists[i].id+'")',function(err){
              if(err)
              {
                  console.log(err);
              }
          });
          console.log("Song added to exercise");
        }
        if(userPlaylists[i].sleep == true)
        {
          db.run('INSERT INTO PLAYLIST VALUES ("'+userName+'",3,"'+userPlaylists[i].id+'")',function(err){
              if(err)
              {
                  console.log(err);
              }
          });
          console.log("Song added to sleep");
        }
        if(userPlaylists[i].memory == true)
        {
          db.run('INSERT INTO PLAYLIST VALUES ("'+userName+'",4,"'+userPlaylists[i].id+'")',function(err){
              if(err)
              {
                  console.log(err);
              }
          });
          console.log("Song added to memory");
        }
        if(userPlaylists[i].writing == true)
        {
          db.run('INSERT INTO PLAYLIST VALUES ("'+userName+'",5,"'+userPlaylists[i].id+'")',function(err){
              if(err)
              {
                  console.log(err);
              }
          });
          console.log("Song added to writing");
        }
        if(userPlaylists[i].problem == true)
        {
          db.run('INSERT INTO PLAYLIST VALUES ("'+userName+'",6,"'+userPlaylists[i].id+'")',function(err){
              if(err)
              {
                  console.log(err);
              }
          });
          console.log("Song added to problem solving");
        }
        if(userPlaylists[i].creativity == true)
        {
          db.run('INSERT INTO PLAYLIST VALUES ("'+userName+'",7,"'+userPlaylists[i].id+'")',function(err){
              if(err)
              {
                  console.log(err);
              }
          });
          console.log("Song added to creativity");
        }
        if(userPlaylists[i].abstract == true)
        {
          db.run('INSERT INTO PLAYLIST VALUES ("'+userName+'",8,"'+userPlaylists[i].id+'")',function(err){
              if(err)
              {
                  console.log(err);
              }
          });
          console.log("Song added to abstract");
        }
      } 

    
    
    
    

	  //db.run('create TABLE PLAYLIST (Username TEXT , Task_ID INTEGER, Song_ID TEXT)');
  }
  
  /*db.each('select * from SONG', function(err, row){
		if(row){
      console.log(row);
			//console.log("S_ID: " + row.Song_ID + " " + row.Key + " " + row.Danceability + " " + row.Energy + " " + row.Speechiness + " " + row.Acousticness + " " + row.Instrumentalness + " " + row.Liveness + " " + row.Tempo + " " + row.Meditation + " " + row.Exercise  + " " + row.Sleep + " " + row.Memory + " " + row.Writing + " " + row.Problem + " " + row.Creativity + " " + row.Abstract);
    }
    if(err)
    {
      console.log("Error:" + err);
    }
	});*/
  /*db.each('select * from USER_LIBRARY', function(err, row){
		if(row){
      console.log(row);
			//console.log("S_ID: " + row.Song_ID + " " + row.Key + " " + row.Danceability + " " + row.Energy + " " + row.Speechiness + " " + row.Acousticness + " " + row.Instrumentalness + " " + row.Liveness + " " + row.Tempo + " " + row.Meditation + " " + row.Exercise  + " " + row.Sleep + " " + row.Memory + " " + row.Writing + " " + row.Problem + " " + row.Creativity + " " + row.Abstract);
    }
    if(err)
    {
      console.log("Error:" + err);
    }
	});*/
  
   /*db.each('select * from USER', function(err, row){
		if(row){
      console.log(row);
    }
    if(err)
    {
      console.log("Error:" + err);
    }
	});*/

  /*
  I just made it right below this on. So copy and paste and do the if then. And make a variable where you'l store
  what you get from the query. named requestedPlaylist
  
  
  var searchedTask = 0;
  searchedTask
  
  
  */
  /*db.each('SELECT P.Song_ID FROM PLAYLIST P, SONG S, Task T WHERE Username = "'+userName+'" and P.Task_ID = 1 and P.Song_ID = S.Song_ID and P.Task_ID = T.Task_ID', function(err, row){
		if(row){
      console.log("Meditation Playlist: " , row);
    }
    if(err)          
    {
      console.log("Error:" + err);
    }
	});
  
  db.each('SELECT P.Song_ID FROM PLAYLIST P, SONG S, Task T WHERE Username = "'+userName+'" and P.Task_ID = 2 and P.Song_ID = S.Song_ID and P.Task_ID = T.Task_ID', function(err, row){
		if(row){
      console.log("Exercise Playlist: " , row);
    }
    if(err)          
    {
      console.log("Error:" + err);
    }
	});
  
  db.each('SELECT P.Song_ID FROM PLAYLIST P, SONG S, Task T WHERE Username = "'+userName+'" and P.Task_ID = 3 and P.Song_ID = S.Song_ID and P.Task_ID = T.Task_ID', function(err, row){
		if(row){
      console.log("Sleep PLaylist: " , row);
    }
    if(err)          
    {
      console.log("Error:" + err);
    }
	});
  
  db.each('SELECT P.Song_ID FROM PLAYLIST P, SONG S, Task T WHERE Username = "'+userName+'" and P.Task_ID = 4 and P.Song_ID = S.Song_ID and P.Task_ID = T.Task_ID', function(err, row){
		if(row){
      console.log("Memory PLaylist: " , row);
    }
    if(err)          
    {
      console.log("Error:" + err);
    }
	});
  
  db.each('SELECT P.Song_ID FROM PLAYLIST P, SONG S, Task T WHERE Username = "'+userName+'" and P.Task_ID = 5 and P.Song_ID = S.Song_ID and P.Task_ID = T.Task_ID', function(err, row){
		if(row){
      console.log("Writing PLaylist: " , row);
    }
    if(err)          
    {
      console.log("Error:" + err);
    }
	});
  
  db.each('SELECT P.Song_ID FROM PLAYLIST P, SONG S, Task T WHERE Username = "'+userName+'" and P.Task_ID = 6 and P.Song_ID = S.Song_ID and P.Task_ID = T.Task_ID', function(err, row){
		if(row){
      console.log("Problem Solving PLaylist: " , row);
    }
    if(err)          
    {
      console.log("Error:" + err);
    }
	});
  
  db.each('SELECT P.Song_ID FROM PLAYLIST P, SONG S, Task T WHERE Username = "'+userName+'" and P.Task_ID = 7 and P.Song_ID = S.Song_ID and P.Task_ID = T.Task_ID', function(err, row){
		if(row){
      console.log("Creativity PLaylist: " , row);
    }
    if(err)          
    {
      console.log("Error:" + err);
    }
	});
  
  db.each('SELECT P.Song_ID FROM PLAYLIST P, SONG S, Task T WHERE Username = "'+userName+'" and P.Task_ID = 8 and P.Song_ID = S.Song_ID and P.Task_ID = T.Task_ID', function(err, row){
		if(row){
      console.log("Abstract PLaylist: " , row);
    }
    if(err)          
    {
      console.log("Error:" + err);
    }
	});*/
  
  
  
  console.log(request.body.audio.length);
  
  console.log("stored in database"); 
    
  response.send("Sorted and Stored Playlists!");
  
  
         
});

app.get('/fetchplaylist',function(request, response) {
  //console.log(request);
  var searchTask = request.query.search;  
  var userName = request.query.user; 
  console.log(searchTask); 
  console.log(userName); 
  var requestPlaylist = [];  
  var taskConvert = {meditation: 1,  exercise: 2, sleep: 3, memory: 4, writing:  5, problem: 6, creativity: 7, abstract: 8};
  var task = taskConvert[searchTask];
  console.log("Converted: " + task); 
  db.all('SELECT P.Song_ID FROM PLAYLIST P, SONG S, Task T WHERE Username ="'+userName+'" and P.Task_ID = '+task+' and P.Song_ID = S.Song_ID and P.Task_ID = T.Task_ID', function(err, row){
		if(row){
      console.log("PLaylist: " , row); 
      response.send(row); // 
    }   
    if(err)          
    {
      console.log("Error:" + err);
    }
	});
  console.log("Response: ", requestPlaylist);
  
  
});
console.log('Listening on 8888');
app.listen(8888);

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
