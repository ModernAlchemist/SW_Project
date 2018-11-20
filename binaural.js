var frequency1;
var frequency2;
var osc1;
var osc2;
var panner1 = new Tone.Panner(-1,-12).toMaster();
var panner2 = new Tone.Panner(1,-12).toMaster();
var binauralOff = false;
var binauralPaused = false;

function setBinaural(frequency,beat)
{
    
    frequency1 = Math.round(frequency - beat/2);
    frequency2 = Math.round(frequency + beat/2);
		osc1 = new Tone.Oscillator(frequency1, "sine").connect(panner1).start();
    osc2 = new Tone.Oscillator(frequency2, "sine").connect(panner2).start();
    osc1.volume.value = -25;
    osc2.volume.value = -25;

}
//setBinaural(300,20);

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