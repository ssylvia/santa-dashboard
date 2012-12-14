function FlickrRequest(type,tags) {
	
	var _type = type;
	var _tags = tags;
	var _self = this;
	var _complete = false;
	
	this.execute = function() {
		var url = buildURL(_tags);		
		$.getJSON(url, function(data){
			var graphics = convertToGraphics(data,_type);
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

	function buildURL(tags) {
		return "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=d166216279faf42604ffb07a01b6fcf9"+
				"&tags="+tags+
				"&bbox=-180,-90,180,90&"+
				"min_taken_date=2012-12-1&"+
				"max_taken_date=2012-12-31&"+
				"sort=date-taken-desc&"+
				"extras=description%2C+date_taken%2C+owner_name%2C+geo%2C+tags%2C+url_n%2C+url_o"+
				"&format=json&jsoncallback=?"		
	}
	
	function convertToGraphics(data,type) {
		var records = data.photos.photo;
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
								value.description._content,
								type,
								value.url_n,
								PointAtts.FORMAT_TYPE_PHOTO);
			graphic = new esri.Graphic(pt,sms,attr);	
			graphics.push(graphic);
			
		});
		return graphics;
	}
	
}