function LocationsService() {
	
	var _self = this;
	var _requests;
	var _graphics;
	
	var _lutTags = {}
	
	_lutTags[PointAtts.RESULT_TYPE_SANTA] = "santa claus";
	_lutTags[PointAtts.RESULT_TYPE_LIGHTS] = "christmas lights";
	_lutTags[PointAtts.RESULT_TYPE_TREE] = "christmas tree";
	_lutTags[PointAtts.RESULT_TYPE_HOLIDAYS] = "holidays";			

	// **********
	// methods...
	// **********
	
	this.executeQuery = function(queryTypes) {
		_requests = [];
		_graphics = [];
		if (queryTypes.length == 0) {
			$(_self).trigger("complete",[_graphics]);
			return;
		}
		var request;
		$.each(queryTypes,function(index,value) {
			
			request = new YouTubeRequest(value,_lutTags[value]);
			_requests.push(request);
			$(request).bind("complete", processResults);
			
			request = new FlickrRequest(value,_lutTags[value]);
			_requests.push(request);
			$(request).bind("complete", processResults);
			
		});
		$.each(_requests,function(index,value){value.execute()});
	}
	
	// *****************
	// private functions
	// *****************
	
	function processResults(event,graphics) {
		_graphics = _graphics.concat(graphics);
		if ($.grep(_requests,function(n,i){return n.isComplete()}).length == _requests.length) {
			$(_self).trigger("complete",[_graphics]);
		}
	}
	
}

