var mapWidth = 400,
    mapHeight = 400;

var svg = d3.select("#map-container")
  .append("svg")
  .attr("id", "city-limits")
  .attr("width", mapWidth)
  .attr("height", mapHeight)
  .attr("fill", "white");

var mapG = svg.append("g")
              .attr("id", "map-g");

var projection = d3.geo.albers()
  .scale(88000)
  .rotate([75.12,0])
  .center([0, 40.0])
  .translate([mapWidth/2, mapHeight/2]);

var geoPath = d3.geo.path()
                .projection(projection);

var mapZoom = d3.behavior.zoom()
                .translate(projection.translate())
                .scale(projection.scale())
                .on("zoom", zoomed);

d3.select("#city-limits").call(mapZoom);

mapG.selectAll("path")
    .data(city_limits_json.features)
    .enter()
    .append("path")
    .attr("stroke", "black")
    .attr("fill", "whitesmoke")
    .attr("d", geoPath);

d3.select("#chart-data")
     .append("svg")
     .attr("id", "building-chart")
     .attr("width", 390)
     .attr("height", 200) 
     .attr("fill", "white")
     .attr("stroke", "black")
     .append("g")
     .attr("id", "chart-g");

// d3.select("#chart-g") 
//    .append("rect")
//    .attr("id", "detail-box")
//    .attr("x", "0")
//    .attr("y", "0")
//    .attr("width", "350")
//    .attr("height", "350")
//    .attr("stroke", "whitesmoke")
//    .attr("stroke-opacity", "0.8")
//    .attr("fill", "none");

// d3.select("#chart-g")
//    .append("text")
//    .attr("id", "building-name")
//    .attr("x", "175")
//    .attr("y", "20")
//    .attr("fill", "black")
//    .attr("font-size", "12px")
//    .attr("font-weight", "100")
//    .attr("font-family", "monospace")
//    .attr("text-anchor", "middle")
//    .text("Click a building for details");

d3.csv("../data/muni_energy.csv", function(incomingData){
        drawPoints(incomingData);
        drawChart(incomingData, property_id = 3192582);
        updateText(incomingData, property_id);
    });

function drawChart(incomingData, property_id){

  var chartSpace = d3.select("#chart-g")
    .append("g")
    .attr("id", "chart-space")
    .attr("transform", "translate(50, -30)");

  var focus_building = incomingData.filter(function(obj){
      return obj["property_id"] == property_id;
   });

  var weui_data = [parseFloat(focus_building[0].weui2011),
                   parseFloat(focus_building[0].weui2012),
                   parseFloat(focus_building[0].weui2013)];

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

  chartSpace
    .append("text")
    .attr("id", "y-axis-label")
    .attr("x", "-100")
    .attr("y", "10")
    .attr("transform", "rotate(270)")
    .text("yearly energy use")
    .append("title")
    .text("Yearly energy use is measured in Weather Normalized Source Energy Use Intensity (kBtu per square foot)");

  chartSpace
    .append("path")
    .attr("d", weuiLine(weui_data))
    .attr("fill", "none")
    .attr("stroke", "dodgerblue")
    .attr("stroke-width", 2);

  chartSpace.selectAll("circle")
    .data(weui_data)
    .enter()
    .append("circle")
    .attr("class", "datapoint")
    .attr("r", 3)
    .attr("cx", function(d, i){ return xScale_line(i) })
    .attr("cy", function(d){ return yScale_line(d) });

  chartSpace.selectAll("text.datapoint")
    .data(weui_data)
    .enter()
    .append("text")
    .attr("class", "datapoint")
    .attr("x", function(d, i) { return xScale_line(i) })    
    .attr("y", function(d){ return yScale_line(d) - 15 })
    .text(function(d){ return Number(d).toFixed(0) });

  chartSpace.append("g")
            .attr("id", "xAxisG")
            .attr("transform", "translate(0, 190)")
            .call(xAxis_line);
 
};

function drawPoints(incomingData){

  var colorScale_percent = d3.scale.linear()
                         .domain([-32, 0, 27])
                         .range(["green", "whitesmoke", "purple"]);

  mapG.selectAll("circle")
   .data(incomingData)
   .enter()
   .append("circle")
   .attr("class", "building")
   .attr("r", 7)
   .attr("stroke", "black")
   .attr("transform", function(d){ 
      return "translate(" + projection([
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

      d3.select("#chart-space").remove();
      drawChart(incomingData, property_id = d.property_id);
   });
 };

function zoomed() {
 
  projection.translate(mapZoom.translate())
            .scale(mapZoom.scale());

  d3.selectAll("path")
    .attr("d", geoPath);

  d3.selectAll("circle.building")
    .attr("transform", function(d){ 
      return "translate(" + projection([
        d.lon,
        d.lat
        ]) + ")";
    });
};