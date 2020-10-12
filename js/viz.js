var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");
function capitalizeFirstLetter(string) {
string = string.toLowerCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
}
// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(12000)
  .center([-73.16,5.88])
  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var rawData = [];
var colorScale = dd => dd==0?"#8BC34A":d3.scaleSequential(d3.interpolateHsl("wheat","sienna"))(Math.log(dd+1)/6)
d3.scaleThreshold()
  .domain([0,5, 10,50, 100,500, 1000, 10000])
  .range(d3.schemeYlOrBr[9]);

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
        datadic[dt["Ciudad de ubicación"]] = {"cases":0};
      }

      datadic[dt["Ciudad de ubicación"]].cases++;
    }
    console.log(datadic);
    var cities = Object.keys(datadic);
    for(i = 0; i<cities.length; i++){
        var fq = datadic[cities[i]]
        var ct = cities[i];
        ct = ct.toUpperCase();
        data.set(ct,fq)
    }
    console.log(data)
  // Draw the map
  g = svg.append("g")
  g2 = svg.append("g").attr("class","ctext")
  mypath = d3.geoPath()
        .projection(projection)
  g.attr("class","map")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", mypath
      )
      // set the color of each country
      .attr("fill", function (d) {
        console.log(data.get(d.properties["MPIO_CNMBR"]),d.properties["MPIO_CNMBR"],d)
        var dataPoint = data.get(d.properties["MPIO_CNMBR"]) || {"cases":0};
        d.total = dataPoint.cases
        return colorScale(d.total);
      }).on("mouseenter", handleMouseOver)
        .on("mouseleave", handleMouseOut);

function handleMouseOver(d, i) {  // Add interactivity
            // Use D3 to select element, change color and size
            d3.select(this).attr("stroke", "black");
            let pt = this;
            var centr = mypath.centroid(d)
            // Specify where to put label of text
            console.log(this,d,i,mypath,centr);
            var el = g2.append("text")
            el.attr("id", "textTown" + "-" + i)
            el.attr("x", centr[0])
            el.attr("y", centr[1]).attr("text-anchor", "middle")
        .attr("font-size", "16px").attr("pointer-events", "none")
            console.log(el)
            el.text(function () {
        return capitalizeFirstLetter(d.properties["MPIO_CNMBR"]+": "+d.total);
      });
          }

      function handleMouseOut(d, i) {
            // Use D3 to select element, change color back to normal
            d3.select(this).attr("stroke", "none");

            // Select text by id and then remove
            d3.select("#textTown"+"-" + i).remove();  // Remove text location
          }

}