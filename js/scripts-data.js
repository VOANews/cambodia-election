//Grab the spreadsheet KEY from the URL bar (NOT from the published window)
var public_spreadsheet_url = '18N6V2RJx5_ahYwtdrC2dXiBTaJuYOOEes6-vphWuzog';// timeline 
//var public_spreadsheet_url = '1G4zXNyiUNmq7NS_hdlrcO5RHbUtMX9aZkf9gdn1cEGU';//quotes for the homepage

var map; //defined here for global access.

var currentProfileNumber = -1;
var loadedData;


var debugMode = true;
// Basic function to replace console.log() statements so they can all be disabled as needed;
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


var metrics = {
	"infant mortality": {
		"category": "health",
		"metric": "infant_mortality",
		"scale": [250, 200, 150, 100, 50, 10],
		"suffix": " per X,XXX"
	},
	"population density": {
		"category": "population",
		"metric": "total",
		"scale": [1000, 800, 400, 200, 100, 50],
		"suffix": " people per km²"
	},
	"electricity": {
		"category": "electricity",
		"metric": "percent_available",
		"scale": [85, 70, 55, 45, 30, 15],
		"suffix": "%"
	},
	"unemployment": {
		"category": "unemployment",
		"metric": "percent",
		"scale": [6, 5, 4, 3, 2, 1],
		"suffix": "%"
	}
}

var currentMetric = "population density";





// ============================
// |  Basic tabletopJS setup  |
// ============================
function loadSpreadsheet() {
	if ( mode == "editing") {
		Tabletop.init( { key: public_spreadsheet_url,
			callback: showInfo,
			simpleSheet: true } )
		/*
		//multisheet version: 
		Tabletop.init( { key: public_spreadsheet_url,
		 	callback: showInfo,
		 	wanted: [ "religion", "parties" ] } )
		*/
	} else if ( mode == "production") {
		//buildPresidents(d3target);
		showInfo(bakedData);
	} else {
		console.log("You need to define the 'mode' ('editing' or 'production')");
	}
}
//function showInfo(data, tabletop) {
function showInfo(data) {
	logger("loaded spreadsheet data: ");
	logger(data);
}




