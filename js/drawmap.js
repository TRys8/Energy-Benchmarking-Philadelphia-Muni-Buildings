var width = 600,
    height = 500;

var svg = d3.select("#map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "white")
  .attr("stroke", "black");

var g = svg.append("g");

var albersProjection = d3.geo.albers()
  .scale(95000)
  .rotate([75.10,0])
  .center([0, 39.95])
  .translate([width/2,height/2]);

var geoPath = d3.geo.path()
    .projection(albersProjection);

g.selectAll("path")
  .data(city_limits_json.features)
  .enter()
  .append("path")
  .attr("stroke", "black")
  .attr("fill", "whitesmoke")
  .attr("d", geoPath);

g.append("g")
   .attr("id", "detail-g")
   .attr("transform", "translate(300, 220)");

d3.select("#detail-g") 
   .append("rect")
   .attr("id", "detail-box")
   .attr("x", "0")
   .attr("y", "0")
   .attr("width", "300")
   .attr("height", "300")
   .attr("stroke", "whitesmoke")
   .attr("stroke-opacity", "0.8")
   .attr("fill", "lightgray")
   .attr("fill-opacity", "0.8");

  d3.select("#detail-g")
   .append("text")
   .attr("id", "building-name")
   .attr("x", "150")
   .attr("y", "20")
   .attr("fill", "black")
   .attr("font-size", "12px")
   .attr("font-weight", "100")
   .attr("font-family", "monospace")
   .attr("text-anchor", "middle")
   .text("Hover over a building, yo");

d3.csv("../data/muni_energy.csv", function(incomingData){
        drawPoints(incomingData);
    });

var buildings = g.selectAll("circle") 

function drawPoints(incomingData){

    g.selectAll("circle")
     .data(incomingData)
     .enter()
     .append("circle")
     .attr("r", 7)
     .attr("stroke", "black")
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
     .attr("fill-opacity", .5)
     .on("click", function(d){
        d3.select("#building-name")
          .text(d.property_name);
     });
   };

