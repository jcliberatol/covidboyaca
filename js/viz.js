//Utils
function capitalizeFirstLetter(string) {
    string = string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
}
                function remove_empty_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return d.value != 0;
            });
        }
    };
}

                function remove_nameless_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                console.log(d.key)
                return d.key != "";
            });
        },
        size: source_group.size
    };
}

let renderMap = function(topo,rawData,ledim){
console.log("LEDIM",ledim)
    var datadic = {};
    var data = d3.map();
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
        var width = innerWidth < 1000 ? innerWidth*0.8 : Math.round(innerWidth * 0.75)
        var height = Math.round(width * (9 / 16))
        var bg = d3.select("#background")
        var svg = d3.select("#mapsvg")
        console.log(width, height)
        svg.attr("width", width),
            svg.attr("height", height);
            bg.attr("width", width),
            bg.attr("height", height);
        var path = d3.geoPath();
        var projection = d3.geoMercator()
            .scale(width * 13)
            .center([-73.16, 5.88])
            .translate([width / 2, height / 2]);

        var colst = "wheat"
        var colend = "sienna"

        switch (vtype) {
            case "recoverrate":
                colst = "CRIMSON";
                colend = "YELLOWGREEN";
                break;
            case "deathrate":
                colst = "YELLOWGREEN";
                colend = "CRIMSON";
                break;
            case "death":
                colst = "LIGHTGRAY";
                colend = "BLACK";
                break;
        }
        console.log(vtype, colst, colend)

        var colorScale = dd => dd == 0 ? "#cce6ae" : d3.scaleSequential(d3.interpolateHsl(colst, colend))(Math.log(dd)/6 )
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
                d.active = dataPoint.cases - dataPoint.recover - dataPoint.death
                d.past = dataPoint.cases - d.active
                d.recoverrate = d.past > 0 ? (Math.pow(d.past / d.cases, 3) * 1000) + 1 : 0;
                d.deathrate = dataPoint.death > 0 ? (Math.pow((dataPoint.death) / (d.past), 3) * 1000) + 1 : 0;
                d.death = dataPoint.death
                return colorScale(d[vtype]);
            }).on("mouseenter", handleMouseOver)
            .on("mouseleave", handleMouseOut)
            .on("click",function(d,i){
            let town = capitalizeFirstLetter(d.properties["MPIO_CNMBR"])
            ledim.filter();
                ledim.filter(town)
                console.log(town)
            dc.redrawAll();
            })
        bg.on("click",function(d,i){
            console.log("Clicked bg",d,i,this)
            ledim.filter();
            dc.redrawAll();
        })

        function handleMouseOver(d, i) { // Add interactivity
            // Use D3 to select element, change color and size
            d3.select(this).attr("stroke", "black");
            let pt = this;
            var fsize = width > 600 ? "20px" : "12px"
            var spacing = width > 600 ? 20 : 12 ;
            var centr = mypath.centroid(d)
            // Specify where to put label of text
            //console.log(this,d,i,mypath,centr);
            var el = g2.append("text")
            el.attr("id", "textTown" + "-" + i)
            el.attr("x", centr[0])
            el.attr("y", centr[1]).attr("text-anchor", "middle")
                .attr("font-size", fsize).attr("pointer-events", "none")
            //Sconsole.log(el)
            let town = capitalizeFirstLetter(d.properties["MPIO_CNMBR"])
            el.text(function() {
                return town;
            });

            var el2 = g2.append("text")
            el2.attr("id", "textTown2" + "-" + i)
            el2.attr("x", centr[0])
            el2.attr("y", centr[1] + spacing).attr("text-anchor", "middle")
                .attr("font-size", fsize).attr("pointer-events", "none")
            //Sconsole.log(el)
            el2.text(function() {
                return ("(Casos:" + d.cases + ")  (Activos: " + d.active + ")  (Muertes: " + d.death + ")");
            });
            var el3 = g2.append("text")
            el3.attr("id", "textTown3" + "-" + i)
            el3.attr("x", centr[0])
            el3.attr("y", centr[1] + spacing * 2).attr("text-anchor", "middle")
                .attr("font-size", fsize).attr("pointer-events", "none")
            //Sconsole.log(el)
            el3.text(function() {
                return ("Activos:" + (d.cases > 0 ? Math.round((d.active / d.cases) * 100 * 100) / 100 : 0) + "%   Muertes: " + (d.past > 0 ? Math.round(d.death / d.past * 100 * 100) / 100 : 0) + "%");
            });
        }

        function handleMouseOut(d, i) {
            // Use D3 to select element, change color back to normal
            d3.select(this).attr("stroke", "none");

            // Select text by id and then remove
            d3.select("#textTown" + "-" + i).remove(); // Remove text location
            d3.select("#textTown2" + "-" + i).remove(); // Remove text location
            d3.select("#textTown3" + "-" + i).remove(); // Remove text location
        }
    }
    var buttons = d3.selectAll('.maptype input');
    buttons.on('change', function(d) {
        drawViz(this.value);
    });
    drawViz("cases");
    window.onresize = function() {
        drawViz(d3.select('input[name="status"]:checked').property("value"));
    }

    }
// Data and color scale