$(document).ready(function(){
	logger("Ready");

	balanceText();


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



	$("#introLink").click(function(){
		$("html, body").animate({ scrollTop: $("#intro").offset().top }, 500);
		return false;
	})

	if ($("#map").length){
		//Define tileset
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
		/*
		var Stamen_TonerLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.{ext}', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			subdomains: 'abcd',
			minZoom: 0,
			maxZoom: 20,
			ext: 'png'
		});*/


		var tiles__watercolor = [Stamen_Watercolor, Stamen_TonerLines]; //, Stamen_TonerLabels


		//Create the leaflet map and restrict zoom/boundaries
		mapData = L.map('map', {
			maxZoom: 9,
			minZoom: 6,
			maxBounds:scrollBounds,
			//attributionControl: false,
			scrollWheelZoom: false,
			dragging: false,
			//zoomControl:false,
			//tap: false,
			layers: tiles__watercolor
		});

		mapData.createPane('labels');
		mapData.getPane('labels').style.zIndex = 450;

		var Stamen_TonerLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.{ext}', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			subdomains: 'abcd',
			minZoom: 0,
			maxZoom: 20,
			ext: 'png',
			pane: 'labels'
		}).addTo(mapData);

		var scrollBounds = [
			[22.854, 115.735],
			[0, 91.117]
		]

		var cambodiaBounds = [
			[14.810457, 107.737],
			[9.940165, 102.398]
		]

		//starts map so that Cambodia is centered on the screen.
		mapData.fitBounds(cambodiaBounds);








		// ==============================================
		// |  Style geojson shapes based on borough   |
		// ==============================================
		var simplifiedName = "";
		function styleConditionally(feature){
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

			if (d.HRName != "Tboung Khmum"){
				var value = d.demographics[ metrics[currentMetric].category ][ metrics[currentMetric].metric ]

				if (currentMetric == "population density"){
					value =  value / d.area;
				}
			} else {
				//If the current province is Tboung Khmum, show the results for Kampong Cham
				//console.log("geojson.features[20]");
				//console.log(geojson.features[20].properties);
				var value = geojson.features[20].properties.demographics[ metrics[currentMetric].category ][ metrics[currentMetric].metric ]

				if (currentMetric == "population density"){
					value =  value / geojson.features[20].properties.area;
				}
			}

			//console.log("trying to getColor — d: " + d)

			return value > metrics[currentMetric].scale[0] ? '#800026' :
					value > metrics[currentMetric].scale[1]  ? '#BD0026' :
					value > metrics[currentMetric].scale[2]  ? '#E31A1C' :
					value > metrics[currentMetric].scale[3]  ? '#FC4E2A' :
					value > metrics[currentMetric].scale[4]  ? '#FD8D3C' :
					//value > 20  ? '#FEB24C' :
					value > metrics[currentMetric].scale[5]  ? '#FED976' :
					        '#FFEDA0';
 

		}



		var geojson;
		var dataDemographics
		$.getJSON( projectPrefix + "/data/cambodia-commune.json", function( data ) {

			geojson = data;

			$.getJSON( projectPrefix + "/data/data.merged.json", function( dataDemographics ) {

				//console.log("trying to loop over geojson");
				//console.log(geojson)
				for (var i = 0; i < geojson.features.length; i++){
					//console.log("i: " + i);

					if (geojson.features[i].properties.OBJECTID != 0){
						var dataState = geojson.features[i].properties.HRName;
						//console.log("dataState: " + dataState);

						geojson.features[i].properties.demographics = {};

						$.extend(geojson.features[i].properties.demographics, dataDemographics[dataState]);

					}
				}

				logger("geojson merged with demographics");
				logger(geojson);

				drawMap();

			});

		})


		function drawMap(){

			logger("Start drawing map\n")

			var vectorMap = L.geoJson(geojson, {
				style: styleConditionally,
				onEachFeature: onEachFeature
			}).addTo(mapData);


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
				var idName = simplifyName(this.feature.properties.HRName)
				$("#" + idName).addClass("selected");

				var popupText ="";

				if (currentMetric == "population density"){
					popupText = "<p><strong>" + this.feature.properties.HRName + " province</strong><br/>" + currentMetric +": " + ( Math.round(this.feature.properties.demographics["population"]["total"] / this.feature.properties.area) )  + metrics[currentMetric].suffix;
				} else {
					popupText = "<p><strong>" + this.feature.properties.HRName + " province</strong><br/>" + currentMetric +": " + this.feature.properties.demographics[metrics[currentMetric].category][metrics[currentMetric].metric] + metrics[currentMetric].suffix;
				}

				this.bindPopup(popupText).openPopup();

			}

			function displayText(feature, layer){
				logger("feature")
				logger(feature)
				logger("layer")
				logger(layer)
				return feature
			}

			$(".map_button").click(function(){
				logger("attempting to redraw the map: " + $(this).data("metric"))

				currentMetric = $(this).data("metric");

				vectorMap.eachLayer(function(layer) {
					layer.closePopup();
				})


				vectorMap.setStyle(
					styleConditionally
				);				
				return false;

			})

		}

	};

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



	// =====================================
	// |  load spreadsheet via tabletopJS  |
	// =====================================
	//loadSpreadsheet();



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
		logger("loading encoded rss")

		$.getJSON(yql, function(res) {
			logger(res);

			var rssFeed = ""
			for (var i = 0; i < rssStoryCount; i++){
				logger(res.query.results.item[i].title)
				rssFeed += "<li><a href='" + res.query.results.item[i].link + "'>" + res.query.results.item[i].title + "</a></li>";
			}

			$("#rssList").html(rssFeed);

		}, "jsonp");

	});


});