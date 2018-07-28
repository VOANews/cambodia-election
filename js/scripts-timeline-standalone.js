//Grab the spreadsheet KEY from the URL bar (NOT from the published window)
var public_spreadsheet_url = '18N6V2RJx5_ahYwtdrC2dXiBTaJuYOOEes6-vphWuzog';// timeline 

var map; //defined here for global access.



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




	$(".voa__timeline__event").click(function(){
		var targetDiv = $(this).attr("href");

		$("html, body").animate({ scrollTop: $(targetDiv).offset().top - 60 }, 1000);
		return false;
	});


	function isScrolledIntoView(elem) {
		var docViewTop = $(window).scrollTop();
		var docViewBottom = docViewTop + $(window).height();

		var elemTop = $(elem).offset().top;
		var elemBottom = elemTop + $(elem).height();

		return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
	}


	$(window).scroll(function () {

		//console.log("attempting to load this image");
		$(".voa__timeline__date").each(function () {

			if (isScrolledIntoView(this) === true) {
				var currentImage = $(this).next('img');

				if ($(currentImage).attr("src") == "https://projects.voanews.com/cambodia-election-2018/img/placeholder.jpg"){
					var currentScrolledImage = $(this).next('img').data("image");

					var windowSize = window.innerWidth;
					if (windowSize > 420){
						currentScrolledImage = currentScrolledImage.replace("_w360_h240", "_w640_h420");
					}

					$(currentImage).attr("src", currentScrolledImage);
				} else {
					logger("already loaded this image")
				}

				$(".voa__timeline__event").removeClass("selected");
				$(this).parent().addClass("selected");
			}
		})

	});

	// Load initial timeline image
	var currentScrolledImage = $(".voa__timeline__event:first-of-type .voa__timeline__date").next('img').data("image");
	var currentImage = $(".voa__timeline__event:first-of-type .voa__timeline__date").next('img');
	var windowSize = window.innerWidth;
	if (windowSize > 420){
		currentScrolledImage = currentScrolledImage.replace("_w360_h240", "_w640_h420");
	}
	$(currentImage).attr("src", currentScrolledImage);


});