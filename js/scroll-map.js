// Grab the spreadsheet KEY from the URL bar (NOT from the published window)
// var public_spreadsheet_url = '1LHNJt8AXc6xLV1d8sX9ys15JA2UxWOeINYsHHXidcqk';
var map; //defined here for global access.
var marker;
var myLayerGroup;
var vectorMap


var currentProfileNumber = -1;
var loadedData;



// Define the zoom bounds
var boundsCambodia = [
		[16, 107.74],
		[9.94, 102.398]
	]

var boundAsia = [
		[54, 140],
		[-5, 45]
	]

var scrollBounds = [
	[22.854, 115.735],
	[0, 91.117]
]


var currentYear = 2013;

var metrics = {
	"infant mortality": {
		"category": "health",
		"metric": "infant_mortality",
		"scale": [250, 200, 150, 100, 50, 40],
	},
	"population density": {
		"category": "population",
		"metric": "total",
		"scale": [1000, 800, 400, 200, 100, 50],
	},
	"electricity": {
		"category": "electricity",
		"metric": "percent_available",
		"scale": [85, 70, 55, 45, 30, 15],
		"colorScale": {
			"top" : 'yellow',
			"high" : "#d5cb2f",
			"mediumHigh" : "#b2a82c",
			"mediumLow" : "#8e8629",
			"low" : "#6a6426",
			"bottom" : "#383422",
			"default" : "#000"
		}
	},
	"unemployment": {
		"category": "unemployment",
		"metric": "percent",
		"scale": [6, 5, 4, 3, 2, 1],
	},
	"election results": {
		"category": "elections",
		"metric": "2013",
		"scale": [90, 80, 70, 60, 50, 45],
		"colorScale": {
			"top" : '#084594',
			"high" : "#2171b5",
			"mediumHigh" : "#4292c6",
			"mediumLow" : "#6baed6",
			"low" : "#9ecae1",
			"bottom" : "#c6dbef",
			"default" : "#eff3ff"
		}
	},
	"education": {
		"category": "education",
		"metric": "percent_beyond_secondary",
		"scale": [7, 6, 5, 4, 3, 2],
	}

}

var colorScaleDefault = {
	"top" : '#800026',
	"high" : "#BD0026",
	"mediumHigh" : "#E31A1C",
	"mediumLow" : "#FC4E2A",
	"low" : "#FD8D3C",
	"bottom" : "#FEB24C",
	"default" : "#FFEDA0"
}

var currentMetric = "election results";// "population density";



// =======================
// |  Utility functions  |
// =======================

var debugMode = true;
// Utility function to replace console.log() statements so they can all be disabled as needed;
function logger(logString){
	if (debugMode){
		console.log(logString);
	}
}


