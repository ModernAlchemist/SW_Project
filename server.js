/********************************************Server.js*******************************************/
/*********************************************Backend********************************************/
// This is a Node.js/Express backend service. Node.js is a backend engine that allows for the running
// of JS outside of the browser. Express.js is a framework for node for serving applications. We use
// the two to create a server and serve up pages as well as services to be called from those pages.
// Here we take care of all database operations using SQLite. SQLite is being used due to its 
// ability to be embedded in the project file. There is also good Node support for SQLite. 
// We take care of the processing of playlists and user verification here as services. 
/***********************************************************************************************/

//Node libraries
const express = require('express');
const app = express();
const request = require('request'); 
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var http = require('http');
var engine = require('consolidate')

app.engine('html', engine.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname );

//SQLite configuration
var fs = require('fs');
var dbFile = './.data/Brain.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);


db.serialize(function(){

 //If the DB does not, it will be created.
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



//Middleware
app.use(express.static(__dirname + '/')); //Attach static files(CSS,SCSS,etc)
app.use(bodyParser.json());               //Used for parsing incoming data from requests

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

//Called as a service to check if the user is in our database and has been processed already
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
      });
  });
});


// Called as a service from the playlist in order to get the key of song, so that we can blend
// the isochronic tone and binaural beat into the song. 
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



// This is the main service from the backend. Here we take the audio analysis for all
// the songs passed from the frontend and sort them into playlists based on what tasks
// induce the most optimal performance.
app.post('/sort', function(request, response) {

  console.log("Received request to sort"); 
  
  db.run('INSERT INTO USER VALUES ("'+request.body.user+'")',function(err){
            if(err)
            {
              console.log("Error: Duplicate User. ");
            }
        });
  
  
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
  var userPlaylists = []; //an array to hold the songs which hold the attributes and playlist flags
  var lengthOfReq = request.body.audio.length; //the number of songs being analyzed
  var i; //index
  var globDance = 0.3536; //global variables for average effective attributes
  var globEnergy = 0.412;
  var globSpeech = 0.0267;                                        
  var globAcoustic = 0.0267;
  var globInstrument = 0.785;
  var globLive = 0.0603;
  var globTempo = 109.228;
  var danceability, energy, speechiness, acousticness, instrumentalness, liveness, tempo; //variables to cross reference attributes of song
  // being analyzed with the global effective attributes
  for (i=0; i<lengthOfReq; i++)//iterate through the batch of songs listed
  {//this will be faster than checking our DB for songs that have already been analyzed.
    var song = {id : "", key: "", //stores the values were are interested in one location for each song scanned
                key : request.body.audio[i].key,
                danceability : request.body.audio[i].danceability,
                energy : request.body.audio[i].energy,
                speechiness : request.body.audio[i].speechiness,
                acousticness : request.body.audio[i].acousticness,
                instrumentalness : request.body.audio[i].instrumentalness,
                liveness : request.body.audio[i].liveness,
                tempo : request.body.audio[i].tempo,
                exercise: false, meditation: false, creativity:false, abstract:false, memory:false, problem:false, sleep:false, writing: false};
    
    //counters for the number of acceptable attributes for each available task
    //                  The tasks are:
    var exeNumTrue = 0; //exercise
    var medNumTrue = 0; //meditate
    var creNumTrue = 0; //creativity
    var sleNumTrue = 0; //sleep
    var memNumTrue = 0; //memory
    var wriNumTrue = 0; //writing
    var proNumTrue = 0; //problem solving
    var absNumTrue = 0; //abstract
    
    
    song.id = request.body.audio[i].id; //store song ID and KEY
    song.key = request.body.audio[i].key;
    
    
    danceability = request.body.audio[i].danceability; //store the other attributes we are interested in of the song being analyzed
    energy = request.body.audio[i].energy;
    speechiness = request.body.audio[i].speechiness;
    acousticness = request.body.audio[i].acousticness;
    instrumentalness = request.body.audio[i].instrumentalness;
    liveness = request.body.audio[i].liveliness;
    tempo = request.body.audio[i].tempo;
    
    
    //These IF statements check that the song being analyzed has attributes within an acceptable range
    if (danceability>(globDance*.7)&&danceability<globDance*1.8)
    {
       exeNumTrue++; //and increments the counter to the corresponding tasks
                     //the values are based off values that proved effective in the research studies 
    }
    if (danceability>(globDance*.9) && danceability<(globDance*1.1))
    {
      absNumTrue++;
    }
    if(danceability>(globDance*.2)&&danceability<(globDance*.7))
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
    
    
    //if the counter is above 2-3, flag it as matching for the corresponding playlist
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
    
    //then once all manipulations and analystics and flagging has completed for each song occurance, store the song in the 
    //playlist for the user
    userPlaylists.push(song)
  
  }

  console.log("sorted"); 
  
  

  var userName = request.body.user; //Use for user

  
  //Here we place the songs into the database after having been sorted.
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

  }
    
  response.send("Sorted and Stored Playlists!");
      
});

