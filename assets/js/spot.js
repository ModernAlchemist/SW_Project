$(document).ready(function(){
var spotifyApi = new SpotifyWebApi();





$.ajax(
  {
    method: "POST",
    url: "https://accounts.spotify.com/api/token",
    data: {
      "grant_type":    "authorization_code",
      "code":          code,
      "redirect_uri":  "http://127.0.0.1:52159/index.html",
      "client_secret": "b60e7cdcaac94e61b8d947ae0c9a7ef1",
      "client_id":     "bb1b05baf47b473280d9fc3e8af8da6c",
    },
    success: function(result) {
      console.log("Success bro!");
    },
  }
);

});
         

  
  