// Utility function for removing spaces and punctuation from a string
function simplifyName(name){
	var idName = name;
	idName = idName.replace(/ /g,'');
	idName = idName.replace("'",'');
	idName = idName.replace(/[.,\/#!$%\^&\;:{}=\-_`~]/g,"");

	return idName;
}

// utility function for making percentage
function percentage(num){
	var percentage = Math.round(num * 1000);
	percentage = percentage/10;
	return percentage;
}

/*
function numKhmer(x){
  return x.toLocaleString('khmr');
}

console.log("2013: " + numKhmer(2013));
*/

//$(window).on('load', function() {// }); // Runs when all assets are loaded.
//$(document).ready(function(){
$(window).on('load', function() {
	logger("Ready");

	// ===================
	// |  Dropdown menu  |
	// ===================
	$(function() {
		$('#main-menu').smartmenus({
			subMenusSubOffsetX: 1,
			subMenusSubOffsetY: -8
		});
	});

	$( "#menuButton" ).click(function() {
		logger("clicked menu toggle")
	  $( ".main-menu-nav").toggle();
	});

	$( ".main-menu-nav a").not(".has-submenu").click(function() {
	  $( ".main-menu-nav").hide();
	});

	$( ".voa__section__full-width" ).click(function() {
	  $( ".main-menu-nav").hide();
	});


	//balanceText();



	/*
	//=====================================================
	// |  Add support for query strings (for languages)   |
	//=====================================================
	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		    results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	// you'll need to use this after the document has loaded.
	languageQuery = getParameterByName('language');
	if (languageQuery && languageQuery!=""){
		language = languageQuery;
	}

	*/



	/*
	// ================================================
	// |  Opens a pop-up with twitter sharing dialog  |
	// ================================================
	$('#shareTwitter').click(function(){
		var url = shareUrl;
		var text = shareText;
		window.open('http://twitter.com/share?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(text), '', 'left=0,top=0,width=550,height=450,personalbar=0,toolbar=0,scrollbars=0,resizable=0');
	})
	*/






	// =================================
	// |  Parsing RSS with Javascript  |
	// |  to reset the styles.         |
	// =================================
	//https://www.raymondcamden.com/2015/12/08/parsing-rss-feeds-in-javascript-options/

	var rssStoryCount = 4;

	$(document).ready(function() {

		//https://www.voacambodia.com/api/zumkyep$kt
		//var yql = "https://query.yahooapis.com/v1/public/yql?q=select%20title%2Clink%2Cdescription%20from%20rss%20where%20url%3D%22https%3A%2F%2Fwww.bbg.gov%2Ftag%2Fhot-spots%2Ffeed%2F%22&format=json&diagnostics=true&callback=";
		//var yql = "https://query.yahooapis.com/v1/public/yql?q=select%20title%2Clink%2Cdescription%20from%20rss%20where%20url%3D%22https%3A%2F%2Fwww.voacambodia.com%2Fapi%2Fzumkyep$kt%2F%22&format=json&diagnostics=true&callback=";
		var yql = "https://query.yahooapis.com/v1/public/yql?q=select%20title%2Clink%2Cdescription%20from%20rss%20where%20url%3D%22" + rssFeedEncoded + "%2F%22&format=json&diagnostics=true&callback=";
		logger("Loaded RSS feed:")

		$.getJSON(yql, function(res) {
			logger(res);



			var rssFeed = ""
			for (var i = 0; i < rssStoryCount; i++){
				//logger(res.query.results.item[i].title)
				rssFeed += "<li><a href='" + res.query.results.item[i].link + "'>" + res.query.results.item[i].title + "</a></li>";
			}

			$("#rssList").html(rssFeed);

		}, "jsonp");

	});







	// =======================================
	// |  Add/remove classes after resizing  |
	// |  to reset the styles.               |
	// =======================================
	function resized(){

		var windowSize = window.innerWidth;

		if(windowSize>640){
			//logger("the browser is wider than 640 pixels wide (large)");
			//var offsetTop = 0;// $("#mapShell").offset().top;
			//logger("offset top: " + offsetTop)
			var bottomSpacing = $(".voa__footer").height();//1000;//$("#mapShell").offset().top - $("#overview").height();
			//logger("--------bottomSpacing: " + bottomSpacing);

			//Unsticks when the footer appears.
			$("#mapShell").sticky({
				topSpacing:0,
				bottomSpacing: bottomSpacing
			});
			//$("#test").sticky({topSpacing:0});

			$(".voa__country-profiles").removeClass("autoHeight");
		} else {
			//logger("the browser is smaller than 640 pixels wide (small)");
			$("#mapShell").unstick();
			$("mapShell").css("position", "relative");
			//$(".voa__country-profiles").css("height", "auto");
			$(".voa__country-profiles").addClass("autoHeight");
		}

	}

	$(window).resize(resized);
	resized();






	// =======================
	// |  Leaflet map setup  |
	// =======================

	var path = [];
	var marker;
	var myLayerGroup;
	var baseLayerTiles;

	var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		subdomains: 'abcd',
		minZoom: 1,
		maxZoom: 16,
		ext: 'png'
	});
	var Stamen_TonerLines = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 20,
		ext: 'png'
	});

	var tiles__watercolor = [Stamen_Watercolor, Stamen_TonerLines]; //, Stamen_TonerLabels



	// ====================
	// |  Create the map  |
	// ====================

	map = L.map('map', {
		maxZoom: 15,
		minZoom: 6,
		maxBounds:scrollBounds,
		//attributionControl: false,
		scrollWheelZoom: false,
		layers: tiles__watercolor
	});


	map.zoomControl.setPosition('bottomleft');


	/*

	// Create a map pane if you want to add a tile-based map layer (e.g. with labels) above the geojson layer

	map.createPane('labels');
	map.getPane('labels').style.zIndex = 450;
	
	var Stamen_TonerLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 20,
		ext: 'png'//,
		//pane: 'labels'
	}).addTo(map);

	map.createPane('labels');
	map.getPane('labels').style.zIndex = 650;
	map.getPane('labels').style.pointerEvents = 'none';

	*/

	//starts map so that Cambodia is centered on the screen.
	map.fitBounds(boundsCambodia);



	// ===============================
	// |  Adding resets for the map  |
	// ===============================
	// Not currently using this, but you could use it to highlight certain areas.
	function resetCountries(){
		$("#detail").removeClass("show");
		$(".leaflet-interactive.selected").removeClass("selected");
	}
	function resetHighlights(){
		$(".leaflet-interactive.highlighted").removeClass("highlighted");
	}





	// =======================================
	// |  Adjust styles based on zoom level  |
	// =======================================

	map.on('zoomend', function () {

		currentZoom = map.getZoom();

		if ( currentZoom > 6 ) {
			//sgrVectorMap.setStyle({weight: 3});
			logger("Show province names (zoom " + currentZoom + ")");
			$(".labelProvince").addClass("show");
		} else {
			logger("Hide province names (zoom " + currentZoom + ")");
			$(".labelProvince").removeClass("show");
		}

	});




	// ==============================================
	// |  Style geojson shapes based on borough   |
	// ==============================================
	var simplifiedName = "";
	function styleConditionally(feature){
		//console.log("styling conditionally ")
		// If feature is "cambodia" draw the outline
		if (feature.properties.sovereignt == "Cambodia"){
			return {
				'fillColor': 'transparent',//'red',
				"color": "#FFF",
				"weight": 6,
				"opacity": 1,
				'className': "cambodia-border"
	    	};
		} else {
			//console.log("!trying to getColor()--switch case: " + feature.properties.HRName);
			return {
					'fillColor': getColor(feature.properties),// 'red',
					"color": "#222",
					"weight": 1,
					"opacity": 1,
					"fillOpacity": .8,
					'className': simplifyName(feature.properties.HRName) + " province"
		    	};
		}
	}

	// beware misspellings in province names
	// beware provinces that merged (or hadn't yet)

	function getColor(d) {

		//logger("\n\nTrying to getColor() " + d.HRName + " for " + currentYear)

		if (d.HRName != "Tboung Khmum"){
			var value = d.demographics[ metrics[currentMetric].category ][ metrics[currentMetric].metric ]

			if (currentMetric == "population density"){
				value =  value / d.area;
			} else if (currentMetric == "election results"){

				var parties = ["CPP", "CNRP", "SRP", "FCP", "HRP", "NRP"]

				// Determine the total number of seats awarded in a province
				var totalSeats = 0;
				for (var n = 0; n < parties.length; n++ ){

					if (d.demographics[ metrics[currentMetric].category ][currentYear][ parties[n] ] ){
						totalSeats += d.demographics[ metrics[currentMetric].category ][currentYear][ parties[n] ];
					}

				}

				//var totalSeats = d.demographics[ metrics[currentMetric].category ][ metrics[currentMetric].metric ]["CPP"] + d.demographics[ metrics[currentMetric].category ][ metrics[currentMetric].metric ]["CNRP"];
				value = percentage(d.demographics[ metrics[currentMetric].category ][currentYear]["CPP"] / totalSeats);

				//logger("\ttotalSeats: " + totalSeats + " (" + value + "%) in " + currentYear);
			}
		} else {
			//If the current province is Tboung Khmum, show the results for Kampong Cham
			//console.log("geojson.features[20]");
			//console.log(geojson.features[20].properties);
			var value = geojson.features[20].properties.demographics[ metrics[currentMetric].category ][ metrics[currentMetric].metric ]

			if (currentMetric == "population density"){
				value =  value / geojson.features[20].properties.area;
			} else if (currentMetric == "election results"){
				var totalSeats =  geojson.features[20].properties.demographics[ metrics[currentMetric].category ][ metrics[currentMetric].metric ]["CPP"] + geojson.features[20].properties.demographics[ metrics[currentMetric].category ][ metrics[currentMetric].metric ]["CNRP"]
				value =  percentage( geojson.features[20].properties.demographics[ metrics[currentMetric].category ][ metrics[currentMetric].metric ]["CPP"] / totalSeats);

				var parties = ["CPP", "CNRP", "SRP", "FCP", "HRP", "NRP"]

				var totalSeats = 0;
				for (var n = 0; n < parties.length; n++ ){

					if (geojson.features[20].properties.demographics[ metrics[currentMetric].category ][currentYear][ parties[n] ] ){
						totalSeats += geojson.features[20].properties.demographics[ metrics[currentMetric].category ][currentYear][ parties[n] ];
					}

				}

				value = percentage(geojson.features[20].properties.demographics[ metrics[currentMetric].category ][currentYear]["CPP"] / totalSeats);

			} 
		}

		if (metrics[currentMetric].colorScale){
			return value > metrics[currentMetric].scale[0] ? metrics[currentMetric].colorScale.top :
					value > metrics[currentMetric].scale[1]  ? metrics[currentMetric].colorScale.high :
					value > metrics[currentMetric].scale[2]  ? metrics[currentMetric].colorScale.mediumHigh :
					value > metrics[currentMetric].scale[3]  ? metrics[currentMetric].colorScale.mediumLow :
					value > metrics[currentMetric].scale[4]  ? metrics[currentMetric].colorScale.low :
					value > metrics[currentMetric].scale[5]  ? metrics[currentMetric].colorScale.bottom :
					        metrics[currentMetric].colorScale.default;

		} else {
			return value > metrics[currentMetric].scale[0] ? colorScaleDefault.top :
					value > metrics[currentMetric].scale[1]  ? colorScaleDefault.high :
					value > metrics[currentMetric].scale[2]  ? colorScaleDefault.mediumHigh :
					value > metrics[currentMetric].scale[3]  ? colorScaleDefault.mediumLow :
					value > metrics[currentMetric].scale[4]  ? colorScaleDefault.low :
					value > metrics[currentMetric].scale[5]  ? colorScaleDefault.bottom :
					        colorScaleDefault.default;
		}

	}




	var geojson;
	var dataDemographics
	$.getJSON( projectPrefix + "/data/cambodia-commune.json", function( data ) {

		geojson = data;

		$.getJSON( projectPrefix + "/data/data.merged.json", function( dataDemographics ) {

			//Looping over geojson and merging it with demographics data 

			for (var i = 0; i < geojson.features.length; i++){
				//console.log("i: " + i);

				if (geojson.features[i].properties.OBJECTID != 0){
					var dataState = geojson.features[i].properties.HRName;
					//console.log("dataState: " + dataState);

					geojson.features[i].properties.demographics = {};

					$.extend(geojson.features[i].properties.demographics, dataDemographics[dataState]);

				}
			}

			logger("\nHere's the geojson merged demographics data");
			logger(geojson);
			logger("\n")

			createMap();

		});

	})


	function createMap(){
		vectorMap = L.geoJson(geojson, {
			maxZoom: 15,
			minZoom: 6,
			style: styleConditionally,
			onEachFeature: onEachFeature
		}).addTo(map);


		// Add ID to names
		vectorMap.eachLayer(function(layer) {
			if (layer.feature.properties.OBJECTID != 0){
				layer._path.id = simplifyName(layer.feature.properties.HRName);
			}
		})

		function onEachFeature(feature, layer) {
			layer.on({
				click: clickBorough
			});
			//layer.bindPopup("<strong>" + layer.feature.properties.HRName + " province</strong>")
		}

		function resetBoroughs(){
			$(".leaflet-interactive.selected").removeClass("selected");
		}


		function clickBorough(e) {
			//logger("clicked: "+ this.feature.properties.name)

			// Highlight the selected country
			resetBoroughs();

			var popupText = "";

			if (this.feature.properties.HRName != "Tboung Khmum"){

				var idName
				if (this.feature.properties.HRName != "Kampong Cham"){
					var idName = simplifyName(this.feature.properties.HRName)
				}else {
					var idName = simplifyName(this.feature.properties.HRName) + ", #TboungKhmum";
				}
				logger("idName: " + idName);
				$("#" + idName).addClass("selected");


				if (currentMetric == "population density"){
					popupText = "<p><strong>" + dictionaryMap.provinces[this.feature.properties.HRName] + "</strong><br/>" + dictionaryMap[currentMetric].label +": " + ( Math.round(this.feature.properties.demographics["population"]["total"] / this.feature.properties.area) )  + dictionaryMap[currentMetric].suffix;
				} else if (currentMetric == "election results"){

					console.log("You clicked on " + this.feature.properties.HRName);

					var totals = "";

					var parties = ["CPP", "CNRP", "SRP", "FCP", "HRP", "NRP"]

					for (var n = 0; n < parties.length; n++ ){


						if (this.feature.properties.demographics[ metrics[currentMetric].category ][currentYear][ parties[n] ] ){
							//this[parties[n]] = 

							totals += parties[n] + ": " + this.feature.properties.demographics[ metrics[currentMetric].category ][currentYear][ parties[n] ] + "<br/>"
						}
					}

					//popupText = "<p><strong>" + dictionaryMap.provinces[this.feature.properties.HRName] + "</strong><br/>" + dictionaryMap.CPP + ": " + this.feature.properties.demographics["elections"]["2013"]["CPP"] + "<br/>" + dictionaryMap.CNRP + ": " + this.feature.properties.demographics["elections"]["2013"]["CNRP"] +"</p>";
					popupText = "<p><strong>" + dictionaryMap.provinces[this.feature.properties.HRName] + "</strong><br/>" + totals +"</p>";
				} else {
					popupText = "<p><strong>" + dictionaryMap.provinces[this.feature.properties.HRName] + "</strong><br/>" + dictionaryMap[currentMetric].label +": " + this.feature.properties.demographics[metrics[currentMetric].category][metrics[currentMetric].metric] + dictionaryMap[currentMetric].suffix;
				}
			} else {
				logger("trying to get " +currentMetric+ " for Tboung Khmum");
				var idName = simplifyName(this.feature.properties.HRName);
				$("#" + idName +", #KampongCham").addClass("selected");


				if (currentMetric == "population density"){
					logger(geojson.features[20].properties.demographics);
					popupText = "<p><strong>" + dictionaryMap.provinces[ geojson.features[20].properties.HRName ] + "</strong><br/>" + dictionaryMap[currentMetric].label +": " + ( Math.round( geojson.features[20].properties.demographics["population"]["total"] /  geojson.features[20].properties.area) )  + dictionaryMap[currentMetric].suffix;
				} else if (currentMetric == "election results"){

					console.log("You clicked on " + this.feature.properties.HRName + " (Tboung Khmum)");

					var totals = "";

					var parties = ["CPP", "CNRP", "SRP", "FCP", "HRP", "NRP"]

					for (var n = 0; n < parties.length; n++ ){


						if (geojson.features[20].properties.demographics[ metrics[currentMetric].category ][currentYear][ parties[n] ] ){
							//this[parties[n]] = 

							totals += parties[n] + ": " + geojson.features[20].properties.demographics[ metrics[currentMetric].category ][currentYear][ parties[n] ] + "<br/>"
						}
					}

					//popupText = "<p><strong>" + dictionaryMap.provinces[this.feature.properties.HRName] + "</strong><br/>" + dictionaryMap.CPP + ": " + this.feature.properties.demographics["elections"]["2013"]["CPP"] + "<br/>" + dictionaryMap.CNRP + ": " + this.feature.properties.demographics["elections"]["2013"]["CNRP"] +"</p>";
					popupText = "<p><strong>" + dictionaryMap.provinces[geojson.features[20].properties.HRName] + "</strong><br/>" + totals +"</p>";
				} else {
					popupText = "<p><strong>" + dictionaryMap.provinces[geojson.features[20].properties.HRName] + "</strong><br/>" + dictionaryMap[currentMetric].label +": " + geojson.features[20].properties.demographics[metrics[currentMetric].category][metrics[currentMetric].metric] + dictionaryMap[currentMetric].suffix;
				}

			}

			this.bindPopup(popupText).openPopup();

		}
		/*
		function displayText(feature, layer){
			console.log("feature")
			console.log(feature)
			console.log("layer")
			console.log(layer)
			return feature
		}
		*/

		// Labelling the map (cities, provinces, countries and bodies of water)
		// Useful for setting up translations on map.
		// http://www.coffeegnome.net/labels-in-leaflet/

		/*
		logger("\n\n")
		logger("The dictionary for map labels is defined in the HTML");
		logger(dictionaryMap);
		*/

		var createLabelIcon = function(labelClass,labelText){
			return L.divIcon({ 
					className: labelClass,
					html: labelText
				})
		}

		var labelPhnomPenh = L.marker(new L.LatLng(11.556374, 104.92821), {icon:createLabelIcon("labelCity", dictionaryMap["Phnom Penh"])}).addTo(map);
		var labelVietnam = L.marker(new L.LatLng(11.036892, 106.95), {icon:createLabelIcon("labelCountry", dictionaryMap.Vietnam)}).addTo(map);
		var labelThailand = L.marker(new L.LatLng(14.966330, 102.478), {icon:createLabelIcon("labelCountry", dictionaryMap.Thailand)}).addTo(map);
		var labelLaos = L.marker(new L.LatLng(15.594, 106.297), {icon:createLabelIcon("labelCountry", dictionaryMap.Laos)}).addTo(map);
		var labelWater = L.marker(new L.LatLng(10.228261, 101.97), {icon:createLabelIcon("labelWater", dictionaryMap["Gulf of Thailand"])}).addTo(map);

		var labelKandal = L.marker(new L.LatLng(11.227, 105.0476), {icon:createLabelIcon("labelProvince show", dictionaryMap.provinces["Kandal"])}).addTo(map);
		var labelTakeo = L.marker(new L.LatLng(10.932, 104.798), {icon:createLabelIcon("labelProvince show", dictionaryMap.provinces["Takeo"])}).addTo(map);
		var labelKampot = L.marker(new L.LatLng(10.760077, 104.083), {icon:createLabelIcon("labelProvince show", dictionaryMap.provinces["Kampot"])}).addTo(map);
		var labelBanteayMeanchey = L.marker(new L.LatLng(13.624, 102.729), {icon:createLabelIcon("labelProvince show", dictionaryMap.provinces["Banteay Meanchey"])}).addTo(map);
		var labelKampongCham = L.marker(new L.LatLng(11.992429, 105.0), {icon:createLabelIcon("labelProvince show", dictionaryMap.provinces["Kampong Cham"])}).addTo(map);



		currentZoom = map.getZoom();

		if ( currentZoom > 6 ) {
			//sgrVectorMap.setStyle({weight: 3});
			logger("Show province names (zoom " + currentZoom + ")");
			$(".labelProvince").addClass("show");

		} else {

			logger("Hide province names (zoom " + currentZoom + ")");
			$(".labelProvince").removeClass("show");

		}


		drawMap();
	}


	function drawMap(){
		//Update the map based on the data.

		logger("Paint map (" + currentMetric +")\n\n\n");

		$("#mapLabel").text(dictionaryMap[currentMetric].label + " " + dictionaryMap["year" + currentYear]);

		$("#mapDescription").text(dictionaryMap[currentMetric].description);

		$("#mapKeyLevel0").html(metrics[currentMetric].scale[0] + "<span class='voa__map-key__label__metric'>" + dictionaryMap[currentMetric].suffix) + "</span>";
		$("#mapKeyLevel1").html(metrics[currentMetric].scale[1] + "<span class='voa__map-key__label__metric'>" + dictionaryMap[currentMetric].suffix) + "</span>";
		$("#mapKeyLevel2").html(metrics[currentMetric].scale[2] + "<span class='voa__map-key__label__metric'>" + dictionaryMap[currentMetric].suffix) + "</span>";
		$("#mapKeyLevel3").html(metrics[currentMetric].scale[3] + "<span class='voa__map-key__label__metric'>" + dictionaryMap[currentMetric].suffix) + "</span>";
		$("#mapKeyLevel4").html(metrics[currentMetric].scale[4] + "<span class='voa__map-key__label__metric'>" + dictionaryMap[currentMetric].suffix) + "</span>";
		$("#mapKeyLevel5").html(metrics[currentMetric].scale[5] + "<span class='voa__map-key__label__metric'>" + dictionaryMap[currentMetric].suffix) + "</span>";
		$("#mapKeyLevel6").html(0)

		if (metrics[currentMetric].colorScale){

			$(".voa__map-key__table__swatch.level0").css("background-color", metrics[currentMetric].colorScale.default);
			$(".voa__map-key__table__swatch.level1").css("background-color",  metrics[currentMetric].colorScale.bottom);
			$(".voa__map-key__table__swatch.level2").css("background-color", metrics[currentMetric].colorScale.low);
			$(".voa__map-key__table__swatch.level3").css("background-color", metrics[currentMetric].colorScale.mediumLow);
			$(".voa__map-key__table__swatch.level4").css("background-color", metrics[currentMetric].colorScale.mediumHigh);
			$(".voa__map-key__table__swatch.level5").css("background-color", metrics[currentMetric].colorScale.high);
			$(".voa__map-key__table__swatch.level6").css("background-color", metrics[currentMetric].colorScale.top);

		} else {

			$(".voa__map-key__table__swatch.level0").css("background-color", colorScaleDefault.default);
			$(".voa__map-key__table__swatch.level1").css("background-color", colorScaleDefault.bottom);
			$(".voa__map-key__table__swatch.level2").css("background-color", colorScaleDefault.low);
			$(".voa__map-key__table__swatch.level3").css("background-color", colorScaleDefault.mediumLow);
			$(".voa__map-key__table__swatch.level4").css("background-color", colorScaleDefault.mediumHigh);
			$(".voa__map-key__table__swatch.level5").css("background-color", colorScaleDefault.high);
			$(".voa__map-key__table__swatch.level6").css("background-color", colorScaleDefault.top);

		}

		vectorMap.setStyle(
			styleConditionally
		);

	}













	// ===================================
	// |  Adding WayPoint scroll events  |
	// ===================================

	waypointsTimeline = $('.scrollTrigger').waypoint({

		handler: function(direction) {
			if (direction == "down") {
				//logger("$(window).scrollTop(): " + $(window).scrollTop())
				//logger("scrolling down")
				currentRegion = $("#" + this.element.id).data("region");
				//logger("current region is: " + currentRegion);
				focusRegion();
			} else {
				//logger("scrolling up")
				currentRegion = $("#" + this.element.id).data("region");
				//logger("region: " + currentRegion);
				focusRegion();
			}



		},
		offset: 140
	})

	var currentRegion = "focusPopulationDensity";
	function focusRegion(){
		logger("The current Region is : " + currentRegion);

		vectorMap.eachLayer(function(layer) {
			layer.closePopup();
		})

		if (currentRegion == "focusPopulationDensity"){
			focusPopulationDensity();
		} else if (currentRegion == "Start"){
			focusStart();
			//focusStart();
		} else if (currentRegion == "focusUnemployment"){
			focusUnemployment();
		} else if(currentRegion == "focusInfantMortality"){
			focusInfantMortality();
			//focusAsia();
		} else if(currentRegion == "focusElectricity"){
			focusElectricity();
		} else if(currentRegion == "focusEducation"){
			focusEducation();
		}

		showElectionMenu();
	}





	// =========================================
	// |  Define the focus events              |
	// |  based on different scroll positions  |
	// =========================================

	function focusStart(){
		logger("initial view");
		resetHighlights();

		map.fitBounds(boundsCambodia);
		currentYear = 2013;
		currentMetric = "election results";
		drawMap();
	}


	function focusEducation(){
		logger("education view");
		resetHighlights();

		map.fitBounds(boundsCambodia);
		currentMetric = "education";
		drawMap();
	}


	function focusPopulationDensity(){
		logger("initial view population density");
		resetHighlights();

		map.fitBounds(boundsCambodia);
		currentMetric = "population density";
		drawMap();
	}

	function focusUnemployment(){
		resetHighlights();

		map.fitBounds(boundsCambodia);
		currentMetric = "unemployment";
		drawMap();

		/*
		// IF YOU WANT TO HIGHLIGHT PROVINCES YOU CAN DO IT LIKE THIS:

		console.log("\n\n\n\n TRYING TO ADD HIGHLIGHT CLASS \n\n\n\n");
		$("#MondulKiri, #KampongCham").addClass("highlighted");
		*/
	}

	function focusElectricity(){
		resetHighlights();

		map.fitBounds(boundsCambodia);
		currentMetric = "electricity";
		drawMap();

	}

	function focusInfantMortality(){
		resetHighlights();

		map.fitBounds(boundsCambodia);
		currentMetric = "infant mortality";
		drawMap();
	}










	function showElectionMenu(){
		if (currentMetric=="election results"){
			$(".voa__menu__election-years").addClass("show");
		} else {
			$(".voa__menu__election-years").removeClass("show");
		}
	}




	function electionMap(){
		logger("initial view");
		resetHighlights();

		$(".voa__menu__election-year a").removeClass("current");
		$("#year" + currentYear).addClass("current");

		map.fitBounds(boundsCambodia);
		currentMetric = "election results";
		drawMap();
	}

	$(".voa__menu__election-year").click(function(){

		currentYear = $(this).text();

		electionMap();

		return false;
	})

	$(".drawMap").click(function(){

		currentYear = $(this).text();

		electionMap();

		return false
	})



	$(".scrollIntoView").click(function(){
		var scrollTarget = $(this).attr("href");
		$("html, body").animate({ scrollTop: $(scrollTarget).offset().top }, 500);

		return false;
	})

});