/***************************************Binaural.js*******************************/
// This script is used for producing a binaural beat in the player that matches the key
// of the song. This is done using the Tone.js library. A binaural beat is an illusionary
// frequency created in the brain that occurs when two pure tones of slightly differing
// frequencies are played in the opposing ears. The difference is the binaural beat.
// We accomplish this here by panning one of our pure tones to the left ear, and the other
// to the right ear. We allow for an average frquency and a beat to be defined for the 
// creation of this binaural beat. This will allow us to customize the sound from our
// player. Here we also allow for the toggle of the beat which is displayed as an interface
// on the player.html.
//
// NOTE: THIS CAN ONLY BE HEARD WITH HEADPHONES
/*********************************************************************************/

var frequency1; //frequencies that will create binaural beat
var frequency2;
var osc1; //Pure tones
var osc2;
var panner1 = new Tone.Panner(-1,-12).toMaster(); //We connect this to osc1
var panner2 = new Tone.Panner(1,-12).toMaster();  //We connect this to osc2
var binauralOff = false;
var binauralPaused = false;

//This where we create and initialize the binaural beat and calculate the need difference.
function setBinaural(frequency,beat)
{
    
    frequency1 = Math.round(frequency - beat/2);
    frequency2 = Math.round(frequency + beat/2);
		osc1 = new Tone.Oscillator(frequency1, "sine").connect(panner1).start();
    osc2 = new Tone.Oscillator(frequency2, "sine").connect(panner2).start();
    osc1.volume.value = -25;
    osc2.volume.value = -25;

}


//Here we provide the ability for toggling the beat.
$(document).ready(function(){
      
    $('#toggleBinaural').on('click', function(){ 
      console.log("Tone");
        if($(this).hasClass("fa-toggle-on")) //Turn off
        {
            osc1.mute = true;
            osc2.mute = true;
            $(this).removeClass("fas fa-toggle-on");
            $(this).addClass("fas fa-toggle-off");
            binauralOff = true;
        }
        else //Turn on
        {
            if(!binauralPaused)
            {
              osc1.mute = false;
              osc2.mute = false;
            }
            $(this).removeClass("fas fa-toggle-off");
            $(this).addClass("fas fa-toggle-on");
        }
    });
  
  
  
  

      
    $('#playPause').on('click', function(){ 

        if($(this).hasClass("fa-pause-circle")) //Turn off
        {
            $(this).removeClass("far fa-pause-circle");
            $(this).addClass("far fa-play-circle");
        }
        else //Turn on
        {
            $(this).removeClass("far fa-play-circle");
            $(this).addClass("far fa-pause-circle");
        }
    });
});

      
function playBinaural() {
  binauralPaused = false;
  if(!binauralOff)
  {
    osc1.mute = false;
    osc2.mute = false;
  }
}
function pauseBinaural() {
    osc1.mute = true;
    osc2.mute = true;
    binauralPaused = true;
}