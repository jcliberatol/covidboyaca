var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(12000)
  .center([-73.16,5.88])
  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var rawData = [];
var colorScale = d3.scaleThreshold()
  .domain([0, 10, 100, 1000, 10000])
  .range(d3.schemeBlues[5]);

// Load external data and boot
d3.queue()
  .defer(d3.json, "data/boyaca_rewinded.json")
  .defer(d3.csv, "data/boyaca.csv", function(d) { rawData.push(d);})
  .await(ready);

function ready(error, topo) {
    console.log(topo)
    console.log(rawData);
    var datadic = {};
    for (i=0; i<rawData.length; i++){
      var dt = rawData[i];
      if(!datadic[dt["Ciudad de ubicación"]]){
        datadic[dt["Ciudad de ubicación"]] = 0;
      }
      datadic[dt["Ciudad de ubicación"]]++;
    }
    console.log(datadic);
    var cities = Object.keys(datadic);
    for(i = 0; i<cities.length; i++){
        var fq = datadic[cities[i]]
        var ct = cities[i];//.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        ct = ct.toUpperCase();
        //console.log(ct)
        data.set(ct,fq)
    }
    console.log(data)
  // Draw the map
  svg.append("g")
  .attr("class","map")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("stroke",function(d){return "black"})
      .attr("fill", function (d) {
        console.log(data.get(d.properties["MPIO_CNMBR"]),d.properties["MPIO_CNMBR"],d)
        d.total = data.get(d.properties["MPIO_CNMBR"]) || 0;
        return colorScale(d.total);
      });
    }