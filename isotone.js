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
            iso = setInterval(toneOnOff, isoFreqMs);
            $(this).removeClass("fas fa-toggle-off");
            $(this).addClass("fas fa-toggle-on");
        }
    });
    });
      
function toneOnOff() {
    env.triggerAttackRelease(0.05);
}
function playTone() {
    if(!toneOff)
    {
      iso = setInterval(toneOnOff, isoFreqMs);
    }
}
function pauseTone() {
    clearInterval(iso);
}