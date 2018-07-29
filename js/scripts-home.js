//Grab the spreadsheet KEY from the URL bar (NOT from the published window)
var public_spreadsheet_url = '1yImKH8MF3Xd0XW0kgRlFlkDwAS1Qkrwh8Om3NyKYxvA';// quotes and stories 

//var currentProfileNumber = -1;
var loadedData;
//var quotationData;
//var quotationRefreshHandler = false;

var currentLanguage = "english"; // replaced in the html
//var currentVoices = "voicesenglish"; // replaced in the html


var debugMode = false;
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


var showLiveBlog = false;
var liveBlogLink = "#";
var liveBlogPromo = "";

function showBlog(){
	console.log("running: showBlog()")
	if (showLiveBlog){
		$("#liveblogNavLink").css("display", "inline-block");
		$("#liveblogNavLink a").attr("href",liveBlogLink);
		$(".voa__project__intro").addClass("voa__grid__two-thirds border-right")
		$(".voa__landing-page__live-blog__promo").css("display", "inline-block");
		$(".voa__landing-page__live-blog__promo").html(liveBlogPromo);
	}
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
		 	wanted: [ currentStories ] } )
	} else if ( mode == "production") {
		//buildPresidents(d3target);
		showInfo(bakedData);
	} else {
		console.log("You need to define the 'mode' ('editing' or 'production')");
	}
}


function showInfo(data) {

	logger("loaded spreadsheet data: ");
	logger(data);

	loadedData = data[currentStories].elements;
	console.log("loadedData")
	console.log(loadedData);

	console.log("only show publish-ready posts")

	var loadedDataPublished = []
	//displayNews();



	for (var i = 0; i < loadedData.length; i++){
		var imageThumbnail = loadedData[i].image;
		var imageSquare = loadedData[i].image;
		var imageSquareSmall = loadedData[i].image;
		var imageRectangle = loadedData[i].image;
		imageThumbnail = imageThumbnail.replace("_w1023", "_w420");
		imageSquare = imageSquare.replace("_w1023", "_w640_h520");
		imageSquareSmall = imageSquareSmall.replace("_w1023", "_w420_h360");
		imageRectangle = imageRectangle.replace("_w1023", "_w740");

		loadedData[i].image_thumbnail = imageThumbnail;
		loadedData[i].image_square = imageSquare;
		loadedData[i].image_square_small = imageSquareSmall;
		loadedData[i].image_rectangle = imageRectangle;


		if (loadedData[i].publish == "TRUE"){
			loadedDataPublished.push(loadedData[i]);
		} else if (loadedData[i].publish == "FALSE" && loadedData[i].liveblog == "TRUE"){
			showLiveBlog = true;
			liveBlogLink = projectPrefix + "/" + language + "/live-blog/";//loadedData[i].link;
			liveBlogPromo = "<a href='" + liveBlogLink + "'>";
			liveBlogPromo += "<img src='https://gdb.voanews.com/8C7F77ED-72A4-4D69-89AD-818A8F5DC9C5_w650_r1.jpg' />";
			liveBlogPromo += "<h3>" + loadedData[i].headline + "</h3>";
			liveBlogPromo += "<p>" + loadedData[i].description + "</p>";
			liveBlogPromo += "</a>"
		}
	}

	showBlog();


	// Register a helper that increases the starting @index or @key by one
	Handlebars.registerHelper('increaseNumbersByOne', function(num){
		num++;
		return num;
	});
	Handlebars.registerHelper('reverse', function (arr) {
		arr.reverse();
	});

	// Grab the template script
	var theTemplateScript = $("#handlebars-template-featured-headlines").html();
	var theTemplateScript2 = $("#handlebars-template-secondary-headlines").html();

	// Compile the template
	var theTemplate = Handlebars.compile(theTemplateScript);
	var theTemplate2 = Handlebars.compile(theTemplateScript2);

	// Define our data object. (I'm sticking it inside another object so that it matches the sample data structure.)
	var context = loadedDataPublished;// loadedData;// data.factchecks.elements;

	var contextHolder = {};
	contextHolder.stories = context;

	//logger(contextHolder)

	// Pass our data to the template
	var theCompiledHtml = theTemplate(contextHolder);
	var theCompiledHtml2 = theTemplate2(contextHolder);

	// Add the compiled html to the page
	$('.content-placeholder').html(theCompiledHtml);
	$('.content-placeholder2').html(theCompiledHtml2);

}




$(document).ready(function(){
	logger("Ready");

	balanceText();


	// Display a random quote.
	var numberOfQuotes = $(".voa__ribbon__quotation").length;
	var randomQuoteNumber = Math.floor(Math.random() * numberOfQuotes);
	var quoteSelected = $(".voa__ribbon__quotation")[randomQuoteNumber];

	var selectedMugshotMugshotUrl = $(quoteSelected).data("url");
	$(quoteSelected).find(".voa__ribbon__quotation__mugshot, .voa__ribbon__quotation__mugshot--small").attr("src", selectedMugshotMugshotUrl)

	$(quoteSelected).addClass("show")


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
	//currentVoices = "voices" + language;
	currentStories = language;
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

	$("h1.project-title").addClass('spread');



	/*
	$.getJSON( "url-for-json.json", function( data ) {
		// Do something
	});
	*/

});

window.onload = function() {
};
