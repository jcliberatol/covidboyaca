//Utils
function capitalizeFirstLetter(string) {
    string = string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Data and color scale

    var rawData = [];
// Load external data and boot
d3.queue()
    .defer(d3.json, "data/boyaca_rewinded.json")
    .defer(d3.csv, "data/boyaca.csv", function(d) {
        rawData.push(d);
    })
    .await(ready);

function ready(error, topo) {

    var data = d3.map();

    console.log(topo)
    console.log(rawData);
    var datadic = {};
    for (i = 0; i < rawData.length; i++) {
        var dt = rawData[i];
        var city = dt["Ciudad de ubicación"]
        if (!datadic[city]) {
            datadic[city] = {
                "cases": 0,
                "recover": 0,
                "death": 0
            };
        }

        datadic[city].cases++;
        if (dt["Fecha de muerte"] != "") {
            datadic[city].death++;
        }
        if (dt["Fecha recuperado"] != "") {
            datadic[city].recover++;
        }

    }

    console.log(datadic);
    var cities = Object.keys(datadic);
    for (i = 0; i < cities.length; i++) {
        var fq = datadic[cities[i]]
        var ct = cities[i];
        ct = ct.toUpperCase();
        data.set(ct, fq)
    }

    //Here we finish with the data, time to add all binders

    var drawViz = function(vtype) {
    var width = Math.round(innerWidth * 0.9)
    var height = Math.round(width * (9 / 16))

    var svg = d3.select("#mapsvg")
    console.log(width, height)
    svg.attr("width", width),
        svg.attr("height", height);
    var path = d3.geoPath();
    var projection = d3.geoMercator()
        .scale(width * 13)
        .center([-73.16, 5.88])
        .translate([width / 2, height / 2]);

    var colst = "wheat"
    var colend = "sienna"

    switch(vtype){
        case "recoverrate" || "deathrate":
            colst="CRIMSON";colend="YELLOWGREEN";
            break;
        case "death":
            colst="LIGHTGRAY";colend="BLACK";
            break;
    }

    var colorScale = dd => dd == 0 ? "#cce6ae" : d3.scaleSequential(d3.interpolateHsl(colst,colend))(Math.log(dd) / 6)
    // Draw the map
    d3.select(".map").remove();
    d3.select(".ctext").remove();
    g = svg.append("g").attr("class", "map")
    g2 = svg.append("g").attr("class", "ctext")
    mypath = d3.geoPath()
        .projection(projection)
    g.selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", mypath)
        // set the color of each country
        .attr("fill", function(d) {
            //console.log(data.get(d.properties["MPIO_CNMBR"]),d.properties["MPIO_CNMBR"],d)
            var dataPoint = data.get(d.properties["MPIO_CNMBR"]) || {
                "cases": 0,
                "recover": 0,
                "death": 0
            };
            d.cases = dataPoint.cases
            d.recover = dataPoint.recover
            d.active = dataPoint.cases-dataPoint.recover-dataPoint.death
            d.past = dataPoint.cases - d.active
            d.recoverrate = dataPoint.cases>0?(Math.pow(dataPoint.recover/dataPoint.cases,3)*1000):0;
            d.deathrate = dataPoint.death>0?(Math.pow((dataPoint.death)/(d.past),3)*1000)+1:0;
            console.log(d.deathrate)

            d.death = dataPoint.death
            return colorScale(d[vtype]);
        }).on("mouseenter", handleMouseOver)
        .on("mouseleave", handleMouseOut);

    function handleMouseOver(d, i) { // Add interactivity
        // Use D3 to select element, change color and size
        d3.select(this).attr("stroke", "black");
        let pt = this;
        var centr = mypath.centroid(d)
        // Specify where to put label of text
        //console.log(this,d,i,mypath,centr);
        var el = g2.append("text")
        el.attr("id", "textTown" + "-" + i)
        el.attr("x", centr[0])
        el.attr("y", centr[1]).attr("text-anchor", "middle")
            .attr("font-size", "20px").attr("pointer-events", "none")
        //Sconsole.log(el)
        el.text(function() {
            return capitalizeFirstLetter(d.properties["MPIO_CNMBR"] + ": " + d.cases);
        });
    }

    function handleMouseOut(d, i) {
        // Use D3 to select element, change color back to normal
        d3.select(this).attr("stroke", "none");

        // Select text by id and then remove
        d3.select("#textTown" + "-" + i).remove(); // Remove text location
    }
}
var buttons = d3.selectAll('.maptype input');
buttons.on('change', function(d) {
drawViz(this.value);
});
drawViz("cases");
window.onresize = function(){
    drawViz();
}
}