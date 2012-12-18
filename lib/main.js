/*
	 | Version 10.1.1
     | Copyright 2012 Esri
     |
     | Licensed under the Apache License, Version 2.0 (the "License");
     | you may not use this file except in compliance with the License.
     | You may obtain a copy of the License at
     |
     |    http://www.apache.org/licenses/LICENSE-2.0
     |
     | Unless required by applicable law or agreed to in writing, software
     | distributed under the License is distributed on an "AS IS" BASIS,
     | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     | See the License for the specific language governing permissions and
     | limitations under the License.
*/

dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("esri.arcgis.utils");
dojo.require("esri.map");

/******************************************************
***************** begin config section ****************
*******************************************************/

var TITLE = "Santa's Dashboard"
var BYLINE = "In this social media era, it's a lot easier to see who's being naughty and who's being nice!  The elves devised this dashboard, so Santa can browse recent, holiday-themed YouTube videos and Flickr photos.  You can, too, by tapping on the dashboard items to toggle themes, and clicking on the map to view content. Zoom in for more detail."
var SATELLITE_URL = "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
var BOUNDARIES_URL = "http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer";

var COLOR_RED = "#FF0000";
var COLOR_ORANGE = "#FF7D40";
var COLOR_GREEN = "#9CCB19";
var COLOR_BLUE = "#0000FF";

/******************************************************
************************** init ***********************
*******************************************************/

var _map;
var _locationsService;
var _selected;

var _layerSantas;
var _layerLights;
var _layerTree;
var _layerHolidays;

var _layerHighlight;

var _dojoReady = false;
var _jqueryReady = false;

var _initExtent;

var _lutColors = {}; 	// look-up tables
var _lutLayers = {};
var _lutMarkers = {};

var _isMobile = isMobile();

var _loading = true;

dojo.addOnLoad(function() {_dojoReady = true;init()});
jQuery(document).ready(function() {_jqueryReady = true;init()});

function advanceProgressBar() {
	if (parseInt($("#progressBar").css("margin-left")) > -10) return;
	$("#progressBar").css("margin-left",parseInt($("#progressBar").css("margin-left"))+5);
	if (_loading) setTimeout(advanceProgressBar,400);
}

function init() {

	if (!_jqueryReady) return;
	if (!_dojoReady) return;
	
	setTimeout(advanceProgressBar,500);

	$(this).resize(handleWindowResize);

	$("#title").append(TITLE);
	$("#subtitle").append(BYLINE);
	
	// correlate each check box to a result type.

	$($($.grep($(".controlGroup"),function(n,i){return $(n).find(".controlCaption").html() == "Santa Claus"})).find(".check")).attr("value",PointAtts.RESULT_TYPE_SANTA);
	$($($.grep($(".controlGroup"),function(n,i){return $(n).find(".controlCaption").html() == "Christmas lights"})).find(".check")).attr("value",PointAtts.RESULT_TYPE_LIGHTS);
	$($($.grep($(".controlGroup"),function(n,i){return $(n).find(".controlCaption").html() == "Christmas tree"})).find(".check")).attr("value",PointAtts.RESULT_TYPE_TREE);
	$($($.grep($(".controlGroup"),function(n,i){return $(n).find(".controlCaption").html() == "Holidays"})).find(".check")).attr("value",PointAtts.RESULT_TYPE_HOLIDAYS);

	// turn on "Santa Claus" check box by default.

	$($($.grep($(".controlGroup"),function(n,i){return $(n).find(".controlCaption").html() == "Santa Claus"})).find(".check")).attr("checked",true);

	// initialize LocationsService

	_locationsService = new LocationsService();
	$(_locationsService).bind("complete", processQueryResults);

	// create map & add layers

	_initExtent = new esri.geometry.Extent({"xmin":-15830107,"ymin":2519171,"xmax":-5811353,"ymax":7235030,"spatialReference":{"wkid":102100}});

	_map = new esri.Map("map",{slider:false,wrapAround180:false,extent:_initExtent});
	_map.addLayer(new esri.layers.ArcGISTiledMapServiceLayer(SATELLITE_URL));
	var layerBoundaries = new esri.layers.ArcGISTiledMapServiceLayer(BOUNDARIES_URL);
	layerBoundaries.setOpacity(0.5); 
	_map.addLayer(layerBoundaries);

	_layerSanta = new esri.layers.GraphicsLayer();
	_layerTree = new esri.layers.GraphicsLayer();
	_layerLights = new esri.layers.GraphicsLayer();
	_layerHolidays = new esri.layers.GraphicsLayer();

	_map.addLayer(_layerHolidays);
	_map.addLayer(_layerTree);
	_map.addLayer(_layerLights);
	_map.addLayer(_layerSanta);

	_layerSanta.show();
	_layerTree.hide();
	_layerLights.hide();
	_layerHolidays.hide();
	
	// highligh layer
	
	_layerHighlight = new esri.layers.GraphicsLayer();
	_map.addLayer(_layerHighlight);

	// layers look-up table

 	_lutLayers[PointAtts.RESULT_TYPE_SANTA] = _layerSanta;
 	_lutLayers[PointAtts.RESULT_TYPE_LIGHTS] = _layerLights;
 	_lutLayers[PointAtts.RESULT_TYPE_TREE] = _layerTree;
 	_lutLayers[PointAtts.RESULT_TYPE_HOLIDAYS] = _layerHolidays;

	// color look-up table

 	_lutColors[PointAtts.RESULT_TYPE_SANTA] = COLOR_RED;
 	_lutColors[PointAtts.RESULT_TYPE_LIGHTS] = COLOR_ORANGE;
 	_lutColors[PointAtts.RESULT_TYPE_TREE] = COLOR_GREEN;
 	_lutColors[PointAtts.RESULT_TYPE_HOLIDAYS] = COLOR_BLUE;
	
 	_lutMarkers[PointAtts.RESULT_TYPE_SANTA] = ["images/RedLight.png","images/RedHighlight.png"];
 	_lutMarkers[PointAtts.RESULT_TYPE_LIGHTS] = ["images/OrangeLight.png","images/OrangeHighlight.png"];
 	_lutMarkers[PointAtts.RESULT_TYPE_TREE] = ["images/GreenLight.png","images/GreenHighlight.png"];
 	_lutMarkers[PointAtts.RESULT_TYPE_HOLIDAYS] = ["images/BlueLight.png","images/BlueHighlight.png"];	

	// kick off part 2

	if (_map.loaded) init2();
	else dojo.connect(_map, 'onLoad', init2);

}

