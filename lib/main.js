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
var BYLINE = "Discover and browse recent YouTube videos and Flickr photos on holiday themes.  Tap on the dashboard to switch themes; zoom in to discover more."
var SATELLITE_URL = "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
var CSV_FILE = "data/xmas-haps.csv";

var COLOR_RED = "#FF0000";
var COLOR_ORANGE = "#FF7D40";
var COLOR_GREEN = "#9CCB19";
var COLOR_BLUE = "#0000FF";

/******************************************************
***************** end config section ******************
*******************************************************/

var _map;
var _locationsService;
var _locations;
var _selected;

var _dojoReady = false;
var _jqueryReady = false;

var _initExtent; 

var _isMobile = isMobile();

dojo.addOnLoad(function() {_dojoReady = true;init()});
jQuery(document).ready(function() {_jqueryReady = true;init()});


function init() {
	
	if (!_jqueryReady) return;
	if (!_dojoReady) return;

	$("#title").append(TITLE);
	$("#subtitle").append(BYLINE);	
	
	$($($.grep($(".controlGroup"),function(n,i){return $(n).find(".controlCaption").html() == "Santa Claus"})).find(".check")).attr("value",PointAtts.RESULT_TYPE_SANTA);
	$($($.grep($(".controlGroup"),function(n,i){return $(n).find(".controlCaption").html() == "Christmas lights"})).find(".check")).attr("value",PointAtts.RESULT_TYPE_LIGHTS);
	$($($.grep($(".controlGroup"),function(n,i){return $(n).find(".controlCaption").html() == "Christmas tree"})).find(".check")).attr("value",PointAtts.RESULT_TYPE_TREE);
	$($($.grep($(".controlGroup"),function(n,i){return $(n).find(".controlCaption").html() == "Holidays"})).find(".check")).attr("value",PointAtts.RESULT_TYPE_HOLIDAYS);

	$(this).resize(handleWindowResize);

	_initExtent = new esri.geometry.Extent({"xmin":-16407360,"ymin":-748663,"xmax":-4197004,"ymax":10365891,"spatialReference":{"wkid":102100}});
	
	_map = new esri.Map("map",{slider:false,wrapAround180:true,extent:_initExtent});
	_map.addLayer(new esri.layers.ArcGISTiledMapServiceLayer(SATELLITE_URL));
	dojo.connect(_map, 'onLoad', init2);
	
	_locationsService = new LocationsService(CSV_FILE);		  
	$(_locationsService).bind("load", init2);
	$(_locationsService).bind("complete", processQueryResults);
	
}

function init2() {
	
	if (!_map.loaded) return;
	if (!_locationsService.isLoaded()) return;	
	
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
		doQuery();
	});
	
	$(".controlCaption").click(function(e){
		var check = $(e.target).parent().find("input");
		if ($(check).attr("checked")) $(check).attr("checked",false);
		else $(check).attr("checked",true);
		doQuery();
	});
	
	doQuery();
	handleWindowResize();
}

function handleWindowResize() {
	var heightDoc = getViewportDimensions()[1];
	$("#mainWindow").height(heightDoc - $("#header").height());
	dijit.byId("mainWindow").layout();
	$("#map").height($("#mainWindow").height() - $("#controlBar").height());
	if (_map) _map.resize();
}

function doQuery() {
	var checks = $.grep($(".check"),function(n,i){return $(n).attr("checked")});
	var query = [];
	$.each(checks,function(index,value){query.push($(value).attr("value"))});
	_locationsService.executeQuery(query);	
}

function processQueryResults(event,locations){
	_locations = locations;
	loadLocations();
	_selected = _locations[0];		
}

function loadLocations() {
	_map.graphics.clear();
	var color = "#FFFFFF"; // default color, just in case one falls through the cracks.
	$.each(_locations,function(index,value) {
		switch(value.attributes.getType()) {
			case PointAtts.RESULT_TYPE_SANTA:
				color = COLOR_RED
				break;
			case PointAtts.RESULT_TYPE_LIGHTS:
				color = COLOR_ORANGE
				break;
			case PointAtts.RESULT_TYPE_TREE:
				color = COLOR_GREEN;
				break;
			case PointAtts.RESULT_TYPE_HOLIDAYS:
				color = COLOR_BLUE;
				break;
		}
		value.setSymbol(new esri.symbol.SimpleMarkerSymbol().setColor(color));
		_map.graphics.add(value);
	});
}