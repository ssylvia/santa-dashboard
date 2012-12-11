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
	_locationsService.executeQuery();	
}

function processQueryResults(event,locations){
	_locations = locations;
	loadLocations();
	_selected = _locations[0];		
}

function loadLocations() {
	_map.graphics.clear();
	$.each(_locations,function(index,value) {
		_map.graphics.add(value);
	});
}