function init2() {

	$("#zoomIn").click(function(e) {
        _map.setLevel(_map.getLevel()+1);
    });
	$("#zoomOut").click(function(e) {
        _map.setLevel(_map.getLevel()-1);
    });
	$("#zoomExtent").click(function(e) {
        _map.setExtent(_initExtent);
    });

	$(".check").click(function(e){
		var layer = _lutLayers[$(e.target).attr("value")];
		layer.setVisibility(!$(e.target).attr("checked"));
	});

	$(".controlCaption").click(function(e){
		var check = $(e.target).parent().find("input");
		if ($(check).attr("checked")) $(check).attr("checked",false);
		else $(check).attr("checked",true);
		var layer = _lutLayers[$(check).attr("value")];
		layer.setVisibility($(check).attr("checked"));
	});
	
	$("#media").load(function(){
		$("#media").css({
			"margin-left":(($("#pictureFrame").width() - $("#media").width())/2),
			"margin-top":(($("#pictureFrame").height() - $("#media").height())/2)
		});
	});

	$.each([_layerSanta,_layerTree,_layerLights,_layerHolidays],function(index,value) {
		dojo.connect(value, "onMouseOver", layer_onMouseOver);
		dojo.connect(value, "onMouseOut", layer_onMouseOut);
		dojo.connect(value, "onClick", layer_onClick);
	});

	doQuery();
	handleWindowResize();

    $(".selectButton").click(function(){
        if($(this).attr("id") === "santa"){
            if($(this).hasClass("on")){
                $(this).attr("src","images/buttons/SantaOff.png");
                $(this).addClass("off");
                $(this).removeClass("on");
            }
            else{
                $(this).attr("src","images/buttons/SantaOn.png");
                $(this).addClass("on");
                $(this).removeClass("off");
            }
            $(".check").eq(0).trigger("click");
        }
        else if($(this).attr("id") === "lights"){
            if($(this).hasClass("on")){
                $(this).attr("src","images/buttons/LightsOff.png");
                $(this).addClass("off");
                $(this).removeClass("on");
            }
            else{
                $(this).attr("src","images/buttons/LightsOn.png");
                $(this).addClass("on");
                $(this).removeClass("off");
            }
            $(".check").eq(1).trigger("click");
        }
        else if($(this).attr("id") === "tree"){
            if($(this).hasClass("on")){
                $(this).attr("src","images/buttons/TreeOff.png");
                $(this).addClass("off");
                $(this).removeClass("on");
            }
            else{
                $(this).attr("src","images/buttons/TreeOn.png");
                $(this).addClass("on");
                $(this).removeClass("off");
            }
            $(".check").eq(2).trigger("click");
        }
        else{
            if($(this).hasClass("on")){
                $(this).attr("src","images/buttons/HolidaysOff.png");
                $(this).addClass("off");
                $(this).removeClass("on");
            }
            else{
                $(this).attr("src","images/buttons/HolidaysOn.png");
                $(this).addClass("on");
                $(this).removeClass("off");
            }
            $(".check").eq(3).trigger("click");
        }
    });
	
	setTimeout(function(){_map.setExtent(_initExtent)},500);

}

