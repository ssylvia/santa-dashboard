function FlickrRequest(type,tags) {
	
	var _type = type;
	var _tags = tags;
	var _self = this;
	var _complete = false;
	
	this.execute = function() {
		var url = buildFlickrURL(_tags);		
		$.getJSON(url, function(data){
			var graphics = flickrToGraphics(data.photos.photo,_type);
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

	function buildFlickrURL(tags) {
		return "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=d166216279faf42604ffb07a01b6fcf9"+
				"&tags="+tags+
				"&bbox=-180,-90,180,90&"+
				"min_taken_date=2012-12-12&"+
				"extras=description%2C+date_taken%2C+owner_name%2C+geo%2C+tags%2C+o_dims%2C+url_sq%2C+url_t%2C+url_s%2C+url_q%2C+url_m%2C+url_n%2C+url_z%2C+url_c%2C+url_l%2C+url_o"+
				"&format=json&jsoncallback=?"		
	}
	
	function flickrToGraphics(records,type) {
		var graphics = [];
		var pt,sms,attr,graphic;
		$.each(records, function(index,value){
			pt = esri.geometry.geographicToWebMercator(
					new esri.geometry.Point(
					[value.longitude,value.latitude],
					new esri.SpatialReference({ wkid:4326}))
			);				
			sms = new esri.symbol.SimpleMarkerSymbol();
			attr = new PointAtts(value.title,
								"this is a test description.",
								type,
								value.url_m,
								PointAtts.FORMAT_TYPE_PHOTO);
			graphic = new esri.Graphic(pt,sms,attr);	
			graphics.push(graphic);
			
		});
		return graphics;
	}
	
}