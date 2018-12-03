$(document).ready(function(){
$.ajax({
     url: "https://accurate-education.glitch.me/dataviz",
     type: "GET",
     async: false,
     success: function(data) { 
        

        const customColors = ["#A07A19", "#AC30C0", "#EB9A72", "#BA86F5", "#EA22A8",
                              "#AC30C0", "#EB9A72", "#BA86F5", "#EA22A8"];
        dataset = {
            "children": data
        };

        var diameter = 600;
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var bubble = d3.pack(dataset)
            .size([diameter, diameter])
            .padding(1.5);

        var svg = d3.select(".d3Graph")
            .append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble");

        var nodes = d3.hierarchy(dataset)
            .sum(function(d) { return d.Count; });

        var node = svg.selectAll(".node")
            .data(bubble(nodes).descendants())
            .enter()
            .filter(function(d){
                return  !d.children
            })
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.append("title")
            .text(function(d) {
                return d.Name + ": " + d.Count;
            });

        node.append("circle")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d,i) {
                
                return customColors[i];
            });

        node.append("text")
            .attr("dy", ".2em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Name.substring(0, d.r / 3);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "white");

        node.append("text")
            .attr("dy", "1.3em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Count;
            })
            .attr("font-family",  "Gill Sans", "Gill Sans MT")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "white");

        d3.select(self.frameElement)
            .style("height", "100em");


     }
});

