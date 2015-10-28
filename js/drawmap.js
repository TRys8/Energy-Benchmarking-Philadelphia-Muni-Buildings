var width = 700,
    height = 580;

var svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("stroke", "black");

var g = svg.append("g");

var albersProjection = d3.geo.albers()
  .scale(90000)
  .rotate([75.15,0])
  .center([0, 40.02])
  .translate([width/2,height/2]);

var geoPath = d3.geo.path()
    .projection(albersProjection);

g.selectAll("path")
  .data(city_limits_json.features)
  .enter()
  .append("path")
  .attr("fill", "#ccc")
  .attr("d", geoPath);

d3.csv("../data/muni_locations.csv", function(incomingData){
        drawPoints(incomingData);
    });

function drawPoints(incomingData){

    g.selectAll("circle")
     .data(incomingData)
     .enter()
     .append("circle")
     .attr("r", 3)
     .attr("transform", function(d){ 
        return "translate(" + albersProjection([
          d.lon,
          d.lat
          ]) + ")";
      })
     .attr("fill", function(d, i){ 
        if( i == 1 ){ return "#F00"}
        else { return "#999" }; 
      })
     .attr("opacity", .5)
     .append("title")
     .text(function(d){
      return d["Property.Name"];
     })
     };
