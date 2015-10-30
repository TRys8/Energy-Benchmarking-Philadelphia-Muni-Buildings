var width = 700,
    height = 580;

var svg = d3.select("#map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "whitesmoke")
  .attr("stroke", "black");

var g = svg.append("g");

var albersProjection = d3.geo.albers()
  .scale(95000)
  .rotate([75.00,0])
  .center([0, 39.95])
  .translate([width/2,height/2]);

var geoPath = d3.geo.path()
    .projection(albersProjection);

g.selectAll("path")
  .data(city_limits_json.features)
  .enter()
  .append("path")
  .attr("fill", "#ccc")
  .attr("d", geoPath);

g.append("g")
   .attr("id", "detail-g")
   .attr("transform", "translate(200, 220)");

d3.select("#detail-g") 
   .append("rect")
   .attr("id", "detail-box")
   .attr("x", "0")
   .attr("y", "0")
   .attr("width", "200")
   .attr("height", "200")
   .attr("stroke", "whitesmoke")
   .attr("stroke-opacity", "0.8")
   .attr("fill", "lightgray")
   .attr("fill-opacity", "0.8");

  d3.select("#detail-g")
   .append("text")
   .attr("id", "building-name")
   .attr("x", "100")
   .attr("y", "20")
   .attr("fill", "black")
   .attr("font-size", "12px")
   .attr("font-family", "sans-serif")
   .attr("text-anchor", "middle")
   .text("Hover over a building, yo");

d3.csv("../data/muni_locations.csv", function(incomingData){
        drawPoints(incomingData);
    });

var buildings = g.selectAll("circle") 

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
     .on("mouseover", function(d){
        d3.select("#building-name")
          .text(d["Property.Name"]);
     })
     .on("mouseout", function(){
        d3.select("#building-name")
          .text("Hover over a building, yo");
     })
     .append("title")
     .text(function(d){
      return d["Property.Name"];
     });
     
  };

