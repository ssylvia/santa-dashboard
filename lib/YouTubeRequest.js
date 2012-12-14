function YouTubeRequest(type,tags) {
	
	var _type = type;
	var _tags = tags;
	var _self = this;
	var _complete = false;
	
	this.execute = function() {
		var url = buildYouTubeURL(_tags);		
		$.getJSON(url, function(data){
			var graphics = youTubeToGraphics(data.feed.entry,_type);
			_complete = true;
			$(_self).trigger("complete",[graphics]);
    	});		
	}
	
	this.isComplete = function() {
		return _complete;
	}

	// *****************
	// private functions
	// *****************

	function buildYouTubeURL(tags) {
		return "https://gdata.youtube.com/feeds/api/videos?q="+tags+"&orderby=published&max-results=10&location=37.42307,-122.08427!&location-radius=1000km&v=2&alt=json"
	}
	
	function youTubeToGraphics(records,type) {
		var graphics = [];
		var pt,sms,attr,graphic;
		var coords;
		$.each(records, function(index,value){
			
			coords = value.georss$where.gml$Point.gml$pos.$t.split(" ");

			pt = esri.geometry.geographicToWebMercator(
					new esri.geometry.Point(
					[coords[1],coords[0]],
					new esri.SpatialReference({ wkid:4326}))
			);				
			sms = new esri.symbol.SimpleMarkerSymbol();
			attr = new PointAtts(value.title.$t,
								"test description",
								type,
								value.content.src,
								PointAtts.FORMAT_TYPE_PHOTO);
			graphic = new esri.Graphic(pt,sms,attr);	
			graphics.push(graphic);
			
		});
		return graphics;
	}
	
}