//Used as a client service to get the requested playlist for the player.
//An array of songIDs are passed back.
app.get('/fetchplaylist',function(request, response) {
  
  var searchTask = request.query.search;  
  var userName = request.query.user; 
  var requestPlaylist = [];  
  var taskConvert = {meditation: 1,  exercise: 2, sleep: 3, memory: 4, writing:  5, problem: 6, creativity: 7, abstract: 8};
  var task = taskConvert[searchTask];
  
  
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

app.get('/data',function(request,response){
  response.sendFile(__dirname + '/data.html');
});

//Used for creating the data visualization
app.get('/dataviz',function(request,response){
  db.all('SELECT * FROM SONG', function(err, row){
		if(row){
      var meditation = 0;
      var problem = 0;
      var exercise = 0;
      var creativity = 0;
      var abstract = 0;
      var sleep = 0;
      var writing = 0;
      var memory = 0;
      
      for(var i = 0; i < row.length; i++)
      {
          if(row[i].Meditation == "true")
          {
              meditation++;
          }
          if(row[i].Problem == "true")
          {
              problem++;
          }
          if(row[i].Exercise == "true")
          {
              exercise++;
          }
          if(row[i].Creativity == "true")
          {
              creativity++;
          }
          if(row[i].Abstract == "true")
          {
              abstract++;
          }
          if(row[i].Sleep == "true")
          {
              sleep++;
          }
          if(row[i].Writing == "true")
          {
              writing++;
          }
          if(row[i].Memory == "true")
          {
              memory++;
          }
      }
      
      response.send([{"Name": "Problem Solving", "Count": problem},
                     {"Name": "Meditation", "Count": meditation},
                     {"Name": "Exercise", "Count": exercise},
                     {"Name": "Creativity", "Count": creativity},
                     {"Name": "Abstract", "Count": abstract},
                     {"Name": "Writing", "Count": writing},
                     {"Name": "Memory", "Count": memory},
                     {"Name": "Sleep", "Count": sleep},
                     {"Name": "Total", "Count": row.length}]);
    }   
    if(err)          
    {
      console.log("Error:" + err);
    }
	});
});

//Used for creating the data visualization stats
app.get('/dataviz1',function(request,response){
  db.all('SELECT * FROM SONG', function(err, row){
		if(row){
      var meditation = 0;
      var problem = 0;
      var exercise = 0;
      var creativity = 0;
      var abstract = 0;
      var sleep = 0;
      var writing = 0;
      var memory = 0;
      var meditationAnalysis = {key:0, dance:0, energy:0, speech:0, acoustic:0, instr:0, live:0, tempo:0};
      var problemAnalysis = {key:0, dance:0, energy:0, speech:0, acoustic:0, instr:0, live:0, tempo:0};
      var writingAnalysis = {key:0, dance:0, energy:0, speech:0, acoustic:0, instr:0, live:0, tempo:0};
      var exerciseAnalysis = {key:0, dance:0, energy:0, speech:0, acoustic:0, instr:0, live:0, tempo:0};
      var sleepAnalysis = {key:0, dance:0, energy:0, speech:0, acoustic:0, instr:0, live:0, tempo:0};
      var abstractAnalysis = {key:0, dance:0, energy:0, speech:0, acoustic:0, instr:0, live:0, tempo:0};
      var creativityAnalysis = {key:0, dance:0, energy:0, speech:0, acoustic:0, instr:0, live:0, tempo:0};
      var memoryAnalysis = {key:0, dance:0, energy:0, speech:0, acoustic:0, instr:0, live:0, tempo:0};
      
      
      
          db.run('Create Table SONG (Song_ID TEXT Primary Key, Key INTEGER, Danceability REAL, Energy REAL, Speechiness REAL, Acousticness REAL, Instrumentalness REAL, Liveness REAL, Tempo REAL, Meditation NUMERIC, Exercise NUMERIC, Sleep NUMERIC, Memory NUMERIC, Writing NUMERIC, Problem NUMERIC, Creativity NUMERIC, Abstract NUMERIC )');

      for(var i = 0; i < row.length; i++)
      {
          if(row[i].Meditation == "true")
          {
              meditation++;
              meditationAnalysis.key += row[i].Key;
              meditationAnalysis.dance += row[i].Danceability;
              meditationAnalysis.energy += row[i].Energy;
              meditationAnalysis.speech += row[i].Speechiness;
              meditationAnalysis.acoustic += row[i].Acousticness;
              meditationAnalysis.instr += row[i].Instrumentalness;
              meditationAnalysis.live += row[i].Liveness;
              meditationAnalysis.tempo += row[i].Tempo;
          }
          if(row[i].Problem == "true")
          {
              problem++;
              problemAnalysis.key += row[i].Key;
              problemAnalysis.dance += row[i].Danceability;
              problemAnalysis.energy += row[i].Energy;
              problemAnalysis.speech += row[i].Speechiness;
              problemAnalysis.acoustic += row[i].Acousticness;
              problemAnalysis.instr += row[i].Instrumentalness;
              problemAnalysis.live += row[i].Liveness;
              problemAnalysis.tempo += row[i].Tempo;
          }
          if(row[i].Exercise == "true")
          {
              exercise++;
              exerciseAnalysis.key += row[i].Key;
              exerciseAnalysis.dance += row[i].Danceability;
              exerciseAnalysis.energy += row[i].Energy;
              exerciseAnalysis.speech += row[i].Speechiness;
              exerciseAnalysis.acoustic += row[i].Acousticness;
              exerciseAnalysis.instr += row[i].Instrumentalness;
              exerciseAnalysis.live += row[i].Liveness;
              exerciseAnalysis.tempo += row[i].Tempo;
          }
          if(row[i].Creativity == "true")
          {
              creativity++;
              creativityAnalysis.key += row[i].Key;
              creativityAnalysis.dance += row[i].Danceability;
              creativityAnalysis.energy += row[i].Energy;
              creativityAnalysis.speech += row[i].Speechiness;
              creativityAnalysis.acoustic += row[i].Acousticness;
              creativityAnalysis.instr += row[i].Instrumentalness;
              creativityAnalysis.live += row[i].Liveness;
              creativityAnalysis.tempo += row[i].Tempo;
          }
          if(row[i].Abstract == "true")
          {
              abstract++;
              abstractAnalysis.key += row[i].Key;
              abstractAnalysis.dance += row[i].Danceability;
              abstractAnalysis.energy += row[i].Energy;
              abstractAnalysis.speech += row[i].Speechiness;
              abstractAnalysis.acoustic += row[i].Acousticness;
              abstractAnalysis.instr += row[i].Instrumentalness;
              abstractAnalysis.live += row[i].Liveness;
              abstractAnalysis.tempo += row[i].Tempo;
          }
          if(row[i].Sleep == "true")
          {
              sleep++;
              sleepAnalysis.key += row[i].Key;
              sleepAnalysis.dance += row[i].Danceability;
              sleepAnalysis.energy += row[i].Energy;
              sleepAnalysis.speech += row[i].Speechiness;
              sleepAnalysis.acoustic += row[i].Acousticness;
              sleepAnalysis.instr += row[i].Instrumentalness;
              sleepAnalysis.live += row[i].Liveness;
              sleepAnalysis.tempo += row[i].Tempo;
          }
          if(row[i].Writing == "true")
          {
              writing++;
              writingAnalysis.key += row[i].Key;
              writingAnalysis.dance += row[i].Danceability;
              writingAnalysis.energy += row[i].Energy;
              writingAnalysis.speech += row[i].Speechiness;
              writingAnalysis.acoustic += row[i].Acousticness;
              writingAnalysis.instr += row[i].Instrumentalness;
              writingAnalysis.live += row[i].Liveness;
              writingAnalysis.tempo += row[i].Tempo;
          }
          if(row[i].Memory == "true")
          {
              memory++;
              memoryAnalysis.key += row[i].Key;
              memoryAnalysis.dance += row[i].Danceability;
              memoryAnalysis.energy += row[i].Energy;
              memoryAnalysis.speech += row[i].Speechiness;
              memoryAnalysis.acoustic += row[i].Acousticness;
              memoryAnalysis.instr += row[i].Instrumentalness;
              memoryAnalysis.live += row[i].Liveness;
              memoryAnalysis.tempo += row[i].Tempo;
          }
      }
      
      function avg(analysis,divider){
        
        Object.keys(analysis).forEach(function(key){ analysis[key] = analysis[key]/divider;});
        return memoryAnalysis;
      }
     
      avg(meditationAnalysis,meditation);
      avg(problemAnalysis,problem);
      avg(exerciseAnalysis,exercise);
      avg(creativityAnalysis,creativity);
      avg(abstractAnalysis,abstract);
      avg(writingAnalysis,writing);
      avg(memoryAnalysis,memory);
      avg(sleepAnalysis,sleep);
      var avgAnalysis = {"Problem Solving": problemAnalysis,
                     "Meditation": meditationAnalysis,
                     "Exercise": exerciseAnalysis,
                     "Creativity": creativityAnalysis,
                     "Abstract": abstractAnalysis,
                     "Writing": writingAnalysis,
                     "Memory": memoryAnalysis,
                     "Sleep": sleepAnalysis};
      
      response.send(avgAnalysis);
      
    }   
    if(err)          
    {
      console.log("Error:" + err);
    }
	});
});


console.log('Listening on 8888');
app.listen(8888);



// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