/******************************************************
****************** event handlers *********************
*******************************************************/

function handleWindowResize() {
	var heightDoc = getViewportDimensions()[1];
	$("#mainWindow").height(heightDoc - $("#header").height());
	dijit.byId("mainWindow").layout();
	$("#map").height($("#mainWindow").height() - $("#controlBar").height());
	if (_map) _map.resize();

    if($(window).width() < 1200){
        $("#woodPane").css("margin-left",($(window).width() - 1000)/2);
        $("#woodPane").attr("src","images/DashboardSmall.png");
    }
    else if($(window).width() < 1600){
        $("#woodPane").css("margin-left",($(window).width() - 1200)/2);
        $("#woodPane").attr("src","images/DashboardWider.png");
    }
    else{
        $("#woodPane").css("margin-left",($(window).width() - 1600)/2);
        $("#woodPane").attr("src","images/DashboardWidest.png");
    }
}

function layer_onClick(event)
{
	$("#hoverInfo").hide();
	_selected = event.graphic;
	postSelection();
}

function layer_onMouseOver(event)
{
	if (_isMobile) return;
	_map.setMapCursor("pointer");
	var graphic = event.graphic;
	var title;
	if (graphic.attributes.getFormat() == PointAtts.FORMAT_TYPE_PHOTO) title = "Flickr";
	else title = "YouTube";
	if ((graphic.attributes.getTitle() != null) && (graphic.attributes.getTitle() != "")) {
		title = title+": "+graphic.attributes.getTitle();
	}
	$("#hoverInfo").html(title);
	var pt = _map.toScreen(graphic.geometry);
	hoverInfoPos(pt.x,pt.y);
}

function layer_onMouseOut(event)
{
	_map.setMapCursor("default");
	$("#hoverInfo").hide();
}

function processQueryResults(event,locations){
	_loading = false;
	loadLocations(locations);
	$("#queryInProgress").fadeOut();
	_selected = _layerSanta.graphics[0];
	postSelection();
}

/******************************************************
*************** private functions *********************
*******************************************************/

function doQuery() {
	$("#queryInProgress").fadeIn();
	var query = [
		PointAtts.RESULT_TYPE_SANTA,
		PointAtts.RESULT_TYPE_LIGHTS,
		PointAtts.RESULT_TYPE_TREE,
		PointAtts.RESULT_TYPE_HOLIDAYS
	];
	_locationsService.executeQuery(query);
}

function loadLocations(locations) {
	var symbol;
	$.each(locations,function(index,value) {
		symbol =  new esri.symbol.PictureMarkerSymbol({
			"url":_lutMarkers[value.attributes.getType()][0],
			"height":22,
			"width":22,
			"type":"esriPMS"
		});		
		value.setSymbol(symbol);
		_lutLayers[value.attributes.getType()].add(value);
	});
}

function postSelection() {
	
    if(_selected.attributes.getFormat() === "photo"){
        $("#lightboxLink").show();
        $("#youtubeFrame").hide();
        $("#youtubeFrame").attr("src","");
    	$("#media").attr("src",_selected.attributes.getURL());
        $("#lightboxLink").attr("href",_selected.attributes.getLargeURL()).attr("title",_selected.attributes.getTitle()+
		" (<a href='"+_selected.attributes.getSource()+"' target='_blank' class='sourceLink'>view source</a>)");
        $("#media").css({
            "margin-left":(($("#pictureFrame").width() - $("#media").width())/2),
            "margin-top":(($("#pictureFrame").height() - $("#media").height())/2)
        });
    }
    else{
        $("#lightboxLink").hide();
        $("#youtubeFrame").attr("src","http://www.youtube.com/embed/"+_selected.attributes.getURL());
        $("#youtubeFrame").show();
    }
	
	var symbol =  new esri.symbol.PictureMarkerSymbol({
		"url":_lutMarkers[_selected.attributes.getType()][1],
		"height":22,
		"width":22,
		"type":"esriPMS"
	});		
	_layerHighlight.clear();
	_layerHighlight.add(new esri.Graphic(_selected.geometry,symbol));
	
}


function hoverInfoPos(x,y){
	if (x <= ($("#map").width())-230){
		$("#hoverInfo").css("left",x+15);
	}
	else{
		$("#hoverInfo").css("left",x-25-($("#hoverInfo").width()));
	}
	if (y >= ($("#hoverInfo").height())+50){
		$("#hoverInfo").css("top",y-35-($("#hoverInfo").height()));
	}
	else{
		$("#hoverInfo").css("top",y-15+($("#hoverInfo").height()));
	}
	$("#hoverInfo").show();
}