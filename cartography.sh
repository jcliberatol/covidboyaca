#npm install -g shapefile
#npm install -g d3-geo-projection

shp2json MGN_MPIO_POLITICO.shp -o col.json
geoproject "d3.geoConicEqualArea().parallels([-4, 13]).rotate([120, 0]).fitSize([960, 960], d)" boyaca_simply.json -o boyaca_simply_eq.json
geo2svg -w 960 -h 960 < boyaca_simply_eq.json > boyaca_simply_eq.svg