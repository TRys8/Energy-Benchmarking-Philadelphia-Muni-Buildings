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
   .text("Click a building for details");

  d3.select("#detail-g")
    .append("g")
    .attr("id", "#chart-space")
    .attr("transform", "translate(50, 50)");

d3.csv("../data/muni_energy.csv", function(incomingData){
        drawPoints(incomingData);
        drawChart(incomingData);
    });

function drawChart(incomingData){

  var xScale_line = d3.scale.linear()
                      .domain([2011, 2012, 2013])
                      .range([100, 175, 250]);

  var xAxis_line = d3.svg.axis()
                     .scale(xScale_line)
                     .orient("bottom")
 
  var yScale_line = d3.scale.linear()
                      .domain([85, 115])
                      .range([150, 20]);



  d3.select("#chart-space");

};

function drawPoints(incomingData){

  var colorScale_percent = d3.scale.linear()
                         .domain([-32, 0, 27])
                         .range(["green", "whitesmoke", "purple"]);

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
   .attr("fill", function(d){
      return colorScale_percent(d.perc_1213);
   })
   .attr("fill-opacity", 1)
   .on("click", function(d){
      d3.select("#building-name")
        .text(d.property_name);

      d3.selectAll("circle")
        .attr("stroke-width", "1");

      d3.select(this)
        .attr("stroke-width", "3");

   });
 };

