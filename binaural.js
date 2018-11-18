var frequency1;
var frequency2;
var osc1;
var osc2;
var panner1 = new Tone.Panner(-1,-12).toMaster();
var panner2 = new Tone.Panner(1,-12).toMaster();
var toneOff = false;

function setBinaural(frequency,beat)
{
    
    frequency1 = Math.round(frequency - beat/2);
    frequency2 = Math.round(frequency + beat/2);
		osc1 = new Tone.Oscillator(frequency1, "sine").connect(panner1).start();
    osc2 = new Tone.Oscillator(frequency2, "sine").connect(panner2).start();
    osc1.volume.value = -25;
    osc2.volume.value = -25;

}
setBinaural(300,20);

    $(document).ready(function(){
      
    $('#toggleBinaural').on('click', function(){ 
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