var rawDatas = [];
// Load external data and boot
/*
d3.queue()
    .defer(d3.json, )
    .defer(d3.csv, "data/boyaca.csv", function(d) {
        rawDatas.push(d);
    })
    .await(ready);
*/
d3.json("data/boyaca_rewinded.json").then(function(tp){
console.log(tp)
    d3.csv("data/boyaca.csv").then(function(rd){
    console.log(rd)
        rawDatas = rd;
        ready(undefined,tp)
    })
})

function ready(error, topology) {
    console.log(rawDatas);

    //Dashboard



    var recchart = new dc.RowChart("#recchart")
    var mfchart = new dc.RowChart("#mfchart")
    var severechart = new dc.RowChart("#severechart")
    var crdserieschart = new dc.SeriesChart("#crdserieschart")
    const dateFormatSpecifier = '%Y-%m-%dT%H:%M:%S.%L';
    const dateFormat = d3.timeFormat(dateFormatSpecifier);
    const dateFormatParser = d3.timeParse(dateFormatSpecifier);

    rawDatas.forEach(d=>{
        d.dateFIS = dateFormatParser(d["FIS"])
        d.datemort = dateFormatParser(d["Fecha de muerte"])
        d.datenot = dateFormatParser(d["Fecha de notificación"])
        d.datediag = dateFormatParser(d["Fecha diagnostico"])
        d.daterec = dateFormatParser(d["Fecha recuperado"])
        d.dateweb = dateFormatParser(d["fecha reporte web"])
        d.gender = d["Sexo"]=="M"?"Hombre":"Mujer";
        d["Ciudad de ubicación"] = capitalizeFirstLetter(d["Ciudad de ubicación"])
    })
    const ndx = crossfilter(rawDatas);
    const all = ndx.groupAll();
    var mpiodim = ndx.dimension(d => d["Ciudad de ubicación"])
    var filterFun = function(){
        console.log("Filtered",ndx.allFiltered())
        renderMap(topology,ndx.allFiltered(),mpiodim)
    }
    console.log(ndx)



    var mfdim = ndx.dimension(d => d.gender)
    var mfg = mfdim.group();

     mfchart
        .width(180)
        .height(180)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .group(mfg)
        .dimension(mfdim)
        .ordinalColors(['#01c5c4', '#b8de6f'])
        .label(d => d.key +" "+ (Math.round(d.value/ndx.allFiltered().length *10000)/100 + "%"))
        .title(d => d.value)
        .elasticX(true)
        .xAxis().ticks(4)
    mfchart.on('filtered',filterFun);
    mfchart.render();

    var severechartdim = ndx.dimension(d => d["Estado"].toUpperCase())
    var severechartg = remove_nameless_bins(severechartdim.group());

    console.log(ndx.allFiltered().length)

     severechart
        .width(180)
        .height(180)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .group(severechartg)
        .dimension(severechartdim)
        .ordinalColors(['#01c5c4','#b8de6f',"#f1e189","#f39233","#794c74","#c56183"])
        .label(d => d.key +" "+ (Math.round(d.value/ndx.allFiltered().length *10000)/100 + "%"))
        .title(d => d.value)
        .elasticX(true)
        .xAxis().ticks(4)
        severechart.on('filtered',filterFun);
    severechart.render();

    var recchartdim = ndx.dimension(d => d["atención"].toUpperCase())
    var recchartg = remove_nameless_bins(recchartdim.group());

     recchart
        .width(180)
        .height(180)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .group(recchartg)
        .dimension(recchartdim)
        .ordinalColors(['#01c5c4','#b8de6f',"#f1e189","#f39233","#794c74","#c56183"])
        .label(d => d.key +" "+ (Math.round(d.value/ndx.allFiltered().length *10000)/100 + "%"))
        .title(d => d.value)
        .elasticX(true)
        .xAxis().ticks(4)
        recchart.on('filtered',filterFun);
    recchart.render();

    var runDimension = ndx.dimension(function(d) {return [d["Estado"].toUpperCase(), Math.round(Number(d["Edad"])/5)*5 + 5] });
    var runGroup = runDimension.group().reduceSum(function(d) { return 1; });
    console.log(runGroup)
    crdserieschart.width(600)
    .height(250)
    .chart(function(c) { return new dc.LineChart(c).renderArea(true).curve(d3.curveCardinal.tension(0.5))})
    .x(d3.scaleLinear().domain([0,100]))
    .brushOn(false)
    .yAxisLabel("Casos")
    .xAxisLabel("Edad")
    .clipPadding(10)
    .elasticY(true)
    .dimension(runDimension)
    .group(runGroup)
    .mouseZoomable(false)
    .seriesAccessor(function(d) {return d.key[0];})
    .keyAccessor(function(d) {return +d.key[1];})
    .valueAccessor(function(d) {return +d.value;})
    //.legend(dc.legend().x(80).y(50).itemHeight(12).gap(6).horizontal(20).legendWidth(300).itemWidth(300))
    //.ordinalColors(['#01c5c4','#b8de6f',"#f1e189","#f39233","#794c74","#c56183"])


    crdserieschart.on('filtered',filterFun);

    crdserieschart.render();

    d3.select("#bclear").on("click",function(){
    console.log("Cleaning all filters")
        recchart.filterAll();
        severechart.filterAll();
        mfchart.filterAll();
        mpiodim.filterAll()

        renderMap(topology,ndx.allFiltered(),mpiodim)
        dc.redrawAll();
    })

    //Map
    renderMap(topology,ndx.allFiltered(),mpiodim)


}