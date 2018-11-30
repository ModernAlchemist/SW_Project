/**************************************Isotone.js***************************************/
// This script is responsible for producing the isochronic tone. An isochronic tone is a
// that alternates between on and off at a given frequency. We do this here using the Tone.js
// library. In order to accomplish this we use and Amplitude Envelope attach to a Frequency.
// This allows us to define the shape of the envelope. Then, at a given frequency we trigger
// the envelope. This can be heard without headphones.
/**************************************************************************************/

var iso;
var env;
var osc;
var isoFreqHz;
var isoTone;
var isoFreqMs;
var isoAttack;
var isoRelease;
var isoDecay;
var filter;
var toneOff = false;
var tonePaused = false;

//Here we create the isochronic tone using the given parameters
//This involves calculating the characteristics of the amplitude envelope based
//on the given frequency(isoAttack, isoRelease, and isoDecay).
//We also define the frequency of the tone.
function setIsotone(frequency,tone)
{
    isoFreqHz = frequency;
    isoTone = tone;
    isoFreqMs = Math.round(1000/(isoFreqHz));
    isoAttack = Math.round(isoFreqMs/3.3)/1000;
    isoRelease = Math.round(isoFreqMs/2.5)/1000;
    isoDecay = Math.round(isoFreqMs/3.3)/1000;
    filter = new Tone.Filter(200, "lowpass").toMaster();


    env = new Tone.AmplitudeEnvelope({
			"attack" : isoAttack,
			"decay" : isoRelease,
			"sustain" : 0.1,
			"release" : isoRelease
		}).connect(filter);
		//create an oscillator and connect it to the envelope
		osc = new Tone.Oscillator({
			"partials" : [3, 2, 1],
			"type" : "custom",
			"frequency" : isoTone,
			"volume" : -5,
		}).connect(env).start();
}

//Used for toggling the isochronic tone on and off
$(document).ready(function(){

    $('#toggleTone').on('click', function(){ 
      console.log("Tone");
        if($(this).hasClass("fa-toggle-on"))
        {
            clearInterval(iso);
            toneOff = true;
            $(this).removeClass("fas fa-toggle-on");
            $(this).addClass("fas fa-toggle-off");
        }
        else
        {
            if(!tonePaused)
            {
              iso = setInterval(toneOnOff, isoFreqMs);
            }
            $(this).removeClass("fas fa-toggle-off");
            $(this).addClass("fas fa-toggle-on");
        }
    });
});
    
//Triggers the release of the envelope
function toneOnOff() {
    env.triggerAttackRelease(0.05);
}

function playTone() {
    tonePaused = false;
    if(!toneOff)
    {
      iso = setInterval(toneOnOff, isoFreqMs);
    }
}

function pauseTone() {
    tonePaused = true;
    clearInterval(iso);
}