//Grab the spreadsheet KEY from the URL bar (NOT from the published window)
var public_spreadsheet_url = '18N6V2RJx5_ahYwtdrC2dXiBTaJuYOOEes6-vphWuzog';// timeline 

var map; //defined here for global access.

// Define the zoom bounds
var scrollBounds = [
	[22.854, 115.735],
	[0, 91.117]
]

var cambodiaBounds = [
	[14.342619, 107.4519],
	[10.675173, 102.8815]
]


var currentProfileNumber = -1;
var loadedData;

var currentLanguage = "english"; // replaced in the html


var timelineImagesLoaded = false;


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




// ============================
// |  Basic tabletopJS setup  |
// ============================
function loadSpreadsheet() {
	if ( mode == "editing") {
		/*
		Tabletop.init( { key: public_spreadsheet_url,
			callback: showInfo,
			simpleSheet: true } )
		//multisheet version: 
		*/
		Tabletop.init( { key: public_spreadsheet_url,
		 	callback: showInfo,
		 	wanted: [ currentLanguage ] } )
	} else if ( mode == "production") {
		//showInfo(bakedData);
	} else {
		console.log("You need to define the 'mode' ('editing' or 'production')");
	}
}


function showInfo(data) {

	logger("loaded spreadsheet data: ");
	logger(data);

	loadedData = data[currentLanguage].elements;

	// Create the timeline markup based on the spreadsheet.
	// Copy and paste it into the HTML.
	if (mode == "editing"){

		var timelineString = "";
		for (var i = 0; i < loadedData.length; i++){

			var simplifiedDate = loadedData[i].date_english;
				simplifiedDate = simplifiedDate.replace(/ /g, "_");
				simplifiedDate = simplifiedDate.replace(",", "");
				simplifiedDate = simplifiedDate.toLowerCase();

			var stringStart = '<div id="' + simplifiedDate + '" class="voa__timeline__event ' + loadedData[i].person + ' ' + loadedData[i].spacer + '">\n';
			var stringMarker = '\t<div class="voa__timeline__event__marker"></div>\n';
			var stringDate = '\t<h3 class="voa__timeline__date">' + loadedData[i].date + '</h3>\n';
			var stringImage = '';
			if (loadedData[i].image != ""){
				stringImage = '\t<img src="https://projects.voanews.com/cambodia-election-2018/img/placeholder.jpg" data-image="' + loadedData[i].image + '" style="margin-bottom: 15px;"/>\n';
			}
			var stringTitle = '\t<h3>' + loadedData[i].title + '</h3>\n';
			var stringText = '\t<p>' + loadedData[i].Events + '</p>\n';
			var stringEnd = '</div>\n\n';

			timelineString += stringStart + stringMarker + stringDate + stringImage + stringTitle + stringText + stringEnd;
		}

		logger(timelineString);
	}

}



