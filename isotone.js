var iso;
var isoFreqHz = 10;
var isoTone = 220;
var isoFreqMs = Math.round(1000/(isoFreqHz));
var isoAttack = Math.round(isoFreqMs/3.3)/1000;
var isoRelease = Math.round(isoFreqMs/2.5)/1000;
var isoDecay = Math.round(isoFreqMs/3.3)/1000;
var filter = new Tone.Filter(200, "lowpass").toMaster();
var env = new Tone.AmplitudeEnvelope({
			"attack" : isoAttack,
			"decay" : isoRelease,
			"sustain" : 0.1,
			"release" : isoRelease
		}).connect(filter);
		//create an oscillator and connect it to the envelope
		var osc = new Tone.Oscillator({
			"partials" : [3, 2, 1],
			"type" : "custom",
			"frequency" : isoTone,
			"volume" : -12,
		}).connect(env).start();

var play = 0;
function playTone()
{
    if(play % 2 == 0)
    {
        iso = setInterval(toneOnOff, isoFreqMs);
    } 
    else 
    {
        clearInterval(iso);
    }
    play++;
}

//create a loop

function toneOnOff() {
    env.triggerAttackRelease(0.05);
}