$.ajax({
     url: "https://accurate-education.glitch.me/dataviz1",
     type: "GET",
     async: false,
     success: function(data) { 

         /*<li>Tempo: <em>122</em></li>
                        <li>Acousticness: <em>0.95</em></li>
                        <li>Speechiness: <em>0.50</em></li>
                        <li>Energy: <em>0.5</em></li>
                        <li>Key: <em>8.3</em></li>
                        <li>Liveness: <em>4.3</em></li>
                        <li>Instrumentalnes: <em>1.05</em></li>*/
       $('.meditationList li:nth-child(1) em').html(Math.round(data.Meditation.tempo*100)/100);
       $('.meditationList li:nth-child(2) em').html(Math.round(data.Meditation.acoustic*100)/100);
       $('.meditationList li:nth-child(3) em').html(Math.round(data.Meditation.speech*100)/100);
       $('.meditationList li:nth-child(4) em').html(Math.round(data.Meditation.energy*100)/100);
       $('.meditationList li:nth-child(5) em').html(Math.round(data.Meditation.key*100)/100);
       $('.meditationList li:nth-child(6) em').html(Math.round(data.Meditation.live*100)/100);
       $('.meditationList li:nth-child(7) em').html(Math.round(data.Meditation.instr*100)/100);
       
       $('.problemList li:nth-child(1) em').html(Math.round(data["Problem Solving"].tempo*100)/100);
       $('.problemList li:nth-child(2) em').html(Math.round(data["Problem Solving"].acoustic*100)/100);
       $('.problemList li:nth-child(3) em').html(Math.round(data["Problem Solving"].speech*100)/100);
       $('.problemList li:nth-child(4) em').html(Math.round(data["Problem Solving"].energy*100)/100);
       $('.problemList li:nth-child(5) em').html(Math.round(data["Problem Solving"].key*100)/100);
       $('.problemList li:nth-child(6) em').html(Math.round(data["Problem Solving"].live*100)/100);
       $('.problemList li:nth-child(7) em').html(Math.round(data["Problem Solving"].instr*100)/100);
       
       $('.writingList li:nth-child(1) em').html(Math.round(data.Writing.tempo*100)/100);
       $('.writingList li:nth-child(2) em').html(Math.round(data.Writing.acoustic*100)/100);
       $('.writingList li:nth-child(3) em').html(Math.round(data.Writing.speech*100)/100);
       $('.writingList li:nth-child(4) em').html(Math.round(data.Writing.energy*100)/100);
       $('.writingList li:nth-child(5) em').html(Math.round(data.Writing.key*100)/100);
       $('.writingList li:nth-child(6) em').html(Math.round(data.Writing.live*100)/100);
       $('.writingList li:nth-child(7) em').html(Math.round(data.Writing.instr*100)/100);
       
       $('.exerciseList li:nth-child(1) em').html(Math.round(data.Exercise.tempo*100)/100);
       $('.exerciseList li:nth-child(2) em').html(Math.round(data.Exercise.acoustic*100)/100);
       $('.exerciseList li:nth-child(3) em').html(Math.round(data.Exercise.speech*100)/100);
       $('.exerciseList li:nth-child(4) em').html(Math.round(data.Exercise.energy*100)/100);
       $('.exerciseList li:nth-child(5) em').html(Math.round(data.Exercise.key*100)/100);
       $('.exerciseList li:nth-child(6) em').html(Math.round(data.Exercise.live*100)/100);
       $('.exerciseList li:nth-child(7) em').html(Math.round(data.Exercise.instr*100)/100);
       
       $('.abstractList li:nth-child(1) em').html(Math.round(data.Abstract.tempo*100)/100);
       $('.abstractList li:nth-child(2) em').html(Math.round(data.Abstract.acoustic*100)/100);
       $('.abstractList li:nth-child(3) em').html(Math.round(data.Abstract.speech*100)/100);
       $('.abstractList li:nth-child(4) em').html(Math.round(data.Abstract.energy*100)/100);
       $('.abstractList li:nth-child(5) em').html(Math.round(data.Abstract.key*100)/100);
       $('.abstractList li:nth-child(6) em').html(Math.round(data.Abstract.live*100)/100);
       $('.abstractList li:nth-child(7) em').html(Math.round(data.Abstract.instr*100)/100);

       $('.creativityList li:nth-child(1) em').html(Math.round(data.Creativity.tempo*100)/100);
       $('.creativityList li:nth-child(2) em').html(Math.round(data.Creativity.acoustic*100)/100);
       $('.creativityList li:nth-child(3) em').html(Math.round(data.Creativity.speech*100)/100);
       $('.creativityList li:nth-child(4) em').html(Math.round(data.Creativity.energy*100)/100);
       $('.creativityList li:nth-child(5) em').html(Math.round(data.Creativity.key*100)/100);
       $('.creativityList li:nth-child(6) em').html(Math.round(data.Creativity.live*100)/100);
       $('.creativityList li:nth-child(7) em').html(Math.round(data.Creativity.instr*100)/100);
       
       $('.memoryList li:nth-child(1) em').html(Math.round(data.Memory.tempo*100)/100);
       $('.memoryList li:nth-child(2) em').html(Math.round(data.Memory.acoustic*100)/100);
       $('.memoryList li:nth-child(3) em').html(Math.round(data.Memory.speech*100)/100);
       $('.memoryList li:nth-child(4) em').html(Math.round(data.Memory.energy*100)/100);
       $('.memoryList li:nth-child(5) em').html(Math.round(data.Memory.key*100)/100);
       $('.memoryList li:nth-child(6) em').html(Math.round(data.Memory.live*100)/100);
       $('.memoryList li:nth-child(7) em').html(Math.round(data.Memory.instr*100)/100);
       
       $('.sleepList li:nth-child(1) em').html(Math.round(data.Sleep.tempo*100)/100);
       $('.sleepList li:nth-child(2) em').html(Math.round(data.Sleep.acoustic*100)/100);
       $('.sleepList li:nth-child(3) em').html(Math.round(data.Sleep.speech*100)/100);
       $('.sleepList li:nth-child(4) em').html(Math.round(data.Sleep.energy*100)/100);
       $('.sleepList li:nth-child(5) em').html(Math.round(data.Sleep.key*100)/100);
       $('.sleepList li:nth-child(6) em').html(Math.round(data.Sleep.live*100)/100);
       $('.sleepList li:nth-child(7) em').html(Math.round(data.Sleep.instr*100)/100);
     }
});
});