$(document).ready(function(){
	if (mode=="production"){
		debugMode = false;
	}
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

	if ($("#mapLocator").length){





		// Trying to add sidebar
		$.getJSON( projectPrefix + "/data/data.merged.json", function( dataDemographics ) {
		//$.getJSON( projectPrefix + "/data/data.merged.minified.json", function( dataDemographics ) {

			//$("#provinceProfileName").text(pinLocation);
			$("#provinceName").text(pinLocationTranslation);
			//$("#provinceName").text(pinLabel);


			var provinceStats = "";

			var metrics = [
				{
					"category": "electricity",
					"metric": "percent_available",
					"string": "electricity"
				},
				{
					"category": "health",
					"metric": "infant_mortality",
					"string": "infant mortality"
				},
				/*{
					"category": "education",
					"metric": "percent_primary_school",
					"string": "primary school completed"
				},*/
				{
					"category": "education",
					"metric": "percent_primary_school_2016",
					"string": "primary school completed 2016"
				}
			]
			for (var i = 0; i < metrics.length; i++){

				var category = metrics[i].category;
				var metric = metrics[i].metric;
				var metricString = metrics[i].string;


				provinceStats += "<tr>";
				provinceStats += "<td>" + dictionaryMap[metricString].label + " " + dictionaryMap[metricString].year +"</td><td>" + dataDemographics[pinLocation][category][metric] + dictionaryMap[metricString].suffix + "</td><td>" + dataDemographics.national[category][metric]  + dictionaryMap[metricString].suffix + "</td>";
				provinceStats += "</tr>"

			}

			$("#provinceProfileStatistics").html(provinceStats);

			if (pinLocation == "Kampong Cham"){
				console.log("This province was split into two in 2013. The new province XYZ had XX% primary graduation in 2016");
			}

		});









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
		mapLocator = L.map('mapLocator', {
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
/*
		mapLocator.createPane('labels');
		mapLocator.getPane('labels').style.zIndex = 450;

		var Stamen_TonerLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.{ext}', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			subdomains: 'abcd',
			minZoom: 0,
			maxZoom: 20,
			ext: 'png',
			pane: 'labels'
		}).addTo(mapLocator);
*/


		var createLabelIcon = function(labelClass,labelText){
			return L.divIcon({ 
					className: labelClass,
					html: labelText
				})
		}

		logger("\n\n\n\n\n")
		logger(dictionaryMap);
		logger(dictionaryMap.Laos)

		var labelPhnomPenh = L.marker(new L.LatLng(11.556374, 104.92821), {icon:createLabelIcon("labelCity", dictionaryMap["Phnom Penh"])}).addTo(mapLocator);
		var labelVietnam = L.marker(new L.LatLng(11.036892, 106.95), {icon:createLabelIcon("labelCountry", dictionaryMap.Vietnam)}).addTo(mapLocator);
		var labelThailand = L.marker(new L.LatLng(14.966330, 102.478), {icon:createLabelIcon("labelCountry", dictionaryMap.Thailand)}).addTo(mapLocator);
		var labelLaos = L.marker(new L.LatLng(15.594, 106.297), {icon:createLabelIcon("labelCountry", dictionaryMap.Laos)}).addTo(mapLocator);
		var labelWater = L.marker(new L.LatLng(10.228261, 101.97), {icon:createLabelIcon("labelWater", dictionaryMap["Gulf of Thailand"])}).addTo(mapLocator);

		var labelKandal = L.marker(new L.LatLng(11.227, 105.0476), {icon:createLabelIcon("labelProvince show", dictionaryMap.provinces["Kandal"])}).addTo(mapLocator);
		var labelTakeo = L.marker(new L.LatLng(10.932, 104.798), {icon:createLabelIcon("labelProvince show", dictionaryMap.provinces["Takeo"])}).addTo(mapLocator);
		var labelKampot = L.marker(new L.LatLng(10.760077, 104.083), {icon:createLabelIcon("labelProvince show", dictionaryMap.provinces["Kampot"])}).addTo(mapLocator);
		var labelBanteayMeanchey = L.marker(new L.LatLng(13.624, 102.729), {icon:createLabelIcon("labelProvince show", dictionaryMap.provinces["Banteay Meanchey"])}).addTo(mapLocator);
		var labelKampongCham = L.marker(new L.LatLng(11.992429, 105.0), {icon:createLabelIcon("labelProvince show", dictionaryMap.provinces["Kampong Cham"])}).addTo(mapLocator);



		currentZoom = mapLocator.getZoom();
		if (currentZoom > 6) {
			//sgrVectorMap.setStyle({weight: 3});
			logger("trying to show province names")

			$(".labelProvince").addClass("show");
		}
		else {
			logger("trying to hide province names")
		//	vectorMap.setStyle({weight: 1});
			$(".labelProvince").removeClass("show");
		}




		//starts map so that Cambodia is centered on the screen.
		mapLocator.fitBounds(cambodiaBounds);


		// =======================================
		// |  Adjust styles based on zoom level  |
		// =======================================

		mapLocator.on('zoomend', function () {
			currentZoom = mapLocator.getZoom();
			logger("currentZoom: " + currentZoom);
			if (currentZoom > 7) {
				//sgrVectorMap.setStyle({weight: 3});
				logger("trying to show province names")

				$(".labelProvince").addClass("show");
			}
			else {
				logger("trying to hide province names")
			//	vectorMap.setStyle({weight: 1});
				$(".labelProvince").removeClass("show");
			}
		});



		// ==============================================
		// |  Style geojson shapes based on borough   |
		// ==============================================
		var simplifiedName = "";
		function styleConditionally(feature){
			if (feature.properties.sovereignt == "Cambodia"){
				return {
					'fillColor': 'transparent',
					"color": "#000",
					"weight": 3,
					"opacity": 0.9,
					'className': "camboda-border"
		    	};
			} else {
				switch (feature.properties.HRName) {
				    case pinLocation: 
				    	return {
							'fillColor': 'red',
							"color": "#900",
							"weight": 1,
							"opacity": 0.9,
							'className': "current-province"
				    	};
					default:
						return {
							"color": "#333",
							"fillColor": "transparent",
							"weight": 1,
							"opacity": 0.9
						}

				}
			}
		}





		$.getJSON( projectPrefix + "/data/cambodia-commune.json", function( data ) {

			var vectorMap = L.geoJson(data, {
				style: styleConditionally,
				onEachFeature: onEachFeature
			}).addTo(mapLocator);


			// Add ID to names
			vectorMap.eachLayer(function(layer) {
				logger("Trying to simplify names")
				if (layer.feature.properties.HRName){
					logger(layer.feature.properties.HRName);
					layer._path.id = simplifyName(layer.feature.properties.HRName);
				}
			})

			function onEachFeature(feature, layer) {
				layer.on({
					click: clickBorough
				});
				layer.bindPopup("<strong>" + dictionaryMap.provinces[ layer.feature.properties.HRName ] + "</strong>")
			}

			function resetBoroughs(){
				$(".leaflet-interactive.selected").removeClass("selected");
			}


			function clickBorough(e) {
				// Highlight the selected country
				resetBoroughs();
				var idName = simplifyName(this.feature.properties.HRName)
				$("#" + idName).addClass("selected");

			}

			vectorMap.eachLayer(function(layer) {
				if (layer.feature.properties.BoroName=="Bronx"){
					var idName = simplifyName(layer.feature.properties.HRName)
					$("#" + idName).addClass("selected");
					layer.openPopup();
				}
			})

		})


		logger("pinCoordinates: "+ pinCoordinates[0] + ", " + pinCoordinates[1]);
		var marker = L.marker(pinCoordinates).addTo(mapLocator);

		marker.bindPopup("<strong>" + pinLabel + "</strong>");

	};



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
	currentLanguage = language;
	currentVoices = "voices" + language;
	loadSpreadsheet();






	// =================================
	// |  Parsing RSS with Javascript  |
	// |  to reset the styles.         |
	// =================================
	//https://www.raymondcamden.com/2015/12/08/parsing-rss-feeds-in-javascript-options/

	var rssStoryCount = 4;

	$(document).ready(function() {

		var yql = "https://query.yahooapis.com/v1/public/yql?q=select%20title%2Clink%2Cdescription%20from%20rss%20where%20url%3D%22" + rssFeedEncoded + "%2F%22&format=json&diagnostics=true&callback=";
		logger("loading encoded rss")

		$.getJSON(yql, function(res) {
			//logger(res);

			var rssFeed = ""
			for (var i = 0; i < rssStoryCount; i++){
				if (res.query.results.item[i]){
					logger(res.query.results.item[i].title)
					rssFeed += "<li><a href='" + res.query.results.item[i].link + "'>" + res.query.results.item[i].title + "</a></li>";
				}
			}

			$("#rssList").html(rssFeed);

		}, "jsonp");

	});





	// =========================
	// |  Basic Leaflet setup  |
	// =========================
	if ($("#map").length){

		var path = [];
		var marker;
		var myLayerGroup;

		// https: also suppported.
		var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
			attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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

		var tiles__watercolor = [Stamen_Watercolor, Stamen_TonerLines];

		//Create the leaflet map and restrict zoom/boundaries
		map = L.map('map', {
			maxZoom: 10,
			minZoom: 3,
			maxBounds:[
				[24, 130],
				[2, 80]
			],
			attributionControl: false,
			dragging: false,
			scrollWheelZoom: false,
			layers: tiles__watercolor//[tiles]
		});

		//starts map so that the continental US is centered on the screen.
		map.fitBounds([
			[16.105581, 109.442410],
			[8.989928, 100.433621]
		]);

	}

	$(".footnote").click(function(){
		event.preventDefault();

		var target = $(this).attr("href");
		console.log("target: " + target);
		if ( $(target).hasClass("show") ){
			$(target).removeClass("show");
		} else {
			$(".annotation").removeClass("show");
			$(target).addClass("show");
		}
	})

	$(".annotation").click(function(){
		//$(".annotation").removeClass("show");
		$(this).toggleClass("show");
		console.log("clicked");
	})


	var previousScroll

	$(".trigger__factbox").click(function(event){
		event.preventDefault();
		var timelineTarget = $(this).attr("href");

		$("#partiesHeader").removeClass("show");
		$("#parties").removeClass("show");


		if ( $("#timelineHeader").hasClass('show') ){

			$(".voa__timeline__event").removeClass("selected");
			$(timelineTarget).addClass("selected");

			var divScrollPosition = $(timelineTarget).position().top;
			var previousScrollTop = $("#timeline").scrollTop();

			$("#timeline").animate({ scrollTop: previousScrollTop + divScrollPosition - 100 }, 500);

		} else {

			$("#timelineHeader").addClass("show");
			$("#timeline").addClass("show");

			$(timelineTarget).addClass("selected");

			// animated scrolling to a target within a div
			// (You'll need to subtract the current window scroll position)
			var currentScrollPosition = $(window).scrollTop();
			var divScrollPosition = $(timelineTarget).offset().top;

			$("#timeline").animate({ scrollTop: $(timelineTarget).offset().top - currentScrollPosition - 70 }, 500);
			previousScroll = $(timelineTarget).offset().top - currentScrollPosition - 70;

		}


		// Don't load all of the timeline images until the timeline is opened.
		if ( !timelineImagesLoaded ){

			$(".voa__timeline__event img").each(function( index ) {
				var newImage = $(this).data("image");

				$(this).attr("src", newImage);
			})

			timelineImagesLoaded = true;
		}
	})


	$(".voa__factbox__close").click(function(){
		closeFactbox();
	})

	function closeFactbox(){
		$("#timeline").removeClass("show");
		$("#timelineHeader").removeClass("show");
		$(".voa__timeline__event").removeClass("selected");
		$("#timeline").animate({ scrollTop: 0 }, 500);


		$("#parties").removeClass("show");
		$("#partiesHeader").removeClass("show");
		//$(".voa__wiki__entry").removeClass("show");

		$(".annotation.show").removeClass("show");
	}



	// Add separate swipe events to close the factbox drawers

	if ($(".voa__factbox__timeline").length){
		//Add gesture support for closing the sidebar factbox.
		var myElement = document.getElementsByClassName("voa__factbox__timeline")[0];

		// create a simple instance
		// by default, it only adds horizontal recognizers
		var mc = new Hammer(myElement);

		// listen to events...
		mc.on("swiperight", function(ev) {
			//myElement.textContent = ev.type +" gesture detected.";
			logger("Gesture: " + ev.type);

			if (ev.type == "swiperight"){
				logger("you swiped right");
				closeFactbox();
			}
		});
	}

	if ($(".voa__factbox__parties").length){
		//Add gesture support for closing the sidebar factbox.
		var myElement = document.getElementsByClassName("voa__factbox__parties")[0];

		// create a simple instance
		// by default, it only adds horizontal recognizers
		var mc = new Hammer(myElement);

		// listen to events...
		mc.on("swiperight", function(ev) {
			logger("Gesture: " + ev.type);

			if (ev.type == "swiperight"){
				logger("you swiped right ");
				closeFactbox();
			}
		});
	}



	$(".trigger__party, .voa__factbox__menu__link").click(function(event){

		event.preventDefault();

		var party = $(this).attr("href");
		closeFactbox();

		$(".voa__wiki__entry").removeClass("show");
		$(".voa__wiki__entry." + party).addClass("show");
		$("#parties").animate({ scrollTop: 0 }, 500);

		if ( $("#partiesHeader").hasClass('show') ){
			// could do something if the parties factbox is already opened
		} else {
			$("#partiesHeader").addClass("show");
			$("#parties").addClass("show");
		}

	})



	function isScrolledIntoView(elem) {
		var docViewTop = $(window).scrollTop();
		var docViewBottom = docViewTop + $(window).height();

		var elemTop = $(elem).offset().top;
		var elemBottom = elemTop + $(elem).height();

		return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
	}


	$(window).scroll(function () {

		// scroll navbar down on homepage.
		$('#projectIntro').each(function () {
			if (isScrolledIntoView(this) === false) {
				$(".voa__navbar").addClass('show-nav')
			} else {
				$(".voa__navbar").removeClass('show-nav')
			}
		});

	});



});