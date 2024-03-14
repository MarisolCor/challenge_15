// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

let street=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
let baseMaps={"satellite":satellite};

var colorGenerator = d3.scaleOrdinal().range(["#a3f602", "#dcf401", "#f7da10", "#fcb72a", "#fca35d","#fe5f63"]).domain([-10,10,30,50,70,90,600 ]);

// Adding the tile layer
var legend = L.control({position: 'bottomright'});

function createMap(data, defaultLayer, overLayMaps) {
    let myMap = L.map("map", {
        center: [37.807246697771554, -122.43170695660642],
        zoom: 6,
        layers: defaultLayer
    });
    addColorScheme(myMap, data);
    L.control.layers(baseMaps, overLayMaps, {collapsed: false}).addTo(myMap);
}

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    geoJsonObject = L.geoJson(data, {
        style:{
            fillOpacity:1000,
        },
        pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {
                radius: feature.properties.mag*3,
                opacity:1,
                color: colorGenerator(feature.geometry.coordinates[2])
            });
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3>Magnitude</h3><h4>" + feature.properties.mag.toFixed(2) + " Richter</h4><hr> "
            +"<h3>Depth</h3> <h4>" + feature.geometry.coordinates[2] + " km</h4>");
        }
    });
    d3.json('https://marisolcor.github.io/challenge_15/static/plates.json').then(function (data){
        platesObject=L.geoJson(data, {
            style:{
                color: "red",
                fillOpacity:0,
            },
        });
        let plateGroupMarker =  L.layerGroup([platesObject]);
        d3.json('https://marisolcor.github.io/challenge_15/static/orogens.json').then(function (data){
            orogensObject=L.geoJson(data, { style:{
                    color: "black",
                    fillOpacity:0.1,
                },});
            let orogenGroupMarker =  L.layerGroup([orogensObject]);
            let overLayMaps = {
                "plates":plateGroupMarker,
                "orogens":orogenGroupMarker,
                "earthQuakes": geoJsonObject,
                "street":street
            }
            createMap(data,[satellite,geoJsonObject], overLayMaps);
        });

    });
});

function addColorScheme(myMap, data){
    legend.onAdd = function (map) {
        var ctl = L.DomUtil.create('div', 'leaflet-control')

        var div =  L.DomUtil.create('div', 'info legend',ctl),
            grades = [-10,10,30,50,70,90 ],
            labels = [],
            from, to;
        for (var i = 0; i < grades.length; i++) {
            from = grades[i];
            to =   grades[i+1];
            labels.push(
                '<i style="background:' + colorGenerator(from) + '; display: grid;">' +
                from + (to ? '&ndash;' + to +'</i>': '+</i>'));
        }

        div.innerHTML = labels.join('');
        return ctl;
    };
    legend.addTo(myMap);
}
