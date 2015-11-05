// define map svg dimensions
var mapWidth = 400,
    mapHeight = 400;

// append svg#city-limits to div#map-container
// this svg is used for presenting map of Philly city limits
var svg = d3.select("#map-container")
            .append("svg")
            .attr("id", "city-limits")
            .attr("width", mapWidth)
            .attr("height", mapHeight)
            .attr("fill", "white");

// append g#map-g to svg#city-limits 
var mapG = svg.append("g")
              .attr("id", "map-g");

// define projection, scale, rotation of map
var projection = d3.geo.albers()
                   .scale(88000)
                   .rotate([75.12,0])
                   .center([0, 40.0])
                   .translate([mapWidth/2, mapHeight/2]);

// append svg path to g#map-g, path defined by .geojson data
var geoPath = d3.geo.path()
                .projection(projection);

mapG.selectAll("path")
    .data(city_limits.features) // geodata (data/city_limits.geojson) is loaded in index.html (line 7)
    .enter()
    .append("path")
    .attr("id", "city-path")
    .attr("stroke", "black")
    .attr("fill", "white")
    .attr("d", geoPath);

// append svg#building-chart to div#chart-data
// this svg is used for presenting line chart of energy use over time
d3.select("#chart-data")
     .append("svg")
     .attr("id", "building-chart")
     .attr("width", 390)
     .attr("height", 200) 
     .attr("fill", "white")
     .attr("stroke", "black")
     .append("g")
     .attr("id", "chart-g");

// define zooming/panning function 
var mapZoom = d3.behavior.zoom()
                .translate(projection.translate())
                .scale(projection.scale())
                .on("zoom", zoomed);

d3.select("#city-limits").call(mapZoom);

// load building-level data
d3.csv("../data/muni_energy.csv", function(incomingData){
        drawPoints(incomingData);
        // drawChart(incomingData);
    });

// drawChart() adds points, lines, and axes to svg#building-chart
function drawChart(building){

  var chartSpace = d3.select("#chart-g")
    .append("g")
    .attr("id", "chart-space")
    .attr("transform", "translate(50, -10)");

  var weui_data = [parseFloat(building.weui2011),
                   parseFloat(building.weui2012),
                   parseFloat(building.weui2013)];
  
  // y-axis limits are drawn based on min/max of building energy use, plus a small padding
  var scalePadding = 0.01;
  var yScale_min = d3.min(weui_data) - (d3.max(weui_data) * scalePadding);
  var yScale_max = d3.max(weui_data) + (d3.max(weui_data) * scalePadding);

  var xScale_line = d3.scale.linear()
                      .domain([0, 1, 2])
                      .range([40, 150, 260]);

  var xAxis_line = d3.svg.axis()
                     .scale(xScale_line)
                     .orient("bottom")
                     .tickSize(5)
                     .tickValues([0, 1, 2])
                     .tickFormat(function(d){
                      return Number(d + 2011).toFixed(0);
                     });
 
  var yScale_line = d3.scale.linear()
                      .domain([yScale_min, yScale_max])
                      .range([180, 50]);

  var yAxis_line = d3.svg.axis()
                     .scale(yScale_line)
                     .orient("left")
                     .tickSize(10)
                     .tickValues(d3.extent(weui_data));

  var weuiLine = d3.svg.line()
                   .x(function(d, i){
                    return xScale_line(i)
                   })
                   .y(function(d) {
                    return yScale_line(d)
                   });
  // label y-axis
  chartSpace
    .append("text")
    .attr("id", "y-axis-label")
    .attr("x", "-100")
    .attr("y", "10")
    .attr("transform", "rotate(270)")
    .text("kBtu/sq. ft.")
    .append("title")
    .text("Yearly energy use is measured in Weather Normalized Source Energy Use Intensity (kBtu per square foot)");
  
  // add line connecting datapoints
  chartSpace
    .append("path")
    .attr("d", weuiLine(weui_data))
    .attr("fill", "none")
    .attr("stroke", "dodgerblue")
    .attr("stroke-width", 2);

  // add circles at each year/energy use datapoint
  chartSpace.selectAll("circle")
    .data(weui_data)
    .enter()
    .append("circle")
    .attr("class", "datapoint")
    .attr("r", 3)
    .attr("cx", function(d, i){ return xScale_line(i) })
    .attr("cy", function(d){ return yScale_line(d) });

  // add text of energy use above each datapoint circle
  chartSpace.selectAll("text.datapoint")
    .data(weui_data)
    .enter()
    .append("text")
    .attr("class", "datapoint")
    .attr("x", function(d, i) { return xScale_line(i) })    
    .attr("y", function(d){ return yScale_line(d) - 15 })
    .text(function(d){ return Number(d).toFixed(0) });

  // draw x-axis
  chartSpace.append("g")
            .attr("id", "xAxisG")
            .attr("transform", "translate(0, 190)")
            .call(xAxis_line);
};

// drawPoints adds points to svg map based on latitude and longitude 
function drawPoints(incomingData){

  var colorScale_percent = d3.scale.linear().clamp(true)
                         .domain([-20, -1, 5])
                         .range(["green", "darkgreen", "purple"]);

  var circleRadiusScale = d3.scale.pow().exponent(2)
                         .domain([28, 660])
                         .range([5, 20]);

  mapG.selectAll("circle")
   .data(incomingData)
   .enter()
   .append("circle")
   .attr("class", "building")
   .attr("r", function(d) {
      return circleRadiusScale(d.avg_1113);
    })
   .attr("stroke", "black") 
   .attr("stroke-opacity", 1)
   .attr("transform", function(d){ 
      return "translate(" + projection([d.lon, d.lat]) + ")";
    })
   .attr("fill", function(d){
      return colorScale_percent(d.perc_1213);
    })
   .attr("fill-opacity", 0.5)
   .on("click", function(d){
      updateText(d);
      drawChart(d);
      d3.selectAll("circle")
        .attr("stroke-width", "1");
      d3.select(this)
        .attr("stroke-width", "3");
   });
};

function updateText(building){

  d3.select("#building-name")
    .text(building.property_name);

  d3.select("#building-address")
    .text(building.address);

  d3.select("#energy-use-2012-text")
    .text("2012 energy use: " + Number(building.weui2012).toFixed(1) + " kBtu/sqft");

  d3.select("#energy-use-2013-text")
    .text("2013 energy use: " + Number(building.weui2013).toFixed(1) + " kBtu/sqft");

  d3.select("#raw-change-text")
    .text("Total change: " + Number(building.raw_1213).toFixed(1) + " kBtu/sqft");

  d3.select("#percent-change-text")
    .text("Percent change: " + Number(building.perc_1213).toFixed(1) + "%");

  d3.select("#chart-space").remove();
};

function zoomed() {
  projection.translate(mapZoom.translate())
            .scale(mapZoom.scale());

  d3.selectAll("path#city-path")
    .attr("d", geoPath);

  d3.selectAll("circle.building")
    .attr("transform", function(d){ 
      return "translate(" + projection([
        d.lon,
        d.lat
        ]) + ")";
    });
};