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
         console.log(data);
         /*<li>Tempo: <em>122</em></li>
                        <li>Acousticness: <em>0.95</em></li>
                        <li>Speechiness: <em>0.50</em></li>
                        <li>Energy: <em>0.5</em></li>
                        <li>Key: <em>8.3</em></li>
                        <li>Liveness: <em>4.3</em></li>
                        <li>Instrumentalnes: <em>1.05</em></li>*/
       $('.meditationList li:nth-child(1) em').html(data.Meditation.tempo);
       $('.meditationList li:nth-child(2) em').html(data.Meditation.acoustic);
       $('.meditationList li:nth-child(3) em').html(data.Meditation.speech);
       $('.meditationList li:nth-child(4) em').html(data.Meditation.energy);
       $('.meditationList li:nth-child(5) em').html(data.Meditation.key);
       $('.meditationList li:nth-child(6) em').html(data.Meditation.liveness);
       $('.meditationList li:nth-child(7) em').html(data.Meditation.instrument);
       
       $('.problemList li:nth-child(1) em').html(data["Problem Solving"].tempo);
       $('.problemList li:nth-child(2) em').html(data["Problem Solving"].acoustic);
       $('.problemList li:nth-child(3) em').html(data["Problem Solving"].speech);
       $('.problemList li:nth-child(4) em').html(data["Problem Solving"].energy);
       $('.problemList li:nth-child(5) em').html(data["Problem Solving"].key);
       $('.problemList li:nth-child(6) em').html(data["Problem Solving"].liveness);
       $('.problemList li:nth-child(7) em').html(data["Problem Solving"].instrument);
       
       $('.writingList li:nth-child(1) em').html(data.Writing.tempo);
       $('.writingList li:nth-child(2) em').html(data.Writing.acoustic);
       $('.writingList li:nth-child(3) em').html(data.Writing.speech);
       $('.writingList li:nth-child(4) em').html(data.Writing.energy);
       $('.writingList li:nth-child(5) em').html(data.Writing.key);
       $('.writingList li:nth-child(6) em').html(data.Writing.liveness);
       $('.writingList li:nth-child(7) em').html(data.Writing.instrument);
       
       $('.exerciseList li:nth-child(1) em').html(data.Exercise.tempo);
       $('.exerciseList li:nth-child(2) em').html(data.Exercise.acoustic);
       $('.exerciseList li:nth-child(3) em').html(data.Exercise.speech);
       $('.exerciseList li:nth-child(4) em').html(data.Exercise.energy);
       $('.exerciseList li:nth-child(5) em').html(data.Exercise.key);
       $('.exerciseList li:nth-child(6) em').html(data.Exercise.liveness);
       $('.exerciseList li:nth-child(7) em').html(data.Exercise.instrument);
       
       $('.abstractList li:nth-child(1) em').html(data.Abstract.tempo);
       $('.abstractList li:nth-child(2) em').html(data.Abstract.acoustic);
       $('.abstractList li:nth-child(3) em').html(data.Abstract.speech);
       $('.abstractList li:nth-child(4) em').html(data.Abstract.energy);
       $('.abstractList li:nth-child(5) em').html(data.Abstract.key);
       $('.abstractList li:nth-child(6) em').html(data.Abstract.liveness);
       $('.abstractList li:nth-child(7) em').html(data.Abstract.instrument);

       $('.creativityList li:nth-child(1) em').html(data.Creativity.tempo);
       $('.creativityList li:nth-child(2) em').html(data.Creativity.acoustic);
       $('.creativityList li:nth-child(3) em').html(data.Creativity.speech);
       $('.creativityList li:nth-child(4) em').html(data.Creativity.energy);
       $('.creativityList li:nth-child(5) em').html(data.Creativity.key);
       $('.creativityList li:nth-child(6) em').html(data.Creativity.liveness);
       $('.creativityList li:nth-child(7) em').html(data.Creativity.instrument);
       
       $('.memoryList li:nth-child(1) em').html(data.Memory.tempo);
       $('.memoryList li:nth-child(2) em').html(data.Memory.acoustic);
       $('.memoryList li:nth-child(3) em').html(data.Memory.speech);
       $('.memoryList li:nth-child(4) em').html(data.Memory.tempo);
       $('.memoryList li:nth-child(5) em').html(data.Memory.energy);
       $('.memoryList li:nth-child(6) em').html(data.Memory.key);
       $('.memoryList li:nth-child(7) em').html(data.Memory.liveness);
       
       $('.sleepList li:nth-child(1) em').html(data.Sleep.tempo);
       $('.sleepList li:nth-child(2) em').html(data.Sleep.acoustic);
       $('.sleepList li:nth-child(3) em').html(data.Sleep.speech);
       $('.sleepList li:nth-child(4) em').html(data.Sleep.tempo);
       $('.sleepList li:nth-child(5) em').html(data.Sleep.energy);
       $('.sleepList li:nth-child(6) em').html(data.Sleep.key);
       $('.sleepList li:nth-child(7) em').html(data.Sleep.liveness);
     }
});
});