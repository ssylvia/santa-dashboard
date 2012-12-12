function LocationsService() {
	
	var _self = this;
	var _loaded = false;

	setTimeout(function(){
		_loaded = true;
		$(_self).trigger("load");
	},500);

	// **********
	// methods...
	// **********
	
	this.executeQuery = function(queryTypes) {

		var url = buildFlickrURL(queryTypes.join(","));
		
		$.getJSON(url, function(data){
			var graphics = flickrToGraphics(data.photos.photo,PointAtts.RESULT_TYPE_SANTA);
			$(_self).trigger("complete",[graphics]);
    	});
		
	}
	
	this.isLoaded = function() {
		return _loaded;
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
								value.url_l,
								PointAtts.FORMAT_TYPE_PHOTO);
			graphic = new esri.Graphic(pt,sms,attr);	
			graphics.push(graphic);
			
		});
		return graphics;
	}

}

